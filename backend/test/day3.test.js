const test = require('node:test');
const assert = require('node:assert/strict');

const { chunkDocument } = require('../services/chunkService');

test('chunkDocument produces ordered chunks with metadata', () => {
    const text = 'one two three four five six seven eight nine ten';
    const chunks = chunkDocument(text, {
        documentName: 'sample.pdf',
        chunkSize: 20,
        chunkOverlap: 5,
    });

    assert.ok(chunks.length > 0);
    assert.equal(chunks[0].documentName, 'sample.pdf');
    assert.equal(chunks[0].chunkIndex, 0);
    assert.equal(chunks[0].characterCount, chunks[0].text.length);
    assert.equal(chunks[0].pageNumber, null);
});

test('embedding service can be loaded without a Gemini API key', () => {
    delete process.env.GEMINI_API_KEY;
    delete require.cache[require.resolve('../services/embeddingService')];

    const embeddingService = require('../services/embeddingService');

    assert.equal(typeof embeddingService.generateEmbeddingsForChunks, 'function');
});
