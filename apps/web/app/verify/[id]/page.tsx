"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowLeft,
  Calendar,
  Lock,
  Download,
  Share2,
  Sparkles,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusChip } from "@/components/ui/StatusChip";
import { EvidenceTag } from "@/components/ui/EvidenceTag";
import { GlassCard } from "@/components/ui/GlassCard";
import { DemoBadge } from "@/components/ui/DemoBadge";

export default function PublicVerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sampleId = (params?.id as string) || "FS-20260930-H801";
  const tokenParam = searchParams.get("token") || "";

  // Verification state: "Verified" | "Unverified" | "Tampered"
  const [verificationStatus, setVerificationStatus] = useState<"Verified" | "Unverified" | "Tampered">("Verified");
  const [message, setMessage] = useState("Cryptographic HMAC-SHA256 signature matches central tamper-evident registry.");

  useEffect(() => {
    // If token has tampered marker in search param
    if (tokenParam.includes("tampered") || tokenParam.includes("invalid")) {
      setVerificationStatus("Tampered");
      setMessage("HMAC-SHA256 cryptographic signature failed. Sample payload has been altered.");
    } else if (!tokenParam) {
      // Default to Verified for demo with valid simulated signature
      setVerificationStatus("Verified");
    }
  }, [tokenParam]);

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
          <Link href="/" className="hover:text-forest dark:hover:text-dark-forest flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-ink dark:text-dark-ink font-medium">Public Authenticity Verification</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 dark:bg-dark-forest/20 text-forest dark:text-dark-forest text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>FeedShield Cryptographic Verification Protocol</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink">
            Traceability &amp; Integrity Seal
          </h1>
          <p className="text-xs text-muted dark:text-dark-muted">
            Instant public validation for dairy cooperatives, veterinarians, and cattle owners.
          </p>
        </div>

        {/* State Simulator Bar for Judges */}
        <div className="glass-card p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="font-bold text-muted dark:text-dark-muted uppercase tracking-wider text-[11px]">
            Test Verification State:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setVerificationStatus("Verified");
                setMessage("Cryptographic HMAC-SHA256 signature matches central tamper-evident registry.");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                verificationStatus === "Verified"
                  ? "bg-forest dark:bg-dark-forest text-white shadow-sm"
                  : "bg-surface dark:bg-dark-card border border-bone dark:border-dark-border text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              1. Verified (Pass)
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationStatus("Unverified");
                setMessage("Sample record exists locally but is pending central synchronization.");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                verificationStatus === "Unverified"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-surface dark:bg-dark-card border border-bone dark:border-dark-border text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              2. Unverified (Pending)
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationStatus("Tampered");
                setMessage("HMAC-SHA256 signature mismatch! Digital payload has been altered or forged.");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                verificationStatus === "Tampered"
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-surface dark:bg-dark-card border border-bone dark:border-dark-border text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              3. Tampered (Warning)
            </button>
          </div>
        </div>

        {/* Glassmorphic Verification Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-card backdrop-blur-md transition-all ${
            verificationStatus === "Verified"
              ? "bg-gradient-to-br from-emerald-900/90 to-forest dark:from-emerald-950/90 dark:to-emerald-900 text-white border-emerald-500/40"
              : verificationStatus === "Unverified"
              ? "bg-gradient-to-br from-amber-900/90 to-amber-950 dark:from-amber-950/90 dark:to-amber-900 text-white border-amber-500/40"
              : "bg-gradient-to-br from-rose-950/95 to-red-900 dark:from-rose-950 dark:to-red-950 text-white border-rose-500/40"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  verificationStatus === "Verified"
                    ? "bg-emerald-400 text-forest"
                    : verificationStatus === "Unverified"
                    ? "bg-amber-400 text-amber-950"
                    : "bg-rose-400 text-rose-950"
                }`}
              >
                {verificationStatus === "Verified" ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : verificationStatus === "Unverified" ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : (
                  <ShieldX className="w-8 h-8" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest opacity-80 block">
                  AUTHENTICITY STATUS
                </span>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  {verificationStatus === "Verified"
                    ? "Officially Verified"
                    : verificationStatus === "Unverified"
                    ? "Unverified Offline Scan"
                    : "Tampered Certificate Warning"}
                </h2>
              </div>
            </div>

            <DemoBadge label="HMAC-SHA256" size="sm" />
          </div>

          <p className="mt-4 text-xs sm:text-sm opacity-90 leading-relaxed font-sans">
            {message}
          </p>

          <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="opacity-60 block text-[10px]">SAMPLE ID</span>
              <span className="font-bold">{sampleId}</span>
            </div>
            <div>
              <span className="opacity-60 block text-[10px]">ORGANIZATION</span>
              <span className="font-bold">DAHD · SIH26111</span>
            </div>
            <div>
              <span className="opacity-60 block text-[10px]">MODEL VERSION</span>
              <span className="font-bold">fusion-silage-v1.0</span>
            </div>
            <div>
              <span className="opacity-60 block text-[10px]">PROVENANCE</span>
              <span className="font-bold">synthetic_demo</span>
            </div>
          </div>
        </div>

        {/* Detailed Certificate Record */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">Certified Analytical Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border space-y-1">
              <span className="text-muted dark:text-dark-muted block text-[11px]">Commodity / Batch</span>
              <span className="font-bold text-sm text-ink dark:text-dark-ink block">Maize Silage (Bunker #1)</span>
              <span className="text-[10px] text-muted dark:text-dark-muted">Physical Form: Chopped &amp; Compacted Silage</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border space-y-1">
              <span className="text-muted dark:text-dark-muted block text-[11px]">Evaluated Risk Tier</span>
              <div className="flex items-center gap-2">
                <StatusChip status="GOOD" size="sm" />
                <span className="font-bold text-forest dark:text-dark-forest">DECISION: FEED</span>
              </div>
              <span className="text-[10px] text-muted dark:text-dark-muted">Lactic acid preservation verified</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border space-y-1">
              <span className="text-muted dark:text-dark-muted block text-[11px]">Sensor Modalities Used</span>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="px-2 py-0.5 rounded bg-moss/10 dark:bg-dark-moss/20 text-forest dark:text-dark-moss text-[10px] font-mono">
                  pH Probe (3.9)
                </span>
                <span className="px-2 py-0.5 rounded bg-moss/10 dark:bg-dark-moss/20 text-forest dark:text-dark-moss text-[10px] font-mono">
                  Temp Probe (27.5°C)
                </span>
                <span className="px-2 py-0.5 rounded bg-moss/10 dark:bg-dark-moss/20 text-forest dark:text-dark-moss text-[10px] font-mono">
                  Image QA
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface/70 dark:bg-dark-card/60 border border-bone dark:border-dark-border space-y-1">
              <span className="text-muted dark:text-dark-muted block text-[11px]">Evidence Attributions</span>
              <div className="flex flex-wrap gap-1 mt-1">
                <EvidenceTag tag="SENSOR-MEASURED" />
                <EvidenceTag tag="ESTIMATED" />
                <EvidenceTag tag="DEMO" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-bone dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href={`/test/result?id=${sampleId}`}
              className="text-xs font-semibold text-forest dark:text-dark-forest hover:underline"
            >
              View Full Farm Result Record →
            </Link>

            <button
              type="button"
              onClick={() => {
                window.open(`/api/v1/reports/analysis-01/pdf`, "_blank");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest hover:bg-deep dark:bg-dark-forest dark:hover:bg-forest text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed Audit Certificate (PDF)</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
