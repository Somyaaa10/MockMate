import { FileQuestion } from "lucide-react";

function EmptyState({
  icon: Icon = FileQuestion,
  title = "No items found",
  description = "Get started by taking action below.",
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#262626] bg-[#0A0A0A] p-8 text-center backdrop-blur-xl my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] border border-[#262626] text-purple-400 mb-4 shadow-lg shadow-purple-500/5">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-[#FFFFFF]">{title}</h3>
      <p className="mt-1 text-xs text-[#A1A1A1] max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#FFFFFF] px-4 py-2 text-xs font-bold text-[#000000] shadow-sm transition hover:bg-[#E5E5E5]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
