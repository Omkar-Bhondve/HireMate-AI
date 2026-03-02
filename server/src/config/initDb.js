const pool = require("./db");

const initDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create analyses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_title VARCHAR(255) NOT NULL,
        job_description TEXT NOT NULL,
        resume_filename VARCHAR(255) NOT NULL,
        resume_text TEXT,
        ats_score INTEGER,
        missing_skills JSONB,
        suggestions JSONB,
        optimized_bullets JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create job_applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        analysis_id INTEGER REFERENCES analyses(id) ON DELETE SET NULL,
        company_name VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        ats_score INTEGER,
        status VARCHAR(20) DEFAULT 'Saved' CHECK (status IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
        applied_date DATE,
        follow_up_date DATE,
        follow_up_type VARCHAR(50) DEFAULT 'Application',
        reminder_sent BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add new fields to existing table if they don't exist
    try {
      await pool.query(`
        ALTER TABLE job_applications 
        ADD COLUMN follow_up_type VARCHAR(50) DEFAULT 'Application',
        ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
      `);
      console.log("✅ Added new columns to job_applications");
    } catch (err) {
      if (err.code !== "42701") {
        // 42701 is "duplicate_column" error code in Postgres
        console.error("Warning adding columns:", err.message);
      }
    }

    console.log("✅ Database tables created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    process.exit(1);
  }
};

initDatabase();
