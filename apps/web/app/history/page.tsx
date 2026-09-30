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

export default function HistoryPage() {
  const router = useRouter();
  const [samples, setSamples] = useState<LocalSample[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, LocalAnalysis>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "silage" | "feed" | "high_risk" | "unsynced">("all");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

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

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header & New Test CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              Test Sample History
            </h1>
            <p className="text-xs text-muted mt-0.5">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-deep text-white font-bold text-xs shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Test</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-surface p-4 rounded-2xl border border-bone shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or crop name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-ivory border border-bone text-xs text-ink focus:outline-none focus:border-forest"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "all" ? "bg-forest text-white" : "bg-ivory text-muted hover:text-ink border border-bone"
              }`}
            >
              All ({samples.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("silage")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "silage" ? "bg-forest text-white" : "bg-ivory text-muted hover:text-ink border border-bone"
              }`}
            >
              Silage
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("feed")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "feed" ? "bg-forest text-white" : "bg-ivory text-muted hover:text-ink border border-bone"
              }`}
            >
              Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("high_risk")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "high_risk" ? "bg-terracotta text-white" : "bg-ivory text-muted hover:text-ink border border-bone"
              }`}
            >
              High Risk
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unsynced")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === "unsynced" ? "bg-amber-600 text-white" : "bg-ivory text-muted hover:text-ink border border-bone"
              }`}
            >
              Unsynced
            </button>
          </div>
        </div>

        {/* Comparison Helper Notice */}
        <div className="text-[11px] text-muted flex items-center justify-between px-1">
          <span>Select any 2 samples using the checkboxes on the left to compare nutritional and sensor diffs.</span>
          <span>{selectedForCompare.length} / 2 selected</span>
        </div>

        {/* Sample List */}
        {loading ? (
          <div className="p-12 text-center bg-surface rounded-2xl border border-bone">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest mb-2" />
            <p className="text-xs text-muted">Loading farm timeline...</p>
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="p-12 text-center bg-surface rounded-2xl border border-bone space-y-3">
            <Layers className="w-8 h-8 text-muted mx-auto" />
            <h3 className="font-semibold text-sm text-ink">No samples found</h3>
            <p className="text-xs text-muted">No records match your search or filter selection.</p>
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
                  className={`p-4 rounded-2xl bg-surface border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? "border-amber-500 shadow-md bg-amber-50/20"
                      : "border-bone hover:border-moss/40 shadow-card"
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
                        <span className="font-mono text-xs font-bold text-muted">
                          {s.id}
                        </span>
                        <SyncStatusBadge status={s.syncStatus} size="sm" />
                      </div>
                      <h3 className="font-display font-bold text-base text-ink mt-0.5">
                        {s.cropOrFeedName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{s.physicalForm || s.sampleType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-bone">
                    {a && (
                      <div className="flex items-center gap-2">
                        <StatusChip status={a.overallRisk} size="sm" />
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-forest/10 text-forest">
                          {a.actionDecision}
                        </span>
                      </div>
                    )}

                    <Link
                      href={`/test/result?id=${s.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory hover:bg-forest hover:text-white text-forest text-xs font-semibold border border-bone transition-all"
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
    </div>
  );
}
