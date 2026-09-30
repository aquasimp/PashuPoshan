import React from "react";
import { EvidenceTag, EvidenceTagType } from "@/components/ui/EvidenceTag";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export interface PredictionEnvelope {
  target: string;
  display_name?: string;
  value: number | null;
  unit: string;
  evidence_tag: EvidenceTagType | string;
  confidence: number;
  uncertainty?: {
    type?: string;
    lower?: number;
    upper?: number;
    level?: number;
  } | null;
  model_version?: string;
  data_provenance?: string;
  modalities_used?: string[];
  modalities_missing?: string[];
  applicability_domain?: "IN_DOMAIN" | "CAUTION" | "INVALID" | "NOT_APPLICABLE" | string;
  message?: string;
}

interface ResultCardProps {
  envelope: PredictionEnvelope;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ envelope, className = "" }) => {
  const isInvalid = envelope.applicability_domain === "INVALID" || envelope.value === null;
  const isCaution = envelope.applicability_domain === "CAUTION";

  const targetLabels: Record<string, string> = {
    dry_matter: "Dry Matter / Moisture",
    crude_protein: "Crude Protein",
    ndf: "Neutral Detergent Fiber (NDF)",
    adf: "Acid Detergent Fiber (ADF)",
    ph: "Silage Core pH",
  };

  const displayName = envelope.display_name || targetLabels[envelope.target] || envelope.target;

  return (
    <GlassCard variant="frosted" className={`p-4 md:p-5 flex flex-col justify-between ${className}`}>
      <div>
        {/* Top Header: Label & Provenance Tags */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="font-semibold text-sm md:text-base text-ink dark:text-dark-ink leading-tight">
              {displayName}
            </h4>
            {envelope.model_version && (
              <span className="text-[10px] text-muted dark:text-dark-muted font-mono block mt-0.5">
                v: {envelope.model_version}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <EvidenceTag tag={envelope.evidence_tag} size="sm" />
            {envelope.data_provenance === "synthetic_demo" && (
              <span className="text-[9px] uppercase tracking-wider font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/60">
                DEMO
              </span>
            )}
          </div>
        </div>

        {/* Primary Value Display */}
        <div className="my-2">
          {isInvalid ? (
            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wider text-[11px]">Out of Domain</span>
                <p className="mt-0.5 leading-snug">
                  {envelope.message || "Sample outside validated model range — laboratory confirmation recommended."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-3xl md:text-4xl text-forest dark:text-dark-ink tracking-tight">
                {typeof envelope.value === "number" ? envelope.value.toFixed(1) : envelope.value}
              </span>
              <span className="text-sm font-semibold text-muted dark:text-dark-muted">{envelope.unit}</span>
            </div>
          )}
        </div>

        {/* Analytical Uncertainty Interval */}
        {!isInvalid && envelope.uncertainty && envelope.uncertainty.lower !== undefined && envelope.uncertainty.upper !== undefined && (
          <div className="text-xs text-muted dark:text-dark-muted font-sans mt-1 flex items-center gap-1.5">
            <span className="text-[11px] font-mono bg-bone/60 dark:bg-dark-card px-1.5 py-0.5 rounded border border-bone dark:border-white/10">
              95% CI: [{envelope.uncertainty.lower.toFixed(1)} – {envelope.uncertainty.upper.toFixed(1)}] {envelope.unit}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Modality & Applicability Domain Pill */}
      <div className="pt-3 mt-3 border-t border-bone/60 dark:border-white/10 flex items-center justify-between text-[11px] text-muted dark:text-dark-muted">
        <div className="flex items-center gap-1">
          <span>Modality:</span>
          <span className="font-medium text-ink dark:text-dark-ink capitalize">
            {envelope.modalities_used?.join(", ") || "NIR"}
          </span>
        </div>

        <div>
          {envelope.applicability_domain === "IN_DOMAIN" && (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              In Domain
            </span>
          )}
          {isCaution && (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
              <AlertCircle className="w-3 h-3" />
              Borderline
            </span>
          )}
          {envelope.applicability_domain === "INVALID" && (
            <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
              <ShieldAlert className="w-3 h-3" />
              Rejected
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
