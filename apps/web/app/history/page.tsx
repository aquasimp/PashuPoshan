"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Calendar,
  HardDrive,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusChip } from "@/components/ui/StatusChip";
import { EvidenceTag } from "@/components/ui/EvidenceTag";
import { SyncStatusBadge } from "@/lib/sync";
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
import { Eye } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [samples, setSamples] = useState<LocalSample[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, LocalAnalysis>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "silage" | "feed" | "high_risk" | "unsynced">("all");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState<LocalSample | null>(null);
  const [isSampleDrawerOpen, setIsSampleDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cropOrFeedName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "silage") return s.sampleType === "silage";
    if (activeFilter === "feed") return s.sampleType === "feed";
    if (activeFilter === "unsynced") return s.syncStatus === "SAVED_ON_DEVICE";
    if (activeFilter === "high_risk") {
      const a = analyses[s.id];
      return a && (a.overallRisk === "HIGH RISK" || a.actionDecision === "DISCARD");
    }
    return true;
  });

  const carouselItems: CarouselItem[] = samples.slice(0, 10).map((s) => {
    const a = analyses[s.id];
    const risk = a?.overallRisk || "GOOD";
    return {
      id: s.id,
      title: s.cropOrFeedName,
      subtitle: `${s.sampleType.toUpperCase()} • ${new Date(s.collectedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      sampleType: s.sampleType,
      physicalForm: s.physicalForm,
      status: a?.overallRisk,
      decision: a?.actionDecision,
      evidenceTag: (a?.predictions?.[0]?.evidenceTag as any) || (a ? "PREDICTED" : "USER-ENTERED"),
      isDemo: s.id.startsWith("DEMO-") || Boolean(s.metadata?.notes?.includes("DEMO")),
      image: s.metadata?.photoUri || (s.sampleType === "silage" ? "/images/silage-good.svg" : "/images/feed-sample.svg"),
      actionLabel: t("carousel.quickView") || "Quick View",
      onClick: () => {
        setSelectedSample(s);
        setIsSampleDrawerOpen(true);
      },
    };
  });

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header & New Test CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink">
              Test Sample History
            </h1>
            <p className="text-xs text-muted dark:text-dark-muted mt-0.5">
              Chronological log of farm feed evaluations stored on this device.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedForCompare.length === 2 && (
              <button
                type="button"
                onClick={() =>
                  router.push(`/compare?id1=${selectedForCompare[0]}&id2=${selectedForCompare[1]}`)
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Compare Selected (2)</span>
              </button>
            )}

            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-deep dark:bg-dark-forest dark:hover:bg-forest text-white font-bold text-xs shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Test</span>
            </Link>
          </div>
        </div>

        {/* Quick Scan Carousel */}
        {samples.length > 0 && (
          <ProductCarousel
            title={t("carousel.recentTestsTitle")}
            subtitle="Swipe horizontally to scan recent field logs or tap quick view."
            items={carouselItems}
            loading={loading}
            onCardClick={(item) => {
              const s = samples.find((x) => x.id === item.id);
              if (s) {
                setSelectedSample(s);
                setIsSampleDrawerOpen(true);
              }
            }}
          />
        )}

        {/* Search & Filter Bar */}
        <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dark-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or crop name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface/80 dark:bg-dark-card border border-bone dark:border-dark-border text-xs text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-dark-forest placeholder:text-muted dark:placeholder:text-dark-muted"
            />
          </div>

          {/* Desktop Filter Tabs */}
          <div className="hidden sm:flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-forest dark:bg-dark-forest text-white"
                  : "bg-surface/80 dark:bg-dark-card text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink border border-bone dark:border-dark-border"
              }`}
            >
              All ({samples.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("silage")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "silage"
                  ? "bg-forest dark:bg-dark-forest text-white"
                  : "bg-surface/80 dark:bg-dark-card text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink border border-bone dark:border-dark-border"
              }`}
            >
              Silage
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("feed")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "feed"
                  ? "bg-forest dark:bg-dark-forest text-white"
                  : "bg-surface/80 dark:bg-dark-card text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink border border-bone dark:border-dark-border"
              }`}
            >
              Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("high_risk")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "high_risk"
                  ? "bg-terracotta text-white"
                  : "bg-surface/80 dark:bg-dark-card text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink border border-bone dark:border-dark-border"
              }`}
            >
              High Risk
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unsynced")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "unsynced"
                  ? "bg-amber-600 text-white"
                  : "bg-surface/80 dark:bg-dark-card text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink border border-bone dark:border-dark-border"
              }`}
            >
              Unsynced
            </button>
          </div>

          {/* Mobile Filter Button */}
          <div className="flex sm:hidden w-full justify-between items-center pt-1">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bone dark:border-dark-border text-xs font-medium bg-surface/80 dark:bg-dark-card text-ink dark:text-dark-ink"
            >
              <Filter className="w-3.5 h-3.5 text-forest dark:text-dark-forest" />
              <span>Filter: <strong className="capitalize">{activeFilter === "all" ? "All" : activeFilter.replace("_", " ")}</strong></span>
            </button>
            <span className="text-[11px] text-muted dark:text-dark-muted font-mono">
              {filteredSamples.length} records
            </span>
          </div>
        </div>

        {/* Comparison Helper Notice */}
        <div className="text-[11px] text-muted dark:text-dark-muted flex items-center justify-between px-1">
          <span>Select any 2 samples using the checkboxes on the left to compare nutritional and sensor diffs.</span>
          <span className="font-mono font-medium">{selectedForCompare.length} / 2 selected</span>
        </div>

        {/* Sample List */}
        {loading ? (
          <div className="p-12 text-center glass-card rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest dark:text-dark-forest mb-2" />
            <p className="text-xs text-muted dark:text-dark-muted">Loading farm timeline...</p>
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl space-y-3">
            <Layers className="w-8 h-8 text-muted dark:text-dark-muted mx-auto" />
            <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">No samples found</h3>
            <p className="text-xs text-muted dark:text-dark-muted">No records match your search or filter selection.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSamples.map((s) => {
              const a = analyses[s.id];
              const isSelected = selectedForCompare.includes(s.id);
              const dateStr = new Date(s.collectedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? "border-amber-500 shadow-md bg-amber-50/30 dark:bg-amber-950/30 border"
                      : "glass-card hover:border-moss/40 dark:hover:border-dark-moss/50"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Checkbox for side-by-side comparison */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectCompare(s.id)}
                      className="w-4 h-4 mt-1 sm:mt-0 rounded accent-amber-600 cursor-pointer"
                      title="Select for comparison"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-muted dark:text-dark-muted">
                          {s.id}
                        </span>
                        <SyncStatusBadge status={s.syncStatus} size="sm" />
                      </div>
                      <h3 className="font-display font-bold text-base text-ink dark:text-dark-ink mt-0.5">
                        {s.cropOrFeedName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{s.physicalForm || s.sampleType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-bone dark:border-dark-border">
                    {a && (
                      <div className="flex items-center gap-2 mr-1">
                        <StatusChip status={a.overallRisk} size="sm" />
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-forest/10 dark:bg-dark-forest/20 text-forest dark:text-dark-forest">
                          {a.actionDecision}
                        </span>
                      </div>
                    )}

                    {/* Quick View Drawer trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSample(s);
                        setIsSampleDrawerOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest text-forest hover:text-white dark:bg-dark-forest/20 dark:hover:bg-dark-forest dark:text-dark-forest dark:hover:text-white text-xs font-semibold transition-all"
                      title="Quick preview details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Quick View</span>
                    </button>

                    <Link
                      href={`/test/result?id=${s.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 dark:bg-dark-card hover:bg-forest dark:hover:bg-dark-forest hover:text-white dark:hover:text-white text-forest dark:text-dark-forest text-xs font-semibold border border-bone dark:border-dark-border transition-all"
                    >
                      <span>Result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sample Detail Drawer */}
      <SampleDetailDrawer
        sample={selectedSample}
        analysis={selectedSample ? analyses[selectedSample.id] : undefined}
        isOpen={isSampleDrawerOpen}
        onClose={() => setIsSampleDrawerOpen(false)}
      />

      {/* Mobile Filter Drawer */}
      <SmoothDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter Timeline"
        description="Select a category to narrow down your feed and silage history"
        footer={
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(false)}
            className="w-full py-2.5 rounded-xl bg-forest hover:bg-deep dark:bg-dark-forest dark:hover:bg-forest text-white font-bold text-xs transition-colors"
          >
            Apply Filters
          </button>
        }
      >
        <motion.div variants={drawerItemVariants} className="space-y-2">
          {(
            [
              { key: "all", label: `All Samples (${samples.length})` },
              { key: "silage", label: "Silage Only" },
              { key: "feed", label: "Commercial Feed" },
              { key: "high_risk", label: "High Risk / Discard" },
              { key: "unsynced", label: "Unsynced Local Data" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setActiveFilter(opt.key);
                setIsFilterDrawerOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                activeFilter === opt.key
                  ? "bg-forest/15 dark:bg-dark-forest/25 text-forest dark:text-dark-forest border-forest/30 dark:border-dark-forest/40"
                  : "glass-surface-1 border-bone dark:border-dark-border text-ink dark:text-dark-ink hover:bg-surface/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      </SmoothDrawer>
    </div>
  );
}
