const express = require("express");
const healthController = require("../controllers/healthController");

const router = express.Router();

const documentRoutes = require("./documentRoutes");
const searchRoutes = require("./searchRoutes"); // NEW

const router2 = express.Router(); // (ignore, just for clarity below)

router.get("/", healthController.getWelcomeMessage);
router.get("/health", healthController.getHealthStatus);

router.use("/api/documents", documentRoutes);
router.use("/api", searchRoutes); // NEW — mounts POST /api/search

module.exports = router;