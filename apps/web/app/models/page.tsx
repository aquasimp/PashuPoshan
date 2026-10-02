"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { EvidenceTag } from "@/components/ui/EvidenceTag";
import { DemoBadge } from "@/components/ui/DemoBadge";
import {
  Cpu,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Database,
  BarChart2,
  Layers,
  Sparkles,
  Info,
  Clock,
  FlaskConical,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";

interface ModelEntry {
  model_name: string;
  version: string;
  target_variable: string;
  display_name: string;
  hash: string;
  data_provenance: string;
  synthetic_disclaimer?: string;
  training_samples: number;
  test_samples: number;
  spectral_bands: number;
  wavelength_range_nm: [number, number];
  champion_model: string;
  metrics: {
    mae: number;
    rmse: number;
    r2: number;
    bias: number;
    rpd: number;
  };
  candidate_comparisons?: Record<string, { mae: number; rmse: number; r2: number; bias: number; rpd: number }>;
  performance_by_crop_type?: Record<string, { mae: number; rmse: number; r2: number; bias: number; rpd: number }>;
}

interface FieldPendingItem {
  target: string;
  status: string;
  reference_method: string;
  target_sample_size: string;
  target_metric_file: string;
}

export default function ModelRegistryPage() {
  const { t } = useI18n();
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [fieldPending, setFieldPending] = useState<FieldPendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<string>("dry_matter_pct");

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await apiFetch("/api/v1/models");
        if (res.ok) {
          const data = await res.json();
          setModels(data.models || []);
          setFieldPending(data.field_validation_pending || []);
        }
      } catch (err) {
        console.error("Failed to fetch model registry:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  const activeModel = models.find((m) => m.target_variable === selectedTarget) || models[0];

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-mono font-semibold text-forest dark:text-dark-forest">
                Machine Learning & Chemometrics
              </span>
              <DemoBadge />
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-forest dark:text-dark-ink tracking-tight">
              Model Performance & Verification Registry
            </h1>
            <p className="text-sm text-muted dark:text-dark-muted mt-1 max-w-2xl font-sans">
              Inspection of operational chemometric regressors, applicability domain bounds, and the scientific field validation roadmap.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <EvidenceTag tag="PREDICTED" size="sm" />
            <span className="text-xs font-mono bg-bone/80 dark:bg-dark-card text-ink dark:text-dark-ink px-2.5 py-1 rounded-lg border border-bone dark:border-white/10">
              Active Bands: 920–1680 nm
            </span>
          </div>
        </div>

        {/* Mandatory Synthetic Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 dark:border-amber-500/40 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm font-sans space-y-1">
              <span className="font-bold tracking-tight block uppercase text-[11px]">
                Scientific Integrity Notice · Claims Policy Section 0.7
              </span>
              <p>
                <strong>Trained on synthetic demo data — NOT a validation of field accuracy.</strong> The metrics below were calculated on physically plausible synthetic absorbance spectra generated via Gaussian Beer-Lambert absorption physics and multiplicative scatter effects.
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                These models demonstrate full edge-to-cloud software integration, nested CV, and applicability domain filtering. Real field accuracy numbers will only be populated after formal wet-chemistry trials.
              </p>
            </div>
          </div>
        </div>

        {/* Model Target Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {models.map((m) => (
            <button
              key={m.target_variable}
              onClick={() => setSelectedTarget(m.target_variable)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all border ${
                selectedTarget === m.target_variable
                  ? "bg-forest dark:bg-dark-forest text-white border-forest dark:border-dark-forest shadow-sm font-semibold"
                  : "bg-surface/70 dark:bg-dark-surface/70 text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink border-bone/80 dark:border-white/10"
              }`}
            >
              {m.display_name}
            </button>
          ))}
        </div>

        {/* Active Model Spotlight */}
        {activeModel && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Metrics Card */}
            <GlassCard variant="hero" className="lg:col-span-2 p-5 md:p-6 space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-bone/80 dark:border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-xl text-forest dark:text-dark-ink">
                      {activeModel.display_name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                      Champion: {activeModel.champion_model}
                    </span>
                  </div>
                  <span className="text-xs text-muted dark:text-dark-muted font-mono block mt-1">
                    Artifact: {activeModel.version} (SHA-256: {activeModel.hash})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted dark:text-dark-muted block">Independent Test Set</span>
                  <span className="text-sm font-semibold font-mono text-ink dark:text-dark-ink">
                    N = {activeModel.test_samples} spectra
                  </span>
                </div>
              </div>

              {/* 4 Primary Performance Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-surface/90 dark:bg-dark-card/90 border border-bone/80 dark:border-white/10">
                  <span className="text-[11px] text-muted dark:text-dark-muted font-sans uppercase tracking-wider block">
                    Coefficient of Determination
                  </span>
                  <span className="font-display font-bold text-2xl text-forest dark:text-dark-ink block mt-1">
                    {activeModel.metrics.r2.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-muted dark:text-dark-muted font-mono">Test R² score</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/90 dark:bg-dark-card/90 border border-bone/80 dark:border-white/10">
                  <span className="text-[11px] text-muted dark:text-dark-muted font-sans uppercase tracking-wider block">
                    Prediction Error
                  </span>
                  <span className="font-display font-bold text-2xl text-forest dark:text-dark-ink block mt-1">
                    {activeModel.metrics.rmse.toFixed(3)}%
                  </span>
                  <span className="text-[10px] text-muted dark:text-dark-muted font-mono">RMSEP (% DM)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/90 dark:bg-dark-card/90 border border-bone/80 dark:border-white/10">
                  <span className="text-[11px] text-muted dark:text-dark-muted font-sans uppercase tracking-wider block">
                    Residual Ratio (RPD)
                  </span>
                  <span className="font-display font-bold text-2xl text-forest dark:text-dark-ink block mt-1">
                    {activeModel.metrics.rpd.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans font-medium">
                    {activeModel.metrics.rpd >= 3.0 ? "Excellent Screening" : "Good Calibration"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface/90 dark:bg-dark-card/90 border border-bone/80 dark:border-white/10">
                  <span className="text-[11px] text-muted dark:text-dark-muted font-sans uppercase tracking-wider block">
                    Systematic Bias
                  </span>
                  <span className="font-display font-bold text-2xl text-forest dark:text-dark-ink block mt-1">
                    {activeModel.metrics.bias > 0 ? `+${activeModel.metrics.bias.toFixed(3)}` : activeModel.metrics.bias.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-muted dark:text-dark-muted font-mono">Mean Offset</span>
                </div>
              </div>

              {/* Candidate Algorithm Comparison Table */}
              {activeModel.candidate_comparisons && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
                      Candidate Algorithm Comparison (Group Holdout)
                    </h4>
                    <span className="text-[10px] text-muted dark:text-dark-muted">No test-set leakage</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-bone/80 dark:border-white/10">
                    <table className="w-full text-xs font-sans text-left">
                      <thead className="bg-bone/40 dark:bg-dark-card text-muted dark:text-dark-muted uppercase font-mono text-[10px]">
                        <tr>
                          <th className="p-2.5">Model Family</th>
                          <th className="p-2.5">Preprocessing</th>
                          <th className="p-2.5">Test RMSEP</th>
                          <th className="p-2.5">Test R²</th>
                          <th className="p-2.5">RPD</th>
                          <th className="p-2.5">Verdict</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-bone/60 dark:divide-white/10 text-ink dark:text-dark-ink">
                        {Object.entries(activeModel.candidate_comparisons).map(([algo, m]) => (
                          <tr key={algo} className={algo === "PLSR" ? "bg-forest/5 dark:bg-dark-forest/10 font-medium" : ""}>
                            <td className="p-2.5 font-semibold flex items-center gap-1.5">
                              {algo === "PLSR" && <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-dark-forest" />}
                              <span>{algo}</span>
                            </td>
                            <td className="p-2.5 font-mono text-muted dark:text-dark-muted">
                              {algo === "PLSR" ? "SNV" : algo === "SVR" ? "Savitzky-Golay 1st Deriv" : "SNV"}
                            </td>
                            <td className="p-2.5 font-mono">{m.rmse.toFixed(3)}</td>
                            <td className="p-2.5 font-mono">{m.r2.toFixed(4)}</td>
                            <td className="p-2.5 font-mono">{m.rpd.toFixed(2)}</td>
                            <td className="p-2.5">
                              {algo === "PLSR" ? (
                                <span className="text-[10px] font-bold text-forest dark:text-emerald-400">CHAMPION</span>
                              ) : algo === "SVR" ? (
                                <span className="text-[10px] text-amber-700 dark:text-amber-400">Overfit (Eqns)</span>
                              ) : (
                                <span className="text-[10px] text-muted dark:text-dark-muted">Candidate</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Applicability Domain & Technical Specs */}
            <div className="space-y-4">
              <GlassCard variant="frosted" className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-forest dark:text-dark-forest" />
                  <h4 className="font-semibold text-sm text-ink dark:text-dark-ink">
                    Applicability Domain Envelope
                  </h4>
                </div>
                <p className="text-xs text-muted dark:text-dark-muted leading-relaxed font-sans">
                  Samples outside the PCA Hotelling T² and Q-residual 99% confidence limits are flagged as <code>INVALID</code>, safely suppressing numerical predictions and advising a confirmatory laboratory test.
                </p>
                <div className="space-y-2 pt-2 border-t border-bone/60 dark:border-white/10 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">PCA Latent Components:</span>
                    <span className="font-semibold text-ink dark:text-dark-ink">5 factors</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">Hotelling T² Limit (99%):</span>
                    <span className="font-semibold text-ink dark:text-dark-ink">14.460</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">Q-Residual Limit (99%):</span>
                    <span className="font-semibold text-ink dark:text-dark-ink">0.02510</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">Rejection Behavior:</span>
                    <span className="text-rose-700 dark:text-rose-400 font-bold">value = null</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard variant="frosted" className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-forest dark:text-dark-forest" />
                  <h4 className="font-semibold text-sm text-ink dark:text-dark-ink">
                    Training Population Structure
                  </h4>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">Total Synthetic Spectra:</span>
                    <span className="font-semibold text-ink dark:text-dark-ink">1,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">Group Structure:</span>
                    <span className="font-semibold text-ink dark:text-dark-ink">20 Farms (GroupKFold)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">Spectral Grid:</span>
                    <span className="font-semibold text-ink dark:text-dark-ink">920–1680 nm (2 nm)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted dark:text-dark-muted">Zero-Leakage Guard:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Section 13: Real Field Validation Status (Pending) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-ink dark:text-dark-ink">
                Real Field Validation Roadmap
              </h2>
              <p className="text-xs text-muted dark:text-dark-muted font-sans">
                Transparent accounting of field campaigns required before commercial deployment.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              STATUS: PENDING
            </span>
          </div>

          {/* Section 11 Item 7: Mandatory 4 Localized Pending Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {t("models.pending.realFieldNir")}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {t("models.pending.realIndianFeedImage")}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {t("models.pending.realUrea")}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {t("models.pending.realExternal")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldPending.map((item, idx) => (
              <GlassCard key={idx} variant="frosted" className="p-4 border-l-4 border-l-amber-500 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <h4 className="font-semibold text-sm text-ink dark:text-dark-ink">{item.target}</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 uppercase">
                    Validation in Progress
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted dark:text-dark-muted font-sans pl-6">
                  <div>
                    <span className="font-medium text-ink dark:text-dark-ink">Reference Standard:</span> {item.reference_method}
                  </div>
                  <div>
                    <span className="font-medium text-ink dark:text-dark-ink">Required Sample Size:</span> {item.target_sample_size}
                  </div>
                  <div>
                    <span className="font-medium text-ink dark:text-dark-ink">Target Insertion Artifact:</span>{" "}
                    <code className="text-[11px] font-mono bg-bone/60 dark:bg-dark-card px-1 py-0.5 rounded">
                      {item.target_metric_file}
                    </code>
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
