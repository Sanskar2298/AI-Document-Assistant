const { searchRelevantChunks } = require("../services/vectorService");
const { generateAnswer } = require("../services/llmService");

const TOP_K = 5;

/**
 * chatController.js
 *
 * Orchestrates the full RAG flow for a single request: retrieve relevant
 * chunks, then generate a grounded answer from them. All the actual logic
 * lives in vectorService (retrieval) and llmService (generation) — this
 * file only sequences the two calls and handles request/response shape,
 * matching the same "controllers only for request handling" rule used in
 * documentController and searchController.
 */
class ChatController {
    static async ask(req, res, next) {
        try {
            const { question } = req.body;

            if (!question || !question.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Question is required.",
                });
            }

            // Step 1: retrieve relevant chunks (reuses Day 4's search pipeline).
            let chunks;
            try {
                chunks = await searchRelevantChunks(question, TOP_K);
            } catch (searchError) {
                console.error("[chatController] Qdrant search failed:", searchError.message);
                return res.status(503).json({
                    success: false,
                    message: "Search is temporarily unavailable. Please try again shortly.",
                });
            }

            // No matching chunks at all (e.g. nothing uploaded yet) — skip the
            // LLM call entirely and return the same grounded "not found"
            // message the system prompt would produce anyway, without
            // spending an API call to get there.
            if (!chunks.length) {
                return res.status(200).json({
                    success: true,
                    answer: "I couldn't find that information in the uploaded documents.",
                    sources: [],
                });
            }

            // Step 2: generate a grounded answer from those chunks.
            let result;
            try {
                result = await generateAnswer(question, chunks);
            } catch (llmError) {
                console.error("[chatController] Gemini generation failed:", llmError.message);
                return res.status(502).json({
                    success: false,
                    message: "The AI service failed to generate a response. Please try again.",
                });
            }

            return res.status(200).json({
                success: true,
                answer: result.answer,
                sources: result.sources,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ChatController;