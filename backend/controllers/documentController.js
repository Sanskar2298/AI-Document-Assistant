const PdfService = require("../services/pdfService");

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

            res.status(200).json({
                success: true,
                fileName: originalname,
                pages,
                textLength,
                preview
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DocumentController;
