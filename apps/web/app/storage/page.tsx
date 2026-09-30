"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  Thermometer,
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

interface StoragePit {
  id: string;
  name: string;
  type: string;
  crop: string;
  capacity_tons: number;
  internal_temp: number;
  ambient_temp: number;
  delta_t: number;
  ph: number;
  heating_rate: number;
  status: "GOOD" | "ATTENTION" | "HIGH RISK";
  alert_title?: string;
  recommendation?: string;
}

const DEMO_PITS: StoragePit[] = [
  {
    id: "pit-01",
    name: "Bunker Silo A - Corn [DEMO]",
    type: "Bunker Silo",
    crop: "Corn Silage (Optimal Core)",
    capacity_tons: 60.0,
    internal_temp: 26.5,
    ambient_temp: 25.0,
    delta_t: 1.5,
    ph: 3.9,
    heating_rate: 0.1,
    status: "GOOD",
    alert_title: "Fermentation Cold Core Stable",
    recommendation: "Maintain front face seal; advance feedout at 15–20 cm per day.",
  },
  {
    id: "pit-02",
    name: "Pit Silo B - Sorghum [DEMO]",
    type: "Trench Pit",
    crop: "Sorghum Silage (Shoulder)",
    capacity_tons: 35.0,
    internal_temp: 41.0,
    ambient_temp: 26.0,
    delta_t: 15.0,
    ph: 5.4,
    heating_rate: 2.8,
    status: "ATTENTION",
    alert_title: "Aerobic Core Heating Detected (+15°C)",
    recommendation: "Inspect shoulder plastic seal for rodent or wind tears. Trim deteriorating outer layer.",
  },
  {
    id: "pit-03",
    name: "Central Cooperative Silage Bunker 1 [DEMO]",
    type: "Commercial Bunker",
    crop: "Corn Silage (Mixed Cut)",
    capacity_tons: 250.0,
    internal_temp: 33.0,
    ambient_temp: 25.0,
    delta_t: 8.0,
    ph: 5.9,
    heating_rate: 0.9,
    status: "HIGH RISK",
    alert_title: "Secondary Clostridial Spoilage Risk",
    recommendation: "Elevated pH (5.9) indicates butyric fermentation. Discard spoiled patches; do not feed to transition cows.",
  },
];

