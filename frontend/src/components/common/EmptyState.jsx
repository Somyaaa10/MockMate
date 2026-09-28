import { FileQuestion } from "lucide-react";

function EmptyState({
  icon: Icon = FileQuestion,
  title = "No items found",
  description = "Get started by taking action below.",
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--strong-line)] bg-[var(--bg-surface)] p-8 text-center backdrop-blur-xl my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--chip-bg)] border border-[var(--strong-line)] text-orange-400 mb-4 shadow-lg shadow-orange-500/5">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary-2)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--text-secondary-2)] max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[var(--inv-bg)] px-4 py-2 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover-2)]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
