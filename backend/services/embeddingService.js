/**
 * embeddingService.js
 *
 * Turns chunk text into numeric vectors using Google's Gemini embedding
 * model. This is deliberately the ONLY file in Day 3 that talks to an
 * external AI API — chunkService.js has zero knowledge of embeddings, and
 * this file has zero knowledge of chunking or PDFs. Each service does one
 * job, which is what makes them independently testable and swappable
 * (e.g. later replacing Gemini with another provider touches only this file).
 *
 * Scope reminder: this file generates and returns embeddings. It does NOT
 * store them in a vector database — Day 3 keeps everything in memory.
 */

const EMBEDDING_MODEL = "gemini-embedding-001";

let embeddingModel = null;

try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    if (!process.env.GEMINI_API_KEY) {
        console.warn(
            "[embeddingService] GEMINI_API_KEY is not set. Embedding generation will fail until it is configured."
        );
    } else {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    }
} catch (error) {
    console.warn(
        "[embeddingService] Could not initialize the Gemini client:",
        error.message
    );
}

/**
 * Generates a single embedding vector for one piece of text.
 *
 * @param {string} text
 * @returns {Promise<number[]>} The embedding vector
 */
async function generateEmbedding(text) {
    if (!text || !text.trim()) {
        throw new Error("generateEmbedding called with empty text");
    }

    if (!embeddingModel) {
        throw new Error(
            "Gemini embedding model is unavailable. Install @google/generative-ai and set GEMINI_API_KEY."
        );
    }

    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

/**
 * Generates embeddings for an array of chunk objects (as produced by
 * chunkService.chunkDocument) and returns new objects that combine the
 * original metadata with the embedding vector.
 *
 * Runs sequentially with a small delay rather than firing all requests in
 * parallel. A 50-page PDF can produce 100+ chunks, and Gemini's free-tier
 * rate limits will reject a burst of 100 simultaneous requests. Sequential
 * processing is slower but reliable — good enough for Day 3's scope.
 * (Day 4+ concerns like batching/parallelism with backoff are intentionally
 * left out for now.)
 *
 * @param {Array<{chunkIndex:number, documentName:string, pageNumber:number|null, text:string, characterCount:number}>} chunks
 * @returns {Promise<Array<{chunkIndex:number, documentName:string, pageNumber:number|null, text:string, embedding:number[]}>>}
 */
async function generateEmbeddingsForChunks(chunks) {
    const results = [];

    for (const chunk of chunks) {
        try {
            const embedding = await generateEmbedding(chunk.text);
            results.push({
                chunkIndex: chunk.chunkIndex,
                documentName: chunk.documentName,
                pageNumber: chunk.pageNumber,
                text: chunk.text,
                embedding,
            });
        } catch (error) {
            // One bad chunk (e.g. a transient API error) shouldn't kill the whole
            // upload. We log it and skip it — the caller can check
            // results.length vs chunks.length to detect partial failures.
            console.error(
                `[embeddingService] Failed to embed chunk ${chunk.chunkIndex} of ${chunk.documentName}:`,
                error.message
            );
        }

        // Small delay between requests to stay well under rate limits.
        await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return results;
}

module.exports = {
    generateEmbedding,
    generateEmbeddingsForChunks,
    EMBEDDING_MODEL,
};