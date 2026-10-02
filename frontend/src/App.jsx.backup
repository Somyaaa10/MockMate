import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserDashboard from "./pages/UserDashboard";
import AIInterviewSetup from "./pages/AIInterviewSetup";
import AIInterviewPage from "./pages/AIInterviewPage";
import PeerInterviewSetup from "./pages/PeerInterviewSetup";
import PeerInterviewRoom from "./pages/PeerInterviewRoom";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)]">
        <div className="text-sm font-medium text-[var(--text-secondary)]">Restoring session...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Dashboard & Interview Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/new"
          element={
            <ProtectedRoute>
              <AIInterviewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/setup"
          element={<Navigate to="/interview/new" replace />}
        />
        <Route
          path="/interview/:id"
          element={
            <ProtectedRoute>
              <AIInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peer/setup"
          element={
            <ProtectedRoute>
              <PeerInterviewSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peer/:roomCode"
          element={
            <ProtectedRoute>
              <PeerInterviewRoom />
            </ProtectedRoute>
          }
        />

        {/* Catch-all fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
