const pool = require("../config/db");
const aiService = require("../services/aiService");

/**
 * Create a new job application
 */
const createApplication = async (req, res) => {
  try {
    const { companyName, jobTitle, atsScore, analysisId, notes } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Company name and job title are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO job_applications 
        (user_id, analysis_id, company_name, job_title, ats_score, status, notes) 
       VALUES ($1, $2, $3, $4, $5, 'Saved', $6) 
       RETURNING *`,
      [
        req.user.id,
        analysisId || null,
        companyName,
        jobTitle,
        atsScore || null,
        notes || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Application created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create Application Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create application.",
    });
  }
};

/**
 * Get all applications for current user
 */
const getApplications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM job_applications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get Applications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

/**
 * Update an application (status, notes, dates)
 */
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, jobTitle, status, appliedDate, followUpDate, notes } =
      req.body;

    // Verify ownership
    const existing = await pool.query(
      `SELECT * FROM job_applications WHERE id = $1 AND user_id = $2`,
      [id, req.user.id],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    // Auto-set follow-up date when status changes to "Applied"
    let finalFollowUpDate =
      followUpDate !== undefined
        ? followUpDate
        : existing.rows[0].follow_up_date;
    let finalAppliedDate =
      appliedDate !== undefined ? appliedDate : existing.rows[0].applied_date;
    let finalFollowUpType = existing.rows[0].follow_up_type;

    if (status === "Applied" && existing.rows[0].status !== "Applied") {
      // Set applied date to today if not provided
      if (!finalAppliedDate) {
        finalAppliedDate = new Date().toISOString().split("T")[0];
      }
      // Set follow-up to 5 days from today
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + 5);
      finalFollowUpDate = followUp.toISOString().split("T")[0];
      finalFollowUpType = "Application";
    } else if (
      status === "Interview" &&
      existing.rows[0].status !== "Interview"
    ) {
      // Set follow-up to 2 days after interview
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + 2);
      finalFollowUpDate = followUp.toISOString().split("T")[0];
      finalFollowUpType = "Interview";
    }

    const result = await pool.query(
      `UPDATE job_applications 
       SET company_name = COALESCE($1, company_name),
           job_title = COALESCE($2, job_title),
           status = COALESCE($3, status),
           applied_date = $4,
           follow_up_date = $5,
           follow_up_type = COALESCE($6, follow_up_type),
           notes = COALESCE($7, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 
       RETURNING *`,
      [
        companyName,
        jobTitle,
        status,
        finalAppliedDate,
        finalFollowUpDate,
        finalFollowUpType,
        notes,
        id,
        req.user.id,
      ],
    );

    res.json({
      success: true,
      message: "Application updated successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Application Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update application.",
    });
  }
};

/**
 * Delete an application
 */
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Application Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete application.",
    });
  }
};

/**
 * Get analytics/stats for current user
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. Basic Stats
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Applied') as applied,
        COUNT(*) FILTER (WHERE status = 'Interview') as interviews,
        COUNT(*) FILTER (WHERE status = 'Offer') as offers,
        COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'Saved') as saved,
        AVG(ats_score) as avg_ats
       FROM job_applications 
       WHERE user_id = $1`,
      [req.user.id],
    );

    const stats = result.rows[0];
    const total = parseInt(stats.total);
    const interviews = parseInt(stats.interviews);
    const offers = parseInt(stats.offers);
    const avgAtsScore = stats.avg_ats
      ? Math.round(parseFloat(stats.avg_ats))
      : 0;

    const interviewRate =
      total > 0 ? Math.round((interviews / total) * 100) : 0;
    const offerRate =
      interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    // 2. Most Applied Role
    const roleResult = await pool.query(
      `SELECT job_title, COUNT(*) as count 
       FROM job_applications 
       WHERE user_id = $1 
       GROUP BY job_title 
       ORDER BY count DESC 
       LIMIT 1`,
      [req.user.id],
    );
    const mostAppliedRole =
      roleResult.rows.length > 0 ? roleResult.rows[0].job_title : null;

    // 3. Chart Data: Applications per day for the last 7 days
    const chartQuery = await pool.query(
      `WITH dates AS (
         SELECT current_date - i AS date
         FROM generate_series(0, 6) i
       )
       SELECT 
         to_char(dates.date, 'Mon DD') as name,
         COUNT(ja.id) as value
       FROM dates
       LEFT JOIN job_applications ja 
         ON date_trunc('day', ja.created_at) = dates.date 
         AND ja.user_id = $1
       GROUP BY dates.date
       ORDER BY dates.date ASC`,
      [req.user.id],
    );

    // 4. Reminders
    const reminders = await pool.query(
      `SELECT id, company_name, job_title, follow_up_date, follow_up_type 
       FROM job_applications 
       WHERE user_id = $1 
         AND status IN ('Applied', 'Interview')
         AND follow_up_date IS NOT NULL 
         AND follow_up_date <= CURRENT_DATE
         AND reminder_sent = false
       ORDER BY follow_up_date ASC`,
      [req.user.id],
    );

    // 5. Smart Insights
    const insights = [];
    if (total > 10) {
      if (interviewRate < 10) {
        insights.push({
          type: "warning",
          text: "Your interview rate is below average (<10%). Consider improving resume keyword optimization to boost your ATS match scores.",
        });
      } else if (interviewRate > 20) {
        insights.push({
          type: "success",
          text: "Great job! Your interview rate is above average. Your resume optimization strategy is working well.",
        });
      }

      if (avgAtsScore < 60) {
        insights.push({
          type: "warning",
          text: `Your average ATS score is ${avgAtsScore}%. Try to target 75%+ before applying to increase your chances.`,
        });
      }
    }

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        applied: parseInt(stats.applied),
        interviews: parseInt(stats.interviews),
        offers: parseInt(stats.offers),
        rejected: parseInt(stats.rejected),
        saved: parseInt(stats.saved),
        interviewRate,
        offerRate,
        avgAtsScore,
        mostAppliedRole,
        chartData: chartQuery.rows,
        reminders: reminders.rows,
        insights,
      },
    });
  } catch (error) {
    console.error("Get Analytics Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

/**
 * Generate AI Follow-Up Email
 */
const generateFollowUpEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Get application details
    const existing = await pool.query(
      `SELECT * FROM job_applications WHERE id = $1 AND user_id = $2`,
      [id, req.user.id],
    );

    if (existing.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    const app = existing.rows[0];
    const daysSince = Math.floor(
      (new Date() - new Date(app.applied_date || app.created_at)) /
        (1000 * 60 * 60 * 24),
    );

    // Prepare prompt
    const promptContext =
      app.follow_up_type === "Interview"
        ? `Generate a professional, polite, and concise follow-up email after a job interview.`
        : `Generate a professional, polite, and concise follow-up email to check on the status of a job application.`;

    const prompt = `
      ${promptContext}
      Details:
      - Job Title: ${app.job_title}
      - Company: ${app.company_name}
      - Time since ${app.follow_up_type === "Interview" ? "interview" : "application"}: ${daysSince} days
      
      Requirements:
      - Start directly with the subject line formatted exactly as "Subject: [Your Subject Here]"
      - Keep it under 150 words.
      - Make it sound confident but not pushy.
      - Use placeholders like [Hiring Manager Name] where necessary.
      - End with a professional sign-off with a placeholder for the candidate's name.
    `;

    // Initialize AI & get response
    await aiService._initModel();
    const result = await aiService.model.generateContent(prompt);
    const emailData = result.response.text();

    res.json({
      success: true,
      data: emailData,
    });
  } catch (error) {
    console.error("Generate Email Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate follow-up email.",
    });
  }
};

module.exports = {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  getAnalytics,
  generateFollowUpEmail,
};
