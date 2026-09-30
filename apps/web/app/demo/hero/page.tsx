"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Layers,
  Volume2,
  FileText,
  Compass,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusChip } from "@/components/ui/StatusChip";
import { EvidenceTag } from "@/components/ui/EvidenceTag";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { db } from "@/lib/db";
import { ensureDemoDataLoaded } from "@/lib/seedLocalDb";

const DEMO_SCENARIOS = [
  {
    id: "sc-1",
    name: "1. Healthy Corn Silage",
    type: "silage",
    crop: "Maize Silage (Core)",
    ph: 3.9,
    internalTemp: 27.0,
    ambientTemp: 25.0,
    deltaT: 2.0,
    dryMatter: 34.0,
    mouldPct: 0,
    risk: "GOOD",
    decision: "FEED",
    summary: "Optimal lactic acid fermentation. Stable cold core and pleasant sweet-acidic profile.",
  },
  {
    id: "sc-2",
    name: "2. Aerobic Bunker Heating",
    type: "silage",
    crop: "Corn Silage (Shoulder)",
    ph: 5.4,
    internalTemp: 40.5,
    ambientTemp: 26.0,
    deltaT: 14.5,
    dryMatter: 38.5,
    mouldPct: 5,
    risk: "ATTENTION",
    decision: "BLEND",
    summary: "Air ingress along bunker shoulder. Yeasts oxidizing lactic acid with elevated core temperature (+14.5°C).",
  },
  {
    id: "sc-3",
    name: "3. Clostridial Spoilage",
    type: "silage",
    crop: "Sorghum Silage (Pit Bottom)",
    ph: 5.9,
    internalTemp: 32.0,
    ambientTemp: 26.0,
    deltaT: 6.0,
    dryMatter: 22.0,
    mouldPct: 15,
    risk: "HIGH RISK",
    decision: "DISCARD",
    summary: "Anaerobic fermentation failure. High moisture silage with butyric acid and protein degradation.",
  },
  {
    id: "sc-4",
    name: "4. Feed Pellet Integrity",
    type: "feed",
    crop: "Cattle Feed Pellets",
    ph: null,
    internalTemp: null,
    ambientTemp: 25.0,
    deltaT: 0,
    dryMatter: 90.0,
    mouldPct: 0,
    risk: "GOOD",
    decision: "FEED",
    summary: "Physical pellets intact with zero mould. Note: Urea cannot be assessed from image alone.",
  },
  {
    id: "sc-5",
    name: "5. Out-of-Bounds Sensor Fault",
    type: "silage",
    crop: "Corn Silage (Probe Fault)",
    ph: 11.2,
    internalTemp: 28.0,
    ambientTemp: 25.0,
    deltaT: 3.0,
    dryMatter: 34.0,
    mouldPct: 0,
    risk: "ATTENTION",
    decision: "RE-TEST",
    summary: "pH probe reading 11.2 is outside physical sensor bounds. Calibration or probe re-test required.",
  },
];

