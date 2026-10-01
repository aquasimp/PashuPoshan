"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EvidenceTag, EvidenceTagType } from "@/components/ui/EvidenceTag";
import { StatusChip, StatusLevel } from "@/components/ui/StatusChip";
import { InputCompleteness } from "@/components/ui/InputCompleteness";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { SyncStatusBadge, SyncStatusType } from "@/lib/sync";
import { LanguageSwitcher, useI18n } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import {
  LiquidGlass,
  LiquidGlassCard,
  LiquidGlassPanel,
  LiquidGlassButton,
  LiquidGlassPill,
  Modal,
  Sheet,
  ProductCarousel,
  CarouselItem,
  SmoothDrawer,
  SampleDetailDrawer,
  drawerItemVariants,
} from "@/components/ui/liquid-glass";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Layers, Sliders, ShieldCheck, Eye, Activity, Info, AlertTriangle } from "lucide-react";

export default function DesignSystemPage() {
  const { t } = useI18n();
  const [selectedTag, setSelectedTag] = useState<string>("PREDICTED");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSmoothDrawerOpen, setIsSmoothDrawerOpen] = useState(false);
  const [isSampleDrawerOpen, setIsSampleDrawerOpen] = useState(false);
  const [carouselStateTab, setCarouselStateTab] = useState<"standard" | "loading" | "empty" | "error">("standard");

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
    { name: "bg-0", hex: "#FAF6EC", text: "text-ink-1" },
    { name: "bg-1", hex: "#F3EDDD", text: "text-ink-1" },
    { name: "surface", hex: "#FFFDF7", text: "text-ink-1" },
    { name: "forest", hex: "#1F4D3A", text: "text-white" },
    { name: "moss", hex: "#6B8F5E", text: "text-white" },
    { name: "amber", hex: "#C98A2B", text: "text-white" },
    { name: "terracotta", hex: "#B95C3A", text: "text-white" },
    { name: "ink-1", hex: "#23302A", text: "text-white" },
  ];

  const darkColors = [
    { name: "bg-0", hex: "#030303", text: "text-white" },
    { name: "bg-1", hex: "#0A0D0B", text: "text-white" },
    { name: "glass-1", hex: "#0F1411", text: "text-white" },
    { name: "glass-2", hex: "#161D18", text: "text-white" },
    { name: "glass-3", hex: "#1E2821", text: "text-white" },
    { name: "primary", hex: "#2F6B52", text: "text-white" },
    { name: "amber", hex: "#DDA245", text: "text-black" },
    { name: "ink-1", hex: "#F3EDDD", text: "text-black" },
  ];

  const demoDrawerSample = {
    id: "DEMO-DS-01",
    clientId: "client-ds-01",
    cropOrFeedName: "Corn Silage Pit Alpha (High-Density Pack)",
    sampleType: "silage" as const,
    physicalForm: "chopped",
    collectedAt: "2026-10-02T10:30:00.000Z",
    updatedAt: "2026-10-02T10:30:00.000Z",
    notes: "Demonstration benchmark sample showing liquid-glass bottom-sheet telemetry integration.",
    syncStatus: "SYNCED" as const,
    photoUri: "/images/silage-good.svg",
  };

  const demoDrawerAnalysis = {
    id: "analysis-ds-01",
    sampleId: "DEMO-DS-01",
    evaluatedAt: "2026-10-02T10:30:05.000Z",
    overallRisk: "ATTENTION",
    actionDecision: "AERATION_CHECK",
    fliegScore: 78,
    silagePh: 4.1,
    spoilageProbability: 0.18,
    aflatoxinRiskLevel: "LOW",
    confidenceInterval: "MODERATE",
    modelSignature: "sha256-demo-ensemble-v2.1",
    recommendationSummary: "Maintain airtight cover; inspect edge compaction to minimize secondary fermentation.",
  };

  const carouselItemsLong: CarouselItem[] = [
    {
      id: "DS-ITEM-01",
      title: "Corn Silage Pit Alpha (Long English: High Quality Fermentation Assessment)",
      subtitle: "SILAGE • Oct 2, 2026",
      qualityStatus: "EXCELLENT",
      riskState: "NORMAL",
      evidenceTag: "PREDICTED",
      isDemo: true,
      imageSrc: "/images/silage-good.svg",
      actionLabel: "Inspect Analysis",
      onAction: () => setIsSampleDrawerOpen(true),
    },
    {
      id: "DS-ITEM-02",
      title: "मक्के का साइलेज — अत्यधिक नमी और एरोबिक हीटिंग का जोखिम (Long Hindi String Verification)",
      subtitle: "साइलेज • 02 अक्टूबर 2026",
      qualityStatus: "WARNING",
      riskState: "ATTENTION",
      evidenceTag: "DETECTED",
      isDemo: true,
      imageSrc: "/images/silage-heating.svg",
      actionLabel: "जाँचें (Inspect)",
      onAction: () => setIsSampleDrawerOpen(true),
    },
    {
      id: "DS-ITEM-03",
      title: "Commercial Cattle Feed Pellet Batch #449 (Hinglish: Storage me dampness detect hui hai, aerobic heating precaution required)",
      subtitle: "FEED • Oct 1, 2026",
      qualityStatus: "CRITICAL",
      riskState: "HIGH RISK",
      evidenceTag: "SENSOR-MEASURED",
      isDemo: true,
      imageSrc: "/images/feed-sample.svg",
      actionLabel: "Quick View",
      onAction: () => setIsSampleDrawerOpen(true),
    },
    {
      id: "DS-ITEM-04",
      title: "Sorghum Trench Silage Layer 3 (Optimal Moisture Pack)",
      subtitle: "SILAGE • Sep 29, 2026",
      qualityStatus: "GOOD",
      riskState: "NORMAL",
      evidenceTag: "ESTIMATED",
      isDemo: true,
      imageSrc: "/images/silage-good.svg",
      actionLabel: "Quick View",
      onAction: () => setIsSampleDrawerOpen(true),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-0 text-ink-1 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink-1">
                  FeedShield Design System
                </h1>
                <DemoBadge label="TOKEN SPEC" subtext="FeedShield Editorial AgriTech" />
              </div>
              <p className="text-ink-2 text-xs sm:text-sm mt-1">
                Component foundations, Liquid Glass tokens (3 levels + solid fallback), pitch-black dark mode, and honest scientific badges.
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* 1. Curated Dual Themes Palette */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-ink-1">
              1. Curated AgriTech Dual-Theme Palette
            </h2>
            <span className="text-xs text-ink-2">Light + Dark Semantic Contrast</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2">Light Palette (Warm Ivory &amp; Botanical)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {lightColors.map((color) => (
                <div
                  key={color.name}
                  className="p-3 rounded-2xl border border-edge shadow-subtle flex flex-col justify-between h-20"
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2">Dark Palette (Obsidian Base #030303 &amp; Mineral Glass)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {darkColors.map((color) => (
                <div
                  key={color.name}
                  className="p-3 rounded-2xl border border-edge shadow-subtle flex flex-col justify-between h-20"
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

        {/* 2. Liquid Glass Primitives (Section 4) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-ink-1">
              2. Liquid Glass System (3 Surface Levels + Solid Fallback)
            </h2>
            <span className="text-xs text-ink-2">Section 4.2 Tokens</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LiquidGlassCard level={1} className="p-5">
              <span className="text-[11px] font-mono font-bold text-forest dark:text-emerald-400 block mb-1">
                LEVEL 1: SURFACE
              </span>
              <h3 className="text-sm font-semibold text-ink-1 mb-1">Glass Surface 1</h3>
              <p className="text-xs text-ink-2 mb-3 leading-relaxed">
                Base card surface (64% dark / 62% light). 14px blur cap.
              </p>
              <LiquidGlassPill size="sm" variant="info">Level 1 Token</LiquidGlassPill>
            </LiquidGlassCard>

            <LiquidGlassCard level={2} className="p-5">
              <span className="text-[11px] font-mono font-bold text-forest dark:text-emerald-400 block mb-1">
                LEVEL 2: ELEVATED
              </span>
              <h3 className="text-sm font-semibold text-ink-1 mb-1">Glass Surface 2</h3>
              <p className="text-xs text-ink-2 mb-3 leading-relaxed">
                Elevated panels and key callout cards (72% dark / 78% light).
              </p>
              <LiquidGlassPill size="sm" variant="success">Level 2 Token</LiquidGlassPill>
            </LiquidGlassCard>

            <LiquidGlassCard level={3} className="p-5">
              <span className="text-[11px] font-mono font-bold text-forest dark:text-emerald-400 block mb-1">
                LEVEL 3: MODAL / NAV
              </span>
              <h3 className="text-sm font-semibold text-ink-1 mb-1">Glass Surface 3</h3>
              <p className="text-xs text-ink-2 mb-3 leading-relaxed">
                High-contrast navigation, sheets, and dialogs (82% dark / 88% light).
              </p>
              <LiquidGlassPill size="sm" variant="warning">Level 3 Token</LiquidGlassPill>
            </LiquidGlassCard>

            <LiquidGlassCard solidFallback={true} className="p-5">
              <span className="text-[11px] font-mono font-bold text-muted block mb-1">
                FALLBACK
              </span>
              <h3 className="text-sm font-semibold text-ink-1 mb-1">Solid Fallback</h3>
              <p className="text-xs text-ink-2 mb-3 leading-relaxed">
                Honors prefers-reduced-transparency &amp; unsupported browsers.
              </p>
              <LiquidGlassPill size="sm">Solid bg-1</LiquidGlassPill>
            </LiquidGlassCard>
          </div>
        </section>

        {/* 3. Liquid Glass Buttons (Section 5.2) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-ink-1">
              3. Liquid Glass Buttons (&gt;= 48px Touch Targets)
            </h2>
            <span className="text-xs text-ink-2">Section 5.2 tactile specifications</span>
          </div>

          <div className="p-6 glass-surface-1 rounded-3xl border border-edge space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <LiquidGlassButton variant="primary">
                Primary Button
              </LiquidGlassButton>
              <LiquidGlassButton variant="secondary">
                Secondary Glass
              </LiquidGlassButton>
              <LiquidGlassButton variant="danger">
                Danger Action
              </LiquidGlassButton>
              <LiquidGlassButton variant="ghost">
                Ghost Control
              </LiquidGlassButton>
            </div>

            <div className="pt-2 border-t border-edge">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-2 mb-3">
                Devanagari &amp; Multilingual Resilience (No Clipping, Balanced Text)
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <LiquidGlassButton variant="primary">
                  नया टेस्ट शुरू करें
                </LiquidGlassButton>
                <LiquidGlassButton variant="secondary">
                  साइलेज किण्वन एवं वायु रिसाव परीक्षण
                </LiquidGlassButton>
                <LiquidGlassButton variant="secondary">
                  New test start karo — instant evaluation
                </LiquidGlassButton>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Interactive Dialogs & Sheets */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-ink-1">
              4. Modal &amp; Sheet Primitives
            </h2>
            <span className="text-xs text-ink-2">WCAG Dialog Compliance</span>
          </div>

          <div className="p-6 glass-surface-1 rounded-3xl border border-edge flex flex-wrap gap-4">
            <LiquidGlassButton
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Test Modal
            </LiquidGlassButton>
            <LiquidGlassButton
              variant="secondary"
              onClick={() => setIsSheetOpen(true)}
            >
              Open Bottom Sheet
            </LiquidGlassButton>
          </div>
        </section>

        {/* 5. Scientific Badges & Tags */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-ink-1">
            5. Mandatory Scientific Evidence Tags
          </h2>
          <div className="p-6 glass-surface-1 rounded-3xl border border-edge flex flex-wrap gap-3">
            {evidenceTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-lg transition-all ${
                  selectedTag === tag ? "ring-2 ring-forest dark:ring-emerald-400 scale-105" : "opacity-80 hover:opacity-100"
                }`}
              >
                <EvidenceTag tag={tag} size="md" />
              </button>
            ))}
          </div>
        </section>

        {/* 6. Sync Badges */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-ink-1">
            6. Offline &amp; Sync Status Indicators
          </h2>
          <div className="p-6 glass-surface-1 rounded-3xl border border-edge flex flex-wrap gap-4">
            {syncStatuses.map((st) => (
              <SyncStatusBadge key={st} status={st} size="md" />
            ))}
          </div>
        </section>

        {/* 7. Liquid Glass Product Carousel */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-display font-semibold text-ink-1">
                7. Product Carousel Component
              </h2>
              <p className="text-xs text-ink-2">
                Horizontal snap scrolling, responsive card width, keyboard controls, localized typography (EN / Hindi / Hinglish), DEMO badges, and scientific evidence tags.
              </p>
            </div>

            {/* State Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-1 border border-edge text-xs">
              {(
                [
                  { key: "standard", label: "Standard / Multi-lang" },
                  { key: "loading", label: "Loading" },
                  { key: "empty", label: "Empty" },
                  { key: "error", label: "Error" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCarouselStateTab(tab.key)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    carouselStateTab === tab.key
                      ? "bg-forest dark:bg-dark-forest text-white shadow-sm"
                      : "text-muted hover:text-ink-1"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 glass-surface-1 rounded-3xl border border-edge">
            {carouselStateTab === "standard" && (
              <ProductCarousel
                items={carouselItemsLong}
                onCardClick={(item) => setIsSampleDrawerOpen(true)}
              />
            )}
            {carouselStateTab === "loading" && (
              <ProductCarousel items={[]} loading={true} />
            )}
            {carouselStateTab === "empty" && (
              <ProductCarousel items={[]} />
            )}
            {carouselStateTab === "error" && (
              <ProductCarousel
                items={[]}
                error="Failed to stream field telemetry feed. Local IndexedDB cache remains intact."
              />
            )}
          </div>
        </section>

        {/* 8. Smooth Bottom-Sheet Drawer */}
        <section className="space-y-4 pb-12">
          <div>
            <h2 className="text-xl font-display font-semibold text-ink-1">
              8. Smooth Bottom-Sheet Drawer Component
            </h2>
            <p className="text-xs text-ink-2">
              Spring-physics bottom-sheet with Framer Motion, staggered item entrance, mobile swipe-to-dismiss, focus trapping, Escape key handling, and Level 3 Liquid Glass.
            </p>
          </div>

          <div className="p-6 glass-surface-1 rounded-3xl border border-edge flex flex-wrap items-center gap-4">
            <LiquidGlassButton
              variant="primary"
              onClick={() => setIsSmoothDrawerOpen(true)}
            >
              <Activity className="w-4 h-4 mr-2" />
              <span>Open Generic SmoothDrawer</span>
            </LiquidGlassButton>

            <LiquidGlassButton
              variant="secondary"
              onClick={() => setIsSampleDrawerOpen(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              <span>Open SampleDetailDrawer Preset</span>
            </LiquidGlassButton>
          </div>
        </section>
      </main>

      {/* Interactive Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="FeedShield Modal Dialog"
      >
        <div className="space-y-4 text-xs sm:text-sm text-ink-2 leading-relaxed">
          <p>
            This dialog is rendered using <strong>Level 3 Liquid Glass</strong> with backdrop saturation and 1px inner edge highlight.
          </p>
          <div className="p-4 rounded-2xl bg-bg-1 border border-edge">
            <p className="font-semibold text-ink-1">WCAG Compliance:</p>
            <p className="text-xs text-ink-2 mt-1">Escape key listener, body overflow trapping, and accessible close button.</p>
          </div>
          <div className="pt-2 flex justify-end">
            <LiquidGlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Dismiss Modal
            </LiquidGlassButton>
          </div>
        </div>
      </Modal>

      {/* Interactive Sheet Demo */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="FeedShield Mobile Sheet"
      >
        <div className="space-y-4 text-xs sm:text-sm text-ink-2 leading-relaxed">
          <p>
            Bottom sheet designed for thumb-friendly mobile workflows with Level 3 glass styling.
          </p>
          <div className="flex justify-end pt-2">
            <LiquidGlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsSheetOpen(false)}
            >
              Close Sheet
            </LiquidGlassButton>
          </div>
        </div>
      </Sheet>

      {/* Generic SmoothDrawer Demonstration */}
      <SmoothDrawer
        isOpen={isSmoothDrawerOpen}
        onClose={() => setIsSmoothDrawerOpen(false)}
        title="Field Advisory Protocol"
        description="Active management recommendations for detected aerobic heating"
        footer={
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsSmoothDrawerOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-edge glass-surface-2 text-ink-1 text-xs font-semibold hover:bg-surface/80"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => setIsSmoothDrawerOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-forest dark:bg-dark-forest text-white text-xs font-bold shadow-sm"
            >
              Acknowledge Advisory
            </button>
          </div>
        }
      >
        <motion.div variants={drawerItemVariants} className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Contributing Risk Factors</p>
              <p className="text-[11px] mt-0.5 opacity-90">
                Core silo face temperature measured 41.8°C with elevated volatile organic signatures. High packing porosity detected.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl glass-surface-2 border border-edge space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Evidence Provenance:</span>
              <EvidenceTag tag="SENSOR-MEASURED" size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Scientific Status:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">ATTENTION</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Confirmatory Action:</span>
              <span className="font-semibold text-ink-1">Thermocouple grid logging</span>
            </div>
          </div>
        </motion.div>
      </SmoothDrawer>

      {/* Preset SampleDetailDrawer Demonstration */}
      <SampleDetailDrawer
        sample={demoDrawerSample}
        analysis={demoDrawerAnalysis}
        isOpen={isSampleDrawerOpen}
        onClose={() => setIsSampleDrawerOpen(false)}
      />
    </div>
  );
}
