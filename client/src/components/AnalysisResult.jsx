import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScoreGauge from "./ScoreGauge";
import { createApplication } from "../services/applicationService";
import {
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Target,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Copy,
  Briefcase,
  Check,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const AnalysisResult = ({ result, companyName }) => {
  const navigate = useNavigate();
  const [appCreated, setAppCreated] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  if (!result) return null;

  const copyBullet = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveApplication = async () => {
    try {
      setAppLoading(true);
      await createApplication({
        companyName: companyName || "Unknown Company",
        jobTitle: result.jobTitle || "Unknown Role",
        atsScore: result.atsScore,
        analysisId: result.id,
      });
      toast.success("Application saved! 🎯");
      setAppCreated(true);
    } catch (error) {
      toast.error("Failed to save application");
    } finally {
      setAppLoading(false);
    }
  };

  return (
    <div className="space-y-8 slide-up">
      {/* Header + Save Action */}
      <div className="text-center mb-2">
        <h2 className="text-3xl font-extrabold text-surface-100 mb-2">
          Analysis Complete <span className="inline-block">✨</span>
        </h2>
        <p className="text-surface-400 text-base mb-6">
          Here's how your resume matches the job description
        </p>

        {/* Save as Application - PRIMARY CTA */}
        {!appCreated ? (
          <button
            onClick={handleSaveApplication}
            disabled={appLoading}
            className="btn-primary mx-auto"
            style={{
              height: "48px",
              paddingLeft: "28px",
              paddingRight: "28px",
            }}
          >
            {appLoading ? (
              <div className="flex items-center gap-2">
                <div
                  className="spinner"
                  style={{ width: 18, height: 18, borderWidth: 2 }}
                />
                Saving...
              </div>
            ) : (
              <>
                <Briefcase size={18} />
                Save as Application
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <Check size={16} />
              Saved to Applications
            </div>
            <button
              onClick={() => navigate("/applications")}
              className="btn-ghost"
              style={{ padding: "10px 16px" }}
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Score + Overall Feedback */}
      <div className="glass-card p-5 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <ScoreGauge score={result.atsScore} />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2.5 mb-3 justify-center md:justify-start">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99, 102, 241, 0.1)" }}
              >
                <MessageSquare size={14} className="text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-surface-100">
                Overall Feedback
              </h3>
            </div>
            <p className="text-surface-300 leading-relaxed text-sm">
              {result.overallFeedback}
            </p>
            <div className="flex flex-wrap gap-4 mt-5 justify-center md:justify-start">
              {companyName && (
                <div
                  className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(139, 92, 246, 0.06)",
                    border: "1px solid rgba(139, 92, 246, 0.1)",
                  }}
                >
                  <Briefcase size={14} style={{ color: "#a78bfa" }} />
                  <span className="text-surface-300 font-medium">
                    {companyName}
                  </span>
                </div>
              )}
              <div
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(99, 102, 241, 0.06)",
                  border: "1px solid rgba(99, 102, 241, 0.1)",
                }}
              >
                <Target size={14} className="text-primary-400" />
                <span className="text-surface-300">
                  <strong className="text-primary-400">
                    {result.matchedCount}
                  </strong>
                  <span className="text-surface-500">
                    /{result.totalKeywords}
                  </span>{" "}
                  keywords matched
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <div className="glass-card p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(16, 185, 129, 0.1)" }}
            >
              <CheckCircle2 size={14} className="text-accent-400" />
            </div>
            <h3 className="text-sm font-bold text-surface-100 uppercase tracking-wide">
              Matched Keywords
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.matchedKeywords?.slice(0, 15).map((kw, i) => (
              <span key={i} className="chip chip-success">
                {kw}
              </span>
            ))}
            {(!result.matchedKeywords ||
              result.matchedKeywords.length === 0) && (
              <p className="text-surface-500 text-sm">
                No keyword matches found
              </p>
            )}
          </div>
        </div>

        {/* Unmatched Keywords */}
        <div className="glass-card p-5 md:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.1)" }}
            >
              <XCircle size={14} className="text-danger-400" />
            </div>
            <h3 className="text-sm font-bold text-surface-100 uppercase tracking-wide">
              Missing Keywords
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.unmatchedKeywords?.slice(0, 15).map((kw, i) => (
              <span key={i} className="chip chip-danger">
                {kw}
              </span>
            ))}
            {(!result.unmatchedKeywords ||
              result.unmatchedKeywords.length === 0) && (
              <p className="text-surface-500 text-sm">All keywords matched!</p>
            )}
          </div>
        </div>
      </div>

      {/* Missing Skills */}
      <div className="glass-card p-5 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(245, 158, 11, 0.1)" }}
          >
            <AlertTriangle size={14} className="text-warning-400" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">Missing Skills</h3>
          <span className="text-xs text-surface-500 ml-auto">
            {result.missingSkills?.length || 0} found
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.missingSkills?.map((skill, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: "rgba(245, 158, 11, 0.04)",
                border: "1px solid rgba(245, 158, 11, 0.08)",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(245, 158, 11, 0.12)" }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: "#fbbf24" }}
                >
                  {i + 1}
                </span>
              </div>
              <span className="text-surface-200 text-sm leading-relaxed">
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="glass-card p-5 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(99, 102, 241, 0.1)" }}
          >
            <Lightbulb size={14} className="text-primary-400" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">
            Improvement Suggestions
          </h3>
        </div>
        <div className="space-y-3">
          {result.suggestions?.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 p-4 rounded-xl"
              style={{
                background: "rgba(99, 102, 241, 0.04)",
                border: "1px solid rgba(99, 102, 241, 0.08)",
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(99, 102, 241, 0.12)" }}
              >
                <Lightbulb size={11} className="text-primary-400" />
              </div>
              <span className="text-surface-200 text-sm leading-relaxed flex-1">
                {suggestion}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Bullet Points */}
      <div className="glass-card p-5 md:p-7">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(16, 185, 129, 0.1)" }}
          >
            <Sparkles size={14} className="text-accent-400" />
          </div>
          <h3 className="text-lg font-bold text-surface-100">
            Optimized Bullet Points
          </h3>
        </div>
        <p className="text-surface-500 text-xs mb-5 sm:ml-10">
          Click to copy. Use these rewritten bullet points on your resume.
        </p>
        <div className="space-y-3">
          {result.optimizedBullets?.map((bullet, i) => (
            <div
              key={i}
              className="group flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all"
              style={{
                background: "rgba(16, 185, 129, 0.04)",
                border: "1px solid rgba(16, 185, 129, 0.08)",
              }}
              onClick={() => copyBullet(bullet)}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(16, 185, 129, 0.04)")
              }
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                style={{ background: "#34d399" }}
              />
              <span className="text-surface-200 text-sm leading-relaxed flex-1">
                {bullet}
              </span>
              <Copy
                size={14}
                className="text-surface-600 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