export default function StorageMonitoringPage() {
  const [pits] = useState<StoragePit[]>(DEMO_PITS);
  const [selectedPit, setSelectedPit] = useState<StoragePit>(DEMO_PITS[1]);

  return (
    <div className="min-h-screen pb-16 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-mono font-semibold text-forest dark:text-dark-forest">
                Storage & Silage Monitoring
              </span>
              <DemoBadge label="SIMULATED IOT" />
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-forest dark:text-dark-ink tracking-tight">
              Bunker & Pit Sensor Telemetry
            </h1>
            <p className="text-xs md:text-sm text-muted dark:text-dark-muted font-sans">
              Continuous thermal differential (ΔT) tracking, pH decay curves, and early aerobic ingress detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-bone/80 dark:bg-dark-card text-ink dark:text-dark-ink px-2.5 py-1 rounded-lg border border-bone dark:border-white/10">
              Sensor Health: 3/3 Probes Active
            </span>
          </div>
        </div>

        {/* Selected Pit Live Telemetry Hero */}
        <GlassCard variant="hero" className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-bone/80 dark:border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl md:text-2xl text-forest dark:text-dark-ink">
                  {selectedPit.name}
                </h2>
                <StatusChip status={selectedPit.status} size="sm" />
              </div>
              <p className="text-xs text-muted dark:text-dark-muted mt-1">
                {selectedPit.crop} · Capacity: {selectedPit.capacity_tons} tons
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-muted dark:text-dark-muted block">Current Status</span>
              <span
                className={`text-sm font-bold font-sans ${
                  selectedPit.status === "GOOD"
                    ? "text-forest dark:text-emerald-400"
                    : selectedPit.status === "ATTENTION"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {selectedPit.alert_title}
              </span>
            </div>
          </div>

          {/* 4 Sensor Telemetry Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-surface/90 dark:bg-dark-card border border-bone/80 dark:border-white/10">
              <div className="flex items-center justify-between text-muted dark:text-dark-muted mb-1">
                <span className="text-xs">Internal Temp</span>
                <Thermometer className="w-3.5 h-3.5" />
              </div>
              <span className="font-display font-bold text-2xl text-forest dark:text-dark-ink block">
                {selectedPit.internal_temp}°C
              </span>
              <span className="text-[10px] text-muted dark:text-dark-muted">
                Ambient: {selectedPit.ambient_temp}°C
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface/90 dark:bg-dark-card border border-bone/80 dark:border-white/10">
              <div className="flex items-center justify-between text-muted dark:text-dark-muted mb-1">
                <span className="text-xs">Heating ΔT</span>
                <Flame className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span
                className={`font-display font-bold text-2xl block ${
                  selectedPit.delta_t > 10
                    ? "text-rose-600 dark:text-rose-400"
                    : selectedPit.delta_t > 5
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-forest dark:text-emerald-400"
                }`}
              >
                +{selectedPit.delta_t}°C
              </span>
              <span className="text-[10px] text-muted dark:text-dark-muted">
                Rate: +{selectedPit.heating_rate}°C/day
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface/90 dark:bg-dark-card border border-bone/80 dark:border-white/10">
              <div className="flex items-center justify-between text-muted dark:text-dark-muted mb-1">
                <span className="text-xs">Core pH</span>
                <Activity className="w-3.5 h-3.5 text-forest" />
              </div>
              <span className="font-display font-bold text-2xl text-forest dark:text-dark-ink block">
                {selectedPit.ph.toFixed(1)}
              </span>
              <span className="text-[10px] text-muted dark:text-dark-muted">
                {selectedPit.ph <= 4.2 ? "Optimal Fermentation" : "Elevated pH Risk"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface/90 dark:bg-dark-card border border-bone/80 dark:border-white/10">
              <div className="flex items-center justify-between text-muted dark:text-dark-muted mb-1">
                <span className="text-xs">Probe Telemetry</span>
                <Activity className="w-3.5 h-3.5 text-moss" />
              </div>
              <span className="font-mono font-bold text-base text-forest dark:text-emerald-400 block mt-1">
                LIVE 99.4%
              </span>
              <span className="text-[10px] text-muted dark:text-dark-muted">Battery: 3.9V (Solar OK)</span>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="p-3.5 rounded-xl bg-forest/5 dark:bg-dark-forest/15 border border-forest/20 dark:border-dark-forest/30 flex items-start gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-forest dark:text-emerald-300 block">Agronomic Recommendation</span>
              <p className="text-ink/80 dark:text-dark-ink/80 mt-0.5">{selectedPit.recommendation}</p>
            </div>
          </div>
        </GlassCard>

        {/* All Monitored Pits List */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-ink dark:text-dark-ink">All Storage Units</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pits.map((pit) => (
              <GlassCard
                key={pit.id}
                variant="frosted"
                onClick={() => setSelectedPit(pit)}
                className={`p-4 cursor-pointer transition-all hover:scale-[1.01] border-2 ${
                  selectedPit.id === pit.id
                    ? "border-forest dark:border-dark-forest bg-forest/5 dark:bg-dark-forest/10"
                    : "border-bone/80 dark:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm text-ink dark:text-dark-ink">{pit.name}</h4>
                  <StatusChip status={pit.status} size="sm" />
                </div>
                <div className="text-xs space-y-1 font-mono text-muted dark:text-dark-muted">
                  <div className="flex justify-between">
                    <span>Core Temp:</span>
                    <span className="text-ink dark:text-dark-ink font-bold">{pit.internal_temp}°C (ΔT +{pit.delta_t}°C)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>pH Reading:</span>
                    <span className="text-ink dark:text-dark-ink font-bold">{pit.ph.toFixed(1)}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
