import { CheckCircle2, FileText, Users, Video, Zap } from "lucide-react";

/* ------------------------------------------------------------------
   Canonical feature registry.
   `quota` here is the FREE-tier allowance and is only used as a
   fallback — real quotas always come from the API payload passed in
   via `normalizeFeatures`.
   ------------------------------------------------------------------ */
export const FEATURE_REGISTRY = [
  {
    feature: "AI_INTERVIEW",
    name: "AI Interview",
    icon: Zap,
    accent: "#60A5FA",
    tint: "rgba(59,130,246,0.12)",
    ring: "rgba(59,130,246,0.28)",
    level: "Basic",
    quota: 1,
    link: "/interview/new",
  },
  {
    feature: "ONE_TO_ONE_INTERVIEW",
    name: "One To One Interview",
    icon: Users,
    accent: "#34D399",
    tint: "rgba(16,185,129,0.12)",
    ring: "rgba(16,185,129,0.28)",
    level: "Basic",
    quota: 100,
    link: "/peer/setup",
  },
  {
    feature: "RESUME_ANALYZER",
    name: "Resume Analyzer",
    icon: FileText,
    accent: "#C084FC",
    tint: "rgba(168,85,247,0.12)",
    ring: "rgba(168,85,247,0.30)",
    level: "Basic",
    quota: 1,
  },
];

const FALLBACK = {
  icon: CheckCircle2,
  accent: "#C084FC",
  tint: "rgba(168,85,247,0.12)",
  ring: "rgba(168,85,247,0.30)",
  level: "Basic",
  quota: 1,
};

/* ------------------------------------------------------------------
   Merge API-provided feature data over the registry.
   Accepts an array of strings, or objects carrying
   { feature, name, level, quota, used, status }.
   ------------------------------------------------------------------ */
export function normalizeFeatures(features) {
  const source =
    Array.isArray(features) && features.length > 0 ? features : FEATURE_REGISTRY;

  return source.map((entry) => {
    const obj = typeof entry === "string" ? { feature: entry } : entry || {};
    const key = obj.feature || obj.name || "";

    const match =
      FEATURE_REGISTRY.find(
        (f) =>
          f.feature === key ||
          f.name.toLowerCase() === String(key).toLowerCase()
      ) || null;

    const base = match ? { ...match } : { ...FALLBACK };

    return {
      ...base,
      ...obj,
      name: obj.name || base.name || String(key).replace(/_/g, " "),
      level: obj.level ?? base.level,
      quota: obj.quota !== undefined ? obj.quota : base.quota,
      used: obj.used,
      status: obj.status,
      link: obj.link ?? base.link,
      // Presentation always comes from the registry so a partial API
      // payload can never render an unstyled or missing icon.
      icon: base.icon,
      accent: base.accent,
      tint: base.tint,
      ring: base.ring,
    };
  });
}
