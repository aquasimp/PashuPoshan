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
    bg: "bg-emerald-50",
    text: "text-forest",
    border: "border-emerald-300",
    icon: CheckCircle,
  },
  ATTENTION: {
    label: "ATTENTION",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: AlertTriangle,
  },
  "HIGH RISK": {
    label: "HIGH RISK",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-300",
    icon: XCircle,
  },
  HIGH_RISK: {
    label: "HIGH RISK",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-300",
    icon: XCircle,
  },
  INDETERMINATE: {
    label: "INDETERMINATE",
    bg: "bg-stone-50",
    text: "text-stone-700",
    border: "border-stone-300",
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

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide font-sans shadow-xs ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <Icon className={size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5"} />
      <span>{config.label}</span>
    </span>
  );
};
