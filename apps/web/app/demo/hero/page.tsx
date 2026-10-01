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
import {
  ProductCarousel,
  CarouselItem,
  SmoothDrawer,
  drawerItemVariants,
} from "@/components/ui/liquid-glass";
import { motion } from "framer-motion";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inspectedScenario, setInspectedScenario] = useState<(typeof DEMO_SCENARIOS)[0] | null>(null);

  const scenarioCarouselItems: CarouselItem[] = DEMO_SCENARIOS.map((sc) => {
    const metrics = [];
    if (sc.ph !== null) {
      metrics.push({ label: "pH", value: sc.ph.toFixed(1), unit: "pH" });
    }
    if (sc.internalTemp !== null) {
      metrics.push({ label: "Core Temp", value: `${sc.internalTemp}°C` });
      metrics.push({ label: "ΔT", value: `+${sc.deltaT}°C` });
    }
    if (sc.dryMatter !== null) {
      metrics.push({ label: "DM", value: `${sc.dryMatter}%` });
    }

    const isCurrent = activeScenario.id === sc.id;

    return {
      id: sc.id,
      title: sc.crop,
      subtitle: sc.name,
      sampleType: sc.type,
      status: sc.risk as any,
      decision: sc.decision as any,
      evidenceTag: "DEMO",
      isDemo: true,
      metrics,
      badge: isCurrent ? "Active Benchmark" : undefined,
      onClick: () => {
        setActiveScenario(sc);
        setInspectedScenario(sc);
        setIsDrawerOpen(true);
      },
      actionLabel: "Inspect Details",
      secondaryActionLabel: isCurrent ? "Selected" : "Select Case",
    };
  });

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
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-moss dark:text-emerald-400">
                SIH26111 Judges Showcase
              </span>
              <DemoBadge label="5-SCENARIO SUITE" size="sm" />
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-ink dark:text-dark-ink tracking-tight mt-1">
              Hero Demo: Healthy vs Spoiled Silage
            </h1>
            <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">
              Live interactive comparison without login. Demonstrates worst supported hazard fusion and instant farmer advisory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/demo/tour"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <Compass className="w-4 h-4 text-mist" />
              <span>Launch 3-Min Judge Tour</span>
            </Link>

            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink hover:bg-bone dark:hover:bg-dark-card text-xs font-medium transition-colors"
              title="Reset local demo database"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted dark:text-dark-muted" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-forest dark:text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-moss dark:text-emerald-400 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* 5 Scenario Horizontal Carousel */}
        <div className="space-y-2">
          <ProductCarousel
            title="Benchmark Scenario Suite"
            subtitle="Horizontally browse 5 pre-configured ground-truth and failure cases"
            items={scenarioCarouselItems}
            onItemClick={(item) => {
              const sc = DEMO_SCENARIOS.find((s) => s.id === item.id);
              if (sc) {
                setActiveScenario(sc);
                setInspectedScenario(sc);
                setIsDrawerOpen(true);
              }
            }}
          />
        </div>

        {/* 5 Scenario Quick Selector Tabs */}
        <div className="glass-card p-3 rounded-2xl border border-bone dark:border-dark-border shadow-card flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenario(sc)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-forest dark:bg-emerald-600 text-white shadow-sm"
                    : "bg-ivory dark:bg-dark-card hover:bg-bone dark:hover:bg-dark-surface text-ink dark:text-dark-ink border border-bone dark:border-dark-border"
                }`}
              >
                {sc.name}
              </button>
            );
          })}
        </div>

        {/* Active Scenario Live Card with Liquid Glass Elevation */}
        <div className="glass-card-hero rounded-3xl p-6 sm:p-8 border-2 border-forest/20 dark:border-emerald-500/30 shadow-float space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-forest dark:text-emerald-400 uppercase tracking-wider block">
                ACTIVE BENCHMARK CASE
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mt-0.5">
                {activeScenario.crop}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <StatusChip status={activeScenario.risk as any} size="md" />
              <div className="px-3 py-1 rounded-xl bg-forest dark:bg-emerald-600 text-white font-mono font-bold text-xs">
                ACTION: {activeScenario.decision}
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-ink/80 dark:text-dark-ink/80 leading-relaxed font-sans">
            {activeScenario.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border">
              <span className="text-[11px] text-muted dark:text-dark-muted block">Core Silage pH</span>
              <span className="font-mono text-base font-bold text-ink dark:text-dark-ink">
                {activeScenario.ph !== null ? activeScenario.ph.toFixed(1) : "N/A"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border">
              <span className="text-[11px] text-muted dark:text-dark-muted block">Internal Temp</span>
              <span className="font-mono text-base font-bold text-ink dark:text-dark-ink">
                {activeScenario.internalTemp !== null ? `${activeScenario.internalTemp}°C` : "N/A"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border">
              <span className="text-[11px] text-muted dark:text-dark-muted block">Heating ΔT</span>
              <span className="font-mono text-base font-bold text-ink dark:text-dark-ink">
                +{activeScenario.deltaT}°C
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory/80 dark:bg-dark-card border border-bone dark:border-dark-border">
              <span className="text-[11px] text-muted dark:text-dark-muted block">Dry Matter</span>
              <span className="font-mono text-base font-bold text-ink dark:text-dark-ink">
                {activeScenario.dryMatter}% DM
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-Side: Healthy Silage vs Spoiled Silage Anatomy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink dark:text-dark-ink">
              Anatomy Comparison: Healthy vs Aerobically Spoiled
            </h2>
            <span className="text-xs text-muted dark:text-dark-muted">Agronomic Quality Indicators</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Healthy Silage Column */}
            <div className="rounded-3xl p-6 sm:p-7 bg-emerald-950 dark:bg-[#0a1a12] text-white shadow-float space-y-4 border border-emerald-600/40">
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
            <div className="rounded-3xl p-6 sm:p-7 bg-stone-900 dark:bg-[#18110e] text-white shadow-float space-y-4 border border-terracotta/40">
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
        <div className="p-6 sm:p-8 rounded-3xl bg-forest dark:bg-[#12241b] text-white shadow-float flex flex-col sm:flex-row items-center justify-between gap-4 border border-forest-border/40 dark:border-emerald-500/20">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl">
              Ready to test a real sample?
            </h3>
            <p className="text-xs sm:text-sm text-mist/90 dark:text-sage-light/80 max-w-lg">
              Perform a full offline test run with custom simulated probe values and live camera QA.
            </p>
          </div>

          <Link
            href="/test"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-dark-ink text-forest dark:text-dark-surface font-bold text-xs shadow-md hover:bg-mist transition-all"
          >
            <span>Begin Interactive Test Flow</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Scenario Inspection Smooth Drawer */}
        <SmoothDrawer
          isOpen={isDrawerOpen && inspectedScenario !== null}
          onClose={() => setIsDrawerOpen(false)}
          title={inspectedScenario?.crop}
          subtitle={inspectedScenario?.name}
          icon={
            inspectedScenario?.type === "silage" ? (
              <Thermometer className="w-5 h-5 text-forest dark:text-emerald-400" />
            ) : (
              <Layers className="w-5 h-5 text-amber-500" />
            )
          }
          badge={
            inspectedScenario && (
              <>
                <DemoBadge label="DEMO" size="sm" />
                <StatusChip status={inspectedScenario.risk as any} size="sm" />
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-forest/10 dark:bg-emerald-500/10 text-forest dark:text-emerald-300 border border-forest/20">
                  ACTION: {inspectedScenario.decision}
                </span>
              </>
            )
          }
          primaryAction={{
            label: "Activate Benchmark Case",
            onClick: () => {
              if (inspectedScenario) {
                setActiveScenario(inspectedScenario);
                setIsDrawerOpen(false);
              }
            },
          }}
          secondaryAction={{
            label: "Close",
            onClick: () => setIsDrawerOpen(false),
          }}
        >
          {inspectedScenario && (
            <>
              <motion.div
                variants={drawerItemVariants}
                className="p-4 rounded-2xl bg-bg-1/80 dark:bg-bg-1/90 border border-edge space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
                    Scenario Dynamics
                  </span>
                  <StatusChip status={inspectedScenario.risk as any} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-ink-1 leading-relaxed">
                  {inspectedScenario.summary}
                </p>
              </motion.div>

              <motion.div variants={drawerItemVariants} className="space-y-2">
                <h4 className="text-xs font-bold text-ink-2 uppercase tracking-wider font-mono">
                  Benchmark Sensor Parameters
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {inspectedScenario.ph !== null && (
                    <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
                      <span className="text-[11px] text-ink-3 block font-mono">Core pH</span>
                      <span className="text-base font-bold text-ink-1">{inspectedScenario.ph.toFixed(1)} pH</span>
                      <div className="mt-1">
                        <EvidenceTag tag="DEMO" size="sm" />
                      </div>
                    </div>
                  )}
                  {inspectedScenario.internalTemp !== null && (
                    <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
                      <span className="text-[11px] text-ink-3 block font-mono">Internal Temp</span>
                      <span className="text-base font-bold text-ink-1">{inspectedScenario.internalTemp}°C</span>
                      <div className="mt-1">
                        <EvidenceTag tag="DEMO" size="sm" />
                      </div>
                    </div>
                  )}
                  {inspectedScenario.deltaT > 0 && (
                    <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
                      <span className="text-[11px] text-ink-3 block font-mono">Thermal Differential (ΔT)</span>
                      <span className="text-base font-bold text-amber-700 dark:text-amber-400">+{inspectedScenario.deltaT}°C</span>
                      <div className="mt-1">
                        <EvidenceTag tag="ESTIMATED" size="sm" />
                      </div>
                    </div>
                  )}
                  {inspectedScenario.dryMatter !== null && (
                    <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
                      <span className="text-[11px] text-ink-3 block font-mono">Dry Matter</span>
                      <span className="text-base font-bold text-ink-1">{inspectedScenario.dryMatter}%</span>
                      <div className="mt-1">
                        <EvidenceTag tag="DEMO" size="sm" />
                      </div>
                    </div>
                  )}
                  <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
                    <span className="text-[11px] text-ink-3 block font-mono">Mould Exposure</span>
                    <span className="text-base font-bold text-ink-1">{inspectedScenario.mouldPct}%</span>
                    <div className="mt-1">
                      <EvidenceTag tag="DETECTED" size="sm" />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={drawerItemVariants}
                className="p-3 rounded-2xl bg-forest/5 dark:bg-emerald-500/10 border border-forest/15 dark:border-emerald-500/20 text-xs text-ink-2 leading-relaxed"
              >
                Confirmatory laboratory test recommended for suspect adulteration or severe spoilage.
              </motion.div>
            </>
          )}
        </SmoothDrawer>
      </main>
    </div>
  );
}
