import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "mockmate-theme";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Ignore storage issues
  }
  if (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage write issues
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  // Listen for system theme changes if no manual preference is saved
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setThemeState(e.matches ? "dark" : "light");
        }
      } catch {
        // Ignore
      }
    };
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  const value = {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}