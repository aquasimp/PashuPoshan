"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Calendar,
  Thermometer,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusChip } from "@/components/ui/StatusChip";
import { EvidenceTag } from "@/components/ui/EvidenceTag";
import { db, LocalSample, LocalAnalysis, LocalAdvisory } from "@/lib/db";
import { ensureDemoDataLoaded } from "@/lib/seedLocalDb";
import { useI18n } from "@/lib/i18n";

function CompareContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialId1 = searchParams.get("id1") || "";
  const initialId2 = searchParams.get("id2") || "";

  const [samples, setSamples] = useState<LocalSample[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, LocalAnalysis>>({});
  const [id1, setId1] = useState(initialId1);
  const [id2, setId2] = useState(initialId2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      await ensureDemoDataLoaded();
      try {
        const localSamples = await db.samples.orderBy("collectedAt").reverse().toArray();
        setSamples(localSamples);

        const localAnalyses = await db.analyses.toArray();
        const map: Record<string, LocalAnalysis> = {};
        for (const a of localAnalyses) {
          map[a.sampleId] = a;
        }
        setAnalyses(map);

        // Auto-select first two if not specified
        if (!initialId1 && localSamples.length > 0) setId1(localSamples[0].id);
        if (!initialId2 && localSamples.length > 1) setId2(localSamples[1].id);
      } catch (err) {
        console.error("Error loading comparison:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialId1, initialId2]);

  const sample1 = samples.find((s) => s.id === id1);
  const sample2 = samples.find((s) => s.id === id2);
  const analysis1 = id1 ? analyses[id1] : null;
  const analysis2 = id2 ? analyses[id2] : null;

  const getMetric = (a: LocalAnalysis | null, targetName: string) => {
    if (!a) return null;
    return a.predictions.find((p) => p.target.toLowerCase().includes(targetName.toLowerCase())) || null;
  };

  const ph1 = getMetric(analysis1, "ph");
  const ph2 = getMetric(analysis2, "ph");
  const temp1 = getMetric(analysis1, "temperature");
  const temp2 = getMetric(analysis2, "temperature");
  const dm1 = getMetric(analysis1, "dry matter");
  const dm2 = getMetric(analysis2, "dry matter");

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
        <Link href="/history" className="hover:text-forest dark:hover:text-dark-forest flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("nav.history")}</span>
        </Link>
        <span>/</span>
        <span className="text-ink dark:text-dark-ink font-medium">{t("nav.compare")}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink">
          {t("nav.compare")}
        </h1>
        <p className="text-xs text-muted dark:text-dark-muted mt-0.5">
          {t("nav.subtitles.compare")}
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 glass-card p-4 rounded-2xl">
        <div>
          <label className="text-xs font-bold text-ink dark:text-dark-ink block mb-1.5">Primary Sample (A)</label>
          <select
            value={id1}
            onChange={(e) => setId1(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-surface/80 dark:bg-dark-card border border-bone dark:border-dark-border text-xs text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-dark-forest"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface dark:bg-dark-card text-ink dark:text-dark-ink">
                {s.id} — {s.cropOrFeedName} ({new Date(s.collectedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-ink dark:text-dark-ink block mb-1.5">Comparison Sample (B)</label>
          <select
            value={id2}
            onChange={(e) => setId2(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-surface/80 dark:bg-dark-card border border-bone dark:border-dark-border text-xs text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-dark-forest"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface dark:bg-dark-card text-ink dark:text-dark-ink">
                {s.id} — {s.cropOrFeedName} ({new Date(s.collectedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample A Column */}
        <div className="glass-card rounded-3xl p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-muted dark:text-dark-muted block">SAMPLE A</span>
              <h2 className="font-display font-bold text-lg text-ink dark:text-dark-ink">
                {sample1?.cropOrFeedName || "Select Sample"}
              </h2>
              <span className="text-xs text-muted dark:text-dark-muted font-mono">{sample1?.id}</span>
            </div>
            {analysis1 && <StatusChip status={analysis1.overallRisk} size="md" />}
          </div>

          <div className="p-3 rounded-2xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border flex items-center justify-between text-xs font-mono">
            <span className="text-muted dark:text-dark-muted">{t("advisory.decision")}</span>
            <span className="font-bold text-sm text-forest dark:text-dark-forest bg-forest/10 dark:bg-dark-forest/20 px-2.5 py-0.5 rounded-lg">
              {analysis1?.actionDecision ? (t("advisory.decisions." + analysis1.actionDecision) || analysis1.actionDecision) : "—"}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-muted dark:text-dark-muted uppercase tracking-wider">
              {t("models.title")}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                <span className="text-muted dark:text-dark-muted">{t("silage.ph")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink dark:text-dark-ink">
                    {ph1?.value !== undefined && ph1?.value !== null ? ph1.value : "—"}
                  </span>
                  {ph1 && <EvidenceTag tag={ph1.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                <span className="text-muted dark:text-dark-muted">{t("silage.internalTemp")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink dark:text-dark-ink">
                    {temp1?.value !== undefined && temp1?.value !== null ? `${temp1.value}°C` : "—"}
                  </span>
                  {temp1 && <EvidenceTag tag={temp1.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                <span className="text-muted dark:text-dark-muted">{t("silage.dryMatter")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink dark:text-dark-ink">
                    {dm1?.value !== undefined && dm1?.value !== null ? `${dm1.value}%` : "—"}
                  </span>
                  {dm1 && <EvidenceTag tag={dm1.evidenceTag} />}
                </div>
              </div>

              {analysis1?.silageAssessment && (
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                  <span className="text-muted dark:text-dark-muted">{t("results.silageRisks.heating")}</span>
                  <span className="font-bold uppercase text-forest dark:text-dark-forest">
                    {t("results.levels." + analysis1.silageAssessment.heatingRisk) || analysis1.silageAssessment.heatingRisk}
                  </span>
                </div>
              )}
            </div>
          </div>

          {sample1 && (
            <Link
              href={`/test/result?id=${sample1.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest dark:text-dark-forest hover:underline"
            >
              <span>{t("carousel.viewResult")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Sample B Column */}
        <div className="glass-card rounded-3xl p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-muted dark:text-dark-muted block">SAMPLE B</span>
              <h2 className="font-display font-bold text-lg text-ink dark:text-dark-ink">
                {sample2?.cropOrFeedName || "Select Sample"}
              </h2>
              <span className="text-xs text-muted dark:text-dark-muted font-mono">{sample2?.id}</span>
            </div>
            {analysis2 && <StatusChip status={analysis2.overallRisk} size="md" />}
          </div>

          <div className="p-3 rounded-2xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border flex items-center justify-between text-xs font-mono">
            <span className="text-muted dark:text-dark-muted">{t("advisory.decision")}</span>
            <span className="font-bold text-sm text-forest dark:text-dark-forest bg-forest/10 dark:bg-dark-forest/20 px-2.5 py-0.5 rounded-lg">
              {analysis2?.actionDecision ? (t("advisory.decisions." + analysis2.actionDecision) || analysis2.actionDecision) : "—"}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-muted dark:text-dark-muted uppercase tracking-wider">
              {t("models.title")}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                <span className="text-muted dark:text-dark-muted">{t("silage.ph")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink dark:text-dark-ink">
                    {ph2?.value !== undefined && ph2?.value !== null ? ph2.value : "—"}
                  </span>
                  {ph2 && <EvidenceTag tag={ph2.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                <span className="text-muted dark:text-dark-muted">{t("silage.internalTemp")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink dark:text-dark-ink">
                    {temp2?.value !== undefined && temp2?.value !== null ? `${temp2.value}°C` : "—"}
                  </span>
                  {temp2 && <EvidenceTag tag={temp2.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                <span className="text-muted dark:text-dark-muted">{t("silage.dryMatter")}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink dark:text-dark-ink">
                    {dm2?.value !== undefined && dm2?.value !== null ? `${dm2.value}%` : "—"}
                  </span>
                  {dm2 && <EvidenceTag tag={dm2.evidenceTag} />}
                </div>
              </div>

              {analysis2?.silageAssessment && (
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border">
                  <span className="text-muted dark:text-dark-muted">{t("results.silageRisks.heating")}</span>
                  <span className="font-bold uppercase text-terracotta">
                    {t("results.levels." + analysis2.silageAssessment.heatingRisk) || analysis2.silageAssessment.heatingRisk}
                  </span>
                </div>
              )}
            </div>
          </div>

          {sample2 && (
            <Link
              href={`/test/result?id=${sample2.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest dark:text-dark-forest hover:underline"
            >
              <span>{t("carousel.viewResult")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Scientific Explainability Callout */}
      <div className="p-5 rounded-3xl glass-card space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-forest dark:text-dark-forest" />
          <h3 className="font-bold text-sm text-ink dark:text-dark-ink">
            Comparative Agronomic Assessment
          </h3>
        </div>
        <p className="text-xs text-ink/80 dark:text-dark-ink/80 leading-relaxed">
          When silage core temperature elevates significantly above ambient levels (ΔT &gt; 5°C) and pH rises above 4.5, aerobic yeasts metabolize organic preserving acids. This raises pH further, allowing opportunistic moulds and clostridia to proliferate. Rapid identification allows farmers to salvage interior silage by blending while discarding the deteriorating outer crust.
        </p>
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted dark:text-dark-muted">Loading comparison...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
