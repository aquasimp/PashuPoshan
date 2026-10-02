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
import {
  ProductCarousel,
  CarouselItem,
  SmoothDrawer,
  SampleDetailDrawer,
  drawerItemVariants,
} from "@/components/ui/liquid-glass";
import { motion } from "framer-motion";

export default function FarmerHomePage() {
  const { t } = useI18n();
  const [samples, setSamples] = useState<LocalSample[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, LocalAnalysis>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingSync, setPendingSync] = useState<number>(0);
  const [selectedSample, setSelectedSample] = useState<LocalSample | null>(null);
  const [isSampleDrawerOpen, setIsSampleDrawerOpen] = useState(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);

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

  // Transform local samples into rich carousel items
  const carouselItems: CarouselItem[] = samples.map((sample) => {
    const analysis = analyses[sample.id];
    const dateStr = new Date(sample.collectedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const metrics = [];
    if (sample.metadata?.ph !== undefined) {
      metrics.push({ label: "pH", value: sample.metadata.ph, unit: "pH" });
    }
    if (sample.metadata?.internalTemp !== undefined) {
      metrics.push({ label: "Core Temp", value: `${sample.metadata.internalTemp}°C` });
    }
    if (sample.metadata?.dryMatter !== undefined) {
      metrics.push({ label: "DM", value: `${sample.metadata.dryMatter}%` });
    } else if (sample.metadata?.visibleMouldPct !== undefined) {
      metrics.push({ label: "Mould", value: `${sample.metadata.visibleMouldPct}%` });
    }

    return {
      id: sample.id,
      title: sample.cropOrFeedName,
      subtitle: sample.physicalForm || (sample.sampleType === "silage" ? "Fermented Silage" : "Feed Concentrate"),
      sampleType: sample.sampleType,
      physicalForm: sample.physicalForm,
      date: dateStr,
      status: analysis?.overallRisk,
      decision: analysis?.actionDecision,
      evidenceTag: (analysis?.predictions?.[0]?.evidenceTag as any) || "DEMO",
      isDemo: true,
      metrics,
      href: `/test/result?id=${sample.id}`,
      onClick: () => {
        setSelectedSample(sample);
        setIsSampleDrawerOpen(true);
      },
      actionLabel: t("carousel.quickView"),
      secondaryActionLabel: t("carousel.viewResult"),
    };
  });

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Top Node Header & Offline Sync Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl glass-surface-2 border border-edge shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 dark:bg-emerald-500/10 border border-forest/20 dark:border-emerald-500/20 flex items-center justify-center text-forest dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-ink-1 text-base">
                  {t("home.testingNode")}
                </h2>
                <DemoBadge label="SIMULATED" size="sm" />
              </div>
              <p className="text-xs text-ink-3">
                {t("home.demoCluster")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {pendingSync > 0 ? (
              <Link
                href="/sync"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/20 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{pendingSync} {t("home.testsPending")}</span>
                <span className="underline font-bold">{t("home.syncNow")}</span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-forest dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
                <span>{t("home.localDbReady")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero 1-Tap CTA Section with Liquid Glass Specular Styling */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest to-deep dark:from-[#0a1711] dark:via-[#0e2118] dark:to-[#050b08] text-white p-6 sm:p-9 shadow-float border border-forest-border/40 dark:border-emerald-500/20">
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md text-xs font-medium text-mist border border-white/15 dark:border-white/10 shadow-glass">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t("home.rapidBadge")}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              {t("home.heroTitle1")} <br />
              <span className="text-mist dark:text-sage-light font-normal">{t("home.heroTitle2")}</span>
            </h1>

            <p className="text-sm sm:text-base text-mist/90 dark:text-sage-light/80 max-w-xl font-sans leading-relaxed">
              {t("home.heroDesc")}
            </p>

            <p className="text-xs text-mist/75 dark:text-sage-light/65 max-w-lg leading-relaxed">
              {t("home.heroCaveat")}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white dark:bg-dark-ink text-forest dark:text-dark-surface font-bold text-base shadow-float hover:bg-mist hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[48px]"
                id="btn-start-new-test"
              >
                <PlusCircle className="w-5 h-5 text-forest dark:text-dark-surface shrink-0" />
                <span className="text-balance leading-normal">{t("home.startTest")}</span>
                <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
              </Link>

              <Link
                href="/demo/hero"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 dark:bg-white/5 hover:bg-white/20 text-white font-medium text-sm border border-white/20 dark:border-white/15 backdrop-blur-md transition-all min-h-[48px]"
              >
                <span className="text-balance leading-normal">{t("home.healthyVsSpoiled")}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Decorative Background Elements */}
          <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none transform translate-x-12 translate-y-8">
            <ShieldCheck className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Active Pit Warnings / Storage Alerts (Honest ESTIMATED Claim + DEMO Badge) */}
        <div className="bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/30 dark:border-amber-600/30 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-200 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DemoBadge label="DEMO" size="sm" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-sans">
                  {t("farmer.storageAlerts")} · Fictional Dairy Cooperative
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-ink-1 mt-0.5">
                {t("home.storageAlertTitle")}
              </p>
              <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">
                {t("home.storageAlertDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAlertDrawerOpen(true)}
            className="shrink-0 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-ink-1 flex items-center gap-1.5 underline px-3.5 py-2 rounded-xl bg-amber-500/15 dark:bg-amber-900/40 hover:bg-amber-500/25 transition-colors min-h-[44px]"
          >
            <span>Inspect Pit Alert</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
                {t("farmer.testSilageSubtitle")}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-bone dark:border-dark-border flex items-center justify-between text-xs font-semibold text-forest dark:text-emerald-400">
              <span>{t("testSelect.selectSilage")}</span>
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
                {t("farmer.testFeedSubtitle")}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-bone dark:border-dark-border flex items-center justify-between text-xs font-semibold text-forest dark:text-emerald-400">
              <span>{t("testSelect.selectFeed")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Sample Tests Carousel Section */}
        <div className="space-y-2">
          <ProductCarousel
            title={t("farmer.recentTests")}
            subtitle={t("carousel.recentTestsSubtitle")}
            items={carouselItems}
            loading={loading}
            viewAllHref="/history"
            viewAllLabel="View All History"
            onItemClick={(item) => {
              const found = samples.find((s) => s.id === item.id);
              if (found) {
                setSelectedSample(found);
                setIsSampleDrawerOpen(true);
              }
            }}
            emptyMessage="No test samples saved yet."
            emptyAction={{
              label: "Perform your first test",
              href: "/test",
            }}
          />
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

        {/* 1. Sample Details Smooth Drawer */}
        <SampleDetailDrawer
          sample={selectedSample}
          analysis={selectedSample ? analyses[selectedSample.id] : null}
          isOpen={isSampleDrawerOpen}
          onClose={() => setIsSampleDrawerOpen(false)}
        />

        {/* 2. Pit Storage Alert Smooth Drawer */}
        <SmoothDrawer
          isOpen={isAlertDrawerOpen}
          onClose={() => setIsAlertDrawerOpen(false)}
          title="Bunker Pit #2 Heating Alert"
          subtitle="Sorghum Silage • Aerobic Core Heating Detected (+8.2°C)"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          badge={
            <>
              <DemoBadge label="DEMO" size="sm" />
              <StatusChip status="ATTENTION" size="sm" />
              <EvidenceTag tag="ESTIMATED" size="sm" />
            </>
          }
          primaryAction={{
            label: "Inspect Pit Result",
            href: "/test/result?id=FS-20260930-W402",
          }}
          secondaryAction={{
            label: t("drawer.close"),
            onClick: () => setIsAlertDrawerOpen(false),
          }}
        >
          <motion.div
            variants={drawerItemVariants}
            className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider font-mono">
              <span>Active Thermal Sensor Anomaly</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-ink-1 leading-snug">
              Core temperature probe recorded +8.2°C above ambient baseline (38.0°C vs 26.0°C).
            </p>
          </motion.div>

          <motion.div variants={drawerItemVariants} className="space-y-2">
            <h4 className="text-xs font-bold text-ink-2 uppercase tracking-wider font-mono">
              {t("drawer.contributingFactors")}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
                <span className="text-[11px] text-ink-3 block font-mono">Internal Temp</span>
                <span className="text-base font-bold text-amber-700 dark:text-amber-400">38.0°C</span>
                <span className="text-[10px] text-ink-3 block mt-0.5">Ambient: 26.0°C</span>
              </div>
              <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
                <span className="text-[11px] text-ink-3 block font-mono">Silage pH</span>
                <span className="text-base font-bold text-ink-1">5.4 pH</span>
                <span className="text-[10px] text-ink-3 block mt-0.5">Target: &lt; 4.2 pH</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={drawerItemVariants} className="space-y-2">
            <h4 className="text-xs font-bold text-ink-2 uppercase tracking-wider font-mono">
              {t("drawer.recommendedAction")}
            </h4>
            <div className="p-3.5 rounded-2xl bg-bg-1/80 border border-edge space-y-1.5 text-xs text-ink-1 leading-relaxed">
              <p>1. <strong>Trim shoulder:</strong> Remove deteriorating, heated outer layer (5–10 cm) along the bunker edge.</p>
              <p>2. <strong>Blend with dry fodder:</strong> Dilute unaffected core silage with dry fodder before feeding cattle.</p>
              <p>3. <strong>Check tarp seal:</strong> Inspect bunker plastic sheeting for punctures and reseal with gravel bags to prevent oxygen ingress.</p>
            </div>
          </motion.div>

          <motion.div
            variants={drawerItemVariants}
            className="p-3 rounded-2xl bg-forest/5 dark:bg-emerald-500/10 border border-forest/15 dark:border-emerald-500/20 text-xs text-ink-2 leading-relaxed"
          >
            {t("drawer.labNote")}
          </motion.div>
        </SmoothDrawer>
      </main>
    </div>
  );
}
