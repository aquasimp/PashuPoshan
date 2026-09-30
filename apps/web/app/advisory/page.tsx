"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Download,
  Share2,
  Stethoscope,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { VoiceControl } from "@/components/ui/VoiceControl";
import { LiquidGlassButton } from "@/components/ui/liquid-glass";
import { db, LocalSample, LocalAnalysis, LocalAdvisory } from "@/lib/db";
import { ensureDemoDataLoaded } from "@/lib/seedLocalDb";
import { useI18n } from "@/lib/i18n";

function AdvisoryContent() {
  const searchParams = useSearchParams();
  const sampleId = searchParams.get("id");
  const { t, locale } = useI18n();

  const [sample, setSample] = useState<LocalSample | null>(null);
  const [analysis, setAnalysis] = useState<LocalAnalysis | null>(null);
  const [advisory, setAdvisory] = useState<LocalAdvisory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdvisory() {
      if (!sampleId) {
        setLoading(false);
        return;
      }
      try {
        let s = await db.samples.get(sampleId);
        if (!s) {
          await ensureDemoDataLoaded();
          s = await db.samples.get(sampleId);
        }
        if (s) {
          setSample(s);
          const a = await db.analyses.where("sampleId").equals(sampleId).first();
          if (a) {
            setAnalysis(a);
            const adv = await db.advisories.where("analysisId").equals(a.id).first();
            if (adv) setAdvisory(adv);
          }
        }
      } catch (err) {
        console.error("Error loading advisory from Dexie:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdvisory();
  }, [sampleId]);

  if (loading) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest" />
        <p className="text-xs text-muted">Retrieving actionable advisory...</p>
      </main>
    );
  }

  if (!sample || !advisory) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="font-display text-xl font-bold text-ink">Advisory Not Available</h2>
        <p className="text-xs text-muted">No synthesized advisory found for this sample.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </main>
    );
  }

  const decision = advisory.decision;
  const decisionTheme =
    decision === "FEED"
      ? {
          bg: "bg-emerald-600",
          text: "text-white",
          sub: "Safe for herd consumption according to standard ration guidelines.",
          tag: "APPROVED FOR FEEDING",
        }
      : decision === "BLEND"
      ? {
          bg: "bg-amber-600",
          text: "text-white",
          sub: "Do not feed pure. Dilute with dry forage or safe silage (max 30%).",
          tag: "RESTRICTED BLEND ONLY",
        }
      : decision === "RE-TEST"
      ? {
          bg: "bg-blue-600",
          text: "text-white",
          sub: "Sensor reading indeterminate or out of calibration. Retake sample.",
          tag: "RE-TEST REQUIRED",
        }
      : {
          bg: "bg-terracotta",
          text: "text-white",
          sub: "Severe spoilage or mycotoxin risk. Discard immediately.",
          tag: "DO NOT FEED · DISCARD",
        };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
        <Link href={`/test/result?id=${sample.id}`} className="hover:text-forest dark:hover:text-emerald-400 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Result</span>
        </Link>
        <span>/</span>
        <span className="text-ink dark:text-dark-ink font-medium">Actionable Advisory</span>
      </div>

      {/* Decision Banner Card with Rich Contrast */}
      <div className={`rounded-3xl p-6 sm:p-8 ${decisionTheme.bg} ${decisionTheme.text} shadow-float space-y-3 border border-white/20 dark:border-white/10`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
            {decisionTheme.tag}
          </span>
          <span className="text-xs font-mono opacity-80">{sample.id}</span>
        </div>

        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Decision: {advisory.decision}
          </h1>
          <p className="text-sm opacity-90 mt-1 max-w-xl font-sans leading-relaxed">
            {decisionTheme.sub}
          </p>
        </div>
      </div>

      {/* Voice Guidance Readout Player Card with Liquid Glass */}
      <div className="glass-surface-2 rounded-3xl p-5 sm:p-6 border border-edge shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-emerald-500/10 border border-forest/20 dark:border-emerald-500/20 flex items-center justify-center text-forest dark:text-emerald-400 shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-ink-1">
              {t("advisory.voiceReadout")}
            </h3>
            <p className="text-xs text-ink-2">
              Actionable guidance spoken in vernacular voice on-device. Never autoplays.
            </p>
          </div>
        </div>

        <VoiceControl
          textToSpeak={
            advisory
              ? `${sample?.cropOrFeedName || "Sample"}. Action Decision: ${advisory.decision}. ${advisory.chain.result}. ${advisory.chain.issue}. ${advisory.chain.action}. ${advisory.chain.storage}. ${advisory.chain.risk}. ${advisory.chain.nextStep}`
              : ""
          }
        />
      </div>

      {/* 6-Step Actionable Advisory Chain */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold text-ink dark:text-dark-ink">
          6-Step Advisory Protocol
        </h2>
        <p className="text-xs text-muted dark:text-dark-muted">
          Sequential guidance designed for immediate farm-level action and veterinary risk mitigation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Step 1: Result */}
          <div className="p-5 rounded-2xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emerald-400 font-mono">
                1. {t("advisory.steps.result")}
              </span>
              <CheckCircle2 className="w-4 h-4 text-forest dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-ink dark:text-dark-ink leading-relaxed">
              {advisory.chain.result}
            </p>
          </div>

          {/* Step 2: Issue */}
          <div className="p-5 rounded-2xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
                2. {t("advisory.steps.issue")}
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </div>
            <p className="text-xs font-semibold text-ink dark:text-dark-ink leading-relaxed">
              {advisory.chain.issue}
            </p>
          </div>

          {/* Step 3: Immediate Action */}
          <div className="p-5 rounded-2xl glass-card border-2 border-forest/30 dark:border-emerald-500/40 shadow-card space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emerald-400 font-mono">
                3. {t("advisory.steps.action")} (Today's Feeding)
              </span>
              <Sparkles className="w-4 h-4 text-forest dark:text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-forest dark:text-emerald-300 leading-relaxed">
              {advisory.chain.action}
            </p>
          </div>

          {/* Step 4: Storage Remediation */}
          <div className="p-5 rounded-2xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-dark-muted font-mono">
                4. {t("advisory.steps.storage")}
              </span>
              <Layers className="w-4 h-4 text-muted dark:text-dark-muted" />
            </div>
            <p className="text-xs font-semibold text-ink dark:text-dark-ink leading-relaxed">
              {advisory.chain.storage}
            </p>
          </div>

          {/* Step 5: Animal Health Risk */}
          <div className="p-5 rounded-2xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta dark:text-rose-400 font-mono">
                5. {t("advisory.steps.risk")}
              </span>
              <Stethoscope className="w-4 h-4 text-terracotta dark:text-rose-400" />
            </div>
            <p className="text-xs font-semibold text-ink dark:text-dark-ink leading-relaxed">
              {advisory.chain.risk}
            </p>
          </div>

          {/* Step 6: Recommended Next Step */}
          <div className="p-5 rounded-2xl glass-card border border-bone dark:border-dark-border shadow-card space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-emerald-400 font-mono">
                6. {t("advisory.steps.nextStep")}
              </span>
              <ArrowRight className="w-4 h-4 text-forest dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-ink dark:text-dark-ink leading-relaxed">
              {advisory.chain.nextStep}
            </p>
          </div>
        </div>
      </div>

      {/* Veterinarian Referral Note */}
      <div className="p-4 rounded-2xl bg-mist/30 dark:bg-emerald-950/20 border border-mist dark:border-emerald-800/40 flex items-start gap-3 text-xs text-forest dark:text-sage-light">
        <Stethoscope className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-ink dark:text-dark-ink">Veterinary Consultation Recommendation</h4>
          <p className="leading-relaxed text-forest/90 dark:text-sage-light/90">
            If milk yield suddenly declines or cows exhibit loose dung, fever, or depressed appetite after silage ration introduction, notify your dairy cooperative veterinary field officer immediately.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href={`/test/result?id=${sample.id}`}
          className="text-xs font-semibold text-forest dark:text-emerald-400 hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quality Gauge</span>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {analysis && (
            <LiquidGlassButton
              type="button"
              variant="primary"
              size="md"
              icon={<Download className="w-4 h-4 text-emerald-300" />}
              onClick={() => {
                window.open(`/api/v1/reports/${analysis.id}/pdf`, "_blank");
              }}
              className="flex-1 sm:flex-initial min-h-[48px]"
            >
              <span>{t("common.actions.download")}</span>
            </LiquidGlassButton>
          )}

          <Link href="/" className="flex-1 sm:flex-initial">
            <LiquidGlassButton
              variant="secondary"
              size="md"
              className="w-full min-h-[48px]"
            >
              <span>Done</span>
            </LiquidGlassButton>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AdvisoryPage() {
  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted dark:text-dark-muted">Loading advisory...</div>}>
        <AdvisoryContent />
      </Suspense>
    </div>
  );
}
