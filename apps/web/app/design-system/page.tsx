"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EvidenceTag, EvidenceTagType } from "@/components/ui/EvidenceTag";
import { StatusChip, StatusLevel } from "@/components/ui/StatusChip";
import { InputCompleteness } from "@/components/ui/InputCompleteness";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { ResultCard } from "@/components/ui/ResultCard";
import { RiskIndicator } from "@/components/ui/RiskIndicator";
import { SyncStatusBadge, SyncStatusType } from "@/lib/sync";
import { LanguageSwitcher, useI18n } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { Check, ShieldCheck, AlertTriangle, AlertCircle, Info, ArrowRight, ArrowLeft } from "lucide-react";

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

  const lightColors = [
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
  ];

  const darkColors = [
    { name: "dark-bg", hex: "#0D1411", text: "text-white" },
    { name: "dark-surface", hex: "#141E1A", text: "text-white" },
    { name: "dark-card", hex: "#1B2A24", text: "text-white" },
    { name: "dark-cardSubtle", hex: "#18241F", text: "text-white" },
    { name: "dark-forest", hex: "#327A5D", text: "text-white" },
    { name: "dark-moss", hex: "#7EAA70", text: "text-dark-bg" },
    { name: "dark-sage", hex: "#9EB698", text: "text-dark-bg" },
    { name: "dark-amber", hex: "#E09C35", text: "text-dark-bg" },
    { name: "dark-terracotta", hex: "#CF6A47", text: "text-white" },
    { name: "dark-ink", hex: "#F5F3EC", text: "text-dark-bg" },
    { name: "dark-muted", hex: "#9EADA3", text: "text-dark-bg" },
    { name: "dark-border", hex: "#273D34", text: "text-white" },
  ];

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-12">
        {/* Breadcrumb & Header */}
        <div className="space-y-4 pb-6 border-b border-bone dark:border-dark-border">
          <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
            <Link href="/" className="hover:text-forest dark:hover:text-dark-forest flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-ink dark:text-dark-ink font-medium">Design System</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest dark:text-dark-forest">
                  FeedShield Design System
                </h1>
                <DemoBadge label="TOKEN SPEC" subtext="FeedShield Editorial AgriTech" />
              </div>
              <p className="text-muted dark:text-dark-muted text-xs sm:text-sm mt-1">
                Component foundations, Liquid Glass tokens, dual light/dark themes, and honest scientific badges.
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* 1. Curated Dual Themes Palette */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-deep dark:text-dark-ink">
              1. Curated AgriTech Dual-Theme Palette
            </h2>
            <span className="text-xs text-muted dark:text-dark-muted">Light + Dark Semantic Contrast</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">Light Palette (Warm Ivory &amp; Botanical)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {lightColors.map((color) => (
                <div
                  key={color.name}
                  className="p-3 rounded-xl border border-bone dark:border-dark-border shadow-subtle flex flex-col justify-between h-20"
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
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">Dark Palette (Deep Mineral Forest &amp; Sage)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {darkColors.map((color) => (
                <div
                  key={color.name}
                  className="p-3 rounded-xl border border-bone dark:border-dark-border shadow-subtle flex flex-col justify-between h-20"
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
          </div>
        </section>

        {/* 2. Canonical Evidence Tags (Section 0.6) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-deep dark:text-dark-ink">
              2. Canonical Evidence Tags (Section 0.6)
            </h2>
            <span className="text-xs text-muted dark:text-dark-muted">Mandatory on every result</span>
          </div>
          <div className="p-6 glass-card rounded-2xl space-y-4">
            <div className="flex flex-wrap gap-3">
              {evidenceTags.map((tag) => (
                <div key={tag} className="flex flex-col items-start gap-1">
                  <EvidenceTag tag={tag} size="md" />
                </div>
              ))}
            </div>

            <div className="p-4 bg-surface/70 dark:bg-dark-card/60 rounded-xl border border-bone dark:border-dark-border text-xs space-y-2 text-ink dark:text-dark-ink">
              <p className="font-semibold text-forest dark:text-dark-forest">Evidence Tag Meaning:</p>
              <ul className="list-disc list-inside space-y-1 text-muted dark:text-dark-muted">
                <li><strong className="text-ink dark:text-dark-ink">DETECTED:</strong> Directly observable visual characteristic (e.g. pellet form).</li>
                <li><strong className="text-ink dark:text-dark-ink">PREDICTED:</strong> Output of trained ML model from validated sensor/NIR spectra.</li>
                <li><strong className="text-ink dark:text-dark-ink">ESTIMATED:</strong> Documented formula, heuristic, or classical CV rule.</li>
                <li><strong className="text-ink dark:text-dark-ink">USER-ENTERED:</strong> Typed in by farmer or lab operator.</li>
                <li><strong className="text-ink dark:text-dark-ink">SENSOR-MEASURED:</strong> Direct reading from pH probe or physical probe.</li>
                <li><strong className="text-ink dark:text-dark-ink">DEMO:</strong> Synthesized demonstration data for trial purposes.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Status Chips & Completeness */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-deep dark:text-dark-ink">
              3. Quality Status Chips
            </h2>
            <div className="p-6 glass-card rounded-2xl flex flex-col gap-3">
              {statusLevels.map((lvl) => (
                <div key={lvl} className="flex items-center justify-between">
                  <StatusChip status={lvl} size="md" />
                  <span className="text-xs text-muted dark:text-dark-muted">Status Level</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-deep dark:text-dark-ink">
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
          <h2 className="text-xl font-display font-semibold text-deep dark:text-dark-ink">
            5. Offline &amp; Sync Indicators
          </h2>
          <div className="p-6 glass-card rounded-2xl flex flex-wrap gap-4">
            {syncStatuses.map((st) => (
              <SyncStatusBadge key={st} status={st} size="md" />
            ))}
          </div>
        </section>

        {/* 6. Liquid Glass Primitives */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-deep dark:text-dark-ink">
            6. Liquid Glass Surfaces (Restrained, No Nesting)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard variant="frosted" className="p-5">
              <h3 className="text-sm font-semibold text-forest dark:text-dark-forest mb-1">Frosted Glass</h3>
              <p className="text-xs text-muted dark:text-dark-muted mb-3">
                Used on top navigation, modal dialogs, and verification hero cards.
              </p>
              <EvidenceTag tag="PREDICTED" size="sm" />
            </GlassCard>

            <GlassCard variant="solid" className="p-5">
              <h3 className="text-sm font-semibold text-deep dark:text-dark-ink mb-1">Solid Fallback</h3>
              <p className="text-xs text-muted dark:text-dark-muted mb-3">
                Main content container surface honoring reduced transparency.
              </p>
              <StatusChip status="GOOD" size="sm" />
            </GlassCard>

            <GlassCard variant="hero" className="p-5">
              <h3 className="text-sm font-semibold text-forest dark:text-dark-forest mb-1">Hero Result Glass</h3>
              <p className="text-xs text-muted dark:text-dark-muted mb-3">
                Result overlay with high contrast and subtle shadow elevation.
              </p>
              <DemoBadge />
            </GlassCard>
          </div>
        </section>

        {/* 7. Action Controls */}
        <section className="space-y-4 pb-8">
          <h2 className="text-xl font-display font-semibold text-deep dark:text-dark-ink">
            7. Controls &amp; Action Buttons (&gt;= 48px Mobile Targets)
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <button className="h-12 px-6 bg-forest hover:bg-deep dark:bg-dark-forest dark:hover:bg-forest text-white rounded-full font-medium shadow-card transition-all flex items-center gap-2">
              <span>{t("farmer.startTest")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="h-12 px-6 bg-surface dark:bg-dark-card hover:bg-mist dark:hover:bg-dark-cardSubtle text-ink dark:text-dark-ink border border-bone dark:border-dark-border rounded-full font-medium transition-all">
              {t("common.actions.retake")}
            </button>
            <button className="h-12 px-6 border border-forest/30 dark:border-dark-forest/40 text-forest dark:text-dark-forest hover:bg-forest/5 dark:hover:bg-dark-forest/10 rounded-full font-medium transition-all">
              {t("common.actions.download")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
