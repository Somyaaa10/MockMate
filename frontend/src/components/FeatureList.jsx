import {
  Zap,
  Users,
  FileText,
  Video,
  CheckCircle,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const DEFAULT_FEATURES = [
  {
    feature: "AI_INTERVIEW",
    name: "AI Interview",
    level: "Free",
    quota: 1,
    icon: Zap,
    color: "bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#8B5CF6]",
    link: "/interview/new",
  },
  {
    feature: "ONE_TO_ONE_INTERVIEW",
    name: "One To One Interview",
    level: "Free",
    quota: 100,
    icon: Users,
    color: "bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#6366F1]",
    link: "/peer/setup",
  },
  {
    feature: "RESUME_ANALYZER",
    name: "Resume Analyzer",
    level: "Free",
    quota: 1,
    icon: FileText,
    color: "bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#8B5CF6]",
  },
  {
    feature: "INTERVIEW_RECORDING",
    name: "Interview Recording",
    level: "Free",
    quota: 5,
    icon: Video,
    color: "bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#EC4899]",
    link: "/peer/setup",
  },
];

export default function FeatureList({ features }) {
  const displayFeatures = features && features.length > 0 ? features : DEFAULT_FEATURES;

  const getFeatureConfig = (feat) => {
    const key = typeof feat === "string" ? feat : feat.feature;
    const match = DEFAULT_FEATURES.find(
      (f) => f.feature === key || f.name.toLowerCase() === key.toLowerCase()
    );

    if (match) {
      return {
        ...match,
        ...(typeof feat === "object" ? feat : {}),
      };
    }

    return {
      feature: key,
      name: typeof feat === "object" && feat.name ? feat.name : key.replace(/_/g, " "),
      level: typeof feat === "object" && feat.level ? feat.level : "Free",
      quota: typeof feat === "object" && feat.quota !== undefined ? feat.quota : 1,
      icon: CheckCircle,
      color: "bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#8B5CF6]",
    };
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {displayFeatures.map((item) => {
        const config = getFeatureConfig(item);
        const Icon = config.icon;
        const targetLink = config.link;

        const cardContent = (
          <div
            className={`group relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113] p-6 backdrop-blur-xl saas-card ${
              targetLink ? "cursor-pointer" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border ${config.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#16161A] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                {config.level}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#F5F5F5] tracking-wide">
              {config.name}
            </h3>

            <div className="mt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-3">
              <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                Quota
              </span>
              <div className="flex items-center gap-1 text-sm font-semibold text-[#F5F5F5]">
                {config.quota === null ? (
                  <span className="flex items-center gap-1 text-[#22C55E]">
                    <InfinityIcon className="h-4 w-4" /> Unlimited
                  </span>
                ) : (
                  <span>{config.quota}</span>
                )}
              </div>
            </div>
          </div>
        );

        if (targetLink) {
          return (
            <Link key={config.feature} to={targetLink} className="block">
              {cardContent}
            </Link>
          );
        }

        return <div key={config.feature}>{cardContent}</div>;
      })}
    </div>
  );
}
