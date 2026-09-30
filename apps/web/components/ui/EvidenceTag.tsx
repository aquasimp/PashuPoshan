import React from "react";
import { Eye, Cpu, Calculator, UserCheck, Activity, Sparkles } from "lucide-react";

export type EvidenceTagType =
  | "DETECTED"
  | "PREDICTED"
  | "ESTIMATED"
  | "USER-ENTERED"
  | "SENSOR-MEASURED"
  | "DEMO";

interface EvidenceTagProps {
  tag: EvidenceTagType | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const tagConfig: Record<
  EvidenceTagType,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  DETECTED: {
    label: "DETECTED",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800/60",
    icon: Eye,
  },
  PREDICTED: {
    label: "PREDICTED",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-forest dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/60",
    icon: Cpu,
  },
  ESTIMATED: {
    label: "ESTIMATED",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/60",
    icon: Calculator,
  },
  "USER-ENTERED": {
    label: "USER-ENTERED",
    bg: "bg-stone-100 dark:bg-stone-900/40",
    text: "text-stone-800 dark:text-stone-300",
    border: "border-stone-300 dark:border-stone-700/60",
    icon: UserCheck,
  },
  "SENSOR-MEASURED": {
    label: "SENSOR-MEASURED",
    bg: "bg-moss/10 dark:bg-moss/20",
    text: "text-moss dark:text-emerald-300",
    border: "border-moss/30 dark:border-moss/40",
    icon: Activity,
  },
  DEMO: {
    label: "DEMO",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700/60",
    icon: Sparkles,
  },
};

export const EvidenceTag: React.FC<EvidenceTagProps> = ({ tag, className = "", size = "md" }) => {
  const normalized = tag.toUpperCase() as EvidenceTagType;
  const config = tagConfig[normalized] || tagConfig["DEMO"];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
    lg: "px-3.5 py-1 text-sm gap-2",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md font-mono uppercase tracking-wider font-semibold border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      title={`Scientific Provenance: ${config.label}`}
    >
      <Icon className={`${iconSizes} flex-shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};
