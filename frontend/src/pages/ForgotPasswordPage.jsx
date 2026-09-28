import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Crown, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldError("");

    if (!email.trim()) {
      setFieldError("Email address is required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setFieldError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred while requesting password reset."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] relative flex flex-col items-center justify-center px-4 py-8 sm:py-12 login-bg-glow selection:bg-orange-500/30 selection:text-white">
      <ThemeToggle className="absolute right-4 top-4 z-50 sm:right-6 sm:top-6" />

      <div className="relative w-full max-w-[460px] my-auto">
        {/* Subtle ambient orange glow behind auth card */}
        <div className="absolute -inset-1 rounded-[22px] bg-[rgba(249,115,22,0.08)] blur-2xl pointer-events-none -z-10" />

        {/* Top Header Navigation */}
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] shadow-sm text-[#F97316] transition duration-200 group-hover:border-[rgba(249,115,22,0.35)] group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Crown className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] transition group-hover:text-[var(--text-accent)]">
              MockMate
            </span>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>

        {/* Authentication Card */}
        <div className="relative rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface-4)]/92 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 transition duration-200 hover:border-[var(--border-strong)] login-fade-card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Forgot Password?
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              Enter your registered email address below. If an account exists, we'll send a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-[#10B981] mb-3" />
                <h2 className="text-lg font-semibold text-white">Reset Link Dispatched</h2>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  If an account exists with <strong className="text-white">{email}</strong>, a password reset email has been sent. Please check your inbox and spam folder.
                </p>
              </div>

              <Link
                to="/login"
                className="flex w-full h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#EC4899] font-semibold text-sm text-white shadow-md shadow-orange-900/20 transition duration-200 hover:-translate-y-[1px]"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Email address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className={`w-full h-11 rounded-[12px] border bg-[var(--bg-surface-6)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition duration-200 placeholder:text-[var(--text-muted)] hover:border-[var(--border-strong)] focus:border-[rgba(249,115,22,0.55)] focus:ring-2 focus:ring-[rgba(249,115,22,0.12)] disabled:bg-[var(--card-elevated-3)] disabled:text-[var(--text-muted)] ${
                      fieldError ? "border-[#EF4444]" : "border-[var(--border-subtle)]"
                    }`}
                  />
                </div>
                {fieldError && (
                  <p className="mt-1 text-xs text-[#F87171]">{fieldError}</p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/10 p-3.5 text-xs text-[#F87171]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EC4899] font-semibold text-sm text-white border-none shadow-md shadow-orange-900/20 transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(236,72,153,0.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Sending link...</span>
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
