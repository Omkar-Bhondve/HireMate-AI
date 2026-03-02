const express = require("express");
const {
  analyzeResume,
  getHistory,
  getAnalysisById,
} = require("../controllers/analysisController");
const authMiddleware = require("../middleware/auth");
const upload = require("../config/multer");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Analyze resume (upload + analysis)
router.post("/analyze", upload.single("resume"), analyzeResume);

// Get analysis history
router.get("/history", getHistory);

// Get specific analysis
router.get("/:id", getAnalysisById);

module.exports = router;
