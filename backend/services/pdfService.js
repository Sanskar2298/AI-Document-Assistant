const { PDFParse } = require("pdf-parse");

class PdfService {
    static async extractText(buffer) {
        let parser;
        try {
            parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            return {
                text: result.text,
                pages: result.total,
            };
        } catch (error) {
            throw new Error("Failed to parse PDF file: " + error.message);
        } finally {
            if (parser) {
                await parser.destroy().catch(() => {});
            }
        }
    }
}

module.exports = PdfService;
