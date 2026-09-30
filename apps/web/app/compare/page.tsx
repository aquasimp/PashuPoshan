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

function CompareContent() {
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
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/history" className="hover:text-forest flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>History</span>
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Side-by-Side Comparison</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Feed Quality Comparison
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Evaluate variations in fermentation chemistry, heating rate, and animal feeding decisions between batches.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 rounded-2xl border border-bone shadow-card">
        <div>
          <label className="text-xs font-bold text-ink block mb-1.5">Primary Sample (A)</label>
          <select
            value={id1}
            onChange={(e) => setId1(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-ivory border border-bone text-xs text-ink focus:outline-none focus:border-forest"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.cropOrFeedName} ({new Date(s.collectedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-ink block mb-1.5">Comparison Sample (B)</label>
          <select
            value={id2}
            onChange={(e) => setId2(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-ivory border border-bone text-xs text-ink focus:outline-none focus:border-forest"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.cropOrFeedName} ({new Date(s.collectedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample A Column */}
        <div className="bg-surface rounded-3xl p-6 border border-bone shadow-card space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-muted block">SAMPLE A</span>
              <h2 className="font-display font-bold text-lg text-ink">
                {sample1?.cropOrFeedName || "Select Sample"}
              </h2>
              <span className="text-xs text-muted font-mono">{sample1?.id}</span>
            </div>
            {analysis1 && <StatusChip status={analysis1.overallRisk} size="md" />}
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-bone flex items-center justify-between text-xs font-mono">
            <span className="text-muted">Action Decision</span>
            <span className="font-bold text-sm text-forest bg-forest/10 px-2.5 py-0.5 rounded-lg">
              {analysis1?.actionDecision || "—"}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
              Analytical Metrics
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                <span className="text-muted">Silage Core pH</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {ph1?.value !== undefined && ph1?.value !== null ? ph1.value : "—"}
                  </span>
                  {ph1 && <EvidenceTag tag={ph1.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                <span className="text-muted">Core Temperature</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {temp1?.value !== undefined && temp1?.value !== null ? `${temp1.value}°C` : "—"}
                  </span>
                  {temp1 && <EvidenceTag tag={temp1.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                <span className="text-muted">Dry Matter (% DM)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {dm1?.value !== undefined && dm1?.value !== null ? `${dm1.value}%` : "—"}
                  </span>
                  {dm1 && <EvidenceTag tag={dm1.evidenceTag} />}
                </div>
              </div>

              {analysis1?.silageAssessment && (
                <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                  <span className="text-muted">Heating Risk</span>
                  <span className="font-bold uppercase text-forest">
                    {analysis1.silageAssessment.heatingRisk}
                  </span>
                </div>
              )}
            </div>
          </div>

          {sample1 && (
            <Link
              href={`/test/result?id=${sample1.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
            >
              <span>View Sample A Full Result</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Sample B Column */}
        <div className="bg-surface rounded-3xl p-6 border border-bone shadow-card space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-muted block">SAMPLE B</span>
              <h2 className="font-display font-bold text-lg text-ink">
                {sample2?.cropOrFeedName || "Select Sample"}
              </h2>
              <span className="text-xs text-muted font-mono">{sample2?.id}</span>
            </div>
            {analysis2 && <StatusChip status={analysis2.overallRisk} size="md" />}
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-bone flex items-center justify-between text-xs font-mono">
            <span className="text-muted">Action Decision</span>
            <span className="font-bold text-sm text-forest bg-forest/10 px-2.5 py-0.5 rounded-lg">
              {analysis2?.actionDecision || "—"}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
              Analytical Metrics
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                <span className="text-muted">Silage Core pH</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {ph2?.value !== undefined && ph2?.value !== null ? ph2.value : "—"}
                  </span>
                  {ph2 && <EvidenceTag tag={ph2.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                <span className="text-muted">Core Temperature</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {temp2?.value !== undefined && temp2?.value !== null ? `${temp2.value}°C` : "—"}
                  </span>
                  {temp2 && <EvidenceTag tag={temp2.evidenceTag} />}
                </div>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                <span className="text-muted">Dry Matter (% DM)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink">
                    {dm2?.value !== undefined && dm2?.value !== null ? `${dm2.value}%` : "—"}
                  </span>
                  {dm2 && <EvidenceTag tag={dm2.evidenceTag} />}
                </div>
              </div>

              {analysis2?.silageAssessment && (
                <div className="flex justify-between p-2.5 rounded-xl bg-ivory border border-bone">
                  <span className="text-muted">Heating Risk</span>
                  <span className="font-bold uppercase text-terracotta">
                    {analysis2.silageAssessment.heatingRisk}
                  </span>
                </div>
              )}
            </div>
          </div>

          {sample2 && (
            <Link
              href={`/test/result?id=${sample2.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
            >
              <span>View Sample B Full Result</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Scientific Explainability Callout */}
      <div className="p-5 rounded-3xl bg-surface border border-bone shadow-card space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-forest" />
          <h3 className="font-bold text-sm text-ink">
            Comparative Agronomic Assessment
          </h3>
        </div>
        <p className="text-xs text-ink/80 leading-relaxed">
          When silage core temperature elevates significantly above ambient levels (ΔT &gt; 5°C) and pH rises above 4.5, aerobic yeasts metabolize organic preserving acids. This raises pH further, allowing opportunistic moulds and clostridia to proliferate. Rapid identification allows farmers to salvage interior silage by blending while discarding the deteriorating outer crust.
        </p>
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Loading comparison...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  );
}
