import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, User, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register(fullName.trim(), email.trim(), password);

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#050505] text-[#F5F5F5] relative login-bg-glow selection:bg-purple-500/30 selection:text-white">
      <div className="flex h-full">
        {/* Left Section */}
        <section className="relative hidden overflow-hidden border-r border-[rgba(255,255,255,0.08)] bg-[#050505] lg:flex lg:w-1/2">
          <div className="relative z-10 flex h-full w-full flex-col justify-between px-12 py-8 auth-fade-left">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111113] shadow-sm text-[#8B5CF6] transition duration-200 group-hover:border-[rgba(139,92,246,0.35)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Crown className="h-5 w-5" />
              </div>

              <span className="text-2xl font-bold text-[#F5F5F5] transition group-hover:text-white">
                MockMate
              </span>
            </Link>

            {/* Content */}
            <div className="max-w-xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#A78BFA]">
                Start Your Journey
              </p>

              <h1 className="text-5xl font-bold leading-tight xl:text-6xl text-[#F5F5F5]">
                Practice today.
                <br />
                <span className="bg-gradient-to-r from-[#F5F5F5] to-[#C4B5FD] bg-clip-text text-transparent">
                  Interview better tomorrow.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-[#A1A1AA]">
                Create your MockMate account and start preparing for your next
                opportunity with AI-powered practice.
              </p>

              {/* Benefits / Stats */}
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-4 backdrop-blur-xl transition duration-200 hover:border-[rgba(139,92,246,0.30)] hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)]">
                  <p className="text-2xl font-bold text-[#F5F5F5]">AI</p>

                  <p className="mt-1 text-xs text-[#71717A]">Mock Interviews</p>
                </div>

                <div className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-4 backdrop-blur-xl transition duration-200 hover:border-[rgba(139,92,246,0.30)] hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)]">
                  <p className="text-2xl font-bold text-[#F5F5F5]">1:1</p>

                  <p className="mt-1 text-xs text-[#71717A]">Peer Practice</p>
                </div>

                <div className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-4 backdrop-blur-xl transition duration-200 hover:border-[rgba(139,92,246,0.30)] hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(99,102,241,0.12)]">
                  <p className="text-2xl font-bold text-[#F5F5F5]">24/7</p>

                  <p className="mt-1 text-xs text-[#71717A]">Practice</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#71717A]">
              © 2026 MockMate. All rights reserved.
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="flex h-full w-full items-center justify-center overflow-y-auto px-6 py-8 lg:w-1/2 lg:overflow-hidden bg-[#08070C]">
          <div className="relative w-full max-w-md">
            {/* Subtle purple ambient glow behind card */}
            <div className="absolute -inset-1 rounded-[22px] bg-[rgba(139,92,246,0.05)] blur-2xl pointer-events-none -z-10" />

            {/* Mobile Back */}
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-[#A1A1AA] transition duration-200 hover:text-[#F5F5F5] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            {/* Card */}
            <div className="relative rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[#0D0D0F]/92 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 transition duration-200 hover:-translate-y-[2px] hover:border-[rgba(255,255,255,0.14)] login-fade-card">
              {/* Heading */}
              <div className="mb-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111113] text-[#8B5CF6] lg:hidden">
                  <Crown className="h-5 w-5" />
                </div>

                <h2 className="text-3xl font-bold text-[#F5F5F5]">Create your account</h2>

                <p className="mt-2 text-[#A1A1AA]">
                  Start preparing smarter with MockMate.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71717A]" />

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      disabled={loading}
                      className="w-full rounded-[12px] border border-[rgba(255,255,255,0.10)] bg-[#0A0A0C] py-3.5 pl-11 pr-4 text-[#F5F5F5] outline-none transition duration-200 placeholder:text-[#71717A] hover:border-[rgba(255,255,255,0.18)] focus:border-[rgba(139,92,246,0.55)] focus:ring-2 focus:ring-[rgba(139,92,246,0.08)] disabled:bg-[#151518] disabled:text-[#71717A] disabled:border-[rgba(255,255,255,0.04)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71717A]" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full rounded-[12px] border border-[rgba(255,255,255,0.10)] bg-[#0A0A0C] py-3.5 pl-11 pr-4 text-[#F5F5F5] outline-none transition duration-200 placeholder:text-[#71717A] hover:border-[rgba(255,255,255,0.18)] focus:border-[rgba(139,92,246,0.55)] focus:ring-2 focus:ring-[rgba(139,92,246,0.08)] disabled:bg-[#151518] disabled:text-[#71717A] disabled:border-[rgba(255,255,255,0.04)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71717A]" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-[12px] border border-[rgba(255,255,255,0.10)] bg-[#0A0A0C] py-3.5 pl-11 pr-4 text-[#F5F5F5] outline-none transition duration-200 placeholder:text-[#71717A] hover:border-[rgba(255,255,255,0.18)] focus:border-[rgba(139,92,246,0.55)] focus:ring-2 focus:ring-[rgba(139,92,246,0.08)] disabled:bg-[#151518] disabled:text-[#71717A] disabled:border-[rgba(255,255,255,0.04)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71717A]" />

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-[12px] border border-[rgba(255,255,255,0.10)] bg-[#0A0A0C] py-3.5 pl-11 pr-4 text-[#F5F5F5] outline-none transition duration-200 placeholder:text-[#71717A] hover:border-[rgba(255,255,255,0.18)] focus:border-[rgba(139,92,246,0.55)] focus:ring-2 focus:ring-[rgba(139,92,246,0.08)] disabled:bg-[#151518] disabled:text-[#71717A] disabled:border-[rgba(255,255,255,0.04)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#F87171]">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="rounded-xl border border-[#22C55E]/25 bg-[#22C55E]/10 px-4 py-3 text-sm text-[#4ADE80]">
                    {success}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] py-3.5 font-semibold text-white border-none shadow-md shadow-purple-900/20 transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(99,102,241,0.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              {/* Trust Line */}
              <p className="mt-3 text-center text-xs text-[#71717A]">
                Free to get started • No credit card required
              </p>

              {/* Login */}
              <p className="mt-6 text-center text-sm text-[#A1A1AA]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#F5F5F5] underline transition duration-200 hover:text-[#A78BFA]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default RegisterPage;
