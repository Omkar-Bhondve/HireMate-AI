const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const pool = require("../config/db");
const atsScorer = require("../services/atsScorer");
const aiService = require("../services/aiService");

/**
 * Analyze resume against job description
 */
const analyzeResume = async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;
    const file = req.file;

    // Validation
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Please provide job title and job description.",
      });
    }

    // Step 1: Extract text from PDF
    const filePath = path.resolve(file.path);
    const fileBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
    const pdfData = await parser.getText();
    await parser.destroy();
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message:
          "Could not extract sufficient text from the resume. Please upload a text-based PDF.",
      });
    }

    // Step 2: Calculate ATS Score
    const atsResult = atsScorer.calculate(resumeText, jobDescription);

    // Step 3: AI Analysis
    const aiAnalysis = await aiService.analyzeResume(
      resumeText,
      jobTitle,
      jobDescription,
    );

    // Step 4: Save to database
    const result = await pool.query(
      `INSERT INTO analyses 
        (user_id, job_title, job_description, resume_filename, resume_text, ats_score, missing_skills, suggestions, optimized_bullets) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, created_at`,
      [
        req.user.id,
        jobTitle,
        jobDescription,
        file.originalname,
        resumeText,
        atsResult.score,
        JSON.stringify(aiAnalysis.missingSkills || []),
        JSON.stringify(aiAnalysis.suggestions || []),
        JSON.stringify(aiAnalysis.optimizedBullets || []),
      ],
    );

    // Clean up uploaded file after processing
    fs.unlinkSync(filePath);

    // Step 5: Return combined result
    res.json({
      success: true,
      message: "Resume analyzed successfully!",
      data: {
        id: result.rows[0].id,
        jobTitle: jobTitle,
        atsScore: atsResult.score,
        matchedKeywords: atsResult.matchedKeywords,
        unmatchedKeywords: atsResult.unmatchedKeywords,
        totalKeywords: atsResult.totalKeywords,
        matchedCount: atsResult.matchedCount,
        missingSkills: aiAnalysis.missingSkills || [],
        suggestions: aiAnalysis.suggestions || [],
        optimizedBullets: aiAnalysis.optimizedBullets || [],
        overallFeedback: aiAnalysis.overallFeedback || "",
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Analysis Error:", error.message);

    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(path.resolve(req.file.path));
      } catch (e) {}
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze resume. Please try again.",
    });
  }
};

/**
 * Get analysis history for current user
 */
const getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, job_title, resume_filename, ats_score, created_at 
       FROM analyses 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get History Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

/**
 * Get a specific analysis by ID
 */
const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM analyses WHERE id = $1 AND user_id = $2`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found.",
      });
    }

    const analysis = result.rows[0];

    res.json({
      success: true,
      data: {
        id: analysis.id,
        jobTitle: analysis.job_title,
        jobDescription: analysis.job_description,
        resumeFilename: analysis.resume_filename,
        atsScore: analysis.ats_score,
        missingSkills: analysis.missing_skills,
        suggestions: analysis.suggestions,
        optimizedBullets: analysis.optimized_bullets,
        createdAt: analysis.created_at,
      },
    });
  } catch (error) {
    console.error("Get Analysis Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

module.exports = { analyzeResume, getHistory, getAnalysisById };
