const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  getAnalytics,
  generateFollowUpEmail,
} = require("../controllers/applicationController");

// All routes are protected
router.use(auth);

router.post("/", createApplication);
router.get("/", getApplications);
router.get("/analytics", getAnalytics);
router.post("/:id/generate-follow-up", generateFollowUpEmail);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

module.exports = router;
