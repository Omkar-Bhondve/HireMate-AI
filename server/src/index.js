const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const pool = require("./config/db");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "HireMate AI Server is running 🚀" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/applications", applicationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 HireMate AI Server Running       ║
  ║   📡 Port: ${PORT}                        ║
  ║   🌍 Mode: ${process.env.NODE_ENV || "development"}              ║
  ╚════════════════════════════════════════╝
  `);

  // Start Cron Jobs (Daily Check at 9:00 AM)
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running daily follow-up check...");
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as pending 
        FROM job_applications 
        WHERE status IN ('Applied', 'Interview')
          AND follow_up_date <= CURRENT_DATE
          AND reminder_sent = false
      `);
      console.log(
        `🔔 Found ${result.rows[0].pending} pending follow-ups today.`,
      );
    } catch (err) {
      console.error("Cron Job Error:", err.message);
    }
  });
});

module.exports = app;
