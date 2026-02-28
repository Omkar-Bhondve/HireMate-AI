import { useEffect, useState } from "react";
import { getHistory } from "../services/analysisService";
import {
  History as HistoryIcon,
  FileText,
  Calendar,
  ArrowRight,
  Inbox,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return "Excellent";
    if (score >= 50) return "Good";
    return "Needs Work";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-12 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 fade-in">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
            }}
          >
            <HistoryIcon size={22} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-100">
              Analysis History
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">
              {history.length > 0
                ? `${history.length} analyses completed`
                : "Your past resume analyses"}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="glass-card p-14 text-center">
            <div className="spinner mx-auto mb-5" />
            <p className="text-surface-400">Loading history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && history.length === 0 && (
          <div className="glass-card p-14 text-center fade-in">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(99, 102, 241, 0.06)" }}
            >
              <Inbox size={36} className="text-surface-600" />
            </div>
            <h3 className="text-xl font-bold text-surface-200 mb-2">
              No analyses yet
            </h3>
            <p className="text-surface-500 mb-8 max-w-sm mx-auto">
              Upload your resume and paste a job description to get your first
              AI-powered analysis.
            </p>
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* History List */}
        {!loading && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={item.id}
                className="glass-card p-5 flex items-center gap-5 fade-in"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                {/* Score */}
                <div
                  className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0"
                  style={{
                    background: `${getScoreColor(item.ats_score)}08`,
                    border: `1px solid ${getScoreColor(item.ats_score)}18`,
                  }}
                >
                  <span
                    className="text-xl font-extrabold leading-none"
                    style={{ color: getScoreColor(item.ats_score) }}
                  >
                    {item.ats_score}
                  </span>
                  <span className="text-[10px] font-medium mt-0.5 text-surface-500">
                    ATS
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-surface-100 truncate mb-1.5">
                    {item.job_title}
                  </h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-surface-400">
                      <FileText size={12} className="text-surface-500" />
                      {item.resume_filename}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-surface-500">
                      <Calendar size={12} />
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                {/* Score Label */}
                <span
                  className="chip shrink-0 text-xs hidden sm:inline-flex"
                  style={{
                    background: `${getScoreColor(item.ats_score)}10`,
                    color: getScoreColor(item.ats_score),
                    border: `1px solid ${getScoreColor(item.ats_score)}20`,
                  }}
                >
                  <TrendingUp size={11} className="mr-1.5" />
                  {getScoreLabel(item.ats_score)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
