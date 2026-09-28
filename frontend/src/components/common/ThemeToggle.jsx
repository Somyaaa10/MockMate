import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Theme toggle button. Mirrors the project's pill/icon-button styling and
 * works on both the public and authenticated surfaces.
 */
function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-secondary)] transition duration-200 hover:border-[var(--strong-line-2)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export default ThemeToggle;