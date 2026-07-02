/**
 * vectorService.js
 *
 * The only file in the project that talks to Qdrant (the vector database).
 * Everything else — chunking, embedding — has no idea Qdrant exists. That
 * separation means swapping Qdrant for pgvector or Pinecone later touches
 * only this file.
 *
 * Scope reminder (Day 4): this file stores vectors and retrieves the
 * nearest ones. It does NOT call any LLM and does NOT generate answers —
 * that's explicitly out of scope until a later day.
 */

const { QdrantClient } = require("@qdrant/js-client-rest");
const { generateEmbedding } = require("./embeddingService");

const COLLECTION_NAME = "lexora_chunks";
const VECTOR_SIZE = 3072; // gemini-embedding-001 output dimension
const DISTANCE_METRIC = "Cosine"; // standard choice for text embeddings

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY || undefined, // only needed for Qdrant Cloud
});

/**
 * Ensures the collection exists before any read/write happens. Safe to call
 * on every server startup or before every operation — it checks first
 * instead of blindly creating, so it never wipes existing data.
 */
async function ensureCollection() {
  const existing = await client.getCollections();
  const alreadyExists = existing.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

  if (!alreadyExists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: DISTANCE_METRIC,
      },
    });
    console.log(`[vectorService] Created collection "${COLLECTION_NAME}"`);
  }
}

/**
 * Stores a batch of embedded chunks (as produced by
 * embeddingService.generateEmbeddingsForChunks) in Qdrant.
 *
 * Each chunk becomes one "point" in Qdrant: a vector + a payload (metadata).
 * The payload is what makes search results useful — without it, a match
 * would just be a vector with no way to say which document or page it
 * came from.
 *
 * @param {Array<{chunkIndex:number, documentName:string, pageNumber:number|null, text:string, embedding:number[]}>} embeddedChunks
 * @param {string} documentId - Unique id for the parent document (e.g. a UUID or the file name)
 */
async function storeChunks(embeddedChunks, documentId) {
  await ensureCollection();

  if (!embeddedChunks.length) return;

  const points = embeddedChunks.map((chunk) => ({
    // Qdrant point IDs must be a positive integer or UUID — combining
    // documentId + chunkIndex into a stable string and hashing it keeps
    // re-uploads of the same document idempotent-ish, but for Day 4
    // simplicity we generate a fresh UUID per point.
    id: cryptoRandomId(),
    vector: chunk.embedding,
    payload: {
      documentId,
      documentName: chunk.documentName,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      chunkText: chunk.text,
    },
  }));

  await client.upsert(COLLECTION_NAME, {
    wait: true, // wait for the write to be confirmed before returning
    points,
  });

  console.log(
    `[vectorService] Stored ${points.length} chunks for document "${documentId}"`
  );
}

/**
 * Converts a natural-language query into an embedding, searches Qdrant for
 * the closest stored chunks, and returns them with their metadata and
 * similarity score.
 *
 * "Similar" here means cosine similarity between the query's vector and
 * each stored chunk's vector — chunks whose meaning is closest to the
 * query, not chunks that share exact keywords.
 *
 * @param {string} query - Natural language search text
 * @param {number} topK - How many results to return
 * @returns {Promise<Array<{documentName:string, pageNumber:number|null, chunkIndex:number, similarityScore:number, text:string}>>}
 */
async function searchRelevantChunks(query, topK = 5) {
  await ensureCollection();

  const queryEmbedding = await generateEmbedding(query);

  const results = await client.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: topK,
    with_payload: true,
  });

  return results.map((result) => ({
    documentName: result.payload.documentName,
    pageNumber: result.payload.pageNumber,
    chunkIndex: result.payload.chunkIndex,
    similarityScore: result.score,
    text: result.payload.chunkText,
  }));
}

function cryptoRandomId() {
  // Node's built-in crypto.randomUUID() — no extra dependency needed.
  return require("crypto").randomUUID();
}

module.exports = {
  ensureCollection,
  storeChunks,
  searchRelevantChunks,
  COLLECTION_NAME,
  VECTOR_SIZE,
};