export default function HeroDemoPage() {
  const [activeScenario, setActiveScenario] = useState(DEMO_SCENARIOS[0]);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetDemo = async () => {
    try {
      await db.samples.clear();
      await db.analyses.clear();
      await db.advisories.clear();
      await db.outbox.clear();
      await ensureDemoDataLoaded();
      setResetMessage("Demo database reset and re-seeded with golden benchmark cases.");
      setTimeout(() => setResetMessage(null), 4000);
    } catch (e) {
      console.error("Reset error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-moss">
                SIH26111 Judges Showcase
              </span>
              <DemoBadge label="5-SCENARIO SUITE" size="sm" />
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-ink tracking-tight mt-1">
              Hero Demo: Healthy vs Spoiled Silage
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Live interactive comparison without login. Demonstrates worst supported hazard fusion and instant farmer advisory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo/tour"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-deep text-white font-bold text-xs shadow-md transition-all"
            >
              <Compass className="w-4 h-4 text-mist" />
              <span>Launch 3-Min Judge Tour</span>
            </Link>

            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-bone text-ink hover:bg-bone text-xs font-medium transition-colors"
              title="Reset local demo database"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-forest font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-moss shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* 5 Scenario Selector Tabs */}
        <div className="bg-surface p-2.5 rounded-2xl border border-bone shadow-card flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenario(sc)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-forest text-white shadow-sm"
                    : "bg-ivory hover:bg-bone text-ink border border-bone"
                }`}
              >
                {sc.name}
              </button>
            );
          })}
        </div>

        {/* Active Scenario Live Card */}
        <div className="bg-surface rounded-3xl p-6 border-2 border-forest/20 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-forest uppercase tracking-wider block">
                ACTIVE BENCHMARK CASE
              </span>
              <h2 className="font-display font-bold text-xl text-ink mt-0.5">
                {activeScenario.crop}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <StatusChip status={activeScenario.risk as any} size="md" />
              <div className="px-3 py-1 rounded-xl bg-forest text-white font-mono font-bold text-xs">
                ACTION: {activeScenario.decision}
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-ink/80 leading-relaxed font-sans">
            {activeScenario.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-ivory border border-bone">
              <span className="text-[11px] text-muted block">Core Silage pH</span>
              <span className="font-mono text-base font-bold text-ink">
                {activeScenario.ph !== null ? activeScenario.ph.toFixed(1) : "N/A"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-ivory border border-bone">
              <span className="text-[11px] text-muted block">Internal Temp</span>
              <span className="font-mono text-base font-bold text-ink">
                {activeScenario.internalTemp !== null ? `${activeScenario.internalTemp}°C` : "N/A"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-ivory border border-bone">
              <span className="text-[11px] text-muted block">Heating ΔT</span>
              <span className="font-mono text-base font-bold text-ink">
                +{activeScenario.deltaT}°C
              </span>
            </div>
            <div className="p-3 rounded-xl bg-ivory border border-bone">
              <span className="text-[11px] text-muted block">Dry Matter</span>
              <span className="font-mono text-base font-bold text-ink">
                {activeScenario.dryMatter}% DM
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-Side: Healthy Silage vs Spoiled Silage Anatomy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">
              Anatomy Comparison: Healthy vs Aerobically Spoiled
            </h2>
            <span className="text-xs text-muted">Agronomic Quality Indicators</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Healthy Silage Column */}
            <div className="rounded-3xl p-6 bg-emerald-950 text-white shadow-card space-y-4 border border-emerald-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-display font-bold text-lg text-white">
                    Healthy Corn Silage
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                  DECISION: FEED
                </span>
              </div>

              {/* Visual simulated canvas representation */}
              <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 border border-emerald-600/30 flex flex-col justify-end">
                <span className="text-xs font-mono text-emerald-200">
                  Visual Hue: Olive-Green to Yellow-Green · Uniform Compaction
                </span>
                <span className="text-[11px] text-emerald-300/80">
                  Aroma: Clean, sweet-acidic lactic vinegar · Zero surface mould
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-emerald-200">Fermentation Acid</span>
                  <span className="font-mono font-bold">Lactic Acid Dominant (&gt;65%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-emerald-200">Silage Core pH</span>
                  <span className="font-mono font-bold text-emerald-300">3.8 – 4.2</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-emerald-200">Thermal Differential</span>
                  <span className="font-mono font-bold">ΔT &lt; 3°C (Cold Stable)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-emerald-200">Aerobic Stability</span>
                  <span className="font-mono font-bold">&gt;72 hours post face opening</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-emerald-200">Dairy Cattle Impact</span>
                  <span className="font-mono font-bold text-emerald-300">High DMI & Peak Milk Yield</span>
                </div>
              </div>
            </div>

            {/* Spoiled Silage Column */}
            <div className="rounded-3xl p-6 bg-stone-900 text-white shadow-card space-y-4 border border-terracotta/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-terracotta" />
                  <h3 className="font-display font-bold text-lg text-white">
                    Spoiled / Heating Silage
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-terracotta text-xs font-mono font-bold">
                  DECISION: DISCARD
                </span>
              </div>

              {/* Visual simulated canvas representation */}
              <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-amber-950 via-stone-900 to-black p-4 border border-stone-700 flex flex-col justify-end">
                <span className="text-xs font-mono text-amber-200">
                  Visual Hue: Dark Brown Slime · White/Blue Spore Colonies
                </span>
                <span className="text-[11px] text-amber-300/80">
                  Aroma: Pungent rancid butter (butyric) & ammonia stench
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-stone-300">Degradation Byproduct</span>
                  <span className="font-mono font-bold text-terracotta">Butyric Acid & Ammonia</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-stone-300">Silage Core pH</span>
                  <span className="font-mono font-bold text-terracotta">5.5 – 6.8</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-stone-300">Thermal Differential</span>
                  <span className="font-mono font-bold text-amber-400">ΔT &gt; +10°C (Active Burning)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-stone-300">Aerobic Stability</span>
                  <span className="font-mono font-bold">&lt;12 hours (Immediate Mold)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-300">Dairy Cattle Impact</span>
                  <span className="font-mono font-bold text-terracotta">Milk Drop (-15%), Acidosis, Ketosis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Direct Action */}
        <div className="p-6 rounded-3xl bg-forest text-white shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl">
              Ready to test a real sample?
            </h3>
            <p className="text-xs text-mist/90 max-w-lg">
              Perform a full offline test run with custom simulated probe values and live camera QA.
            </p>
          </div>

          <Link
            href="/test"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-forest font-bold text-xs shadow-md hover:bg-mist transition-all"
          >
            <span>Begin Interactive Test Flow</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </main>
    </div>
  );
}
