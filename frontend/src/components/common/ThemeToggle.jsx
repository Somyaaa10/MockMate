import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Accessible Theme Toggle component.
 * Works seamlessly across both Public (Landing/Auth) and Dashboard routes.
 */
function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] shadow-xs ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[var(--warning)] transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[var(--primary)] transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}

export default ThemeToggle;