import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getApplications,
  getAnalytics,
  updateApplication as updateAppAPI,
  deleteApplication as deleteAppAPI,
  generateFollowUpEmail,
} from "../services/applicationService";
import {
  setApplications,
  setAnalytics,
  setLoading,
  updateApplication,
  removeApplication,
} from "../store/applicationSlice";
import toast from "react-hot-toast";
import {
  Briefcase,
  TrendingUp,
  Award,
  XCircle,
  BarChart3,
  Bell,
  Edit3,
  Trash2,
  ChevronDown,
  Building2,
  X,
  Check,
  Users,
  Trophy,
  Activity,
  Lightbulb,
  Mail,
  CalendarDays,
  Copy,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_OPTIONS = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const STATUS_COLORS = {
  Saved: {
    bg: "rgba(99, 102, 241, 0.1)",
    color: "#818cf8",
    border: "rgba(99, 102, 241, 0.2)",
  },
  Applied: {
    bg: "rgba(59, 130, 246, 0.1)",
    color: "#60a5fa",
    border: "rgba(59, 130, 246, 0.2)",
  },
  Interview: {
    bg: "rgba(16, 185, 129, 0.1)",
    color: "#34d399",
    border: "rgba(16, 185, 129, 0.2)",
  },
  Offer: {
    bg: "rgba(245, 158, 11, 0.1)",
    color: "#fbbf24",
    border: "rgba(245, 158, 11, 0.2)",
  },
  Rejected: {
    bg: "rgba(239, 68, 68, 0.1)",
    color: "#f87171",
    border: "rgba(239, 68, 68, 0.2)",
  },
};

const Applications = () => {
  const dispatch = useDispatch();
  const { applications, analytics, loading } = useSelector(
    (state) => state.application,
  );
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  // Email Generator State
  const [generatingEmailFor, setGeneratingEmailFor] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      const [appsRes, analyticsRes] = await Promise.all([
        getApplications(),
        getAnalytics(),
      ]);
      dispatch(setApplications(appsRes.data.data));
      dispatch(setAnalytics(analyticsRes.data.data));
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateAppAPI(id, { status: newStatus });
      dispatch(updateApplication(res.data.data));
      // Refresh analytics
      const analyticsRes = await getAnalytics();
      dispatch(setAnalytics(analyticsRes.data.data));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setEditData({
      companyName: app.company_name,
      jobTitle: app.job_title,
      notes: app.notes || "",
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await updateAppAPI(editingId, editData);
      dispatch(updateApplication(res.data.data));
      setEditingId(null);
      toast.success("Application updated!");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppAPI(id);
      dispatch(removeApplication(id));
      setDeletingId(null);
      // Refresh analytics
      const analyticsRes = await getAnalytics();
      dispatch(setAnalytics(analyticsRes.data.data));
      toast.success("Application deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleGenerateEmail = async (id, currentStatus) => {
    try {
      setGeneratingEmailFor(id);
      const res = await generateFollowUpEmail(id);
      setGeneratedEmail(res.data.data);
      setShowEmailModal(true);
      toast.success("Follow-up email generated! ✨");
    } catch (error) {
      toast.error("Failed to generate email");
    } finally {
      setGeneratingEmailFor(null);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast.success("Email copied to clipboard!");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (app) => {
    if (
      (app.status !== "Applied" && app.status !== "Interview") ||
      !app.follow_up_date
    )
      return false;
    return (
      new Date(app.follow_up_date) <= new Date() && app.reminder_sent === false
    );
  };

  const analyticsCards = analytics
    ? [
        {
          label: "Total",
          value: analytics.total,
          icon: <Briefcase size={20} />,
          color: "#818cf8",
          subtext: `${analytics.applied} active`,
        },
        {
          label: "Interview Rate",
          value: `${analytics.interviewRate}%`,
          icon: <TrendingUp size={20} />,
          color: "#34d399",
          subtext: `${analytics.interviews} interviews`,
        },
        {
          label: "Offer Rate",
          value: `${analytics.offerRate}%`,
          icon: <Trophy size={20} />,
          color: "#fbbf24",
          subtext: `${analytics.offers} offers`,
        },
        {
          label: "Avg ATS",
          value: `${analytics.avgAtsScore}%`,
          icon: <Activity size={20} />,
          color: "#a78bfa",
          subtext: `Score matching`,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-12 relative z-10">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10 fade-in">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
            }}
          >
            <BarChart3 size={22} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-100">
              Advanced Analytics Hub
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Track growth, automate follow-ups, and land the role.
            </p>
          </div>
        </div>

        {/* Follow-up Reminders */}
        {analytics?.reminders?.length > 0 && (
          <div
            className="p-5 rounded-2xl mb-8 fade-in flex items-start flex-col lg:flex-row gap-4 justify-between"
            style={{
              background:
                "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))",
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
          >
            <div className="flex gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(245, 158, 11, 0.2)" }}
              >
                <Bell size={24} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-warning-400 mb-1">
                  Follow-Up Required
                </h3>
                <p className="text-sm text-surface-300 mb-4 max-w-xl">
                  You have{" "}
                  <strong className="text-surface-100">
                    {analytics.reminders.length} pending follow-ups.
                  </strong>{" "}
                  Sending follow-up emails increases response rates by 40%. Want
                  us to draft them for you?
                </p>
                <div className="flex flex-col gap-3">
                  {analytics.reminders.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center gap-4 p-3 rounded-lg"
                      style={{ background: "rgba(0,0,0,0.2)" }}
                    >
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-sm">
                          <strong className="text-surface-200">
                            {r.company_name}
                          </strong>
                          <span className="text-surface-400 mx-2">—</span>
                          <span className="text-surface-300">
                            {r.job_title}
                          </span>
                        </p>
                        <p className="text-xs text-surface-500 mt-1">
                          {r.follow_up_type} • Due:{" "}
                          {formatDate(r.follow_up_date)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleGenerateEmail(r.id, r.follow_up_type)
                        }
                        disabled={generatingEmailFor === r.id}
                        className="btn-primary"
                        style={{
                          height: "36px",
                          fontSize: "12px",
                          padding: "0 16px",
                        }}
                      >
                        {generatingEmailFor === r.id ? (
                          <div
                            className="spinner"
                            style={{ width: 14, height: 14, borderWidth: 2 }}
                          />
                        ) : (
                          <>
                            <Sparkles size={14} /> AI Draft Email
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Top Row */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {analyticsCards.map((card, i) => (
              <div
                key={card.label}
                className="glass-card p-6 fade-in flex items-center justify-between"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div>
                  <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider mb-2">
                    {card.label}
                  </p>
                  <p className="text-3xl font-extrabold text-surface-100 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-surface-500">{card.subtext}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Middle Row: Graph + Insights */}
        {analytics && (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Chart */}
            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(99, 102, 241, 0.1)" }}
                  >
                    <Activity size={16} className="text-primary-400" />
                  </div>
                  <h3 className="text-base font-bold text-surface-100">
                    Application Velocity
                  </h3>
                </div>
                <div className="text-sm text-surface-400 mt-2 sm:mt-0">
                  Last 7 Days
                </div>
              </div>

              <div className="h-[250px] w-full">
                {analytics.chartData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#818cf8"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#818cf8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid #1e293b",
                          borderRadius: "8px",
                          color: "#f8fafc",
                        }}
                        itemStyle={{ color: "#818cf8" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#818cf8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-surface-500 text-sm">
                    No data available for the last 7 days.
                  </div>
                )}
              </div>
            </div>

            {/* Smart Insights Sidebar */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex items-center gap-2.5 mb-6">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(16, 185, 129, 0.1)" }}
                >
                  <Lightbulb size={16} className="text-accent-400" />
                </div>
                <h3 className="text-base font-bold text-surface-100">
                  Smart Insights
                </h3>
              </div>

              <div className="flex-1 space-y-4">
                {analytics.mostAppliedRole && (
                  <div className="p-4 rounded-xl border border-surface-700/50 bg-surface-800/20">
                    <p className="text-xs text-surface-400 mb-1">
                      Top Targeted Role
                    </p>
                    <p className="text-sm font-semibold text-primary-300">
                      {analytics.mostAppliedRole}
                    </p>
                  </div>
                )}

                {analytics.insights && analytics.insights.length > 0 ? (
                  analytics.insights.map((insight, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border"
                      style={{
                        background:
                          insight.type === "warning"
                            ? "rgba(245, 158, 11, 0.05)"
                            : "rgba(16, 185, 129, 0.05)",
                        borderColor:
                          insight.type === "warning"
                            ? "rgba(245, 158, 11, 0.1)"
                            : "rgba(16, 185, 129, 0.1)",
                      }}
                    >
                      <p className="text-sm text-surface-300 leading-relaxed">
                        {insight.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border border-surface-700/50 bg-surface-800/20 text-center py-8">
                    <TrendingUp
                      className="text-surface-600 mx-auto mb-3"
                      size={24}
                    />
                    <p className="text-sm text-surface-400">
                      Keep applying! We need at least 10 applications to
                      generate AI insights.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="glass-card p-14 text-center">
            <div className="spinner mx-auto mb-5" />
            <p className="text-surface-400">Loading applications...</p>
          </div>
        )}

        {/* Applications Table */}
        {!loading && applications.length > 0 && (
          <div
            className="glass-card overflow-hidden fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="p-5 border-b border-surface-800/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-surface-100 flex items-center gap-2">
                <Briefcase size={16} className="text-primary-400" /> All
                Applications
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(99, 102, 241, 0.08)",
                    }}
                  >
                    {[
                      "Company",
                      "Role",
                      "ATS",
                      "Status",
                      "Applied",
                      "Follow-up",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-xs font-semibold text-surface-500 uppercase tracking-wider text-left"
                        style={{ padding: "14px 16px" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr
                      key={app.id}
                      className="transition-colors group"
                      style={{
                        borderBottom: "1px solid rgba(99, 102, 241, 0.05)",
                        background: isOverdue(app)
                          ? "rgba(245, 158, 11, 0.03)"
                          : "transparent",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(99, 102, 241, 0.03)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = isOverdue(app)
                          ? "rgba(245, 158, 11, 0.03)"
                          : "transparent")
                      }
                    >
                      {/* Company */}
                      <td style={{ padding: "14px 16px" }}>
                        {editingId === app.id ? (
                          <input
                            value={editData.companyName}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                companyName: e.target.value,
                              })
                            }
                            className="input-field"
                            style={{ padding: "6px 10px", fontSize: "13px" }}
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: "rgba(99, 102, 241, 0.08)" }}
                            >
                              <Building2
                                size={14}
                                className="text-primary-400"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-surface-200">
                                {app.company_name}
                              </p>
                              {app.notes && (
                                <p className="text-xs text-surface-500 truncate max-w-[150px]">
                                  {app.notes}
                                </p>
                              )}
                            </div>
                            {isOverdue(app) && (
                              <Bell
                                size={13}
                                style={{ color: "#fbbf24" }}
                                className="shrink-0"
                              />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td style={{ padding: "14px 16px" }}>
                        {editingId === app.id ? (
                          <input
                            value={editData.jobTitle}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                jobTitle: e.target.value,
                              })
                            }
                            className="input-field"
                            style={{ padding: "6px 10px", fontSize: "13px" }}
                          />
                        ) : (
                          <p className="text-sm text-surface-300">
                            {app.job_title}
                          </p>
                        )}
                      </td>

                      {/* ATS Score */}
                      <td style={{ padding: "14px 16px" }}>
                        {app.ats_score ? (
                          <span
                            className="text-sm font-bold"
                            style={{
                              color:
                                app.ats_score >= 75
                                  ? "#10b981"
                                  : app.ats_score >= 50
                                    ? "#f59e0b"
                                    : "#ef4444",
                            }}
                          >
                            {app.ats_score}%
                          </span>
                        ) : (
                          <span className="text-surface-600 text-sm">—</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td style={{ padding: "14px 16px" }}>
                        <div className="relative inline-block">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app.id, e.target.value)
                            }
                            className="appearance-none cursor-pointer text-xs font-semibold rounded-full pr-7 pl-3 py-1.5"
                            style={{
                              background:
                                STATUS_COLORS[app.status]?.bg ||
                                STATUS_COLORS.Saved.bg,
                              color:
                                STATUS_COLORS[app.status]?.color ||
                                STATUS_COLORS.Saved.color,
                              border: `1px solid ${STATUS_COLORS[app.status]?.border || STATUS_COLORS.Saved.border}`,
                              outline: "none",
                            }}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option
                                key={s}
                                value={s}
                                style={{
                                  background: "#1e293b",
                                  color: "#e2e8f0",
                                }}
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: STATUS_COLORS[app.status]?.color }}
                          />
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td style={{ padding: "14px 16px" }}>
                        <span className="text-xs text-surface-400 flex items-center gap-1.5 whitespace-nowrap">
                          {app.applied_date && (
                            <CalendarDays
                              size={12}
                              className="text-surface-500"
                            />
                          )}
                          {formatDate(app.applied_date)}
                        </span>
                      </td>

                      {/* Follow-up Date */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          className={`text-xs flex items-center gap-1.5 whitespace-nowrap ${isOverdue(app) ? "font-semibold" : ""}`}
                          style={{
                            color: isOverdue(app) ? "#fbbf24" : "#94a3b8",
                          }}
                        >
                          {app.follow_up_date && (
                            <CalendarDays
                              size={12}
                              style={{
                                color: isOverdue(app) ? "#fbbf24" : "#64748b",
                              }}
                            />
                          )}
                          {formatDate(app.follow_up_date)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px" }}>
                        <div className="flex items-center gap-1.5">
                          {editingId === app.id ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
                                style={{
                                  background: "rgba(16, 185, 129, 0.1)",
                                  color: "#34d399",
                                }}
                                title="Save"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
                                style={{
                                  background: "rgba(239, 68, 68, 0.1)",
                                  color: "#f87171",
                                }}
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(app)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
                                style={{
                                  background: "rgba(99, 102, 241, 0.08)",
                                  color: "#94a3b8",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.color = "#818cf8";
                                  e.currentTarget.style.background =
                                    "rgba(99, 102, 241, 0.15)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.color = "#94a3b8";
                                  e.currentTarget.style.background =
                                    "rgba(99, 102, 241, 0.08)";
                                }}
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              {deletingId === app.id ? (
                                <button
                                  onClick={() => handleDelete(app.id)}
                                  className="px-2.5 h-8 rounded-lg flex items-center justify-center gap-1.5 border-none cursor-pointer text-xs font-semibold"
                                  style={{
                                    background: "rgba(239, 68, 68, 0.15)",
                                    color: "#f87171",
                                  }}
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(app.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
                                  style={{
                                    background: "rgba(239, 68, 68, 0.08)",
                                    color: "#94a3b8",
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.color = "#f87171";
                                    e.currentTarget.style.background =
                                      "rgba(239, 68, 68, 0.15)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.color = "#94a3b8";
                                    e.currentTarget.style.background =
                                      "rgba(239, 68, 68, 0.08)";
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Generated Email Modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 fade-in"
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="glass-card w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-surface-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 glow-primary"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                >
                  <Mail size={18} color="white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-surface-100 truncate">
                    AI Follow-Up Email
                  </h3>
                  <p className="text-sm text-surface-400 mt-0.5 truncate flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary-400" />
                    Generated by Gemini AI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                <button
                  onClick={copyEmail}
                  className="btn-primary w-full sm:w-auto justify-center"
                  style={{
                    padding: "8px 16px",
                    height: "40px",
                    fontSize: "13px",
                  }}
                >
                  <Copy size={14} />
                  Copy
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer shrink-0 transition-colors"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#f87171",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(239, 68, 68, 0.15)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(239, 68, 68, 0.1)")
                  }
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Email Body */}
            <div
              className="p-6 overflow-y-auto"
              style={{ background: "rgba(2, 6, 23, 0.5)" }}
            >
              <div
                className="p-6 rounded-xl font-mono text-sm text-surface-200 whitespace-pre-wrap leading-relaxed border"
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  borderColor: "rgba(99, 102, 241, 0.1)",
                }}
              >
                {generatedEmail}
              </div>
              <p className="text-xs text-surface-500 mt-4 flex items-start gap-2">
                <Lightbulb
                  size={12}
                  className="text-primary-400 shrink-0 mt-0.5"
                />
                <span>
                  Make sure to replace the bracketed placeholders like [Hiring
                  Manager Name] before sending.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
