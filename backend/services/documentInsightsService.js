const { GoogleGenerativeAI } = require("@google/generative-ai");

const INSIGHTS_MODEL = "gemini-2.5-flash";
const WORDS_PER_MINUTE = 200;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: INSIGHTS_MODEL });

// In-memory cache, keyed by documentId. Generated once per document
// (during upload) and read back by getInsights() — never regenerated
// on chat requests.
const insightsCache = new Map();

const INSIGHTS_PROMPT_INSTRUCTION = `You are analyzing a document to generate a quick-understanding overview for someone who hasn't read it yet.

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "executiveSummary": "150-250 word plain-English summary of what this document is and what it covers",
  "keyTopics": ["topic1", "topic2"],
  "importantConcepts": [
    { "concept": "name", "explanation": "one or two sentence plain explanation" }
  ],
  "suggestedQuestions": ["question 1?", "question 2?"],
  "difficultyLevel": "Beginner",
  "namedEntities": [
    { "name": "...", "type": "Person" }
  ],
  "timeline": [
    { "period": "...", "event": "..." }
  ]
}

keyTopics: 5-10 short labels, 1-3 words each.
importantConcepts: 3-6 items, only concepts actually discussed in the document.
suggestedQuestions: 6-8 questions this document could actually answer, based only on its real content.
difficultyLevel: exactly one of "Beginner", "Intermediate", "Advanced".
namedEntities: real people, organizations, products, locations, or technologies actually named in the document. type must be one of "Person", "Organization", "Location", "Product", "Technology", "Other". Omit this key entirely (do not include an empty array) if the document names no real entities.
timeline: only include this key if the document actually describes a chronological sequence of events, dates, or a project/history timeline. Omit the key entirely otherwise — most documents (resumes without dated history, technical specs, reference material) will NOT have a timeline, and you must not invent one.

Base everything strictly on the provided document text. Do not invent topics, entities, or timeline events that aren't actually present.`;

function computeReadingStats(text, pages) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return { pages, wordCount, estimatedReadingTimeMinutes: estimatedMinutes };
}

async function callGeminiForInsights(text) {
  const truncatedText = text.slice(0, 30000);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${INSIGHTS_PROMPT_INSTRUCTION}\n\nDocument text:\n\n${truncatedText}` }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const raw = result.response.text().trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("[documentInsightsService] Failed to parse Gemini JSON response:", raw);
    throw new Error("Failed to parse AI insights response.");
  }
}

async function generateInsights(documentId, text, pages) {
  const aiInsights = await callGeminiForInsights(text);
  const readingStats = computeReadingStats(text, pages);

  const insights = { ...aiInsights, readingStats };
  insightsCache.set(documentId, insights);
  return insights;
}

function getInsights(documentId) {
  return insightsCache.get(documentId) || null;
}

module.exports = {
  generateInsights,
  getInsights,
};