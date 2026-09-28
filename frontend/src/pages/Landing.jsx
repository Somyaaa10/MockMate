import { useEffect } from "react";
import {
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  Bot,
  FileText,
  Users,
  Video,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ------------------------------------------------------------------
   Scroll-reveal — soft fade-up the first time a section enters view.
   Fallback to fully-visible content when IntersectionObserver is
   unavailable so nothing is ever hidden from screen readers/no-JS.
   ------------------------------------------------------------------ */
function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (els.length === 0) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const FEATURES = [
  {
    icon: Bot,
    title: "AI Mock Interviews",
    desc: "Practice realistic interviews with AI-generated questions and personalized feedback.",
    color: "#F97316",
  },
  {
    icon: FileText,
    title: "Smart Resume Analyzer",
    desc: "Analyze your resume and receive actionable suggestions to improve your profile.",
    color: "#FB923C",
  },
  {
    icon: Users,
    title: "Peer-to-Peer Interviews",
    desc: "Connect with other candidates for realistic one-to-one mock interviews.",
    color: "#EC4899",
  },
  {
    icon: Sparkles,
    title: "AI Feedback",
    desc: "Get detailed feedback on communication, technical answers, confidence, and overall performance.",
    color: "#F97316",
  },
  {
    icon: BarChart3,
    title: "Interview Analytics",
    desc: "Track your progress and identify your strengths and weaknesses over time.",
    color: "#EC4899",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Choose Your Interview",
    description:
      "Select AI or peer interview and configure your target role.",
  },
  {
    number: "02",
    title: "Practice",
    description:
      "Answer realistic questions in a focused interview environment.",
  },
  {
    number: "03",
    title: "Improve",
    description:
      "Review your performance and use feedback to improve.",
  },
];

const VALUE_CARDS = [
  { value: "AI", label: "Personalized interview practice" },
  { value: "1:1", label: "Real-time peer interviews" },
  { value: "24/7", label: "Practice whenever you want" },
];

function Landing() {
  useScrollReveal();

  return (
    <main className="min-h-screen bg-[var(--bg-main)] pt-[72px] text-[var(--text-primary)] relative overflow-hidden ambient-bg-glow selection:bg-orange-500/30 selection:text-white">
      <Header />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden px-6 pt-[64px] pb-20">
        {/* Soft ambient glow */}
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="hero-stagger-1 mb-6 inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--card-bg-3)] px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur-xl shadow-sm transition duration-200 hover:border-[rgba(249,115,22,0.35)]">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#F97316] ai-pulse-dot" />
            AI-Powered Mock Interview Platform
          </div>

          <h1 className="hero-stagger-1 text-[42px] font-extrabold leading-[1.04] tracking-tight text-[var(--text-primary)] sm:text-6xl md:text-7xl lg:text-[84px]">
            Prepare Smarter.
            <span className="block text-gradient-purple">Interview Better.</span>
          </h1>

          <p className="hero-stagger-2 mx-auto mt-6 max-w-[720px] text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
            Practice realistic interviews with AI or connect with peers for
            real-time mock interview sessions. Get feedback, improve your
            skills, and become interview-ready.
          </p>

          {/* CTAs */}
          <div className="hero-stagger-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/interview/new"
              className="btn-saas-primary inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#EC4899] px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-900/20 hover:opacity-95 sm:w-auto"
            >
              Start Mock Interview
            </Link>
            <a
              href="#features"
              className="btn-saas-secondary inline-flex w-full items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] px-7 py-3.5 font-semibold text-[var(--text-primary)] backdrop-blur-xl sm:w-auto"
            >
              Explore Features
            </a>
          </div>

          {/* Value cards */}
          <div className="hero-stagger-4 mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {VALUE_CARDS.map((card) => (
              <div
                key={card.value}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-5 text-center backdrop-blur-xl saas-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  {card.value}
                </div>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section
        id="features"
        className="relative z-10 scroll-mt-[84px] border-t border-[var(--border-subtle)] bg-[var(--bg-main)] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl" data-reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F97316]">
              Features
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Everything You Need to Ace Your Interview
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-6 backdrop-blur-xl saas-card"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--card-elevated-2)] transition duration-200 group-hover:border-[rgba(249,115,22,0.35)]"
                  >
                    <Icon className="h-5 w-5" style={{ color: feature.color }} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section
        id="how-it-works"
        className="relative z-10 scroll-mt-[84px] border-t border-[var(--border-subtle)] bg-[var(--bg-surface-7)] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl text-center" data-reveal>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F97316]">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Practice in three simple steps
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-8 text-left backdrop-blur-xl saas-card"
              >
                <span className="font-display text-4xl font-bold tracking-tight text-[#F97316]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section
        id="pricing"
        className="relative z-10 scroll-mt-[84px] overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-main)] px-6 py-24"
      >
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl" data-reveal>
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F97316]">
              Pricing
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              Flexible pricing for every career stage
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-center">
            {/* Starter */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-6 backdrop-blur-xl saas-card">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-elevated-2)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                  <Sparkles className="h-6 w-6 text-[#F97316]" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Starter</h3>
                <div className="mt-2 text-4xl font-bold text-[var(--text-primary)]">Free</div>
              </div>

              <ul className="mt-8 space-y-4">
                {[
                  "AI mock interviews",
                  "Peer-to-peer practice",
                  "Basic resume feedback",
                  "Community access",
                  "Limited interview topics",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 w-full block text-center rounded-lg border border-[var(--border-subtle)] bg-[var(--card-elevated-2)] px-5 py-3 font-semibold text-[var(--text-primary)] btn-saas-secondary hover:bg-[var(--hover-bg-3)]"
              >
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="relative rounded-2xl border-2 border-[#F97316]/80 bg-[var(--card-elevated-2)] p-6 shadow-2xl shadow-orange-900/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 lg:scale-[1.03]">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#F97316] to-[#EC4899] px-5 py-1.5 text-xs font-semibold text-white shadow-lg">
                Most Popular
              </div>

              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#EC4899]">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Professional</h3>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">$29</span>
                  <span className="text-sm text-[var(--text-secondary)]">/month</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {[
                  "Advanced AI scoring & feedback",
                  "Mentor-led sessions",
                  "Detailed resume suggestions",
                  "Peer 1:1 practice rooms",
                  "Full interview topic library",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 w-full block text-center rounded-lg bg-gradient-to-r from-[#F97316] to-[#EC4899] px-5 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 btn-saas-primary hover:opacity-95"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-6 backdrop-blur-xl saas-card">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-elevated-2)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                  <ShieldCheck className="h-6 w-6 text-[#F97316]" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Enterprise</h3>
                <div className="mt-2 text-4xl font-bold text-[var(--text-primary)]">Custom</div>
              </div>

              <ul className="mt-8 space-y-4">
                {[
                  "Dedicated career coaching",
                  "API & calendar integrations",
                  "In-depth analytics",
                  "Priority candidate support",
                  "Custom resume support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:hello@mockmate.dev"
                className="mt-8 w-full block text-center rounded-lg border border-[var(--border-subtle)] bg-[var(--card-elevated-2)] px-5 py-3 font-semibold text-[var(--text-primary)] btn-saas-secondary hover:bg-[var(--hover-bg-3)]"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative z-10 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-7)] px-6 py-24">
        <div className="mx-auto max-w-4xl" data-reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--card-bg-3)] px-8 py-14 text-center backdrop-blur-xl sm:px-12 sm:py-16 shadow-[0_0_90px_-30px_rgba(249,115,22,0.45)]">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#F97316]/15 blur-[80px]" />

            <h2 className="relative font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-[42px]">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--text-secondary)]">
              Start practicing today and build the confidence you need for your
              next interview.
            </p>

            <div className="relative mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/interview/new"
                className="btn-saas-primary inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#EC4899] px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-600/25 hover:opacity-95 sm:w-auto"
              >
                Start Mock Interview
              </Link>
              <a
                href="#features"
                className="btn-saas-secondary inline-flex w-full items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--card-elevated-2)] px-7 py-3.5 font-semibold text-[var(--text-primary)] sm:w-auto"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Landing;
