const express = require("express");
const healthController = require("../controllers/healthController");

const router = express.Router();

const documentRoutes = require("./documentRoutes");

router.get("/", healthController.getWelcomeMessage);
router.get("/health", healthController.getHealthStatus);

router.use("/api/documents", documentRoutes);

module.exports = router;
