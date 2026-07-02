const express = require("express");
const SearchController = require("../controllers/searchController");

const router = express.Router();

// POST /api/search  { "query": "..." }  →  { success, results: [...] }
router.post("/search", SearchController.search);

module.exports = router;

/**
 * Mount this in your main app file alongside your existing document routes, e.g.:
 *
 *   const searchRoutes = require("./routes/searchRoutes");
 *   app.use("/api", searchRoutes);
 *
 * If your upload route is already mounted at /api (e.g. POST /api/upload),
 * this gives you POST /api/search alongside it.
 */