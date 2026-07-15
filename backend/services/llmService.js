/**
 * llmService.js
 *
 * Same responsibility as before — the only file that talks to Gemini's
 * text-generation model. Two additions in this update:
 *
 * 1. The prompt now explicitly tells Gemini that context chunks may come
 *    from different documents, and instructs it to synthesize across them
 *    and flag conflicts rather than silently picking one.
 * 2. A new generateAnswerStream() function alongside the existing
 *    generateAnswer() — the non-streaming version is untouched and still
 *    used by the original /api/chat endpoint. Streaming is additive, not
 *    a replacement.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

const CHAT_MODEL = "gemini-2.5-flash";
const SIMILARITY_THRESHOLD = Number(process.env.RELEVANCE_THRESHOLD) || 0.5;

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "[llmService] GEMINI_API_KEY is not set. Answer generation will fail until it is configured."
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatModel = genAI.getGenerativeModel({ model: CHAT_MODEL });

const SYSTEM_INSTRUCTION = `You are Lexora, an AI-powered document intelligence assistant.
You must answer ONLY using the provided document context. Never use outside knowledge. Never invent facts.

The context below may contain excerpts from MULTIPLE different documents, each labeled with its source document name, page number, and a relevance score between 0 and 1.

When context comes from more than one document:
- Synthesize information across documents when the question calls for it (e.g. comparisons).
- Cite which document each piece of information comes from.
- If sources from different documents conflict or disagree, explicitly say so rather than silently picking one.
- Do not invent a relationship between documents that isn't actually supported by the retrieved chunks.

Classify the context into one of three cases, and respond accordingly:

1. FULLY ANSWERABLE — the context directly and clearly answers the question.
   Answer normally, concisely and professionally, referencing document name and page number.

2. PARTIALLY ANSWERABLE — the context is related to the question's topic but doesn't fully or directly answer it.
   Say what you found, and be explicit that it's a partial answer, citing the source.

3. NOT ANSWERABLE — the context is unrelated to the question, or the relevance scores are low.
   Respond in this exact structure:
   "I couldn't find [specific thing asked] in the uploaded document(s). This document appears to mainly contain [describe actual content based on the chunks you were given]. You can ask me to [suggest 1-2 concrete question types the document could actually answer]."

Never blend case 3 with invented facts.`;

function buildPrompt(question, chunks, options = {}) {
  const { belowThreshold = false, threshold = SIMILARITY_THRESHOLD, conversationHistory = [] } = options;

  // Real multi-turn memory: prior Q&A pairs get prepended to the prompt so
  // Gemini actually has context for follow-ups like "what about the second
  // one." This is a genuine pipeline change — the model receives the
  // actual prior turns, not just a UI illusion of continuity. Capped to
  // the last 6 turns to keep prompt size bounded.
  const historyBlock = conversationHistory.length
    ? `Conversation so far:\n${conversationHistory
        .slice(-6)
        .map((turn) => `Q: ${turn.question}\nA: ${turn.answer}`)
        .join("\n\n")}\n\n---\n\n`
    : "";

  if (!chunks.length) {
    return `${historyBlock}No document chunks were retrieved at all for this question.

Question: ${question}

Respond with case 3 (NOT ANSWERABLE), noting no relevant content was found and that no documents may be uploaded yet.`;
  }

  const uniqueDocs = [...new Set(chunks.map((c) => c.documentName))];
  const isMultiDocument = uniqueDocs.length > 1;

  const contextBlocks = chunks
    .map((chunk, i) => {
      const pageLabel = chunk.pageNumber != null ? `, page ${chunk.pageNumber}` : "";
      const score = chunk.similarityScore?.toFixed(3) ?? "unknown";
      return `[Source ${i + 1}: ${chunk.documentName}${pageLabel} | relevance score: ${score}]\n${chunk.text}`;
    })
    .join("\n\n---\n\n");

  const multiDocNote = isMultiDocument
    ? `\nNOTE: This context contains excerpts from ${uniqueDocs.length} different documents: ${uniqueDocs.join(", ")}. Synthesize across them if relevant, and cite which document each fact comes from.\n`
    : "";

  const confidenceHint = belowThreshold
    ? `\nNOTE: The highest relevance score above (${chunks[0].similarityScore?.toFixed(3)}) is below the configured confidence threshold (${threshold}). Treat this as a strong signal the question is likely NOT ANSWERABLE from this context, unless a chunk obviously and directly answers it despite the low score.\n`
    : "";

  return `${historyBlock}Document context (each chunk labeled with source, page, and relevance score):

${contextBlocks}
${multiDocNote}${confidenceHint}
---

Question: ${question}

If this question refers back to the conversation above (e.g. "the second one," "that," "it"), resolve the reference using the conversation history before answering. Classify this into FULLY ANSWERABLE, PARTIALLY ANSWERABLE, or NOT ANSWERABLE per your instructions, then respond accordingly using ONLY the document context above (the conversation history is for resolving references only, not as a source of facts).`;
}

function computeBelowThreshold(chunks) {
  const topScore = chunks[0]?.similarityScore ?? 0;
  return chunks.length > 0 && topScore < SIMILARITY_THRESHOLD;
}

function buildSources(chunks) {
  return chunks.map((chunk) => ({
    documentName: chunk.documentName,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    preview: chunk.text.slice(0, 150),
  }));
}

async function generateAnswer(question, chunks, conversationHistory = []) {
  const belowThreshold = computeBelowThreshold(chunks);
  const prompt = buildPrompt(question, chunks, { belowThreshold, threshold: SIMILARITY_THRESHOLD, conversationHistory });

  const result = await chatModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
  });

  return {
    answer: result.response.text().trim(),
    sources: buildSources(chunks),
    documentsUsed: [...new Set(chunks.map((c) => c.documentName))],
  };
}

/**
 * Streaming generation. Yields text pieces as they arrive from Gemini;
 * the caller (chatController's streaming handler) turns these into SSE
 * events. Transport mechanics stay out of this file entirely.
 */
async function* generateAnswerStream(question, chunks, conversationHistory = []) {
  const belowThreshold = computeBelowThreshold(chunks);
  const prompt = buildPrompt(question, chunks, { belowThreshold, threshold: SIMILARITY_THRESHOLD, conversationHistory });

  const result = await chatModel.generateContentStream({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

module.exports = {
  generateAnswer,
  generateAnswerStream,
  buildPrompt,
  buildSources,
  computeBelowThreshold,
  CHAT_MODEL,
  SIMILARITY_THRESHOLD,
};