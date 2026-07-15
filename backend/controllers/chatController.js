const { searchRelevantChunks } = require("../services/vectorService");
const { generateAnswer, generateAnswerStream, buildSources } = require("../services/llmService");

const TOP_K = 5;

class ChatController {
    static async ask(req, res, next) {
        try {
            const { question, selectedDocumentIds = [], searchScope = "all", history = [] } = req.body;

            if (!question || !question.trim()) {
                return res.status(400).json({ success: false, message: "Question is required." });
            }

            const documentIds = searchScope === "selected" ? selectedDocumentIds : [];

            let chunks;
            try {
                chunks = await searchRelevantChunks(question, TOP_K, documentIds);
            } catch (searchError) {
                console.error("[chatController] Qdrant search failed:", searchError.message);
                return res.status(503).json({
                    success: false,
                    message: "Search is temporarily unavailable. Please try again shortly.",
                });
            }

            if (!chunks.length) {
                return res.status(200).json({
                    success: true,
                    answer: "I couldn't find that information in the uploaded documents.",
                    sources: [],
                    documentsUsed: [],
                });
            }

            let result;
            try {
                result = await generateAnswer(question, chunks, history);
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
                documentsUsed: result.documentsUsed,
            });
        } catch (error) {
            next(error);
        }
    }

    static async askStream(req, res) {
        const { question, selectedDocumentIds = [], searchScope = "all", history = [] } = req.body;

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        });

        const send = (event, data) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        if (!question || !question.trim()) {
            send("error", { message: "Question is required." });
            return res.end();
        }

        try {
            send("status", { stage: "retrieval_started", message: "Searching documents..." });

            const documentIds = searchScope === "selected" ? selectedDocumentIds : [];
            let chunks;
            try {
                chunks = await searchRelevantChunks(question, TOP_K, documentIds);
            } catch (searchError) {
                console.error("[chatController] Qdrant search failed:", searchError.message);
                send("error", { message: "Search is temporarily unavailable. Please try again shortly." });
                return res.end();
            }

            send("status", { stage: "retrieval_completed", message: "Documents searched." });

            if (!chunks.length) {
                send("token", { text: "I couldn't find that information in the uploaded documents." });
                send("sources", { sources: [], documentsUsed: [] });
                send("done", {});
                return res.end();
            }

            send("status", { stage: "generating", message: "Generating answer..." });

            try {
                for await (const textPiece of generateAnswerStream(question, chunks, history)) {
                    send("token", { text: textPiece });
                }
            } catch (llmError) {
                console.error("[chatController] Gemini streaming failed:", llmError.message);
                send("error", { message: "The AI service failed to generate a response. Please try again." });
                return res.end();
            }

            send("sources", {
                sources: buildSources(chunks),
                documentsUsed: [...new Set(chunks.map((c) => c.documentName))],
            });
            send("done", {});
            res.end();
        } catch (error) {
            console.error("[chatController] Unexpected streaming error:", error.message);
            send("error", { message: "Something went wrong. Please try again." });
            res.end();
        }
    }
}

module.exports = ChatController;