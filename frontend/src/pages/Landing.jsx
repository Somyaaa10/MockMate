import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import FeatureList from "../components/FeatureList";
import Footer from "../components/Footer";

function Landing() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#F5F5F5] relative overflow-hidden ambient-bg-glow selection:bg-purple-500/30 selection:text-white">
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Soft Ambient Glow near Hero */}
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl text-center hero-animate-in">
          <div className="mb-6 inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111113] px-4 py-2 text-sm text-[#A1A1AA] backdrop-blur-xl shadow-sm transition duration-200 hover:border-[rgba(139,92,246,0.35)]">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#8B5CF6] ai-pulse-dot" />
            AI-Powered Mock Interview Platform
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-[#F5F5F5]">
            Prepare Smarter.
            <span className="block text-gradient-purple">
              Interview Better.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#A1A1AA]">
            Practice realistic interviews with AI or connect with peers for
            real-time mock interview sessions. Get feedback, improve your
            skills, and become interview-ready.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/interview/new"
              className="rounded-xl bg-[#8B5CF6] px-7 py-3.5 font-semibold text-white shadow-lg shadow-purple-900/20 btn-saas-primary hover:bg-[#7C3AED] inline-flex items-center justify-center"
            >
              Start Mock Interview
            </Link>

            <a
              href="#features"
              className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111113] px-7 py-3.5 font-semibold text-[#F5F5F5] backdrop-blur-xl btn-saas-secondary hover:bg-[#16161A] inline-flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113] p-6 backdrop-blur-xl saas-card">
              <div className="text-3xl font-bold text-[#F5F5F5]">AI</div>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                Personalized interview practice
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113] p-6 backdrop-blur-xl saas-card">
              <div className="text-3xl font-bold text-[#F5F5F5]">1:1</div>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                Real-time peer interviews
              </p>
            </div>

            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113] p-6 backdrop-blur-xl saas-card">
              <div className="text-3xl font-bold text-[#F5F5F5]">24/7</div>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                Practice whenever you want
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-24 border-t border-[rgba(255,255,255,0.08)] bg-[#050505]">
        <div className="mx-auto max-w-7xl">
          <FeatureList />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 border-t border-[rgba(255,255,255,0.08)] bg-[#0A0A0B] relative z-10">
        <div className="mx-auto max-w-7xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#8B5CF6]">
            How It Works
          </span>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl text-[#F5F5F5]">
            Practice in three simple steps
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
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
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113] p-8 text-left backdrop-blur-xl saas-card"
              >
                <span className="text-sm font-bold text-[#8B5CF6]">
                  {step.number}
                </span>

                <h3 className="mt-4 text-xl font-semibold text-[#F5F5F5]">{step.title}</h3>

                <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative overflow-hidden px-6 py-24 border-t border-[rgba(255,255,255,0.08)] bg-[#050505] z-10">
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8B5CF6]">
              Pricing
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl text-[#F5F5F5]">
              Choose Your Plan
            </h2>

            <p className="mt-4 text-lg text-[#A1A1AA]">
              Flexible pricing for every career stage
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-center">
            {/* Starter */}
            <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113] p-6 backdrop-blur-xl saas-card">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16161A] text-[#F5F5F5] border border-[rgba(255,255,255,0.08)]">
                  <Sparkles className="h-6 w-6 text-[#8B5CF6]" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-[#F5F5F5]">Starter</h3>

                <div className="mt-2 text-4xl font-bold text-[#F5F5F5]">Free</div>
              </div>

              <ul className="mt-8 space-y-4">
                {[
                  "AI mock interviews (basic)",
                  "Peer-to-peer practice",
                  "Basic resume feedback",
                  "Community forum access",
                  "Limited interview topics",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[#A1A1AA]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 w-full block text-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#16161A] px-5 py-3 font-semibold text-[#F5F5F5] btn-saas-secondary hover:bg-[#1D1D21]"
              >
                Get Started
              </Link>
            </div>

            {/* Professional */}
            <div className="relative rounded-2xl border-2 border-[#8B5CF6]/80 bg-[#16161A] p-6 shadow-2xl shadow-purple-900/30 backdrop-blur-xl transition duration-300 hover:-translate-y-1 lg:scale-[1.03]">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-1.5 text-xs font-semibold text-white shadow-lg">
                Most Popular
              </div>

              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1]">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-[#F5F5F5]">Professional</h3>

                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[#F5F5F5]">$29</span>
                  <span className="text-sm text-[#A1A1AA]">/mo</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {[
                  "Advanced AI scoring & feedback",
                  "Mentor-led sessions",
                  "Detailed resume suggestions",
                  "Interview recordings",
                  "Full interview topic library",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[#A1A1AA]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 w-full block text-center rounded-lg bg-[#8B5CF6] px-5 py-3 font-semibold text-white shadow-lg shadow-purple-600/20 btn-saas-primary hover:bg-[#7C3AED]"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113] p-6 backdrop-blur-xl saas-card">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16161A] text-[#F5F5F5] border border-[rgba(255,255,255,0.08)]">
                  <ShieldCheck className="h-6 w-6 text-[#8B5CF6]" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold text-[#F5F5F5]">Enterprise</h3>

                <div className="mt-2 text-4xl font-bold text-[#F5F5F5]">Custom</div>
              </div>

              <ul className="mt-8 space-y-4">
                {[
                  "Dedicated career coaching",
                  "API & calendar integrations",
                  "In-depth analytics",
                  "Unlimited recordings",
                  "Custom resume creation",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[#A1A1AA]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:hello@mockmate.dev"
                className="mt-8 w-full block text-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#16161A] px-5 py-3 font-semibold text-[#F5F5F5] btn-saas-secondary hover:bg-[#1D1D21]"
              >
                Contact Sales
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
