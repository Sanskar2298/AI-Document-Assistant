const { getOrGenerateSection, VALID_SECTIONS } = require("../services/studyModeService");
const { getText } = require("../services/documentTextStore");

class StudyModeController {
    static async getSection(req, res, next) {
        try {
            const { documentId, section } = req.params;

            if (!VALID_SECTIONS.includes(section)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}`,
                });
            }

            const text = getText(documentId);
            if (!text) {
                return res.status(404).json({
                    success: false,
                    message: "Document text not found. It may have been cleared or the server restarted.",
                });
            }

            const content = await getOrGenerateSection(documentId, text, section);
            res.status(200).json({ success: true, section, content });
        } catch (error) {
            console.error("[studyModeController] Generation failed:", error.message);
            res.status(502).json({
                success: false,
                message: "Failed to generate study material. Please try again.",
            });
        }
    }
}

module.exports = StudyModeController;