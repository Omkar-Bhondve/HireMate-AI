/**
 * ATS Score Calculator
 * Calculates a basic ATS compatibility score by comparing
 * keywords from the job description against the resume text.
 */

class ATSScorer {
  /**
   * Extract meaningful keywords from text
   */
  extractKeywords(text) {
    // Common stop words to filter out
    const stopWords = new Set([
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "shall",
      "can",
      "need",
      "must",
      "this",
      "that",
      "these",
      "those",
      "i",
      "me",
      "my",
      "we",
      "our",
      "you",
      "your",
      "he",
      "him",
      "his",
      "she",
      "her",
      "it",
      "its",
      "they",
      "them",
      "their",
      "what",
      "which",
      "who",
      "whom",
      "when",
      "where",
      "why",
      "how",
      "all",
      "each",
      "every",
      "both",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "than",
      "too",
      "very",
      "just",
      "about",
      "above",
      "after",
      "again",
      "also",
      "any",
      "as",
      "back",
      "because",
      "before",
      "between",
      "down",
      "during",
      "even",
      "first",
      "get",
      "go",
      "good",
      "here",
      "high",
      "if",
      "into",
      "know",
      "like",
      "long",
      "look",
      "make",
      "much",
      "new",
      "no",
      "not",
      "now",
      "old",
      "only",
      "over",
      "own",
      "part",
      "right",
      "same",
      "see",
      "so",
      "still",
      "take",
      "then",
      "there",
      "think",
      "time",
      "two",
      "under",
      "up",
      "use",
      "way",
      "well",
      "work",
      "able",
      "etc",
      "including",
      "experience",
      "role",
      "position",
      "company",
      "team",
      "working",
      "strong",
      "excellent",
      "preferred",
      "required",
      "requirements",
      "qualifications",
      "responsibilities",
      "years",
      "year",
      "minimum",
      "plus",
      "join",
      "looking",
    ]);

    // Normalize and tokenize
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s\-\+\#\.]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.has(word));

    // Also extract multi-word phrases (2-3 word combinations)
    const normalizedText = text.toLowerCase();
    const commonTechPhrases = this._extractPhrases(normalizedText);

    return [...new Set([...words, ...commonTechPhrases])];
  }

  /**
   * Extract common multi-word technical phrases
   */
  _extractPhrases(text) {
    const phrases = [];
    const commonPhrases = [
      "machine learning",
      "deep learning",
      "data science",
      "data analysis",
      "project management",
      "agile methodology",
      "scrum master",
      "full stack",
      "front end",
      "back end",
      "ci cd",
      "ci/cd",
      "unit testing",
      "test driven",
      "object oriented",
      "rest api",
      "restful api",
      "graphql api",
      "cloud computing",
      "aws",
      "azure",
      "google cloud",
      "gcp",
      "version control",
      "git",
      "docker",
      "kubernetes",
      "react js",
      "react.js",
      "reactjs",
      "node js",
      "node.js",
      "nodejs",
      "vue js",
      "vue.js",
      "angular js",
      "angular",
      "type script",
      "typescript",
      "javascript",
      "python",
      "java",
      "c++",
      "c#",
      "ruby",
      "go",
      "rust",
      "swift",
      "sql",
      "nosql",
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "problem solving",
      "communication skills",
      "team leadership",
      "product management",
      "user experience",
      "ui ux",
      "ui/ux",
    ];

    for (const phrase of commonPhrases) {
      if (text.includes(phrase)) {
        phrases.push(phrase);
      }
    }

    return phrases;
  }

  /**
   * Calculate ATS score
   * @param {string} resumeText - Extracted resume text
   * @param {string} jobDescription - Job description text
   * @returns {object} - Score details
   */
  calculate(resumeText, jobDescription) {
    const jdKeywords = this.extractKeywords(jobDescription);
    const resumeLower = resumeText.toLowerCase();

    let matchedCount = 0;
    const matchedKeywords = [];
    const unmatchedKeywords = [];

    for (const keyword of jdKeywords) {
      if (resumeLower.includes(keyword)) {
        matchedCount++;
        matchedKeywords.push(keyword);
      } else {
        unmatchedKeywords.push(keyword);
      }
    }

    const totalKeywords = jdKeywords.length;
    const score =
      totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;

    // Clamp between 0-100
    const finalScore = Math.min(100, Math.max(0, score));

    return {
      score: finalScore,
      totalKeywords,
      matchedCount,
      matchedKeywords: [...new Set(matchedKeywords)].slice(0, 20),
      unmatchedKeywords: [...new Set(unmatchedKeywords)].slice(0, 20),
    };
  }
}

module.exports = new ATSScorer();
