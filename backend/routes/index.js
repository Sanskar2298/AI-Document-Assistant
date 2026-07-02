const express = require("express");
const healthController = require("../controllers/healthController");

const router = express.Router();

const documentRoutes = require("./documentRoutes");
const searchRoutes = require("./searchRoutes");
const chatRoutes = require("./chatRoutes");

router.get("/", healthController.getWelcomeMessage);
router.get("/health", healthController.getHealthStatus);

router.use("/api/documents", documentRoutes);
router.use("/api", searchRoutes);
router.use("/api", chatRoutes);

module.exports = router;