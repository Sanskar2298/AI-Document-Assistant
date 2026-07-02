/**
 * llmService.js
 *
 * Same responsibility as before — the only file that talks to Gemini's
 * text-generation model. This update makes the prompt confidence-aware:
 * Gemini now sees each chunk's similarity score and is explicitly told
 * whether the overall context is strong, weak, or absent, so it can give
 * a smart fallback instead of a flat "not found" message.
 *
 * Still grounded-only: the model is never given permission to use outside
 * knowledge. The improvement is entirely about HOW it talks about the
 * document's actual content when it can't answer directly.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

const CHAT_MODEL = "gemini-2.5-flash";

// Configurable relevance threshold — see chatController.js for where this
// is actually applied. Exported so it's tunable in one place, not
// hardcoded in multiple files.
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

Each context chunk below is labeled with its source and a relevance score between 0 and 1 (higher = more relevant to the question).

Classify the context into one of three cases, and respond accordingly:

1. FULLY ANSWERABLE — the context directly and clearly answers the question.
   → Answer normally, concisely and professionally, referencing document name and page number where possible.

2. PARTIALLY ANSWERABLE — the context is related to the question's topic but doesn't fully or directly answer it.
   → Say what you found, and be explicit that it's a partial answer, citing the source.

3. NOT ANSWERABLE — the context is unrelated to the question, or the relevance scores are low.
   → Respond in this exact structure, filling in the bracketed parts based on what the document actually contains:
   "I couldn't find [specific thing asked] in the uploaded document. This document appears to mainly contain [describe actual content based on the chunks you were given]. You can ask me to [suggest 1-2 concrete question types the document could actually answer]."

Never blend case 3 with invented facts — the "appears to mainly contain" description must be based only on what's visible in the provided chunks, not assumptions.`;

/**
 * Builds the prompt: each chunk labeled with source AND its similarity
 * score, so the model can reason about confidence, followed by the
 * question and an explicit reminder of the three-way classification.
 *
 * Including the score in the label (not just the text) is what lets the
 * model distinguish "this chunk is topically close but weak" from "this
 * chunk is a strong match" — without a score, every chunk looks equally
 * authoritative to the model regardless of actual relevance.
 *
 * @param {string} question
 * @param {Array<{documentName:string, pageNumber:number|null, chunkIndex:number, text:string, similarityScore:number}>} chunks
 * @returns {string}
 */
function buildPrompt(question, chunks, options = {}) {
  const { belowThreshold = false, threshold = SIMILARITY_THRESHOLD } = options;

  if (!chunks.length) {
    return `No document chunks were retrieved at all for this question.

Question: ${question}

Respond with case 3 (NOT ANSWERABLE), noting no relevant content was found and that no documents may be uploaded yet.`;
  }

  const contextBlocks = chunks
    .map((chunk, i) => {
      const pageLabel = chunk.pageNumber != null ? `, page ${chunk.pageNumber}` : "";
      const score = chunk.similarityScore?.toFixed(3) ?? "unknown";
      return `[Source ${i + 1}: ${chunk.documentName}${pageLabel} | relevance score: ${score}]\n${chunk.text}`;
    })
    .join("\n\n---\n\n");

  const confidenceHint = belowThreshold
    ? `\nNOTE: The highest relevance score above (${chunks[0].similarityScore?.toFixed(3)}) is below the configured confidence threshold (${threshold}). Treat this as a strong signal the question is likely NOT ANSWERABLE from this context, unless a chunk obviously and directly answers it despite the low score.\n`
    : "";

  return `Document context (each chunk labeled with source and relevance score):

${contextBlocks}
${confidenceHint}
---

Question: ${question}

Classify this into FULLY ANSWERABLE, PARTIALLY ANSWERABLE, or NOT ANSWERABLE per your instructions, then respond accordingly using ONLY the context above.`;
}

/**
 * @param {string} question
 * @param {Array<{documentName:string, pageNumber:number|null, chunkIndex:number, text:string, similarityScore:number}>} chunks
 * @returns {Promise<{answer:string, sources:Array<{documentName:string, pageNumber:number|null, chunkIndex:number}>}>}
 */
async function generateAnswer(question, chunks) {
  // Confidence check: compare the single best match against the threshold.
  // Using the top score (not an average) because one strong, precise match
  // should count as answerable even if the other 4 chunks are noise —
  // averaging would incorrectly penalize a good match dragged down by
  // weaker filler chunks.
  const topScore = chunks[0]?.similarityScore ?? 0;
  const belowThreshold = chunks.length > 0 && topScore < SIMILARITY_THRESHOLD;

  const prompt = buildPrompt(question, chunks, { belowThreshold, threshold: SIMILARITY_THRESHOLD });

  const result = await chatModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
  });

  const answer = result.response.text().trim();

  const sources = chunks.map((chunk) => ({
    documentName: chunk.documentName,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
  }));

  return { answer, sources };
}

module.exports = {
  generateAnswer,
  buildPrompt,
  CHAT_MODEL,
  SIMILARITY_THRESHOLD,
};