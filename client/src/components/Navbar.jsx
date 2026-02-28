import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logout } from "../store/authSlice";
import {
  LogOut,
  Brain,
  LayoutDashboard,
  History,
  Briefcase,
} from "lucide-react";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const { analytics } = useSelector((state) => state.application);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Top Navbar */}
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "rgba(2, 6, 23, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(99, 102, 241, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center glow-primary transition-transform duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <Brain size={18} color="white" className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-base sm:text-lg font-bold bg-linear-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
              HireMate AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === "/dashboard"
                  ? "bg-primary-500/12 text-primary-400"
                  : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50"
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === "/history"
                  ? "bg-primary-500/12 text-primary-400"
                  : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50"
              }`}
            >
              <History size={16} />
              History
            </Link>
            <Link
              to="/applications"
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === "/applications"
                  ? "bg-primary-500/12 text-primary-400"
                  : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50"
              }`}
            >
              <Briefcase size={16} />
              Applications
              {analytics?.reminders?.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-surface-900">
                  {analytics.reminders.length}
                </span>
              )}
            </Link>
          </div>

          {/* User Section & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-surface-200 leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-surface-500 mt-0.5">{user?.email}</p>
            </div>
            <div className="w-px h-8 bg-surface-700/50 hidden sm:block" />
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:gap-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-surface-400 hover:text-danger-400 hover:bg-danger-500/8 transition-all duration-200 border-none cursor-pointer bg-transparent"
              title="Logout"
            >
              <LogOut size={18} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-2 flex justify-around items-center"
        style={{
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(99, 102, 241, 0.1)",
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl flex-1 transition-all duration-200 ${
            location.pathname === "/dashboard"
              ? "text-primary-400"
              : "text-surface-500 hover:text-surface-300"
          }`}
        >
          <div
            className={`p-1.5 rounded-lg ${location.pathname === "/dashboard" ? "bg-primary-500/15" : "bg-transparent"}`}
          >
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] font-medium">Auto-apply</span>
        </Link>

        <Link
          to="/applications"
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl flex-1 transition-all duration-200 ${
            location.pathname === "/applications"
              ? "text-primary-400"
              : "text-surface-500 hover:text-surface-300"
          }`}
        >
          <div
            className={`p-1.5 rounded-lg ${location.pathname === "/applications" ? "bg-primary-500/15" : "bg-transparent"}`}
          >
            <Briefcase size={20} />
            {analytics?.reminders?.length > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-surface-900 border-surface-900">
                {analytics.reminders.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Tracker</span>
        </Link>

        <Link
          to="/history"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl flex-1 transition-all duration-200 ${
            location.pathname === "/history"
              ? "text-primary-400"
              : "text-surface-500 hover:text-surface-300"
          }`}
        >
          <div
            className={`p-1.5 rounded-lg ${location.pathname === "/history" ? "bg-primary-500/15" : "bg-transparent"}`}
          >
            <History size={20} />
          </div>
          <span className="text-[10px] font-medium">History</span>
        </Link>
      </div>
    </>
  );
};

export default Navbar;
