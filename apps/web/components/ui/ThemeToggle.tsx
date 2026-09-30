"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = "" }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-bone/60 dark:border-white/10 bg-surface/50 dark:bg-dark-surface/50 animate-pulse ${className}`} />
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-xl border border-bone/80 dark:border-white/10 bg-surface/80 dark:bg-dark-surface/80 hover:bg-bone/80 dark:hover:bg-dark-card text-ink dark:text-dark-ink transition-all shadow-subtle backdrop-blur-md active:scale-95 ${className}`}
        title={`Current: ${resolvedTheme} mode (Click to switch)`}
        aria-label="Toggle Theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-4 h-4 text-amber" />
        ) : (
          <Moon className="w-4 h-4 text-forest" />
        )}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl border border-bone/80 dark:border-white/10 bg-surface/70 dark:bg-dark-surface/70 backdrop-blur-md shadow-subtle text-xs font-medium font-sans ${className}`}
      role="group"
      aria-label="Theme selector"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          theme === "light"
            ? "bg-forest text-white shadow-sm font-semibold"
            : "text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
        }`}
        aria-pressed={theme === "light"}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          theme === "dark"
            ? "bg-forest text-white shadow-sm font-semibold"
            : "text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
        }`}
        aria-pressed={theme === "dark"}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          theme === "system"
            ? "bg-forest text-white shadow-sm font-semibold"
            : "text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
        }`}
        aria-pressed={theme === "system"}
      >
        <Laptop className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Auto</span>
      </button>
    </div>
  );
};
