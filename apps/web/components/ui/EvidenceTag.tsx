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
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: Eye,
  },
  PREDICTED: {
    label: "PREDICTED",
    bg: "bg-emerald-50",
    text: "text-forest",
    border: "border-emerald-200",
    icon: Cpu,
  },
  ESTIMATED: {
    label: "ESTIMATED",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    icon: Calculator,
  },
  "USER-ENTERED": {
    label: "USER-ENTERED",
    bg: "bg-stone-100",
    text: "text-stone-800",
    border: "border-stone-300",
    icon: UserCheck,
  },
  "SENSOR-MEASURED": {
    label: "SENSOR-MEASURED",
    bg: "bg-moss/10",
    text: "text-moss",
    border: "border-moss/30",
    icon: Activity,
  },
  DEMO: {
    label: "DEMO",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: Sparkles,
  },
};

export const EvidenceTag: React.FC<EvidenceTagProps> = ({ tag, className = "", size = "md" }) => {
  const normalizedTag = (tag.toUpperCase() as EvidenceTagType);
  const config = tagConfig[normalizedTag] || {
    label: tag,
    bg: "bg-stone-50",
    text: "text-stone-700",
    border: "border-stone-200",
    icon: Activity,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-sans ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
    </span>
  );
};
