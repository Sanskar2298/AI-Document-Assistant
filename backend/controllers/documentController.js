const PdfService = require("../services/pdfService");
const { chunkDocument } = require("../services/chunkService");
const { generateEmbeddingsForChunks } = require("../services/embeddingService");
const { storeChunks, deleteAllChunks, deleteDocument } = require("../services/vectorService");
const { generateInsights, getInsights } = require("../services/documentInsightsService");
const { storeText, setDisplayName, deleteDocumentData } = require("../services/documentTextStore");
const { storeFile, getFile, deleteFile } = require("../services/documentFileStore");
const { randomUUID } = require("crypto");

class DocumentController {
    static async upload(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded or file is not a PDF." });
            }

            const { originalname, buffer } = req.file;

            const { text, pages } = await PdfService.extractText(buffer);
            const textLength = text.length;
            const preview = text.substring(0, 1000);

            const chunks = chunkDocument(text, {
                documentName: originalname,
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const embeddedChunks = await generateEmbeddingsForChunks(chunks);
            const documentId = randomUUID();
            await storeChunks(embeddedChunks, documentId);

            storeText(documentId, text);
            setDisplayName(documentId, originalname);
            storeFile(documentId, buffer); // NEW — needed for the PDF viewer to actually render the file

            let insights = null;
            try {
                insights = await generateInsights(documentId, text, pages);
            } catch (insightError) {
                console.error("[documentController] Insight generation failed:", insightError.message);
            }

            res.status(200).json({
                success: true,
                documentId,
                fileName: originalname,
                pages,
                textLength,
                chunksCreated: chunks.length,
                embeddingsGenerated: embeddedChunks.length,
                preview,
                insights,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getInsights(req, res, next) {
        try {
            const { documentId } = req.params;
            const insights = getInsights(documentId);
            if (!insights) {
                return res.status(404).json({ success: false, message: "No insights found for this document." });
            }
            res.status(200).json({ success: true, insights });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/documents/:documentId/file — serves back the raw PDF for
     * the viewer to render. Content-Type is set explicitly since this
     * bypasses Express's normal JSON response pattern.
     */
    static async getFile(req, res, next) {
        try {
            const { documentId } = req.params;
            const buffer = getFile(documentId);

            if (!buffer) {
                return res.status(404).json({ success: false, message: "File not found. It may have been cleared or the server restarted." });
            }

            res.setHeader("Content-Type", "application/pdf");
            res.send(buffer);
        } catch (error) {
            next(error);
        }
    }

    static async deleteOne(req, res, next) {
        try {
            const { documentId } = req.params;
            await deleteDocument(documentId);
            deleteDocumentData(documentId);
            deleteFile(documentId);
            res.status(200).json({ success: true, message: "Document deleted." });
        } catch (error) {
            next(error);
        }
    }

    static async rename(req, res, next) {
        try {
            const { documentId } = req.params;
            const { fileName } = req.body;

            if (!fileName || !fileName.trim()) {
                return res.status(400).json({ success: false, message: "fileName is required." });
            }

            setDisplayName(documentId, fileName.trim());
            res.status(200).json({ success: true, documentId, fileName: fileName.trim() });
        } catch (error) {
            next(error);
        }
    }

    static async clearAll(req, res, next) {
        try {
            await deleteAllChunks();
            res.status(200).json({ success: true, message: "All documents cleared." });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DocumentController;