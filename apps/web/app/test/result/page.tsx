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
import { db, LocalSample, LocalAnalysis, LocalAdvisory } from "@/lib/db";
import { useI18n } from "@/lib/i18n";

function ResultContent() {
  const searchParams = useSearchParams();
  const sampleId = searchParams.get("id");
  const { t } = useI18n();

  const [sample, setSample] = useState<LocalSample | null>(null);
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
        const s = await db.samples.get(sampleId);
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
        <h2 className="font-display text-xl font-bold text-ink">Sample Result Not Found</h2>
        <p className="text-xs text-muted">The requested sample ID does not exist in local storage.</p>
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

  const isSilage = sample.sampleType === "silage";
  const assessment = analysis.silageAssessment;

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb & Offline Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <Link href="/" className="hover:text-forest flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link href="/history" className="hover:text-forest">
            History
          </Link>
          <span>/</span>
          <span className="text-ink font-medium font-mono">{sample.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {analysis.analyzedOnDevice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300 text-[11px] font-medium">
              <HardDrive className="w-3 h-3 text-stone-600" />
              <span>Analysed on device — Offline</span>
            </span>
          )}
          <DemoBadge label="DEMO SYNTHETIC" size="sm" />
        </div>
      </div>

      {/* Top Banner Notice: Synthetic Demo Data */}
      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{t("results.claims.syntheticBanner")}</span>
        </div>
        <Link href="/design-system" className="underline font-bold text-[11px] shrink-0">
          Learn More
        </Link>
      </div>

      {/* Hero Quality Result Card */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border-2 border-bone p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium text-muted block">
              Sample ID: {sample.id}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {sample.cropOrFeedName}
            </h1>
            <p className="text-xs text-muted">
              Collected on {new Date(sample.collectedAt).toLocaleString()} · {sample.physicalForm}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={analysis.overallRisk} size="lg" />
            <div className="px-3.5 py-1.5 rounded-xl bg-forest text-white font-mono font-bold text-sm tracking-wider shadow-sm">
              DECISION: {analysis.actionDecision}
            </div>
          </div>
        </div>

        {/* Input Completeness Component */}
        <div className="pt-2 border-t border-bone">
          <InputCompleteness
            score={analysis.inputCompleteness.score}
            modalitiesUsed={analysis.inputCompleteness.modalitiesUsed}
            modalitiesMissing={analysis.inputCompleteness.modalitiesMissing}
          />
        </div>

        {/* Feed Scientific Honesty Claim Banner */}
        {!isSilage && (
          <div className="p-3.5 rounded-2xl bg-mist/40 border border-mist flex items-start gap-2.5 text-xs text-forest">
            <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t("results.claims.ureaImageOnly")}</p>
              <p className="text-[11px] text-muted mt-0.5">
                Crude protein, NDF, and non-visible chemical adulterants require NIR spectroscopy or rapid chemical assay strips.
              </p>
            </div>
          </div>
        )}

        {/* Silage 5-Hazard Risk Matrix */}
        {isSilage && assessment && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-ink">Silage Fermentation & Storage Hazards</h3>
              <EvidenceTag tag="ESTIMATED" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. Air Ingress */}
              <div className="p-3.5 rounded-2xl bg-ivory border border-bone space-y-1">
                <span className="text-[11px] text-muted block leading-tight">Air Ingress</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.airIngressRisk === "low"
                      ? "text-forest"
                      : assessment.airIngressRisk === "moderate"
                      ? "text-amber-700"
                      : "text-terracotta"
                  }`}
                >
                  {assessment.airIngressRisk}
                </span>
                <span className="text-[10px] text-muted block">Compaction seal</span>
              </div>

              {/* 2. Core Heating */}
              <div className="p-3.5 rounded-2xl bg-ivory border border-bone space-y-1">
                <span className="text-[11px] text-muted block leading-tight">Aerobic Heating</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.heatingRisk === "low"
                      ? "text-forest"
                      : assessment.heatingRisk === "moderate"
                      ? "text-amber-700"
                      : "text-terracotta"
                  }`}
                >
                  {assessment.heatingRisk}
                </span>
                <span className="text-[10px] text-muted block">Thermal ΔT core</span>
              </div>

              {/* 3. Spoilage */}
              <div className="p-3.5 rounded-2xl bg-ivory border border-bone space-y-1">
                <span className="text-[11px] text-muted block leading-tight">Spoilage Hazard</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.spoilageRisk === "low"
                      ? "text-forest"
                      : assessment.spoilageRisk === "moderate"
                      ? "text-amber-700"
                      : "text-terracotta"
                  }`}
                >
                  {assessment.spoilageRisk}
                </span>
                <span className="text-[10px] text-muted block">Clostridia / mould</span>
              </div>

              {/* 4. Fermentation Failure */}
              <div className="p-3.5 rounded-2xl bg-ivory border border-bone space-y-1">
                <span className="text-[11px] text-muted block leading-tight">Fermentation</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.fermentationFailureRisk === "low"
                      ? "text-forest"
                      : assessment.fermentationFailureRisk === "moderate"
                      ? "text-amber-700"
                      : "text-terracotta"
                  }`}
                >
                  {assessment.fermentationFailureRisk}
                </span>
                <span className="text-[10px] text-muted block">pH trajectory</span>
              </div>

              {/* 5. Mould Proliferation */}
              <div className="p-3.5 rounded-2xl bg-ivory border border-bone space-y-1">
                <span className="text-[11px] text-muted block leading-tight">Mould Risk</span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    assessment.mouldRisk === "low"
                      ? "text-forest"
                      : assessment.mouldRisk === "moderate"
                      ? "text-amber-700"
                      : "text-terracotta"
                  }`}
                >
                  {assessment.mouldRisk}
                </span>
                <span className="text-[10px] text-muted block">Visible / aerobic</span>
              </div>
            </div>
          </div>
        )}

        {/* Nutritional & Sensor Metrics */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-ink">Analytical Measurements & Parameters</h3>
            <span className="text-[11px] text-muted">Prediction Envelope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analysis.predictions.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-ivory border border-bone space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">{p.target}</span>
                  <EvidenceTag tag={p.evidenceTag} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-xl font-bold text-ink">
                    {p.value !== null ? p.value : "Out of Range"}
                  </span>
                  <span className="text-xs text-muted font-sans">{p.unit}</span>
                </div>
                <div className="text-[10px] text-muted flex justify-between font-mono">
                  <span>Domain: {p.applicabilityDomain}</span>
                  {p.confidence && <span>Conf: {(p.confidence * 100).toFixed(0)}%</span>}
                </div>
              </div>
            ))}

            {!isSilage && (
              <div className="p-3.5 rounded-2xl bg-bone/40 border border-dashed border-stone-300 space-y-2">
                <span className="text-xs font-medium text-muted block">Crude Protein & NDF</span>
                <span className="text-sm font-semibold text-stone-500 block">
                  {t("results.nutrition.notMeasured")}
                </span>
                <p className="text-[10px] text-muted">
                  Requires portable NIR spectrometer scan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-bone flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={`/advisory?id=${sample.id}`}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-forest hover:bg-deep text-white font-bold text-sm shadow-md transition-all"
            id="btn-view-advisory"
          >
            <Volume2 className="w-5 h-5 text-mist" />
            <span>{t("advisory.title")} & Voice Readout</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href={`/verify/${sample.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-surface hover:bg-bone text-ink font-semibold text-sm border border-bone transition-all"
          >
            <QrCode className="w-4 h-4 text-forest" />
            <span>Traceability QR</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              window.open(`/api/v1/reports/${analysis.id}/pdf`, "_blank");
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-surface hover:bg-bone text-ink font-semibold text-sm border border-bone transition-all"
          >
            <Download className="w-4 h-4 text-forest" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Loading analysis result...</div>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}
