import React from "react";
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

export type StatusLevel = "GOOD" | "ATTENTION" | "HIGH RISK" | "HIGH_RISK" | "INDETERMINATE";

interface StatusChipProps {
  status: StatusLevel | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  GOOD: {
    label: "GOOD",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-forest dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-700/60",
    icon: CheckCircle,
  },
  ATTENTION: {
    label: "ATTENTION",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700/60",
    icon: AlertTriangle,
  },
  "HIGH RISK": {
    label: "HIGH RISK",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-700/60",
    icon: XCircle,
  },
  HIGH_RISK: {
    label: "HIGH RISK",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-700/60",
    icon: XCircle,
  },
  INDETERMINATE: {
    label: "INDETERMINATE",
    bg: "bg-stone-100 dark:bg-stone-900/40",
    text: "text-stone-700 dark:text-stone-300",
    border: "border-stone-300 dark:border-stone-700/60",
    icon: HelpCircle,
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, className = "", size = "md" }) => {
  const normalized = status.toUpperCase().replace("-", " ");
  const config = statusConfig[normalized] || statusConfig["INDETERMINATE"];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2 font-semibold",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border font-sans shadow-sm ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <Icon className={`${iconSizes} flex-shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};
