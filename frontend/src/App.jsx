import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./context/AuthContext";

const Landing = lazy(() => import("./pages/Landing"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AIInterviewSetup = lazy(() => import("./pages/AIInterviewSetup"));
const AIInterviewPage = lazy(() => import("./pages/AIInterviewPage"));
const PeerInterviewSetup = lazy(() => import("./pages/PeerInterviewSetup"));
const PeerInterviewRoom = lazy(() => import("./pages/PeerInterviewRoom"));

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="text-sm font-medium text-[var(--text-secondary)]">
        Loading...
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)]">
        <div className="text-sm font-medium text-[var(--text-secondary)]">
          Restoring session...
        </div>
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
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/signup"
            element={<Navigate to="/register" replace />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

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

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;