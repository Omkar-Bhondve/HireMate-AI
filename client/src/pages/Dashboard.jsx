import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { analyzeResume } from "../services/analysisService";
import { getAnalytics } from "../services/applicationService";
import {
  setAnalysisLoading,
  setAnalysisResult,
  setAnalysisError,
  clearResult,
} from "../store/analysisSlice";
import { setAnalytics } from "../store/applicationSlice";
import AnalysisResult from "../components/AnalysisResult";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  Briefcase,
  Sparkles,
  X,
  RotateCcw,
  Zap,
  Shield,
  Target,
  Brain,
  Building2,
} from "lucide-react";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { result, loading, error } = useSelector((state) => state.analysis);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState(null); // Store form data for application creation
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm();

  useEffect(() => {
    // Populate analytics globally for the notification badge in navbar
    const fetchStats = async () => {
      try {
        const res = await getAnalytics();
        dispatch(setAnalytics(res.data.data));
      } catch (err) {}
    };
    fetchStats();
  }, [dispatch]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast.error("Only PDF files are allowed");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    if (!file) {
      toast.error("Please upload your resume (PDF)");
      return;
    }

    try {
      dispatch(setAnalysisLoading(true));

      // Save form data for later application creation
      setFormData({
        companyName: data.companyName,
        jobTitle: data.jobTitle,
      });

      const fd = new FormData();
      fd.append("resume", file);
      fd.append("jobTitle", data.jobTitle);
      fd.append("jobDescription", data.jobDescription);

      const response = await analyzeResume(fd);
      dispatch(setAnalysisResult(response.data));
      toast.success("Analysis complete! 🎯");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Analysis failed. Please try again.";
      dispatch(setAnalysisError(msg));
      toast.error(msg);
    }
  };

  const handleReset = () => {
    dispatch(clearResult());
    setFile(null);
    setFormData(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-12 relative z-10">
        {/* Page Header */}
        {!result && !loading && (
          <div className="text-center mb-12 fade-in">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 glow-primary"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Brain size={32} color="white" />
            </div>

            <h1 className="text-5xl font-extrabold mb-4 leading-tight">
              <span className="bg-linear-to-r from-primary-400 via-violet-400 to-accent-400 bg-clip-text text-transparent">
                Resume Intelligence
              </span>
            </h1>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Upload your resume and paste the job description. Our AI will
              analyze the match and give you actionable insights.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-8">
              {[
                {
                  icon: <Zap size={15} />,
                  label: "ATS Score",
                  color: "#6366f1",
                },
                {
                  icon: <Target size={15} />,
                  label: "Skill Gap Analysis",
                  color: "#10b981",
                },
                {
                  icon: <Shield size={15} />,
                  label: "AI Suggestions",
                  color: "#8b5cf6",
                },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    background: `${badge.color}10`,
                    color: badge.color,
                    border: `1px solid ${badge.color}20`,
                  }}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Form */}
        {!result && !loading && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Resume Upload */}
            <div className="glass-card p-7">
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <Upload size={16} className="text-primary-400" />
                </div>
                <h3 className="text-base font-semibold text-surface-100">
                  Upload Resume
                </h3>
                <span className="text-xs text-surface-500 ml-auto">
                  PDF only • Max 5MB
                </span>
              </div>

              <div
                className={`upload-zone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                {file ? (
                  <div className="flex items-center justify-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(16, 185, 129, 0.1)" }}
                    >
                      <FileText size={22} className="text-accent-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-surface-200">
                        {file.name}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to
                        analyze
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="ml-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors border-none cursor-pointer"
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "#f87171",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(239, 68, 68, 0.15)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(239, 68, 68, 0.08)")
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <div
                      className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(99, 102, 241, 0.08)" }}
                    >
                      <Upload size={24} className="text-surface-400" />
                    </div>
                    <p className="text-surface-200 text-sm font-medium mb-1">
                      Drag & drop your resume here
                    </p>
                    <p className="text-surface-500 text-xs">
                      or{" "}
                      <span className="text-primary-400 font-medium">
                        browse files
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="glass-card p-7">
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <Briefcase size={16} className="text-primary-400" />
                </div>
                <h3 className="text-base font-semibold text-surface-100">
                  Job Details
                </h3>
              </div>

              <div className="space-y-5">
                {/* Company Name - NEW */}
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Google, Microsoft, Amazon..."
                      className="input-field"
                      style={{ paddingLeft: "2.75rem" }}
                      {...register("companyName", {
                        required: "Company name is required",
                      })}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-danger-400 text-xs mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-danger-400 inline-block" />
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    className="input-field"
                    {...register("jobTitle", {
                      required: "Job title is required",
                    })}
                  />
                  {errors.jobTitle && (
                    <p className="text-danger-400 text-xs mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-danger-400 inline-block" />
                      {errors.jobTitle.message}
                    </p>
                  )}
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Job Description
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Paste the full job description here..."
                    className="input-field"
                    style={{ resize: "none", lineHeight: "1.7" }}
                    {...register("jobDescription", {
                      required: "Job description is required",
                      minLength: {
                        value: 50,
                        message:
                          "Please provide a more detailed job description (min 50 chars)",
                      },
                    })}
                  />
                  {errors.jobDescription && (
                    <p className="text-danger-400 text-xs mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-danger-400 inline-block" />
                      {errors.jobDescription.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className="p-4 rounded-xl flex items-start gap-3"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}
              >
                <X size={16} className="text-danger-400 shrink-0 mt-0.5" />
                <p className="text-danger-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ height: "56px", fontSize: "1.05rem" }}
            >
              <Sparkles size={20} />
              Analyze Resume
            </button>
          </form>
        )}

        {/* Loading State */}
        {loading && (
          <div className="glass-card p-14 text-center fade-in pulse-glow">
            <div
              className="spinner mx-auto mb-8"
              style={{ width: 60, height: 60, borderWidth: 3 }}
            />
            <h3 className="text-2xl font-bold text-surface-100 mb-3">
              Analyzing Your Resume
            </h3>
            <p className="text-surface-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Our AI is comparing your resume against the job description,
              calculating ATS compatibility, and generating personalized
              suggestions...
            </p>
            <div className="flex justify-center gap-8">
              {[
                { label: "Extracting text", color: "#6366f1" },
                { label: "Matching keywords", color: "#10b981" },
                { label: "AI analysis", color: "#8b5cf6" },
              ].map((step, i) => (
                <div
                  key={step.label}
                  className="flex items-center gap-2 text-xs text-surface-500"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: step.color,
                      animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="fade-in">
            <div className="flex justify-end mb-8">
              <button onClick={handleReset} className="btn-ghost">
                <RotateCcw size={16} />
                New Analysis
              </button>
            </div>
            <AnalysisResult
              result={result}
              companyName={formData?.companyName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
