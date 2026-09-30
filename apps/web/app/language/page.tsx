"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { useI18n, SupportedLanguage } from "@/lib/i18n";
import { Languages, CheckCircle2, ArrowLeft, Volume2, Sparkles } from "lucide-react";

export default function LanguageSelectorPage() {
  const { language, setLanguage, t } = useI18n();
  const router = useRouter();

  const options: {
    code: SupportedLanguage;
    title: string;
    nativeTitle: string;
    description: string;
    sampleAdvisory: string;
  }[] = [
    {
      code: "en",
      title: "English",
      nativeTitle: "English",
      description: "Standard technical & agricultural terms for cooperative management & reports.",
      sampleAdvisory: "Silage core heating (+12°C). Aerobic yeasts active. Recommend trimming shoulder and blending.",
    },
    {
      code: "hi",
      nativeTitle: "हिन्दी",
      title: "Hindi",
      description: "पशुपालक भाइयों के लिए सरल और स्पष्ट भाषा, सभी चेतावनियां और आवाज में सलाह।",
      sampleAdvisory: "साइलेज में तापमान (+12°C) ज्यादा है। हवा रिसाव से फफूंद का खतरा है। खराब हिस्सा अलग करें।",
    },
    {
      code: "hinglish",
      nativeTitle: "Hinglish",
      title: "Hinglish",
      description: "Daily spoken mix of Hindi & English naturally used by Indian dairy farmers.",
      sampleAdvisory: "Pit mein heating (+12°C) dekhi gayi hai. Spoilage ka risk badh sakta hai. Khilate waqt blend karein.",
    },
  ];

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    router.back();
  };

  return (
    <div className="min-h-screen pb-16 font-sans">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl border border-bone/80 dark:border-white/10 hover:bg-bone/80 dark:hover:bg-dark-card transition-colors text-ink dark:text-dark-ink"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-forest dark:text-dark-ink tracking-tight">
              Select Language · भाषा चुनें
            </h1>
            <p className="text-xs md:text-sm text-muted dark:text-dark-muted">
              Choose your preferred language for tests, advisories, voice, and PDF reports.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {options.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <GlassCard
                key={opt.code}
                variant={isSelected ? "hero" : "frosted"}
                onClick={() => handleSelect(opt.code)}
                className={`p-5 cursor-pointer transition-all hover:scale-[1.01] border-2 ${
                  isSelected
                    ? "border-forest dark:border-dark-forest bg-forest/5 dark:bg-dark-forest/15"
                    : "border-bone/80 dark:border-white/10 hover:border-forest/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xl text-forest dark:text-dark-ink">
                        {opt.nativeTitle}
                      </span>
                      <span className="text-xs text-muted dark:text-dark-muted font-sans">
                        ({opt.title})
                      </span>
                    </div>
                    <p className="text-xs text-muted dark:text-dark-muted leading-relaxed font-sans">
                      {opt.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="p-1.5 rounded-full bg-forest text-white shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Sample Advisory Preview */}
                <div className="mt-3 pt-3 border-t border-bone/60 dark:border-white/10 flex items-start gap-2 text-xs text-ink/80 dark:text-dark-ink/80 bg-bone/30 dark:bg-dark-card/50 p-2.5 rounded-xl font-sans">
                  <Volume2 className="w-4 h-4 text-forest dark:text-dark-forest shrink-0 mt-0.5" />
                  <span className="italic leading-snug">"{opt.sampleAdvisory}"</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}
