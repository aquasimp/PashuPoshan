"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "./db";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type VisualEffects = "auto" | "full" | "reduced";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  visualEffects: VisualEffects;
  resolvedEffects: "full" | "reduced";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setVisualEffects: (effects: VisualEffects) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "feedshield-theme";
const THEME_FALLBACK_KEY = "pashuposhan-theme";
const EFFECTS_STORAGE_KEY = "feedshield-effects";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [visualEffects, setVisualEffectsState] = useState<VisualEffects>("auto");
  const [resolvedEffects, setResolvedEffects] = useState<"full" | "reduced">("full");
  const [mounted, setMounted] = useState(false);

  const applyThemeColorMeta = (resolved: ResolvedTheme) => {
    if (typeof document === "undefined") return;
    const color = resolved === "dark" ? "#030303" : "#FAF6EC";
    let meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  };

  const computeResolvedEffects = useCallback((eff: VisualEffects): "full" | "reduced" => {
    if (eff === "reduced") return "reduced";
    if (eff === "full") return "full";
    // "auto": check browser preference for reduced-transparency or reduced-motion
    if (typeof window !== "undefined") {
      const prefersReducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedTransparency || prefersReducedMotion) {
        return "reduced";
      }
    }
    return "full";
  }, []);

  const applyResolvedToDOM = useCallback((resTheme: ResolvedTheme, resEffects: "full" | "reduced") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Theme class & style
    if (resTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    // Visual effects classes
    if (resEffects === "reduced") {
      root.classList.add("effects-reduced");
      root.classList.remove("effects-full");
    } else {
      root.classList.add("effects-full");
      root.classList.remove("effects-reduced");
    }

    applyThemeColorMeta(resTheme);
  }, []);

  useEffect(() => {
    // 1. Read stored theme
    const storedTheme = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(THEME_FALLBACK_KEY)) as Theme | null;
    const initialTheme: Theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : "system";
    setThemeState(initialTheme);

    // 2. Read stored visual effects
    const storedEffects = localStorage.getItem(EFFECTS_STORAGE_KEY) as VisualEffects | null;
    const initialEffects: VisualEffects = storedEffects === "auto" || storedEffects === "full" || storedEffects === "reduced" ? storedEffects : "auto";
    setVisualEffectsState(initialEffects);

    // 3. Resolve initial
    const mediaQueryDark = window.matchMedia("(prefers-color-scheme: dark)");
    const initialResolvedTheme: ResolvedTheme =
      initialTheme === "dark" ? "dark" : initialTheme === "light" ? "light" : mediaQueryDark.matches ? "dark" : "light";
    const initialResolvedEff = computeResolvedEffects(initialEffects);

    setResolvedTheme(initialResolvedTheme);
    setResolvedEffects(initialResolvedEff);
    applyResolvedToDOM(initialResolvedTheme, initialResolvedEff);
    setMounted(true);

    // 4. Also check Dexie for cross-tab or offline persistence sync
    try {
      db.settings.get("theme").then((item) => {
        if (item && item.value && item.value !== initialTheme) {
          setTheme(item.value);
        }
      }).catch(() => {});

      db.settings.get("visualEffects").then((item) => {
        if (item && item.value && item.value !== initialEffects) {
          setVisualEffects(item.value);
        }
      }).catch(() => {});
    } catch (e) {}

    // Listeners for system changes
    const handleThemeChange = () => {
      if (theme === "system") {
        const nextResolved: ResolvedTheme = mediaQueryDark.matches ? "dark" : "light";
        setResolvedTheme(nextResolved);
        applyResolvedToDOM(nextResolved, computeResolvedEffects(visualEffects));
      }
    };

    const mediaQueryTrans = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const handleEffectsChange = () => {
      if (visualEffects === "auto") {
        const nextEff = computeResolvedEffects("auto");
        setResolvedEffects(nextEff);
        applyResolvedToDOM(resolvedTheme, nextEff);
      }
    };

    mediaQueryDark.addEventListener("change", handleThemeChange);
    mediaQueryTrans.addEventListener("change", handleEffectsChange);

    return () => {
      mediaQueryDark.removeEventListener("change", handleThemeChange);
      mediaQueryTrans.removeEventListener("change", handleEffectsChange);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      db.settings.put({ key: "theme", value: newTheme, updatedAt: new Date().toISOString() }).catch(() => {});
    } catch (e) {}

    const mediaQueryDark = window.matchMedia("(prefers-color-scheme: dark)");
    const nextResolved: ResolvedTheme =
      newTheme === "dark" ? "dark" : newTheme === "light" ? "light" : mediaQueryDark.matches ? "dark" : "light";

    setResolvedTheme(nextResolved);
    applyResolvedToDOM(nextResolved, resolvedEffects);
  };

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const setVisualEffects = (newEffects: VisualEffects) => {
    setVisualEffectsState(newEffects);
    try {
      localStorage.setItem(EFFECTS_STORAGE_KEY, newEffects);
      db.settings.put({ key: "visualEffects", value: newEffects, updatedAt: new Date().toISOString() }).catch(() => {});
    } catch (e) {}

    const nextEff = computeResolvedEffects(newEffects);
    setResolvedEffects(nextEff);
    applyResolvedToDOM(resolvedTheme, nextEff);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, visualEffects, resolvedEffects, setTheme, toggleTheme, setVisualEffects }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
