const PdfService = require("../services/pdfService");
const { chunkDocument } = require("../services/chunkService");
const { generateEmbeddingsForChunks } = require("../services/embeddingService");
const { storeChunks } = require("../services/vectorService");
const { randomUUID } = require("crypto");

class DocumentController {
    static async upload(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded or file is not a PDF." });
            }

            const { originalname, buffer } = req.file;

            // Extract text from the PDF buffer
            const { text, pages } = await PdfService.extractText(buffer);

            // Calculate text length and generate preview
            const textLength = text.length;
            const preview = text.substring(0, 1000);

            // Day 3: chunking
            const chunks = chunkDocument(text, {
                documentName: originalname,
                chunkSize: 1000,
                chunkOverlap: 200,
            });

            // Day 3: embeddings
            const embeddedChunks = await generateEmbeddingsForChunks(chunks);

            // ============ NEW: Day 4 — store in vector database ============
            // Replaces Day 3's in-memory Map. Qdrant now persists the
            // chunks + vectors, so they survive server restarts and can be
            // searched without keeping everything in RAM.
            const documentId = randomUUID();
            await storeChunks(embeddedChunks, documentId);

            res.status(200).json({
                success: true,
                fileName: originalname,
                pages,
                textLength,
                chunksCreated: chunks.length,
                embeddingsGenerated: embeddedChunks.length,
                preview
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DocumentController;