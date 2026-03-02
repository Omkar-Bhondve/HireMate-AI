const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor() {
    this.client = null;
    this.model = null;
  }

  _initModel() {
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        throw new Error("GEMINI_API_KEY is not configured in .env file");
      }
      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
    }
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async analyzeResume(resumeText, jobTitle, jobDescription) {
    this._initModel();

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze the following resume against the given job description. Provide a detailed, actionable analysis.

**Job Title:** ${jobTitle}

**Job Description:**
${jobDescription}

**Resume Text:**
${resumeText}

Respond ONLY with a valid JSON object (no markdown, no code blocks, no extra text) in this exact format:
{
  "missingSkills": ["skill1", "skill2", "skill3"],
  "suggestions": [
    "Specific suggestion 1 to improve the resume for this role",
    "Specific suggestion 2 to improve the resume for this role",
    "Specific suggestion 3 to improve the resume for this role"
  ],
  "optimizedBullets": [
    "Optimized bullet point 1 tailored to the job description",
    "Optimized bullet point 2 tailored to the job description",
    "Optimized bullet point 3 tailored to the job description",
    "Optimized bullet point 4 tailored to the job description",
    "Optimized bullet point 5 tailored to the job description"
  ],
  "overallFeedback": "A 2-3 sentence overall assessment of how well the resume matches this role"
}

Important rules:
- missingSkills: List 3-8 specific technical or soft skills mentioned in the JD but missing or underrepresented in the resume
- suggestions: List 3-5 specific, actionable improvement suggestions
- optimizedBullets: Rewrite 5 resume bullet points to better match the job description, using strong action verbs and quantifiable metrics where possible
- overallFeedback: Brief overall assessment
- Return ONLY the JSON object, nothing else`;

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `📡 Sending request to Gemini API (attempt ${attempt}/${maxRetries})...`,
        );
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        console.log("✅ Gemini API responded, parsing JSON...");

        // Clean up the response - remove markdown code blocks if present
        text = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const parsed = JSON.parse(text);
        console.log("✅ AI analysis parsed successfully");
        return parsed;
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);

        // If rate limited and we have retries left, wait and retry
        if (error.message?.includes("429") && attempt < maxRetries) {
          const waitTime = attempt * 12; // 12s, 24s
          console.log(`⏳ Rate limited. Waiting ${waitTime}s before retry...`);
          await this._sleep(waitTime * 1000);
          continue;
        }

        // Final attempt or non-retryable error
        if (
          error.message?.includes("API_KEY") ||
          error.message?.includes("403")
        ) {
          throw new Error(
            "Invalid Gemini API key. Please check your GEMINI_API_KEY in .env",
          );
        }
        if (error.message?.includes("429")) {
          throw new Error(
            "Gemini free-tier rate limit exceeded. Please wait a minute and try again.",
          );
        }
        if (error instanceof SyntaxError) {
          throw new Error("AI returned an invalid response. Please try again.");
        }
        throw new Error(`AI analysis failed: ${error.message}`);
      }
    }
  }
}

module.exports = new AIService();
