/**
 * vectorService.js
 *
 * Unchanged responsibilities from Day 4 — the only file that talks to
 * Qdrant. This update adds one capability: searchRelevantChunks can now
 * optionally scope a search to specific documentIds. When no filter is
 * given (the default, and the only mode that existed before), it behaves
 * exactly as it always has — searching globally across every stored chunk.
 * That's what "multi-document reasoning by default" actually means here:
 * there was no per-document scoping before, so every question already
 * searched globally. The new piece is the ABILITY to narrow it, not the
 * global behavior itself.
 */

const { QdrantClient } = require("@qdrant/js-client-rest");
const { generateEmbedding } = require("./embeddingService");

const COLLECTION_NAME = "lexora_chunks";
const VECTOR_SIZE = 3072;
const DISTANCE_METRIC = "Cosine";

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY || undefined,
});

async function ensureCollection() {
  const existing = await client.getCollections();
  const alreadyExists = existing.collections.some((c) => c.name === COLLECTION_NAME);

  if (!alreadyExists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: { size: VECTOR_SIZE, distance: DISTANCE_METRIC },
    });
    console.log(`[vectorService] Created collection "${COLLECTION_NAME}"`);
  }

  // Runs every time, not just on first creation — Qdrant's createPayloadIndex
  // is idempotent (safe to call repeatedly), and this guarantees the index
  // exists even for collections that were created before this index logic
  // was added, without needing to delete and recreate anything.
  try {
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "documentId",
      field_schema: "keyword",
    });
  } catch (err) {
    // Ignore "already exists" errors from repeated calls; only log anything unexpected.
    if (!String(err.message || "").includes("already exists")) {
      console.error("[vectorService] Failed to ensure payload index:", err.message);
    }
  }
}

async function storeChunks(embeddedChunks, documentId) {
  await ensureCollection();
  if (!embeddedChunks.length) return;

  const points = embeddedChunks.map((chunk) => ({
    id: require("crypto").randomUUID(),
    vector: chunk.embedding,
    payload: {
      documentId,
      documentName: chunk.documentName,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      chunkText: chunk.text,
    },
  }));

  await client.upsert(COLLECTION_NAME, { wait: true, points });
  console.log(`[vectorService] Stored ${points.length} chunks for document "${documentId}"`);
}

/**
 * Searches for the topK most similar chunks, optionally scoped to a set
 * of documentIds.
 *
 * @param {string} query
 * @param {number} topK
 * @param {string[]} [documentIds] - If provided and non-empty, restricts the
 *   search to only chunks belonging to these document IDs. Omit or pass an
 *   empty array to search globally across all stored documents (default,
 *   unchanged behavior).
 * @returns {Promise<Array<{documentId:string, documentName:string, pageNumber:number|null, chunkIndex:number, similarityScore:number, text:string}>>}
 */
async function searchRelevantChunks(query, topK = 5, documentIds = []) {
  await ensureCollection();

  const queryEmbedding = await generateEmbedding(query);

  const searchParams = {
    vector: queryEmbedding,
    limit: topK,
    with_payload: true,
  };

  // Qdrant filter syntax: "match any of these documentIds". Only applied
  // when the caller actually wants scoping — omitting it entirely (rather
  // than passing an always-true filter) keeps the default global-search
  // path identical to before.
  if (documentIds.length > 0) {
    searchParams.filter = {
      must: [{ key: "documentId", match: { any: documentIds } }],
    };
  }

  const results = await client.search(COLLECTION_NAME, searchParams);

  return results.map((result) => ({
    documentId: result.payload.documentId,
    documentName: result.payload.documentName,
    pageNumber: result.payload.pageNumber,
    chunkIndex: result.payload.chunkIndex,
    similarityScore: result.score,
    text: result.payload.chunkText,
  }));
}

/**
 * Deletes the entire collection and lets it get recreated fresh on the
 * next upload. Exists specifically so old test uploads don't silently
 * keep influencing searches forever — there was previously no way to
 * reset Qdrant short of doing it manually in the cloud console.
 */
async function deleteAllChunks() {
  const existing = await client.getCollections();
  const exists = existing.collections.some((c) => c.name === COLLECTION_NAME);
  if (exists) {
    await client.deleteCollection(COLLECTION_NAME);
    console.log(`[vectorService] Deleted collection "${COLLECTION_NAME}"`);
  }
}

/**
 * Deletes only the points belonging to one document, using the payload
 * index on documentId. Real deletion from Qdrant — not a session-only
 * removal like the old frontend-only "remove" was.
 */
async function deleteDocument(documentId) {
  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: "documentId", match: { value: documentId } }],
    },
  });
  console.log(`[vectorService] Deleted all chunks for document "${documentId}"`);
}

module.exports = {
  ensureCollection,
  storeChunks,
  searchRelevantChunks,
  deleteAllChunks,
  deleteDocument,
  COLLECTION_NAME,
  VECTOR_SIZE,
};