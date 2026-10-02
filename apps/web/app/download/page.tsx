"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Camera,
  Database,
  WifiOff,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useI18n } from "@/lib/i18n";
import { DemoBadge } from "@/components/ui/DemoBadge";

export default function DownloadPage() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const directApkUrl = "/PashuPoshan.apk";
  const mirrorApkUrl = "/PashuPoshan.apk";
  const absoluteDownloadUrl = "https://pashuposhann.vercel.app/PashuPoshan.apk";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(absoluteDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Hero Download Card with Specular Ambient Gradient */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest to-deep dark:from-[#08150f] dark:via-[#0c1f15] dark:to-[#040a07] text-white p-6 sm:p-10 shadow-float border border-forest-border/40 dark:border-emerald-500/20">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android Release · v1.0</span>
              </div>
              <DemoBadge label="SIGNED RELEASE KEYSTORE" size="sm" />
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-mist">
                SIH26111
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              {t("download.title")}
            </h1>

            <p className="text-sm sm:text-base text-mist/90 dark:text-sage-light/80 leading-relaxed font-sans max-w-2xl">
              {t("download.subtitle")}
            </p>

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap gap-2 text-xs font-mono pt-1 text-emerald-100/90">
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10">
                📦 {t("download.fileSize")}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10">
                🏷️ {t("download.version")}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10">
                📱 {t("download.targetAndroid")}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10">
                🔑 Universal APK (ARM64 / x86_64)
              </span>
            </div>

            {/* Download CTA Button Cluster */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={directApkUrl}
                download="PashuPoshan.apk"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-dark-ink text-forest dark:text-dark-surface font-bold text-base shadow-float hover:bg-mist hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[52px]"
                id="btn-download-primary-apk"
              >
                <Download className="w-5 h-5 text-forest dark:text-dark-surface animate-bounce" />
                <span>{t("download.downloadBtn")}</span>
                <span className="text-xs font-normal opacity-70">(5.7 MB)</span>
              </a>

              <a
                href={mirrorApkUrl}
                download="PashuPoshan.apk"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 dark:bg-white/5 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 dark:border-white/15 backdrop-blur-md transition-all min-h-[48px]"
              >
                <span>Mirror Download</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 dark:bg-white/5 hover:bg-white/20 text-white font-medium text-xs border border-white/20 dark:border-white/15 backdrop-blur-md transition-all min-h-[48px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="text-emerald-300 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Download Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none transform translate-x-12 translate-y-8">
            <Smartphone className="w-80 h-80 text-white" />
          </div>
        </section>

        {/* 4-Step Installation Walkthrough */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-dark-ink">
              {t("download.howToInstall")}
            </h2>
            <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">
              Because PashuPoshan is distributed directly for rural field trials without third-party store delays, follow these standard steps:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-3xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-forest/10 dark:bg-emerald-500/10 text-forest dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-ink dark:text-dark-ink">
                  {t("download.step1Title")}
                </h3>
                <p className="text-xs text-muted dark:text-dark-muted mt-1 leading-relaxed">
                  {t("download.step1Desc")}
                </p>
              </div>
              <span className="text-[10px] font-mono text-forest dark:text-emerald-400 font-semibold">
                PashuPoshan.apk (5.7 MB)
              </span>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-3xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-ink dark:text-dark-ink">
                  {t("download.step2Title")}
                </h3>
                <p className="text-xs text-muted dark:text-dark-muted mt-1 leading-relaxed">
                  {t("download.step2Desc")}
                </p>
              </div>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
                Settings → Allow from this source
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-3xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-ink dark:text-dark-ink">
                  {t("download.step3Title")}
                </h3>
                <p className="text-xs text-muted dark:text-dark-muted mt-1 leading-relaxed">
                  {t("download.step3Desc")}
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                More details → Install anyway
              </span>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-3xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-moss/10 dark:bg-emerald-500/10 text-forest dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-ink dark:text-dark-ink">
                  {t("download.step4Title")}
                </h3>
                <p className="text-xs text-muted dark:text-dark-muted mt-1 leading-relaxed">
                  {t("download.step4Desc")}
                </p>
              </div>
              <span className="text-[10px] font-mono text-forest dark:text-emerald-400 font-semibold">
                Ready for field tests
              </span>
            </div>
          </div>
        </section>

        {/* Native Advantages Grid */}
        <section className="p-6 sm:p-8 rounded-3xl glass-surface-2 border border-edge shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-ink dark:text-dark-ink">
                {t("download.featuresTitle")}
              </h2>
              <p className="text-xs text-muted dark:text-dark-muted mt-0.5">
                Engineered for Indian dairy farmers operating in rural areas with intermittent connectivity.
              </p>
            </div>
            <DemoBadge label="OFFLINE FIRST" size="md" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl glass-surface-1 border border-edge flex items-start gap-3">
              <Camera className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink dark:text-dark-ink block mb-0.5">
                  Hardware Camera Integration
                </span>
                <span className="text-muted dark:text-dark-muted text-xs leading-relaxed">
                  {t("download.feature1")}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-surface-1 border border-edge flex items-start gap-3">
              <Database className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink dark:text-dark-ink block mb-0.5">
                  Local On-Device Database
                </span>
                <span className="text-muted dark:text-dark-muted text-xs leading-relaxed">
                  {t("download.feature2")}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-surface-1 border border-edge flex items-start gap-3">
              <Cpu className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink dark:text-dark-ink block mb-0.5">
                  Smooth Native Gestures
                </span>
                <span className="text-muted dark:text-dark-muted text-xs leading-relaxed">
                  {t("download.feature3")}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-surface-1 border border-edge flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink dark:text-dark-ink block mb-0.5">
                  Zero Data Consumption
                </span>
                <span className="text-muted dark:text-dark-muted text-xs leading-relaxed">
                  {t("download.feature4")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Scan to Download on Phone section for desktop users */}
        <section className="p-6 rounded-3xl glass-card border border-bone dark:border-dark-border shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/10 dark:bg-emerald-500/10 text-forest dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Mobile Transfer</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-dark-ink">
              {t("download.qrTitle")}
            </h3>
            <p className="text-xs text-muted dark:text-dark-muted leading-relaxed">
              {t("download.qrSubtitle")}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-muted dark:text-dark-muted">
              <span>Direct Link:</span>
              <code className="px-2 py-0.5 rounded bg-bone dark:bg-dark-card text-forest dark:text-emerald-400">
                pashuposhann.vercel.app/PashuPoshan.apk
              </code>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-dark-card border border-bone dark:border-dark-border shadow-sm shrink-0">
            {/* SVG Visual QR Mock / Scanner Code */}
            <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center border border-bone shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(absoluteDownloadUrl)}`}
                alt="QR Code to Download PashuPoshan APK"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-[11px] font-mono text-muted dark:text-dark-muted">
              Point phone camera here
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
