"use client";

import React, { useState } from "react";
import { EvidenceTag, EvidenceTagType } from "@/components/ui/EvidenceTag";
import { StatusChip, StatusLevel } from "@/components/ui/StatusChip";
import { InputCompleteness } from "@/components/ui/InputCompleteness";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SyncStatusBadge, SyncStatusType } from "@/lib/sync";
import { LanguageSwitcher, useI18n } from "@/lib/i18n";
import { Check, ShieldCheck, AlertTriangle, AlertCircle, Info, ArrowRight } from "lucide-react";

export default function DesignSystemPage() {
  const { t } = useI18n();
  const [selectedTag, setSelectedTag] = useState<string>("PREDICTED");

  const evidenceTags: EvidenceTagType[] = [
    "DETECTED",
    "PREDICTED",
    "ESTIMATED",
    "USER-ENTERED",
    "SENSOR-MEASURED",
    "DEMO",
  ];

  const statusLevels: StatusLevel[] = [
    "GOOD",
    "ATTENTION",
    "HIGH RISK",
    "INDETERMINATE",
  ];

  const syncStatuses: SyncStatusType[] = [
    "SAVED_ON_DEVICE",
    "QUEUED",
    "SYNCING",
    "SYNCED",
    "FAILED",
  ];

  return (
    <div className="min-h-screen bg-ivory p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-bone">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-forest">
                FeedShield Design System
              </h1>
              <DemoBadge label="TOKEN SPEC" subtext="FeedShield Editorial AgriTech" />
            </div>
            <p className="text-muted text-sm mt-1">
              Component foundations, accessibility fallbacks, and honest scientific badges
            </p>
          </div>
          <LanguageSwitcher />
        </header>

        {/* 1. Palette & Color Tokens */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-deep">1. Curated AgriTech Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: "ivory", hex: "#FAF6EC", text: "text-ink" },
              { name: "bone", hex: "#F3EDDD", text: "text-ink" },
              { name: "surface", hex: "#FFFDF7", text: "text-ink" },
              { name: "forest", hex: "#1F4D3A", text: "text-white" },
              { name: "deep", hex: "#143628", text: "text-white" },
              { name: "moss", hex: "#6B8F5E", text: "text-white" },
              { name: "sage", hex: "#A9BFA0", text: "text-ink" },
              { name: "mist", hex: "#E4EBDD", text: "text-ink" },
              { name: "amber", hex: "#C98A2B", text: "text-white" },
              { name: "terracotta", hex: "#B95C3A", text: "text-white" },
              { name: "ink", hex: "#23302A", text: "text-white" },
              { name: "muted", hex: "#6E7A70", text: "text-white" },
            ].map((color) => (
              <div
                key={color.name}
                className="p-3 rounded-xl border border-bone shadow-subtle flex flex-col justify-between h-24"
                style={{ backgroundColor: color.hex }}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${color.text}`}>
                  {color.name}
                </span>
                <span className={`text-[11px] font-mono opacity-80 ${color.text}`}>
                  {color.hex}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Evidence Tags (All 6 canonical tags) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-deep">
              2. Canonical Evidence Tags (Section 0.6)
            </h2>
            <span className="text-xs text-muted">Mandatory on every result</span>
          </div>
          <div className="p-6 bg-surface rounded-2xl border border-bone shadow-subtle">
            <div className="flex flex-wrap gap-3 mb-6">
              {evidenceTags.map((tag) => (
                <div key={tag} className="flex flex-col items-start gap-1">
                  <EvidenceTag tag={tag} size="md" />
                </div>
              ))}
            </div>

            <div className="p-4 bg-ivory rounded-xl border border-bone text-xs space-y-2 text-ink">
              <p className="font-semibold text-forest">Evidence Tag Meaning:</p>
              <ul className="list-disc list-inside space-y-1 text-muted">
                <li><strong className="text-ink">DETECTED:</strong> Directly observable visual characteristic (e.g. pellet form).</li>
                <li><strong className="text-ink">PREDICTED:</strong> Output of trained ML model from validated sensor/NIR spectra.</li>
                <li><strong className="text-ink">ESTIMATED:</strong> Documented formula, heuristic, or classical CV rule.</li>
                <li><strong className="text-ink">USER-ENTERED:</strong> Typed in by farmer or lab operator.</li>
                <li><strong className="text-ink">SENSOR-MEASURED:</strong> Direct reading from pH probe or physical probe.</li>
                <li><strong className="text-ink">DEMO:</strong> Synthesized demonstration data for trial purposes.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Status Chips & Completeness */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-deep">
              3. Quality Status Chips
            </h2>
            <div className="p-6 bg-surface rounded-2xl border border-bone shadow-subtle flex flex-col gap-3">
              {statusLevels.map((lvl) => (
                <div key={lvl} className="flex items-center justify-between">
                  <StatusChip status={lvl} size="md" />
                  <span className="text-xs text-muted">Status Level</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-deep">
              4. Input Completeness
            </h2>
            <InputCompleteness
              modalitiesUsed={["rgb", "sensors"]}
              modalitiesMissing={["nir", "assay"]}
              score={0.5}
            />
          </div>
        </section>

        {/* 5. Sync States & Outbox Badges */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-deep">
            5. Offline & Sync Indicators
          </h2>
          <div className="p-6 bg-surface rounded-2xl border border-bone shadow-subtle flex flex-wrap gap-4">
            {syncStatuses.map((st) => (
              <SyncStatusBadge key={st} status={st} size="md" />
            ))}
          </div>
        </section>

        {/* 6. Glass Surfaces with Solid Fallback */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-deep">
            6. Frosted Glass Surfaces (Restrained, No Nesting)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard variant="frosted" className="p-5">
              <h3 className="text-sm font-semibold text-forest mb-1">Frosted Glass</h3>
              <p className="text-xs text-muted mb-3">
                Used on top navigation, modal dialogs, and verification hero cards.
              </p>
              <EvidenceTag tag="PREDICTED" size="sm" />
            </GlassCard>

            <GlassCard variant="solid" className="p-5">
              <h3 className="text-sm font-semibold text-deep mb-1">Solid Fallback</h3>
              <p className="text-xs text-muted mb-3">
                Main content container surface honoring reduced transparency.
              </p>
              <StatusChip status="GOOD" size="sm" />
            </GlassCard>

            <GlassCard variant="hero" className="p-5">
              <h3 className="text-sm font-semibold text-forest mb-1">Hero Result Glass</h3>
              <p className="text-xs text-muted mb-3">
                Result overlay with high contrast and subtle shadow elevation.
              </p>
              <DemoBadge />
            </GlassCard>
          </div>
        </section>

        {/* 7. Action Buttons & Touch Targets */}
        <section className="space-y-4 pb-8">
          <h2 className="text-xl font-display font-semibold text-deep">
            7. Controls & Action Buttons (&gt;= 48px Mobile Targets)
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <button className="h-12 px-6 bg-forest hover:bg-deep text-white rounded-full font-medium shadow-card transition-all flex items-center gap-2">
              <span>{t("farmer.startTest")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="h-12 px-6 bg-bone hover:bg-mist text-ink rounded-full font-medium transition-all">
              {t("common.actions.retake")}
            </button>
            <button className="h-12 px-6 border border-forest/30 text-forest hover:bg-forest/5 rounded-full font-medium transition-all">
              {t("common.actions.download")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
