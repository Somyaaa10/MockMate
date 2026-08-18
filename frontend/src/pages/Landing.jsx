import { Check, Crown, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Header from "../components/Header";
import FeatureList from "../components/FeatureList";
import Footer from "../components/Footer";

function Landing() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
            <span className="mr-2 h-2 w-2 rounded-full bg-cyan-400" />
            AI-Powered Mock Interview Platform
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Prepare Smarter.
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Interview Better.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Practice realistic interviews with AI or connect with peers for
            real-time mock interview sessions. Get feedback, improve your
            skills, and become interview-ready.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500">
              Start Mock Interview
            </button>

            <a
              href="#features"
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-slate-200 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-3xl font-bold">AI</div>
              <p className="mt-2 text-sm text-slate-400">
                Personalized interview practice
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-3xl font-bold">1:1</div>
              <p className="mt-2 text-sm text-slate-400">
                Real-time peer interviews
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-3xl font-bold">24/7</div>
              <p className="mt-2 text-sm text-slate-400">
                Practice whenever you want
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureList />

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            How It Works
          </span>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
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
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-left backdrop-blur-xl"
              >
                <span className="text-sm font-bold text-blue-400">
                  {step.number}
                </span>

                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      {/* Pricing */}
      <section id="pricing" className="relative overflow-hidden px-6 py-24">
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Pricing
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Choose Your Plan
            </h2>

            <p className="mt-4 text-lg text-slate-400">
              Flexible pricing for every career stage
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-center">
            {/* Starter */}
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700/70">
                  <Sparkles className="h-6 w-6 text-slate-200" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold">Starter</h3>

                <div className="mt-2 text-4xl font-bold">Free</div>
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
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-8 w-full rounded-lg bg-white/10 px-5 py-3 font-semibold transition hover:bg-white/15">
                Get Started
              </button>
            </div>

            {/* Professional */}
            <div className="relative rounded-2xl border border-fuchsia-500 bg-white/[0.05] p-6 shadow-2xl shadow-purple-900/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 lg:scale-[1.03]">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-1.5 text-xs font-semibold text-white shadow-lg">
                Most Popular
              </div>

              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold">Professional</h3>

                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-sm text-slate-400">/mo</span>
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
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-8 w-full rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:from-purple-500 hover:to-fuchsia-400">
                Get Started
              </button>
            </div>

            {/* Enterprise */}
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-xl font-bold">Enterprise</h3>

                <div className="mt-2 text-4xl font-bold">Custom</div>
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
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-8 w-full rounded-lg bg-white/10 px-5 py-3 font-semibold transition hover:bg-white/15">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Landing;
