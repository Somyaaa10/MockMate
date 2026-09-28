import { FileText, PlayCircle } from "lucide-react";
import { EmptyState } from "./DashboardPrimitives";

/* ------------------------------------------------------------------
   Reports empty state — one clear explanation, one primary action.
   ------------------------------------------------------------------ */
export default function EmptyReports({
  title = "No Reports Yet",
  description,
  actionLabel = "Start Interview",
  onAction,
}) {
  return (
    <EmptyState
      icon={FileText}
      title={title}
      description={
        description ||
        "Start an AI interview to generate your first performance report and track your progress."
      }
      action={
        onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mm-btn mm-btn-primary px-6 py-3 text-[14px]"
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            {actionLabel}
          </button>
        ) : null
      }
    />
  );
}
