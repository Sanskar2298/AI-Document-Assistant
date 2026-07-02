const express = require("express");
const ChatController = require("../controllers/chatController");

const router = express.Router();

// POST /api/chat  { "question": "..." }  →  { success, answer, sources: [...] }
router.post("/chat", ChatController.ask);

module.exports = router;