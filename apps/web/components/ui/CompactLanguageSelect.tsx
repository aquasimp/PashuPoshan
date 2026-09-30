"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useI18n, Locale } from "@/lib/i18n";

interface CompactLanguageSelectProps {
  className?: string;
  dropUp?: boolean;
}

export const CompactLanguageSelect: React.FC<CompactLanguageSelectProps> = ({
  className = "",
  dropUp = false,
}) => {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { code: Locale; label: string; native: string }[] = [
    { code: "en", label: "English", native: "EN" },
    { code: "hi", label: "हिन्दी", native: "हिं" },
    { code: "hinglish", label: "Hinglish", native: "Hgl" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
        className="glass-surface-2 hover:glass-surface-3 border border-edge hover:border-edge-hi px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium text-ink-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/50 dark:focus-visible:ring-emerald-400"
      >
        <Globe className="w-3.5 h-3.5 text-forest dark:text-emerald-400 flex-shrink-0" />
        <span className="hidden sm:inline font-sans">{currentLang.label}</span>
        <span className="sm:hidden font-sans font-semibold">{currentLang.native}</span>
        <ChevronDown className={`w-3 h-3 text-ink-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Languages"
          className={`absolute right-0 z-50 min-w-[130px] p-1.5 rounded-2xl glass-surface-3 border border-edge shadow-elevated animate-in fade-in zoom-in-95 duration-150 ${
            dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={locale === l.code}
              type="button"
              onClick={() => selectLanguage(l.code)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                locale === l.code
                  ? "glass-surface-active text-forest dark:text-emerald-300 font-semibold border border-edge"
                  : "text-ink-2 hover:text-ink-1 hover:glass-surface-2"
              }`}
            >
              <span className={l.code === "hi" ? "font-hindi" : "font-sans"}>{l.label}</span>
              {locale === l.code && <Check className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
