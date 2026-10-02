import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MessagesSquare, Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isMinLength = password.length >= 6;

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = "Full name is required.";
    }
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await register(fullName.trim(), email.trim(), password);
      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] relative flex flex-col items-center justify-center px-4 py-12 transition-colors duration-200">
      <ThemeToggle className="absolute right-4 top-4 z-50 sm:right-6 sm:top-6" />

      <div className="relative w-full max-w-[440px] my-auto">
        {/* Top Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] text-white shadow-md transition duration-200">
              <MessagesSquare className="h-4.5 w-4.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] transition group-hover:text-[var(--primary)]">
              MockMate
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>

        {/* Authentication Card */}
        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--panel-shadow)] sm:p-8 transition duration-200">
          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Start preparing smarter for your interviews.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="reg-fullname" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  id="reg-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: null }));
                  }}
                  placeholder="Your full name"
                  autoComplete="name"
                  disabled={loading}
                  className={`w-full h-11 rounded-xl border bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition duration-200 placeholder:text-[var(--text-muted)] hover:border-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] disabled:bg-[var(--background-soft)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed ${
                    fieldErrors.fullName ? "border-[var(--danger)]" : "border-[var(--border)]"
                  }`}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className={`w-full h-11 rounded-xl border bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition duration-200 placeholder:text-[var(--text-muted)] hover:border-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] disabled:bg-[var(--background-soft)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed ${
                    fieldErrors.email ? "border-[var(--danger)]" : "border-[var(--border)]"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  disabled={loading}
                  className={`w-full h-11 rounded-xl border bg-[var(--surface)] pl-10 pr-11 text-sm text-[var(--text-primary)] outline-none transition duration-200 placeholder:text-[var(--text-muted)] hover:border-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] disabled:bg-[var(--background-soft)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed ${
                    fieldErrors.password ? "border-[var(--danger)]" : "border-[var(--border)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition duration-150 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirement Indicator */}
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                {isMinLength ? (
                  <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                ) : (
                  <X className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                )}
                <span className={isMinLength ? "text-[var(--success)] font-medium" : "text-[var(--text-muted)]"}>
                  At least 6 characters
                </span>
              </div>
              {fieldErrors.password && (
                <p className="mt-0.5 text-xs text-[var(--danger)]">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className={`w-full h-11 rounded-xl border bg-[var(--surface)] pl-10 pr-11 text-sm text-[var(--text-primary)] outline-none transition duration-200 placeholder:text-[var(--text-muted)] hover:border-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)] disabled:bg-[var(--background-soft)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed ${
                    fieldErrors.confirmPassword ? "border-[var(--danger)]" : "border-[var(--border)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition duration-150 p-1"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-[var(--danger)]">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3.5 text-xs text-[var(--danger)]">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-3.5 text-xs text-[var(--success)]">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] font-semibold text-sm text-white shadow-lg shadow-[#7C5CFF]/25 hover:opacity-95 transition duration-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Trust Line */}
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Free to get started • No credit card required
          </p>

          {/* Login Link */}
          <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] underline transition duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
