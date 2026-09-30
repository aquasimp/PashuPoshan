"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import hinglish from "../locales/hinglish.json";
import { Globe } from "lucide-react";

export type Locale = "en" | "hi" | "hinglish";
export type SupportedLanguage = Locale;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  language: Locale;
  setLanguage: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Locale, any> = {
  en,
  hi,
  hinglish,
};

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = (localStorage.getItem("pashuposhan_locale") || localStorage.getItem("feedshield_locale")) as Locale;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("pashuposhan_locale", l);
    }
  };

  const t = (path: string, fallback?: string): string => {
    const parts = path.split(".");
    let curr = translations[locale];
    for (const part of parts) {
      if (curr && curr[part] !== undefined) {
        curr = curr[part];
      } else {
        // Fallback to English
        let fallbackVal = translations["en"];
        for (const p of parts) {
          if (fallbackVal && fallbackVal[p] !== undefined) {
            fallbackVal = fallbackVal[p];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackVal === "string" ? fallbackVal : fallback || path;
      }
    }
    return typeof curr === "string" ? curr : fallback || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, language: locale, setLanguage: setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`inline-flex items-center gap-1 bg-surface/90 border border-bone rounded-full p-1 shadow-subtle ${className}`}>
      <Globe className="w-3.5 h-3.5 text-forest ml-1.5 mr-0.5" />
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
          locale === "en" ? "bg-forest text-white" : "text-ink hover:text-forest"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLocale("hi")}
        className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
          locale === "hi" ? "bg-forest text-white font-hindi" : "text-ink hover:text-forest font-hindi"
        }`}
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => setLocale("hinglish")}
        className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${
          locale === "hinglish" ? "bg-forest text-white" : "text-ink hover:text-forest"
        }`}
      >
        Hinglish
      </button>
    </div>
  );
};
