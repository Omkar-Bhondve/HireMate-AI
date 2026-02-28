import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./store/store";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Applications from "./pages/Applications";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div
          className="min-h-screen flex flex-col"
          style={{ background: "#020617" }}
        >
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(30, 41, 59, 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#e2e8f0",
              border: "1px solid rgba(99, 102, 241, 0.15)",
              borderRadius: "14px",
              fontSize: "14px",
              fontFamily: '"Inter", system-ui, sans-serif',
              padding: "14px 18px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#1e293b",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#1e293b",
              },
            },
          }}
        />
      </Router>
    </Provider>
  );
}

export default App;
