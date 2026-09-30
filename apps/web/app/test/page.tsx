"use client";

import React from "react";
import Link from "next/link";
import {
  Thermometer,
  Layers,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { useI18n } from "@/lib/i18n";

export default function TestSelectPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
          <Link href="/" className="hover:text-forest dark:hover:text-emerald-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-ink dark:text-dark-ink font-medium">Select Test Protocol</span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-moss dark:text-emerald-400">
              Step 1 of 4
            </span>
            <span className="text-xs text-muted dark:text-dark-muted">• Tap to select</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink tracking-tight">
            Choose Sample Category
          </h1>
          <p className="text-sm text-muted dark:text-dark-muted max-w-xl">
            Select the appropriate protocol for rapid AI screening and sensor fusion. Works fully offline on-device.
          </p>
        </div>

        {/* Protocol Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Silage Protocol Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border-2 border-forest/30 dark:border-emerald-500/40 shadow-card hover:border-forest dark:hover:border-emerald-400 hover:shadow-float transition-all flex flex-col justify-between relative group">
            <div className="absolute top-5 right-5">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-forest dark:bg-emerald-600 text-white shadow-sm">
                Recommended
              </span>
            </div>

            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-forest/10 dark:bg-emerald-500/10 flex items-center justify-center text-forest dark:text-emerald-400 group-hover:bg-forest group-hover:text-white dark:group-hover:bg-emerald-600 transition-colors p-3">
                <Thermometer className="w-6 h-6" />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-forest dark:text-emerald-300">
                  {t("farmer.testSilage")}
                </h2>
                <p className="text-xs text-muted dark:text-dark-muted font-sans mt-0.5">
                  साइलेज किण्वन एवं वायु रिसाव परीक्षण
                </p>
              </div>

              <p className="text-xs text-ink/80 dark:text-dark-ink/80 leading-relaxed">
                Comprehensive evaluation for pit, bunker, and wrapped bag silage. Fuses core pH probe, internal temperature probe, ambient differential, and visual inspection.
              </p>

              <div className="space-y-2 pt-2 border-t border-bone dark:border-dark-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-dark-muted block">
                  Evaluation Capabilities:
                </span>
                <ul className="text-xs space-y-1.5 text-ink/90 dark:text-dark-ink/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Aerobic core heating & temperature rise (ΔT)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Fermentation quality (lactic vs butyric pH)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Shoulder air-ingress & mould risk analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Structured 6-step actionable farmer advisory</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-bone dark:border-dark-border">
              <Link
                href="/test/capture?type=silage"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all group-hover:shadow-lg"
                id="btn-select-silage"
              >
                <span>Select Silage Protocol</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Feed Concentrate Protocol Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-bone dark:border-dark-border shadow-card hover:border-forest/40 dark:hover:border-emerald-500/40 hover:shadow-float transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:bg-forest group-hover:text-white dark:group-hover:bg-emerald-600 transition-colors p-3">
                <Layers className="w-6 h-6" />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-forest dark:text-emerald-300">
                  {t("farmer.testFeed")}
                </h2>
                <p className="text-xs text-muted dark:text-dark-muted font-sans mt-0.5">
                  पशु आहार / दाना एवं सूखा चारा परीक्षण
                </p>
              </div>

              <p className="text-xs text-ink/80 dark:text-dark-ink/80 leading-relaxed">
                Optical and assay screening for commercial cattle feed pellets, mash, oil cake (mustard, cotton), and dry hay.
              </p>

              <div className="space-y-2 pt-2 border-t border-bone dark:border-dark-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-dark-muted block">
                  Evaluation Capabilities:
                </span>
                <ul className="text-xs space-y-1.5 text-ink/90 dark:text-dark-ink/90">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Physical pellet integrity & dust ratio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Visual surface mould screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Colorimetric chemical assay strip reader</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-moss dark:text-emerald-400 shrink-0" />
                    <span>Strict scientific transparency tags</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-bone dark:border-dark-border">
              <Link
                href="/test/capture?type=feed"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-bone dark:bg-dark-card hover:bg-forest hover:text-white dark:hover:bg-emerald-600 text-forest dark:text-dark-ink font-bold text-sm transition-all"
                id="btn-select-feed"
              >
                <span>Select Feed Protocol</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scientific Transparency Notice */}
        <div className="p-4 rounded-2xl glass-card border border-bone dark:border-dark-border flex items-start gap-3 text-xs text-forest dark:text-sage-light">
          <Info className="w-4 h-4 shrink-0 text-forest dark:text-emerald-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-ink dark:text-dark-ink">FeedShield Scientific Honesty Standard:</strong> FeedShield operates as a rapid screening, measurement, and decision-support tool. It explicitly refers suspect, contaminated, or out-of-domain samples to accredited state veterinary laboratories. RGB photography alone is never claimed to estimate protein, NDF, or invisible urea.
          </p>
        </div>
      </main>
    </div>
  );
}
