import { useEffect, useState } from "react";
import {
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  Bot,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ------------------------------------------------------------------
   Scroll-reveal — soft fade-up the first time a section enters view.
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

const FEATURE_DATA = [
  {
    number: "01",
    title: "AI Mock Interviews",
    desc: "Practice realistic interviews with AI-generated questions and personalized feedback.",
    icon: Bot,
  },
  {
    number: "02",
    title: "Smart Resume Analyzer",
    desc: "Analyze your resume and receive actionable suggestions to improve your profile.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Peer-to-Peer Interviews",
    desc: "Connect with other candidates for realistic one-to-one mock interviews.",
    icon: Users,
  },
  {
    number: "04",
    title: "AI Feedback",
    desc: "Get detailed feedback on communication, technical answers, confidence, and overall performance.",
    icon: Sparkles,
  },
  {
    number: "05",
    title: "Interview Analytics",
    desc: "Track your progress and identify your strengths and weaknesses over time.",
    icon: BarChart3,
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

/* ------------------------------------------------------------------
   Feature Preview Mockups (Visual UI representation for each feature)
   ------------------------------------------------------------------ */
function PreviewContent({ index }) {
  switch (index) {
    case 0:
      // AI Mock Interviews
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between rounded-xl bg-[var(--background-soft)] p-3.5 border border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">AI Interviewer • Active Session</span>
            </div>
            <span className="text-xs font-mono text-[var(--primary)] font-bold">02:45 / 05:00</span>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">Question 2 of 5</span>
            <h4 className="mt-2 text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
              "Explain how React's Virtual DOM diffing algorithm optimizes rendering performance."
            </h4>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Your Audio Input</span>
              <span className="text-[var(--success)] font-medium">Recording Answer...</span>
            </div>
            <div className="flex items-center gap-1.5 h-7">
              {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 45, 85, 50].map((h, i) => (
                <span key={i} className="flex-1 rounded-full bg-[var(--primary)] transition-all duration-150" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      );

    case 1:
      // Smart Resume Analyzer
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between rounded-xl bg-[var(--background-soft)] p-4 border border-[var(--border)]">
            <div>
              <span className="text-xs text-[var(--text-muted)]">Resume Match Score</span>
              <div className="text-2xl font-extrabold text-[var(--text-primary)] font-hero">88 / 100</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] font-extrabold text-base">
              88%
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <span className="text-xs font-bold text-[var(--text-primary)]">Key Skills Extracted</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {["React.js", "Node.js", "TypeScript", "System Design", "MongoDB"].map((skill) => (
                <span key={skill} className="rounded-lg bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
            <span className="text-xs font-bold text-[var(--text-primary)]">Actionable Suggestions</span>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2 text-[var(--success)] font-medium">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>Strong technical project descriptions.</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--warning)] font-medium">
                <Zap className="h-3.5 w-3.5 shrink-0" />
                <span>Add quantitative metrics to experience bullet points.</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 2:
      // Peer-to-Peer Interviews
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between rounded-xl bg-[var(--background-soft)] p-3 border border-[var(--border)] text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Peer Room #4092</span>
            <span className="rounded-full bg-[var(--success)]/15 px-2.5 py-0.5 text-[11px] font-bold text-[var(--success)]">Live Connected</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-video rounded-xl border border-[var(--border)] bg-[var(--background-soft)] flex items-center justify-center overflow-hidden p-3">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Users className="h-7 w-7 text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Peer Candidate</span>
              </div>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">Alex C.</span>
            </div>
            <div className="relative aspect-video rounded-xl border border-[var(--border)] bg-[var(--background-soft)] flex items-center justify-center overflow-hidden p-3">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Bot className="h-7 w-7 text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">You</span>
              </div>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">You</span>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 flex items-center justify-around text-xs font-semibold text-[var(--text-secondary)]">
            <span className="rounded-lg bg-[var(--primary-soft)] px-3 py-1.5 text-[var(--primary)]">Shared Code Editor</span>
            <span>Real-time Video & Audio</span>
          </div>
        </div>
      );

    case 3:
      // AI Feedback
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--text-muted)]">Overall Performance</span>
              <div className="text-2xl font-extrabold text-[var(--text-primary)] font-hero">8.8 / 10</div>
            </div>
            <Sparkles className="h-8 w-8 text-[var(--primary)]" />
          </div>

          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            {[
              { label: "Technical Answer Depth", val: 92 },
              { label: "Communication Clarity", val: 85 },
              { label: "Confidence & Pace", val: 88 },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-xs font-medium text-[var(--text-primary)] mb-1">
                  <span>{metric.label}</span>
                  <span className="text-[var(--primary)] font-bold">{metric.val}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--primary-soft)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${metric.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-bold text-[var(--text-primary)] block mb-1">AI Recommendation:</span>
            "Excellent explanation of React diffing. Focus on framing architecture trade-offs clearly at the beginning."
          </div>
        </div>
      );

    case 4:
      // Interview Analytics
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-3 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">Interviews</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">14</span>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-3 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">Practice Time</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">12.5h</span>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background-soft)] p-3 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">Avg Score</span>
              <span className="text-lg font-bold text-[var(--primary)]">86%</span>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <span className="text-xs font-bold text-[var(--text-primary)] block mb-3">Score Growth Trend</span>
            <div className="flex items-end gap-2 h-24 pt-2 border-b border-[var(--border)] pb-2">
              {[55, 62, 70, 78, 85, 88, 92].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md bg-[var(--primary)] transition-all duration-300" style={{ height: `${v}%` }} />
                  <span className="text-[9px] text-[var(--text-muted)]">S{i+1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Top Strength: System Architecture</span>
            <span className="text-[var(--success)] font-bold">Top 5%</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function FeatureGrid() {
  const topFeatures = FEATURE_DATA.slice(0, 3);
  const bottomFeatures = FEATURE_DATA.slice(3, 5);

  return (
    <div className="mt-12 space-y-6 max-w-5xl mx-auto">
      {/* Row 1: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topFeatures.map((feat) => {
          const IconComponent = feat.icon;
          return (
            <div
              key={feat.number}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[var(--panel-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-md flex flex-col justify-start text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] mb-5 transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                {IconComponent && <IconComponent className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Row 2: 2 Cards Centered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[700px] mx-auto">
        {bottomFeatures.map((feat) => {
          const IconComponent = feat.icon;
          return (
            <div
              key={feat.number}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[var(--panel-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-md flex flex-col justify-start text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] mb-5 transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                {IconComponent && <IconComponent className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Landing() {
  useScrollReveal();

  return (
    <main className="min-h-screen bg-[var(--background)] pt-[72px] text-[var(--text-primary)] relative overflow-hidden transition-colors duration-200">
      <Header />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28">
        {/* Soft ambient glow */}
        <div className="absolute left-1/2 top-1/4 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6366F1]/15 via-[#A855F7]/12 to-[#D946EF]/15 blur-[140px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="hero-stagger-1 mb-6 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] shadow-xs">
            <span className="mr-2 h-2 w-2 rounded-full bg-[var(--primary)] ai-pulse-dot" />
            AI-Powered Mock Interview Platform
          </div>

          <h1 className="hero-stagger-1 text-4xl sm:text-6xl lg:text-[72px] font-extrabold leading-[1.02] tracking-tight text-[var(--text-primary)]">
            Prepare Smarter.
            <span className="block bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] bg-clip-text text-transparent">
              Interview Better.
            </span>
          </h1>

          <p className="hero-stagger-2 mx-auto mt-6 max-w-[720px] text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            Practice realistic interviews with AI or connect with peers for
            real-time mock interview sessions. Get feedback, improve your
            skills, and become interview-ready.
          </p>

          {/* CTAs */}
          <div className="hero-stagger-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/interview/new"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition duration-200 hover:opacity-95 sm:w-auto"
            >
              Start Mock Interview
            </Link>
            <a
              href="#features"
              className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-xs transition duration-200 hover:bg-[var(--surface-hover)] sm:w-auto"
            >
              Explore Features
            </a>
          </div>

          {/* Value cards */}
          <div className="hero-stagger-4 mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {VALUE_CARDS.map((card) => (
              <div
                key={card.value}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--panel-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <div className="font-hero text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
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

      {/* ═══════════ FEATURES (SCROLL-DRIVEN STICKY SHOWCASE) ═══════════ */}
      <section
        id="features"
        className="relative z-10 scroll-mt-[72px] border-t border-[var(--border-soft)] bg-[var(--background)] px-6 pt-[100px] sm:pt-[120px] pb-[140px] transition-colors duration-200"
      >
        {/* Subtle radial glow behind feature section */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-70"
          style={{
            background: "radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.08), transparent 55%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1200px]" data-reveal>
          {/* Section Header */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
              FEATURES
            </span>
            <h2 className="mt-2 text-3xl md:text-[44px] lg:text-[48px] font-extrabold tracking-tight leading-[1.05] text-[var(--text-primary)]">
              Everything You Need to Ace Your Interview
            </h2>
          </div>

          {/* Feature Grid Component */}
          <FeatureGrid />
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section
        id="how-it-works"
        className="relative z-10 scroll-mt-[84px] border-t border-[var(--border-soft)] bg-[var(--background-soft)] px-6 pt-[90px] pb-[100px] transition-colors duration-200"
      >
        <div className="mx-auto max-w-7xl text-center" data-reveal>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
            HOW IT WORKS
          </span>
          <h2 className="mt-2 text-3xl md:text-[42px] font-extrabold tracking-tight text-[var(--text-primary)]">
            Practice in three simple steps
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-left shadow-[var(--panel-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <span className="font-hero text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--primary)]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-secondary)]">
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
        className="relative z-10 scroll-mt-[84px] overflow-hidden border-t border-[var(--border-soft)] bg-[var(--background)] px-6 pt-[90px] pb-[100px] transition-colors duration-200"
      >
        <div className="relative mx-auto max-w-7xl" data-reveal>
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
              PRICING
            </span>
            <h2 className="mt-2 text-3xl md:text-[42px] font-extrabold tracking-tight text-[var(--text-primary)]">
              Choose Your Plan
            </h2>
            <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
              Flexible pricing for every career stage
            </p>
          </div>

          {/* Pricing cards equal height */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {/* Starter */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 flex flex-col justify-between shadow-[var(--panel-shadow)]">
              <div>
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Starter</h3>
                  <div className="mt-2 font-hero text-4xl font-extrabold text-[var(--text-primary)]">Free</div>
                </div>

                <ul className="mt-8 space-y-3.5">
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
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className="mt-8 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 text-center text-sm font-semibold text-[var(--text-primary)] shadow-xs transition duration-200 hover:bg-[var(--surface-hover)]"
              >
                Get Started
              </Link>
            </div>

            {/* Professional (Highlighted Card: 3-Stop gradient border & soft glow) */}
            <div className="relative rounded-2xl border-2 border-[#7C5CFF] bg-[var(--surface)] p-7 flex flex-col justify-between shadow-[0_0_40px_rgba(124,92,255,0.18)] transition duration-300">
              {/* Popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] px-4 py-1 text-xs font-semibold text-white shadow-xs">
                Most Popular
              </div>

              <div>
                <div className="flex justify-center mt-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] via-[#A855F7] to-[#D946EF] text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Professional</h3>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    <span className="font-hero text-4xl font-extrabold text-[var(--text-primary)]">$29</span>
                    <span className="text-sm text-[var(--text-secondary)]">/month</span>
                  </div>
                </div>

                <ul className="mt-8 space-y-3.5">
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
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className="mt-8 block w-full rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] py-3 text-center text-sm font-semibold text-white shadow-md transition duration-200 hover:opacity-95"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 flex flex-col justify-between shadow-[var(--panel-shadow)]">
              <div>
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Enterprise</h3>
                  <div className="mt-2 font-hero text-4xl font-extrabold text-[var(--text-primary)]">Custom</div>
                </div>

                <ul className="mt-8 space-y-3.5">
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
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="mailto:hello@mockmate.dev"
                className="mt-8 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 text-center text-sm font-semibold text-[var(--text-primary)] shadow-xs transition duration-200 hover:bg-[var(--surface-hover)]"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative z-10 border-t border-[var(--border-soft)] bg-[var(--background-soft)] px-6 pt-[80px] pb-[90px] transition-colors duration-200">
        <div className="mx-auto max-w-4xl" data-reveal>
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-12 text-center sm:px-12 sm:py-14 shadow-[0_0_40px_rgba(124,92,255,0.12)]">
            {/* Soft purple/pink radial background glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,92,255,0.14),transparent_70%)]" />

            <h2 className="relative font-hero text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Start practicing today and build the confidence you need for your
              next interview.
            </p>

            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/interview/new"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition duration-200 hover:opacity-95 sm:w-auto"
              >
                Start Mock Interview
              </Link>
              <a
                href="#features"
                className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-xs transition duration-200 hover:bg-[var(--surface-hover)] sm:w-auto"
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
