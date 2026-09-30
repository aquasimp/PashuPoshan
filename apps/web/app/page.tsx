"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  PlusCircle,
  AlertTriangle,
  Layers,
  Thermometer,
  ArrowRight,
  RefreshCw,
  HardDrive,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusChip } from "@/components/ui/StatusChip";
import { EvidenceTag } from "@/components/ui/EvidenceTag";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { db, LocalSample, LocalAnalysis } from "@/lib/db";
import { ensureDemoDataLoaded } from "@/lib/seedLocalDb";
import { useI18n } from "@/lib/i18n";

export default function FarmerHomePage() {
  const { t } = useI18n();
  const [samples, setSamples] = useState<LocalSample[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, LocalAnalysis>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingSync, setPendingSync] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      await ensureDemoDataLoaded();
      try {
        const localSamples = await db.samples.orderBy("collectedAt").reverse().limit(6).toArray();
        setSamples(localSamples);

        const localAnalyses = await db.analyses.toArray();
        const map: Record<string, LocalAnalysis> = {};
        for (const a of localAnalyses) {
          map[a.sampleId] = a;
        }
        setAnalyses(map);

        const outboxCount = await db.outbox.where("status").equals("pending").count();
        setPendingSync(outboxCount);
      } catch (err) {
        console.error("Failed to load local DB data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Top Node Header & Offline Sync Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-bone shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
              <ShieldCheck className="w-6 h-6 text-forest" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-ink text-base">
                  Kisan Dairy Testing Node #1
                </h2>
                <DemoBadge label="SIMULATED" size="sm" />
              </div>
              <p className="text-xs text-muted">
                Anand Cooperative Milk Union · District Dairy Cluster
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {pendingSync > 0 ? (
              <Link
                href="/sync"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-700" />
                <span>{pendingSync} tests pending sync</span>
                <span className="underline font-bold">Sync Now</span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-forest border border-emerald-200 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
                <span>Local DB Ready · Offline Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero 1-Tap CTA Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest to-deep text-white p-6 sm:p-8 shadow-card">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-mist border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Rapid Screening & Silage Intelligence (SIH26111)</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              Test your feed. <br />
              <span className="text-mist font-normal">Understand risk. Act with confidence.</span>
            </h1>

            <p className="text-sm sm:text-base text-mist/90 max-w-xl font-sans">
              Instant AI evaluation of corn & sorghum silage fermentation, moisture, core bunker heating, and cattle feed integrity directly on your smartphone.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-forest font-bold text-base shadow-lg hover:bg-mist hover:scale-[1.02] active:scale-[0.98] transition-all"
                id="btn-start-new-test"
              >
                <PlusCircle className="w-5 h-5 text-forest" />
                <span>{t("farmer.startTest")}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/demo/hero"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-forest-dark/40 hover:bg-forest-dark/60 text-white font-medium text-sm border border-white/20 transition-all"
              >
                <span>Compare Healthy vs Spoiled</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-12 translate-y-8">
            <ShieldCheck className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Active Pit Warnings / Storage Alerts */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-sans">
                  {t("farmer.storageAlerts")}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-ink mt-0.5">
                Bunker Pit #2 (Sorghum): Aerobic Core Heating Detected (+12°C above ambient)
              </p>
              <p className="text-xs text-muted mt-0.5">
                Shoulder air ingress identified. Recommended action: Trim deteriorating shoulder and blend with dry fodder.
              </p>
            </div>
          </div>
          <Link
            href="/test/result?id=FS-20260930-W402"
            className="shrink-0 text-xs font-bold text-amber-900 hover:text-ink flex items-center gap-1.5 underline px-3 py-1.5 rounded-lg bg-amber-100/80 hover:bg-amber-100 transition-colors"
          >
            <span>Inspect Pit Alert</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Quick Test Select Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Silage Card */}
          <Link
            href="/test/capture?type=silage"
            className="group p-5 rounded-2xl bg-surface border border-bone hover:border-forest/40 shadow-card hover:shadow-subtle transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-moss/10 flex items-center justify-center text-moss group-hover:bg-forest group-hover:text-white transition-colors">
                  <Thermometer className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-moss/10 text-forest">
                  Multimodal Sensor + Image
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-forest group-hover:text-deep transition-colors">
                {t("farmer.testSilage")}
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Test fermented silage pits and bunker bags. Analyzes pH, temperature differential, dry matter, and spoilage risk.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-bone flex items-center justify-between text-xs font-semibold text-forest">
              <span>Start Silage Evaluation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Feed Concentrate Card */}
          <Link
            href="/test/capture?type=feed"
            className="group p-5 rounded-2xl bg-surface border border-bone hover:border-forest/40 shadow-card hover:shadow-subtle transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 group-hover:bg-forest group-hover:text-white transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bone text-muted">
                  Visual QA + Assay Reader
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-forest group-hover:text-deep transition-colors">
                {t("farmer.testFeed")}
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Inspect cattle feed pellets, mash, oil cakes, and dry fodder for physical integrity, visible mould, and chemical screening.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-bone flex items-center justify-between text-xs font-semibold text-forest">
              <span>Start Feed Concentrate Check</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Sample Tests Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-ink">
                {t("farmer.recentTests")}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-bone text-muted font-medium">
                {samples.length} recorded
              </span>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-forest hover:text-deep flex items-center gap-1 hover:underline"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-surface rounded-2xl border border-bone">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted mb-2" />
              <p className="text-xs text-muted">Loading local samples...</p>
            </div>
          ) : samples.length === 0 ? (
            <div className="p-8 text-center bg-surface rounded-2xl border border-bone">
              <p className="text-sm text-muted">No test samples saved yet.</p>
              <Link
                href="/test"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-xs font-medium"
              >
                <span>Perform your first test</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {samples.map((sample) => {
                const analysis = analyses[sample.id];
                const dateStr = new Date(sample.collectedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Link
                    key={sample.id}
                    href={`/test/result?id=${sample.id}`}
                    className="p-4 rounded-xl bg-surface border border-bone hover:border-moss/50 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono font-medium text-muted block">
                            {sample.id}
                          </span>
                          <h4 className="font-semibold text-sm text-ink group-hover:text-forest transition-colors mt-0.5">
                            {sample.cropOrFeedName}
                          </h4>
                        </div>
                        {analysis && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <StatusChip status={analysis.overallRisk} size="sm" />
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-forest/10 text-forest">
                              {analysis.actionDecision}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted mt-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{sample.physicalForm || sample.sampleType}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-bone/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {analysis?.predictions?.[0] && (
                          <EvidenceTag tag={analysis.predictions[0].evidenceTag} />
                        )}
                      </div>
                      <span className="text-forest font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Utility Actions Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Link
            href="/history"
            className="p-3.5 rounded-xl bg-surface border border-bone text-center hover:bg-bone/40 transition-colors"
          >
            <Layers className="w-5 h-5 mx-auto text-forest mb-1.5" />
            <span className="text-xs font-semibold text-ink block">Test History</span>
            <span className="text-[10px] text-muted">Filter & search</span>
          </Link>

          <Link
            href="/compare"
            className="p-3.5 rounded-xl bg-surface border border-bone text-center hover:bg-bone/40 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mx-auto text-forest mb-1.5" />
            <span className="text-xs font-semibold text-ink block">Compare Samples</span>
            <span className="text-[10px] text-muted">Side-by-side diff</span>
          </Link>

          <Link
            href="/sync"
            className="p-3.5 rounded-xl bg-surface border border-bone text-center hover:bg-bone/40 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mx-auto text-forest mb-1.5" />
            <span className="text-xs font-semibold text-ink block">Sync Center</span>
            <span className="text-[10px] text-muted">Offline outbox</span>
          </Link>

          <Link
            href="/demo/hero"
            className="p-3.5 rounded-xl bg-surface border border-bone text-center hover:bg-bone/40 transition-colors"
          >
            <Sparkles className="w-5 h-5 mx-auto text-amber-600 mb-1.5" />
            <span className="text-xs font-semibold text-ink block">Hero Demo</span>
            <span className="text-[10px] text-muted">Judges Showcase</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
