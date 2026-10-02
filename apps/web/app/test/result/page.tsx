"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Volume2,
  ArrowRight,
  ArrowLeft,
  Share2,
  QrCode,
  Sparkles,
  Info,
  Thermometer,
  Layers,
  Cpu,
  RefreshCw,
  HardDrive,
  Download,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusChip } from "@/components/ui/StatusChip";
import { EvidenceTag } from "@/components/ui/EvidenceTag";
import { InputCompleteness } from "@/components/ui/InputCompleteness";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { VoiceControl } from "@/components/ui/VoiceControl";
import { LiquidGlassButton } from "@/components/ui/liquid-glass";
import { db, LocalSample, LocalImage, LocalAnalysis, LocalAdvisory } from "@/lib/db";
import { ensureDemoDataLoaded } from "@/lib/seedLocalDb";
import { useI18n } from "@/lib/i18n";
import { getApiBaseUrl } from "@/lib/api";

function ResultContent() {
  const searchParams = useSearchParams();
  const sampleId = searchParams.get("id");
  const { t } = useI18n();

  const [sample, setSample] = useState<LocalSample | null>(null);
  const [sampleImage, setSampleImage] = useState<LocalImage | null>(null);
  const [analysis, setAnalysis] = useState<LocalAnalysis | null>(null);
  const [advisory, setAdvisory] = useState<LocalAdvisory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
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
          const img = await db.images.where("sampleId").equals(sampleId).first();
          if (img) setSampleImage(img);
          const a = await db.analyses.where("sampleId").equals(sampleId).first();
          if (a) {
            setAnalysis(a);
            const adv = await db.advisories.where("analysisId").equals(a.id).first();
            if (adv) setAdvisory(adv);
          }
        }
      } catch (err) {
        console.error("Error loading result from Dexie:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [sampleId]);

  if (loading) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest" />
        <p className="text-xs text-muted">Retrieving analytical result...</p>
      </main>
    );
  }

  if (!sample || !analysis) {
    return (
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="font-display text-xl font-bold text-ink dark:text-dark-ink">{t("results.sampleNotFound")}</h2>
        <p className="text-xs text-muted dark:text-dark-muted">{t("results.sampleNotFoundDesc")}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest dark:bg-emerald-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("results.returnHome")}</span>
        </Link>
      </main>
    );
  }

  const isSilage = sample.sampleType === "silage";
  const assessment = analysis.silageAssessment;

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb & Offline Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted dark:text-dark-muted">
          <Link href="/" className="hover:text-forest dark:hover:text-emerald-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("nav.home")}</span>
          </Link>
          <span>/</span>
          <Link href="/history" className="hover:text-forest dark:hover:text-emerald-400">
            {t("nav.history")}
          </Link>
          <span>/</span>
          <span className="text-ink dark:text-dark-ink font-medium font-mono">{sample.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {analysis.analyzedOnDevice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900/60 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 text-[11px] font-medium">
              <HardDrive className="w-3 h-3 text-stone-600 dark:text-stone-400" />
              <span>{t("results.analysedOnDevice")}</span>
            </span>
          )}
          <DemoBadge label="DEMO SYNTHETIC" size="sm" />
        </div>
      </div>

      {/* Top Banner Notice: Synthetic Demo Data */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>{t("results.claims.syntheticBanner")}</span>
        </div>
        <Link href="/design-system" className="underline font-bold text-[11px] shrink-0">
          Learn More
        </Link>
      </div>

      {/* Hero Quality Result Card with Liquid Glass Elevation */}
      <div className="relative overflow-hidden rounded-3xl glass-card-hero border border-forest/15 dark:border-white/10 p-6 sm:p-9 shadow-float space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium text-muted dark:text-dark-muted block">
              Sample ID: {sample.id}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink">
              {sample.cropOrFeedName}
            </h1>
            <p className="text-xs text-muted dark:text-dark-muted">
              {t("results.collectedOn")} {new Date(sample.collectedAt).toLocaleString()} · {sample.physicalForm}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <StatusChip status={analysis.overallRisk} size="lg" />
            <div className="px-4 py-2 rounded-2xl bg-forest dark:bg-emerald-600 text-white font-mono font-bold text-sm tracking-wider shadow-md">
              {t("advisory.decision")}: {t("advisory.decisions." + analysis.actionDecision) || analysis.actionDecision}
            </div>
          </div>
        </div>

        {/* Input Completeness Component */}
        <div className="pt-2 border-t border-bone dark:border-dark-border">
          <InputCompleteness
            score={analysis.inputCompleteness.score}
            modalitiesUsed={analysis.inputCompleteness.modalitiesUsed}
            modalitiesMissing={analysis.inputCompleteness.modalitiesMissing}
          />
        </div>

        {/* Captured Sample Photo */}
        {sampleImage?.dataUrl && (
          <div className="pt-2 border-t border-bone dark:border-dark-border">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border">
              <div className="relative w-28 h-24 rounded-xl overflow-hidden border border-bone dark:border-dark-border shrink-0 shadow-sm">
                <img
                  src={sampleImage.dataUrl}
                  alt="Captured sample"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink dark:text-dark-ink">{t("results.verifiedPhotoTitle")}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-forest dark:text-emerald-300 text-[10px] font-bold">
                    {t("capture.validated")}
                  </span>
                </div>
                <p className="text-muted dark:text-dark-muted text-[11px]">
                  {t("results.verifiedPhotoSub")} Sharpness: {sampleImage.blurScore ?? 84}% · Illumination: {sampleImage.exposureScore ?? 88}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feed Scientific Honesty Claim Banner */}
        {!isSilage && (
          <div className="p-4 rounded-2xl bg-mist/40 dark:bg-emerald-950/20 border border-mist dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-forest dark:text-emerald-300">
            <Info className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t("results.claims.ureaImageOnly")}</p>
              <p className="text-[11px] text-muted dark:text-dark-muted mt-0.5">
                Crude protein, NDF, and non-visible chemical adulterants require NIR spectroscopy or rapid chemical assay strips.
              </p>
            </div>
          </div>
        )}

        {/* Silage 5-Hazard Risk Matrix */}
        {isSilage && assessment && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">{t("results.hazardsTitle")}</h3>
              <EvidenceTag tag="ESTIMATED" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. Air Ingress */}
              <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border space-y-1">
                <span className="text-[11px] text-muted dark:text-dark-muted block leading-tight">{t("results.silageRisks.airIngress")}</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.airIngressRisk === "low"
                      ? "text-forest dark:text-emerald-400"
                      : assessment.airIngressRisk === "moderate"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-terracotta dark:text-rose-400"
                  }`}
                >
                  {t("results.levels." + assessment.airIngressRisk) || assessment.airIngressRisk}
                </span>
                <span className="text-[10px] text-muted dark:text-dark-muted block">{t("results.compactionSeal")}</span>
              </div>

              {/* 2. Core Heating */}
              <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border space-y-1">
                <span className="text-[11px] text-muted dark:text-dark-muted block leading-tight">{t("results.silageRisks.heating")}</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.heatingRisk === "low"
                      ? "text-forest dark:text-emerald-400"
                      : assessment.heatingRisk === "moderate"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-terracotta dark:text-rose-400"
                  }`}
                >
                  {t("results.levels." + assessment.heatingRisk) || assessment.heatingRisk}
                </span>
                <span className="text-[10px] text-muted dark:text-dark-muted block">{t("results.coreThermalRise")}</span>
              </div>

              {/* 3. Spoilage */}
              <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border space-y-1">
                <span className="text-[11px] text-muted dark:text-dark-muted block leading-tight">{t("results.silageRisks.spoilage")}</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.spoilageRisk === "low"
                      ? "text-forest dark:text-emerald-400"
                      : assessment.spoilageRisk === "moderate"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-terracotta dark:text-rose-400"
                  }`}
                >
                  {t("results.levels." + assessment.spoilageRisk) || assessment.spoilageRisk}
                </span>
                <span className="text-[10px] text-muted dark:text-dark-muted block">{t("results.volatileAmmonia")}</span>
              </div>

              {/* 4. Fermentation Failure */}
              <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border space-y-1">
                <span className="text-[11px] text-muted dark:text-dark-muted block leading-tight">{t("results.silageRisks.fermentation")}</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.fermentationFailureRisk === "low"
                      ? "text-forest dark:text-emerald-400"
                      : assessment.fermentationFailureRisk === "moderate"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-terracotta dark:text-rose-400"
                  }`}
                >
                  {t("results.levels." + assessment.fermentationFailureRisk) || assessment.fermentationFailureRisk}
                </span>
                <span className="text-[10px] text-muted dark:text-dark-muted block">{t("results.acidificationThreshold")}</span>
              </div>

              {/* 5. Mould Proliferation */}
              <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border space-y-1">
                <span className="text-[11px] text-muted dark:text-dark-muted block leading-tight">{t("results.silageRisks.mould")}</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.mouldRisk === "low"
                      ? "text-forest dark:text-emerald-400"
                      : assessment.mouldRisk === "moderate"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-terracotta dark:text-rose-400"
                  }`}
                >
                  {t("results.levels." + assessment.mouldRisk) || assessment.mouldRisk}
                </span>
                <span className="text-[10px] text-muted dark:text-dark-muted block">{t("results.surfaceFungal")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nutritional & Sensor Metrics */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">Analytical Measurements & Parameters</h3>
            <span className="text-[11px] text-muted dark:text-dark-muted">Prediction Envelope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analysis.predictions.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted dark:text-dark-muted">{p.target}</span>
                  <EvidenceTag tag={p.evidenceTag} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-xl font-bold text-ink dark:text-dark-ink">
                    {p.value !== null ? p.value : "Out of Range"}
                  </span>
                  <span className="text-xs text-muted dark:text-dark-muted font-sans">{p.unit}</span>
                </div>
                <div className="text-[10px] text-muted dark:text-dark-muted flex justify-between font-mono">
                  <span>Domain: {p.applicabilityDomain}</span>
                  {p.confidence && <span>Conf: {(p.confidence * 100).toFixed(0)}%</span>}
                </div>
              </div>
            ))}

            {!isSilage && (
              <div className="p-4 rounded-2xl bg-bone/40 dark:bg-dark-card/50 border border-dashed border-stone-300 dark:border-stone-700 space-y-2">
                <span className="text-xs font-medium text-muted dark:text-dark-muted block">Crude Protein & NDF</span>
                <span className="text-sm font-semibold text-stone-500 dark:text-stone-400 block">
                  {t("results.nutrition.notMeasured")}
                </span>
                <p className="text-[10px] text-muted dark:text-dark-muted">
                  Requires portable NIR spectrometer scan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Voice Readout Section - Localized Farmer Advisory */}
        <div className="pt-4 border-t border-edge flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl glass-surface-1 border border-edge">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-base text-ink-1 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-forest dark:text-emerald-400" />
              <span>{t("advisory.title")}</span>
            </h4>
            <p className="text-xs text-ink-2 max-w-md leading-relaxed">
              Listen to actionable farmer guidance in spoken Hindi or English on-device. Never autoplays.
            </p>
          </div>
          <VoiceControl
            textToSpeak={
              advisory
                ? `${sample.cropOrFeedName}. ${t("advisory.decision")}: ${t("advisory.decisions." + advisory.decision) || advisory.decision}. ${advisory.chain.result}. ${advisory.chain.action}. ${advisory.chain.storage}. ${advisory.chain.nextStep}`
                : `${sample.cropOrFeedName}. ${analysis.overallRisk}. ${analysis.actionDecision}`
            }
          />
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-edge flex flex-col sm:flex-row items-center gap-3">
          <Link href={`/advisory?id=${sample.id}`} className="w-full sm:w-auto flex-1">
            <LiquidGlassButton
              variant="primary"
              size="lg"
              icon={<Volume2 className="w-5 h-5 text-emerald-300" />}
              className="w-full min-h-[48px]"
              id="btn-view-advisory"
            >
              <span>{t("advisory.title")}</span>
            </LiquidGlassButton>
          </Link>

          <Link href={`/verify/${sample.id}`} className="w-full sm:w-auto">
            <LiquidGlassButton
              variant="secondary"
              size="lg"
              icon={<QrCode className="w-5 h-5 text-forest dark:text-emerald-400" />}
              className="w-full min-h-[48px]"
            >
              <span>{t("results.traceabilityQr")}</span>
            </LiquidGlassButton>
          </Link>

          <LiquidGlassButton
            type="button"
            variant="secondary"
            size="lg"
            icon={<Download className="w-5 h-5 text-forest dark:text-emerald-400" />}
            onClick={() => {
              window.open(`${getApiBaseUrl()}/reports/${analysis.id}/pdf`, "_blank");
            }}
            className="w-full sm:w-auto min-h-[48px]"
          >
            <span>PDF Report</span>
          </LiquidGlassButton>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted dark:text-dark-muted">{t("results.title")}...</div>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}
