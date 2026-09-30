import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface InputCompletenessProps {
  modalitiesUsed: string[];
  modalitiesMissing: string[];
  score?: number;
  className?: string;
}

const MODALITY_LABELS: Record<string, string> = {
  rgb: "Visual Image (RGB)",
  nir: "NIR Spectroscopy",
  sensors: "Digital Probes (pH & Temp)",
  assay: "Colorimetric Strip",
  metadata: "Storage Context",
};

export const InputCompleteness: React.FC<InputCompletenessProps> = ({
  modalitiesUsed = [],
  modalitiesMissing = [],
  score,
  className = "",
}) => {
  const total = modalitiesUsed.length + modalitiesMissing.length;
  const rawScore = score !== undefined ? (score > 1 ? score / 100 : score) : total > 0 ? modalitiesUsed.length / total : 0;
  const percentage = Math.round(rawScore * 100);

  return (
    <div className={`p-4 rounded-xl border border-bone bg-surface shadow-subtle ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-ink font-sans">Input Modality Completeness</h4>
          <p className="text-xs text-muted">Evidence strength backing this evaluation</p>
        </div>
        <div className="text-right">
          <span className="text-base font-bold text-forest font-sans">{percentage}%</span>
          <span className="text-xs text-muted ml-1">covered</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-mist rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-forest transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Breakdown List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
        {modalitiesUsed.map((m) => (
          <div key={m} className="flex items-center gap-1.5 text-forest font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-moss flex-shrink-0" />
            <span>{MODALITY_LABELS[m.toLowerCase()] || m}</span>
          </div>
        ))}
        {modalitiesMissing.map((m) => (
          <div key={m} className="flex items-center gap-1.5 text-muted">
            <AlertCircle className="w-3.5 h-3.5 text-terracotta/70 flex-shrink-0" />
            <span className="line-through">{MODALITY_LABELS[m.toLowerCase()] || m}</span>
            <span className="text-[10px] text-terracotta bg-terracotta/10 px-1 py-0.2 rounded font-sans">Missing</span>
          </div>
        ))}
      </div>
    </div>
  );
};
