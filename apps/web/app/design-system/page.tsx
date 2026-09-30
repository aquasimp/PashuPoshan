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
} from "@/components/ui/liquid-glass";
import { ArrowLeft, Sparkles, Layers, Sliders, ShieldCheck } from "lucide-react";

export default function DesignSystemPage() {
  const { t } = useI18n();
  const [selectedTag, setSelectedTag] = useState<string>("PREDICTED");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
        <section className="space-y-4 pb-8">
          <h2 className="text-xl font-display font-semibold text-ink-1">
            6. Offline &amp; Sync Status Indicators
          </h2>
          <div className="p-6 glass-surface-1 rounded-3xl border border-edge flex flex-wrap gap-4">
            {syncStatuses.map((st) => (
              <SyncStatusBadge key={st} status={st} size="md" />
            ))}
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
    </div>
  );
}
