const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const documentController = require("../controllers/documentController");

const router = express.Router();

router.post("/upload", upload.single("file"), documentController.upload);

module.exports = router;
