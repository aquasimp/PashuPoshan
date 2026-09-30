import React from "react";
import { HardDrive, Clock, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export type SyncStatusType =
  | "SAVED_ON_DEVICE"
  | "QUEUED"
  | "SYNCING"
  | "SYNCED"
  | "FAILED";

export function generateClientId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "client-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function generateSampleId(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FS-${yyyy}${mm}${dd}-${randomSuffix}`;
}

interface SyncStatusBadgeProps {
  status: SyncStatusType | string;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  SyncStatusType,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  SAVED_ON_DEVICE: {
    label: "Saved on device",
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-300",
    icon: HardDrive,
  },
  QUEUED: {
    label: "Queued",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: Clock,
  },
  SYNCING: {
    label: "Syncing...",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
    icon: RefreshCw,
  },
  SYNCED: {
    label: "Synced",
    bg: "bg-emerald-50",
    text: "text-forest",
    border: "border-emerald-300",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Sync failed",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-300",
    icon: AlertCircle,
  },
};

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  className = "",
  size = "md",
}) => {
  const normalized = (status.toUpperCase() as SyncStatusType);
  const config = statusConfig[normalized] || statusConfig.SAVED_ON_DEVICE;
  const Icon = config.icon;

  const isSpinning = normalized === "SYNCING";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide font-sans ${
        config.bg
      } ${config.text} ${config.border} ${
        size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-3 py-1 text-xs gap-1.5"
      } ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
      <span>{config.label}</span>
    </span>
  );
};
