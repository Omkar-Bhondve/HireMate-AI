import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { loginSuccess } from "../store/authSlice";
import toast from "react-hot-toast";
import {
  Brain,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await registerUser(data);
      dispatch(loginSuccess(response.data));
      toast.success("Account created successfully! 🎉");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-animated relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-5 glow-primary"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Brain
              size={38}
              color="white"
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-primary-400 via-violet-400 to-accent-400 bg-clip-text text-transparent mb-2">
            HireMate AI
          </h1>
          <p className="text-surface-400 text-sm sm:text-base flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-primary-400" />
            Resume Intelligence Engine
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-surface-100">
              Create Your Account
            </h2>
            <p className="text-surface-500 text-sm mt-1">
              Start analyzing your resumes with AI
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-danger-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-danger-400 inline-block" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem" }}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-danger-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-danger-400 inline-block" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="input-field"
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 bg-transparent border-none cursor-pointer p-1 rounded transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-danger-400 inline-block" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ height: "48px" }}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div
                    className="spinner"
                    style={{ width: 20, height: 20, borderWidth: 2 }}
                  />
                  Creating Account...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-surface-700/50" />
            <span className="text-surface-500 text-xs font-medium uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-surface-700/50" />
          </div>

          {/* Login Link */}
          <p className="text-center text-surface-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-400 font-semibold hover:text-primary-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-surface-600 text-xs mt-6">
          AI-Powered Resume Analysis • Built for Job Seekers
        </p>
      </div>
    </div>
  );
};

export default Register;
