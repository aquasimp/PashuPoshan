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
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Top Node Header & Offline Sync Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-bone dark:border-dark-border shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-emerald-500/10 flex items-center justify-center text-forest dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-ink dark:text-dark-ink text-base">
                  Kisan Dairy Testing Node #1
                </h2>
                <DemoBadge label="SIMULATED" size="sm" />
              </div>
              <p className="text-xs text-muted dark:text-dark-muted">
                Anand Cooperative Milk Union · District Dairy Cluster
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {pendingSync > 0 ? (
              <Link
                href="/sync"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>{pendingSync} tests pending sync</span>
                <span className="underline font-bold">Sync Now</span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
                <span>Local DB Ready · Offline Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero 1-Tap CTA Section with Liquid Glass Specular Styling */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest to-deep dark:from-[#13241b] dark:via-[#193225] dark:to-[#0f1d16] text-white p-6 sm:p-9 shadow-float border border-forest-border/40 dark:border-emerald-500/20">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md text-xs font-medium text-mist border border-white/15 dark:border-white/10 shadow-glass">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Rapid Screening & Silage Intelligence (SIH26111)</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              Test your feed. <br />
              <span className="text-mist dark:text-sage-light font-normal">Understand risk. Act with confidence.</span>
            </h1>

            <p className="text-sm sm:text-base text-mist/90 dark:text-sage-light/80 max-w-xl font-sans leading-relaxed">
              Instant AI evaluation of corn & sorghum silage fermentation, moisture, core bunker heating, and cattle feed integrity directly on your smartphone.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white dark:bg-dark-ink text-forest dark:text-dark-surface font-bold text-base shadow-float hover:bg-mist hover:scale-[1.02] active:scale-[0.98] transition-all"
                id="btn-start-new-test"
              >
                <PlusCircle className="w-5 h-5 text-forest dark:text-dark-surface" />
                <span>{t("farmer.startTest")}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/demo/hero"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 dark:bg-white/5 hover:bg-white/20 text-white font-medium text-sm border border-white/20 dark:border-white/15 backdrop-blur-md transition-all"
              >
                <span>Compare Healthy vs Spoiled</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none transform translate-x-12 translate-y-8">
            <ShieldCheck className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Active Pit Warnings / Storage Alerts */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 font-sans">
                  {t("farmer.storageAlerts")}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-ink dark:text-dark-ink mt-0.5">
                Bunker Pit #2 (Sorghum): Aerobic Core Heating Detected (+12°C above ambient)
              </p>
              <p className="text-xs text-muted dark:text-dark-muted mt-0.5 leading-relaxed">
                Shoulder air ingress identified. Recommended action: Trim deteriorating shoulder and blend with dry fodder.
              </p>
            </div>
          </div>
          <Link
            href="/test/result?id=FS-20260930-W402"
            className="shrink-0 text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-ink dark:hover:text-white flex items-center gap-1.5 underline px-3.5 py-2 rounded-xl bg-amber-100/80 dark:bg-amber-900/40 hover:bg-amber-100 transition-colors"
          >
            <span>Inspect Pit Alert</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Quick Test Select Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Silage Card */}
          <Link
            href="/test/capture?type=silage"
            className="group p-6 rounded-3xl glass-card border border-bone dark:border-dark-border hover:border-forest/50 dark:hover:border-emerald-500/50 shadow-card hover:shadow-float transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-moss/10 dark:bg-emerald-500/10 flex items-center justify-center text-moss dark:text-emerald-400 group-hover:bg-forest group-hover:text-white transition-colors">
                  <Thermometer className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-moss/10 dark:bg-emerald-500/10 text-forest dark:text-emerald-300">
                  Multimodal Sensor + Image
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-forest dark:text-dark-ink group-hover:text-deep dark:group-hover:text-emerald-300 transition-colors">
                {t("farmer.testSilage")}
              </h3>
              <p className="text-xs text-muted dark:text-dark-muted mt-1 leading-relaxed">
                Test fermented silage pits and bunker bags. Analyzes pH, temperature differential, dry matter, and spoilage risk.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-bone dark:border-dark-border flex items-center justify-between text-xs font-semibold text-forest dark:text-emerald-400">
              <span>Start Silage Evaluation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Feed Concentrate Card */}
          <Link
            href="/test/capture?type=feed"
            className="group p-6 rounded-3xl glass-card border border-bone dark:border-dark-border hover:border-forest/50 dark:hover:border-emerald-500/50 shadow-card hover:shadow-float transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-700 dark:text-amber-400 group-hover:bg-forest group-hover:text-white transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bone dark:bg-dark-card text-muted dark:text-dark-muted">
                  Visual QA + Assay Reader
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-forest dark:text-dark-ink group-hover:text-deep dark:group-hover:text-emerald-300 transition-colors">
                {t("farmer.testFeed")}
              </h3>
              <p className="text-xs text-muted dark:text-dark-muted mt-1 leading-relaxed">
                Inspect cattle feed pellets, mash, oil cakes, and dry fodder for physical integrity, visible mould, and chemical screening.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-bone dark:border-dark-border flex items-center justify-between text-xs font-semibold text-forest dark:text-emerald-400">
              <span>Start Feed Concentrate Check</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Sample Tests Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-ink dark:text-dark-ink">
                {t("farmer.recentTests")}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-bone dark:bg-dark-card text-muted dark:text-dark-muted font-medium">
                {samples.length} recorded
              </span>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-forest dark:text-emerald-400 hover:text-deep dark:hover:text-emerald-300 flex items-center gap-1 hover:underline"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center glass-card rounded-3xl border border-bone dark:border-dark-border">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted dark:text-dark-muted mb-2" />
              <p className="text-xs text-muted dark:text-dark-muted">Loading local samples...</p>
            </div>
          ) : samples.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-3xl border border-bone dark:border-dark-border">
              <p className="text-sm text-muted dark:text-dark-muted">No test samples saved yet.</p>
              <Link
                href="/test"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest dark:bg-emerald-600 text-white text-xs font-medium"
              >
                <span>Perform your first test</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                    className="p-4 rounded-2xl glass-card border border-bone dark:border-dark-border hover:border-moss/60 dark:hover:border-emerald-500/50 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono font-medium text-muted dark:text-dark-muted block">
                            {sample.id}
                          </span>
                          <h4 className="font-semibold text-sm text-ink dark:text-dark-ink group-hover:text-forest dark:group-hover:text-emerald-300 transition-colors mt-0.5">
                            {sample.cropOrFeedName}
                          </h4>
                        </div>
                        {analysis && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <StatusChip status={analysis.overallRisk} size="sm" />
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-forest/10 dark:bg-emerald-500/10 text-forest dark:text-emerald-300">
                              {analysis.actionDecision}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted mt-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{sample.physicalForm || sample.sampleType}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-bone/60 dark:border-dark-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {analysis?.predictions?.[0] && (
                          <EvidenceTag tag={analysis.predictions[0].evidenceTag} />
                        )}
                      </div>
                      <span className="text-forest dark:text-emerald-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
            className="p-3.5 rounded-2xl glass-card border border-bone dark:border-dark-border text-center hover:bg-bone/40 dark:hover:bg-dark-card transition-colors"
          >
            <Layers className="w-5 h-5 mx-auto text-forest dark:text-emerald-400 mb-1.5" />
            <span className="text-xs font-semibold text-ink dark:text-dark-ink block">Test History</span>
            <span className="text-[10px] text-muted dark:text-dark-muted">Filter & search</span>
          </Link>

          <Link
            href="/compare"
            className="p-3.5 rounded-2xl glass-card border border-bone dark:border-dark-border text-center hover:bg-bone/40 dark:hover:bg-dark-card transition-colors"
          >
            <TrendingUp className="w-5 h-5 mx-auto text-forest dark:text-emerald-400 mb-1.5" />
            <span className="text-xs font-semibold text-ink dark:text-dark-ink block">Compare Samples</span>
            <span className="text-[10px] text-muted dark:text-dark-muted">Side-by-side diff</span>
          </Link>

          <Link
            href="/sync"
            className="p-3.5 rounded-2xl glass-card border border-bone dark:border-dark-border text-center hover:bg-bone/40 dark:hover:bg-dark-card transition-colors"
          >
            <RefreshCw className="w-5 h-5 mx-auto text-forest dark:text-emerald-400 mb-1.5" />
            <span className="text-xs font-semibold text-ink dark:text-dark-ink block">Sync Center</span>
            <span className="text-[10px] text-muted dark:text-dark-muted">Offline outbox</span>
          </Link>

          <Link
            href="/demo/hero"
            className="p-3.5 rounded-2xl glass-card border border-bone dark:border-dark-border text-center hover:bg-bone/40 dark:hover:bg-dark-card transition-colors"
          >
            <Sparkles className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1.5" />
            <span className="text-xs font-semibold text-ink dark:text-dark-ink block">Hero Demo</span>
            <span className="text-[10px] text-muted dark:text-dark-muted">Judges Showcase</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
