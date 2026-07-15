const { GoogleGenerativeAI } = require("@google/generative-ai");

const STUDY_MODEL = "gemini-2.5-flash-lite";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: STUDY_MODEL });

// Cache shape: Map<documentId, { flashcards?, quiz?, interview?, cheatsheet?, glossary? }>
const studyCache = new Map();

const SECTION_PROMPTS = {
  flashcards: `Generate 10-20 flashcards from this document. Return ONLY valid JSON:
{ "flashcards": [ { "front": "question", "back": "answer" } ] }
Base every card strictly on content actually in the document.`,

  quiz: `Generate exactly 10 multiple-choice questions from this document. Return ONLY valid JSON:
{ "questions": [ { "question": "...", "options": ["a","b","c","d"], "correctAnswer": "a", "explanation": "short explanation" } ] }
correctAnswer must be an exact string match to one of the options. Base every question strictly on content actually in the document.`,

  interview: `Generate interview-style questions from this document, grouped by difficulty. Return ONLY valid JSON:
{
  "beginner": [ { "question": "...", "modelAnswer": "..." } ],
  "intermediate": [ { "question": "...", "modelAnswer": "..." } ],
  "advanced": [ { "question": "...", "modelAnswer": "..." } ]
}
3-4 questions per difficulty level. Base every question strictly on content actually in the document.`,

  cheatsheet: `Generate a concise one-page revision cheat sheet from this document. Return ONLY valid JSON:
{
  "keyConcepts": ["concept 1", "concept 2"],
  "definitions": [ { "term": "...", "definition": "..." } ],
  "importantFacts": ["fact 1", "fact 2"],
  "formulas": ["formula 1"],
  "bestPractices": ["practice 1"]
}
Omit the "formulas" key entirely if the document has no formulas. Keep everything skimmable — short phrases, not paragraphs.`,

  glossary: `Generate a glossary of important terms from this document. Return ONLY valid JSON:
{ "terms": [ { "term": "...", "explanation": "one-line explanation" } ] }
Include only terms actually discussed in the document, 8-15 terms.`,

  eli5: `Explain this entire document as if to a curious 5-year-old — simple words, short sentences, relatable analogies. Return ONLY valid JSON:
{ "explanation": "the ELI5 explanation, 150-300 words", "analogies": ["a short analogy 1", "a short analogy 2"] }
Base it strictly on the document's actual content — simplify the real ideas, don't invent new ones.`,

  mindmap: `Generate a hierarchical mind map of this document's structure. Return ONLY valid JSON:
{
  "root": "central topic (the document's main subject)",
  "branches": [
    {
      "label": "branch topic",
      "children": ["sub-point 1", "sub-point 2"]
    }
  ]
}
4-7 branches, each with 2-5 children. Base every branch and child strictly on content actually in the document — do not invent structure that isn't there.`,
};

const VALID_SECTIONS = Object.keys(SECTION_PROMPTS);

async function callGeminiWithRetry(prompt, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      });
    } catch (err) {
      const isRetryable = err.message?.includes("503") || err.message?.includes("overloaded");
      if (!isRetryable || attempt === maxRetries) throw err;

      const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      console.warn(`[studyModeService] Gemini 503, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function getOrGenerateSection(documentId, text, section) {
  if (!VALID_SECTIONS.includes(section)) {
    throw new Error(`Unknown study mode section: ${section}`);
  }

  const cached = studyCache.get(documentId);
  if (cached && cached[section]) {
    return cached[section];
  }

  const truncatedText = text.slice(0, 30000);
  const prompt = `${SECTION_PROMPTS[section]}\n\nDocument text:\n\n${truncatedText}`;

  const result = await callGeminiWithRetry(prompt);
  const raw = result.response.text().trim();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`[studyModeService] Failed to parse JSON for section "${section}":`, raw);
    throw new Error(`Failed to parse ${section} response.`);
  }

  const existing = studyCache.get(documentId) || {};
  existing[section] = parsed;
  studyCache.set(documentId, existing);

  return parsed;
}

module.exports = {
  getOrGenerateSection,
  VALID_SECTIONS,
};