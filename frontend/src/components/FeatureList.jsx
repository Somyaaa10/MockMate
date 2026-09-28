/* ------------------------------------------------------------------
   Legacy wrapper. The feature presentation now lives in
   `dashboard/FeatureCard` so the Overview grid and this component
   share one registry and one set of styles.
   ------------------------------------------------------------------ */
import FeatureGrid from "./dashboard/FeatureCard";

export default function FeatureList({ features, onSelect }) {
  return <FeatureGrid features={features} onSelect={onSelect} />;
}
