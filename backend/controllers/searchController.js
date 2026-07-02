const { searchRelevantChunks } = require("../services/vectorService");

/**
 * searchController.js
 *
 * Handles the /api/search endpoint. This controller's only job is request
 * handling — validating input and shaping the response. All actual
 * retrieval logic lives in vectorService, matching the "controllers only
 * for request handling" architecture rule.
 */
class SearchController {
    static async search(req, res, next) {
        try {
            const { query } = req.body;

            if (!query || !query.trim()) {
                return res.status(400).json({ success: false, message: "Query text is required." });
            }

            const topK = 5; // fixed for Day 4; could become a request param later

            const rawResults = await searchRelevantChunks(query, topK);

            // Shape the response to match the spec exactly — internal field
            // names (similarityScore, chunkIndex) don't all need to leak
            // to the frontend as-is.
            const results = rawResults.map((r) => ({
                documentName: r.documentName,
                pageNumber: r.pageNumber,
                score: r.similarityScore,
                text: r.text,
            }));

            res.status(200).json({
                success: true,
                results,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = SearchController;