/**
 * chunkService.js
 *
 * Splits extracted document text into smaller, overlapping chunks that are
 * suitable for embedding generation later (Day 3) and vector search (Day 4+).
 *
 * Why chunk at all?
 * - Embedding models have an input token limit, and a whole PDF's text
 *   almost never fits in one call.
 * - Smaller chunks give more precise retrieval later — a 50-page PDF chunked
 *   into ~500-character pieces lets future search return the exact
 *   paragraph that answers a question, not the entire document.
 *
 * This module has NO knowledge of embeddings, databases, or APIs.
 * It only takes text in and returns chunk objects out. That separation is
 * what makes it "reusable" — the same function works whether the caller is
 * an upload route today, a re-processing job later, or a test script.
 */

const DEFAULT_CHUNK_SIZE = 1000; // characters per chunk
const DEFAULT_CHUNK_OVERLAP = 200; // characters shared between consecutive chunks

/**
 * Splits a single block of text into overlapping chunks without cutting
 * words in half. Word-boundary splitting keeps chunks readable and avoids
 * feeding the embedding model fragments like "...proces" / "sing...".
 *
 * @param {string} text - Raw text to split
 * @param {number} chunkSize - Target max characters per chunk
 * @param {number} chunkOverlap - Characters of overlap between chunks
 * @returns {string[]} Array of raw text chunks (no metadata yet)
 */
function splitTextIntoChunks(text, chunkSize, chunkOverlap) {
  if (chunkOverlap >= chunkSize) {
    throw new Error("chunkOverlap must be smaller than chunkSize");
  }

  const cleanedText = text.replace(/\s+/g, " ").trim();
  if (!cleanedText) return [];

  const words = cleanedText.split(" ");
  const chunks = [];

  let currentChunk = "";
  let i = 0;

  while (i < words.length) {
    const word = words[i];
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;

    if (candidate.length > chunkSize && currentChunk) {
      // Current chunk is full — push it and start the next one.
      chunks.push(currentChunk);

      // Build the overlap: walk backwards from the end of the chunk we just
      // pushed, collecting whole words until we've covered `chunkOverlap`
      // characters. This becomes the seed for the next chunk so context
      // isn't lost at the boundary.
      const overlapWords = [];
      let overlapLength = 0;
      const wordsInChunk = currentChunk.split(" ");

      for (let j = wordsInChunk.length - 1; j >= 0 && overlapLength < chunkOverlap; j--) {
        overlapWords.unshift(wordsInChunk[j]);
        overlapLength += wordsInChunk[j].length + 1;
      }

      currentChunk = overlapWords.join(" ");
      // Re-process the current word against the new (overlap-seeded) chunk.
      currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
    } else {
      currentChunk = candidate;
    }

    i++;
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Turns extracted document text into an array of metadata-rich chunk
 * objects, ready for embedding generation.
 *
 * Accepts either:
 *  - a single string (whole-document text), or
 *  - an array of { pageNumber, text } objects, if the extraction step
 *    already tracked page boundaries.
 *
 * Using page-aware input is optional — Day 2's extraction may or may not
 * preserve per-page text. If it doesn't, pass a plain string and
 * pageNumber will simply be null on every chunk.
 *
 * @param {string|{pageNumber:number, text:string}[]} input
 * @param {object} options
 * @param {string} options.documentName - Original file name, stored on every chunk
 * @param {number} [options.chunkSize=1000]
 * @param {number} [options.chunkOverlap=200]
 * @returns {Array<{
 *   chunkIndex: number,
 *   documentName: string,
 *   pageNumber: number|null,
 *   text: string,
 *   characterCount: number
 * }>}
 */
function chunkDocument(input, options = {}) {
  const {
    documentName,
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
  } = options;

  if (!documentName) {
    throw new Error("chunkDocument requires options.documentName");
  }

  const pages = Array.isArray(input)
    ? input
    : [{ pageNumber: null, text: input }];

  const allChunks = [];
  let chunkIndex = 0;

  // Chunking page-by-page (instead of joining all text first) is what
  // preserves document order AND lets us tag each chunk with the correct
  // pageNumber. chunkIndex still increments globally across the whole
  // document, so downstream consumers get one continuous, ordered sequence.
  for (const page of pages) {
    const pageChunks = splitTextIntoChunks(page.text || "", chunkSize, chunkOverlap);

    for (const chunkText of pageChunks) {
      allChunks.push({
        chunkIndex,
        documentName,
        pageNumber: page.pageNumber ?? null,
        text: chunkText,
        characterCount: chunkText.length,
      });
      chunkIndex++;
    }
  }

  return allChunks;
}

module.exports = {
  chunkDocument,
  splitTextIntoChunks, // exported separately so it can be unit-tested in isolation
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP,
};