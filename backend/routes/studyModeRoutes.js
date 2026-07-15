const express = require("express");
const StudyModeController = require("../controllers/studyModeController");

const router = express.Router();

// GET /api/documents/:documentId/study/:section
// section = flashcards | quiz | interview | cheatsheet | glossary
router.get("/:documentId/study/:section", StudyModeController.getSection);

module.exports = router;