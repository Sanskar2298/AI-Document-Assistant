const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const documentController = require("../controllers/documentController");

const router = express.Router();

router.post("/upload", upload.single("file"), documentController.upload);

router.delete("/", documentController.clearAll);

router.get("/:documentId/insights", documentController.getInsights);

router.delete("/:documentId", documentController.deleteOne);
router.patch("/:documentId", documentController.rename);

router.get("/:documentId/file", documentController.getFile);

module.exports = router;