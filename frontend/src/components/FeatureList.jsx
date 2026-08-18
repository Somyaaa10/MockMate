import {
  BrainCircuit,
  MessageSquareText,
  Video,
  FileText,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Mock Interviews",
    description:
      "Practice realistic technical, behavioral, and system-design interviews with AI-generated questions.",
  },
  {
    icon: Video,
    title: "Peer Interviews",
    description:
      "Connect with another candidate and conduct realistic one-to-one mock interviews using WebRTC.",
  },
  {
    icon: MessageSquareText,
    title: "Real-Time Interaction",
    description:
      "Use video, audio, screen sharing, and chat to simulate an actual interview environment.",
  },
  {
    icon: FileText,
    title: "Resume Analysis",
    description:
      "Upload your resume and get personalized interview questions based on your skills and experience.",
  },
  {
    icon: BarChart3,
    title: "Performance Reports",
    description:
      "Understand your strengths and weaknesses through detailed AI-generated performance reports.",
  },
  {
    icon: ShieldCheck,
    title: "Interview Ready",
    description:
      "Build confidence through structured practice and measurable improvement over time.",
  },
];

function FeatureList() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Powerful Features
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="text-blue-400">prepare better</span>
          </h2>

          <p className="mt-5 text-slate-400">
            MockMate combines AI-powered practice with real human interaction to
            create a complete interview preparation experience.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/20">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeatureList;
