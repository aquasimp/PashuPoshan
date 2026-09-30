"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  HardDrive,
  QrCode,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { DemoBadge } from "@/components/ui/DemoBadge";

const TOUR_STEPS = [
  {
    step: 1,
    badge: "THE PROBLEM (SIH26111)",
    title: "Silent Spoilage in Indian Dairy Pits",
    summary:
      "Over 30% of silage prepared by smallholder farmers undergoes aerobic deterioration, butyric fermentation, and clostridial rotting. Farmers lack rapid tools to detect invisible air ingress, resulting in toxic ingestion, acute acidosis, and sudden milk yield drops.",
    highlights: [
      "No lab access within 50 km for rural dairy farmers",
      "Traditional testing takes 7-14 days for wet chemistry results",
      "Feeding moldy silage causes up to 20% loss in herd butterfat yield",
    ],
    actionLink: "/demo/hero",
    actionLabel: "View Healthy vs Spoiled Comparison",
  },
  {
    step: 2,
    badge: "MULTIMODAL ARCHITECTURE",
    title: "Sensor + Optical + NIR Late Fusion",
    summary:
      "PashuPoshan does not rely on a single fragile modality. It integrates smartphone cameras for surface quality, probe sensors for core pH and thermal differential (ΔT), and NIR spectroscopy for molecular absorption bands.",
    highlights: [
      "Core probe: pH + thermal rise (Internal - Ambient ΔT)",
      "Image QA: Real-time blur, lighting, and framing validation",
      "NIR: Chemometrics (SNV, MSC, Savitzky-Golay, Hotelling T²)",
    ],
    actionLink: "/test",
    actionLabel: "Try Interactive Sensor Flow",
  },
  {
    step: 3,
    badge: "SCIENTIFIC HONESTY",
    title: "Strict Claims Policy & Evidence Tags",
    summary:
      "We strictly refuse fake AI claims. RGB photos are NEVER claimed to measure protein or invisible urea. Every result is tagged with its precise provenance: DETECTED, PREDICTED, ESTIMATED, or SENSOR-MEASURED.",
    highlights: [
      "Automated Claims Linter (claims_lint.py) enforces 22 strict rules",
      "Exact strings: 'Urea cannot be assessed from this image alone'",
      "Explicit laboratory referral for high-risk or out-of-domain samples",
    ],
    actionLink: "/design-system",
    actionLabel: "Inspect Evidence Tag System",
  },
  {
    step: 4,
    badge: "RULES PARITY",
    title: "100% Cross-Platform Parity",
    summary:
      "The silage rules engine is defined in YAML and compiled to both Python (backend) and TypeScript (frontend). 25+ golden test cases guarantee 100% parity so farmers receive identical decisions whether online or offline.",
    highlights: [
      "Worst Supported Hazard late fusion rule",
      "Hotelling T² & Q-residual applicability domain check",
      "Out-of-domain returns INVALID with null value, not a hallucinated number",
    ],
    actionLink: "/compare",
    actionLabel: "Compare Sample Diffs",
  },
  {
    step: 5,
    badge: "OFFLINE FIRST",
    title: "Zero Connectivity Dexie PWA",
    summary:
      "Rural dairy sheds rarely have stable cellular networks. PashuPoshan operates 100% offline using IndexedDB via Dexie. Results are signed locally with 'Analysed on device — Offline' and synced when connected.",
    highlights: [
      "Offline background service worker and local cache",
      "Idempotent outbox with conflict resolution ladder",
      "Side-by-side 'Updated after Sync' comparison viewer",
    ],
    actionLink: "/sync",
    actionLabel: "Open Offline Sync Hub",
  },
  {
    step: 6,
    badge: "TRACEABILITY",
    title: "Cryptographic HMAC-SHA256 Seal",
    summary:
      "Every tested batch is assigned a unique FS-YYYYMMDD-XXXX identifier and signed with an HMAC-SHA256 token embedded in a QR code. Cooperatives, buyers, and consumers can verify authenticity in 1 tap.",
    highlights: [
      "Instant public QR verification card: Verified / Unverified / Tampered",
      "Official ReportLab signed PDF certificate generation",
      "Digital audit trail protecting premium quality milk supply chains",
    ],
    actionLink: "/verify/FS-20260930-H801",
    actionLabel: "Verify Authenticity QR",
  },
  {
    step: 7,
    badge: "LONG-TERM INNOVATION",
    title: "Field Data Collection & Indian Dataset",
    summary:
      "PashuPoshan includes a dedicated field data collection module. Over time, extension workers and cooperative nodes build India's premier multimodal dataset linking images, spectra, and ground-truth wet chemistry.",
    highlights: [
      "Decentralized shared-node testing model for KVKs and milk unions",
      "Model registry with continuous calibration metrics (RMSEP, R², RPD)",
      "Ready for real-world pilot across dairy clusters nationwide",
    ],
    actionLink: "/admin",
    actionLabel: "View Admin & Model Registry",
  },
];

export default function GuidedTourPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const current = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const nextStep = () => {
    if (!isLast) setCurrentStepIndex(currentStepIndex + 1);
  };

  const prevStep = () => {
    if (!isFirst) setCurrentStepIndex(currentStepIndex - 1);
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center space-y-6">
        {/* Tour Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-emerald-400 font-mono">
              JUDGE PITCH TOUR · STEP {current.step} OF {TOUR_STEPS.length}
            </span>
          </div>

          <Link
            href="/demo/hero"
            className="p-2 rounded-xl text-muted dark:text-dark-muted hover:text-ink dark:hover:text-white glass-card border border-bone dark:border-dark-border transition-colors"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentStepIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentStepIndex
                  ? "w-8 bg-forest dark:bg-emerald-500 shadow-sm"
                  : i < currentStepIndex
                  ? "w-3 bg-moss dark:bg-emerald-600"
                  : "w-2 bg-bone dark:bg-dark-card"
              }`}
            />
          ))}
        </div>

        {/* Central Tour Slide Card with Liquid Glass Elevation */}
        <div className="glass-card-hero rounded-3xl p-6 sm:p-9 border border-forest/15 dark:border-white/10 shadow-float space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold px-3.5 py-1 rounded-full bg-forest/10 dark:bg-emerald-500/15 text-forest dark:text-emerald-300">
              {current.badge}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink tracking-tight pt-1">
              {current.title}
            </h1>
          </div>

          <p className="text-sm sm:text-base text-ink/85 dark:text-dark-ink/85 leading-relaxed font-sans">
            {current.summary}
          </p>

          <div className="space-y-2.5 pt-3 border-t border-bone dark:border-dark-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted block">
              Key Technical Innovations:
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-ink/90 dark:text-dark-ink/90">
              {current.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-moss dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Link to Live Screen */}
          <div className="pt-4 border-t border-bone dark:border-dark-border flex items-center justify-between">
            <Link
              href={current.actionLink}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-emerald-400 hover:text-deep dark:hover:text-emerald-300 hover:underline"
            >
              <span>{current.actionLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <span className="text-[11px] text-muted dark:text-dark-muted font-mono">
              {currentStepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </div>
        </div>

        {/* Navigation Controls Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirst}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink font-semibold text-xs disabled:opacity-40 hover:bg-bone dark:hover:bg-dark-card transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {isLast ? (
            <Link
              href="/test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Start Live Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Next Innovation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
