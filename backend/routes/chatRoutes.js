const express = require("express");
const ChatController = require("../controllers/chatController");

const router = express.Router();

// POST /api/chat  { question, selectedDocumentIds?, searchScope? }  →  { success, answer, sources, documentsUsed }
router.post("/chat", ChatController.ask);

// POST /api/chat/stream  same body  →  Server-Sent Events (status/token/sources/done/error)
router.post("/chat/stream", ChatController.askStream);

module.exports = router;