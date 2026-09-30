import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusChip, StatusLevel } from "@/components/ui/StatusChip";
import { EvidenceTag, EvidenceTagType } from "@/components/ui/EvidenceTag";
import { AlertTriangle, Flame, ShieldAlert, Biohazard, Eye } from "lucide-react";

export interface HazardItem {
  id: string;
  name: string;
  level: StatusLevel | string;
  description: string;
  evidence_tag: EvidenceTagType | string;
  action_tip?: string;
}

interface RiskIndicatorProps {
  hazards: HazardItem[];
  className?: string;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ hazards, className = "" }) => {
  const getHazardIcon = (id: string) => {
    switch (id.toLowerCase()) {
      case "heating":
      case "aerobic_heating":
        return Flame;
      case "mould":
      case "visible_mould":
        return Eye;
      case "spoilage":
      case "clostridial":
        return Biohazard;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {hazards.map((hazard) => {
        const Icon = getHazardIcon(hazard.id);
        const isHighRisk = hazard.level.toUpperCase().includes("HIGH") || hazard.level.toUpperCase().includes("RISK");
        const isAttention = hazard.level.toUpperCase().includes("ATTENTION") || hazard.level.toUpperCase().includes("MODERATE");

        return (
          <GlassCard
            key={hazard.id}
            variant="frosted"
            className={`p-3.5 md:p-4 border transition-all ${
              isHighRisk
                ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20"
                : isAttention
                ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20"
                : "border-bone/70 dark:border-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isHighRisk
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      : isAttention
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-forest dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm text-ink dark:text-dark-ink">{hazard.name}</h5>
                  <p className="text-xs text-muted dark:text-dark-muted mt-0.5 leading-snug">
                    {hazard.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <StatusChip status={hazard.level} size="sm" />
                <EvidenceTag tag={hazard.evidence_tag} size="sm" />
              </div>
            </div>

            {hazard.action_tip && (
              <div className="mt-2.5 pt-2 border-t border-bone/60 dark:border-white/10 text-xs text-ink/90 dark:text-dark-ink/90 flex items-center gap-1.5 font-sans">
                <span className="font-semibold text-forest dark:text-dark-forest">Immediate Action:</span>
                <span>{hazard.action_tip}</span>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
};
