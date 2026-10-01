"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  X,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Thermometer,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StatusChip, StatusLevel } from "@/components/ui/StatusChip";
import { EvidenceTag, EvidenceTagType } from "@/components/ui/EvidenceTag";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { LiquidGlassButton } from "./LiquidGlassButton";
import { useI18n } from "@/lib/i18n";
import { LocalSample, LocalAnalysis } from "@/lib/db";

export interface SmoothDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label?: string;
    onClick?: () => void;
  };
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ariaDescribedBy?: string;
}

const drawerVariants = {
  hidden: {
    y: "100%",
    opacity: 0.3,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 32,
      stiffness: 320,
      mass: 0.8,
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};

export const drawerItemVariants = {
  hidden: {
    y: 16,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 28,
      stiffness: 340,
    },
  },
};

export const SmoothDrawer: React.FC<SmoothDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  badge,
  icon,
  children,
  footer,
  primaryAction,
  secondaryAction,
  maxWidth = "lg",
  className,
  ariaDescribedBy,
}) => {
  const { t } = useI18n();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management & Escape key handling
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      };
      window.addEventListener("keydown", handleGlobalKeyDown);

      // Focus first interactive element or drawer container
      requestAnimationFrame(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            drawerRef.current.focus();
          }
        }
      });

      return () => {
        window.removeEventListener("keydown", handleGlobalKeyDown);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Keyboard navigation listener (Escape + Tab focus trap)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    },
    [onClose]
  );

  // Drag-to-dismiss gesture on mobile
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 450) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="smooth-drawer-title"
          aria-describedby={ariaDescribedBy || "smooth-drawer-desc"}
          className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-end overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop with blur & click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
          />

          {/* Smooth Animated Bottom-Sheet Glass Container */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
            className={twMerge(
              clsx(
                "relative z-10 w-full glass-surface-3 rounded-t-[2.25rem] sm:rounded-t-[2.5rem] border-t border-x border-edge shadow-float flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden outline-none pb-[env(safe-area-inset-bottom,1rem)]",
                maxWidthClasses,
                className
              )
            )}
          >
            {/* Mobile Drag Handle Bar */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0 select-none">
              <div
                aria-hidden="true"
                className="w-12 h-1.5 rounded-full bg-edge-hi/80 dark:bg-edge-hi/50 transition-all hover:w-16"
              />
            </div>

            {/* Drawer Header */}
            <motion.div
              variants={drawerItemVariants}
              className="px-6 pt-2 pb-4 border-b border-edge/80 flex items-start justify-between gap-3 shrink-0"
            >
              <div className="flex items-start gap-3 min-w-0">
                {icon && (
                  <div className="w-10 h-10 rounded-2xl bg-forest/10 dark:bg-emerald-500/15 border border-forest/20 dark:border-emerald-500/20 flex items-center justify-center text-forest dark:text-emerald-300 shrink-0 mt-0.5">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {badge}
                  </div>
                  {title && (
                    <h3
                      id="smooth-drawer-title"
                      className="font-display font-bold text-xl sm:text-2xl text-ink-1 truncate tracking-tight"
                    >
                      {title}
                    </h3>
                  )}
                  {(subtitle || description) && (
                    <p
                      id="smooth-drawer-desc"
                      className="text-xs sm:text-sm text-ink-2 mt-0.5 leading-relaxed font-sans break-words"
                    >
                      {subtitle || description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t("drawer.close")}
                className="p-2 -mr-2 rounded-2xl text-ink-2 hover:text-ink-1 hover:bg-glass-1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-forest dark:focus-visible:ring-emerald-400 outline-none shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Drawer Content Body with Staggered Animations */}
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4 pr-5 focus:outline-none">
              {children}
            </div>

            {/* Drawer Footer Actions */}
            {footer ? (
              <motion.div
                variants={drawerItemVariants}
                className="px-6 py-3.5 border-t border-edge/80 bg-bg-1/40 dark:bg-bg-1/60 shrink-0"
              >
                {footer}
              </motion.div>
            ) : (primaryAction || secondaryAction) && (
              <motion.div
                variants={drawerItemVariants}
                className="px-6 py-3.5 border-t border-edge/80 bg-bg-1/40 dark:bg-bg-1/60 flex flex-col sm:flex-row items-center justify-end gap-2.5 shrink-0"
              >
                {secondaryAction && (
                  <button
                    type="button"
                    onClick={() => {
                      secondaryAction.onClick ? secondaryAction.onClick() : onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-edge hover:border-edge-hi text-ink-2 hover:text-ink-1 hover:bg-glass-2 text-xs sm:text-sm font-semibold transition-all min-h-[44px]"
                  >
                    {secondaryAction.label || t("drawer.close")}
                  </button>
                )}

                {primaryAction &&
                  (primaryAction.href ? (
                    <Link
                      href={primaryAction.href}
                      onClick={() => {
                        primaryAction.onClick?.();
                        onClose();
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-subtle hover:shadow-card transition-all min-h-[44px]"
                    >
                      <span>{primaryAction.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        primaryAction.onClick?.();
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-subtle hover:shadow-card transition-all min-h-[44px]"
                    >
                      <span>{primaryAction.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* Special High-Fidelity Preset: Sample Inspection Drawer */
export interface SampleDrawerProps {
  sample: (LocalSample | any) | null;
  analysis?: (LocalAnalysis | any) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SampleDetailDrawer: React.FC<SampleDrawerProps> = ({
  sample,
  analysis,
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();

  if (!sample) return null;

  const dateStr = new Date(sample.collectedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSilage = sample.sampleType === "silage";

  return (
    <SmoothDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={sample.cropOrFeedName}
      subtitle={`${sample.id} • ${dateStr}`}
      icon={isSilage ? <Thermometer className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
      badge={
        <>
          <DemoBadge label="DEMO" size="sm" />
          {analysis && <StatusChip status={analysis.overallRisk} size="sm" />}
          {analysis && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-forest/10 dark:bg-emerald-500/10 text-forest dark:text-emerald-300 border border-forest/20">
              {analysis.actionDecision}
            </span>
          )}
        </>
      }
      primaryAction={{
        label: t("drawer.viewFullResult"),
        href: `/test/result?id=${sample.id}`,
      }}
      secondaryAction={{
        label: t("drawer.close"),
        onClick: onClose,
      }}
    >
      {/* 1. Quality & Decision Status Banner */}
      <motion.div
        variants={drawerItemVariants}
        className="p-4 rounded-2xl bg-bg-1/80 dark:bg-bg-1/90 border border-edge space-y-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">
            {t("drawer.decision")}
          </span>
          {analysis && <StatusChip status={analysis.overallRisk} size="sm" />}
        </div>
        <p className="text-xs sm:text-sm font-semibold text-ink-1 leading-snug">
          {analysis?.recommendationSummary ? (
            analysis.recommendationSummary
          ) : (
            <>
              {analysis?.actionDecision === "FEED" && "Safe for dairy livestock feeding. Meets optimal nutritional and physical standards."}
              {analysis?.actionDecision === "BLEND" && "Moderate aerobic deterioration or moisture imbalance. Blend with dry fodder before feeding."}
              {analysis?.actionDecision === "RE_TEST" && "Sensor parameters borderline or indeterminate. Recommended to clean probe and re-test."}
              {analysis?.actionDecision === "DISCARD" && "Severe mycotoxin or clostridial spoilage risk. Discard batch to protect herd health."}
              {!analysis && "Pending completed sensor & spectral processing."}
            </>
          )}
        </p>
      </motion.div>

      {/* 2. Key Metrics Grid */}
      <motion.div variants={drawerItemVariants} className="space-y-2">
        <h4 className="text-xs font-bold text-ink-2 uppercase tracking-wider font-mono">
          {t("drawer.keyMetrics")}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {analysis?.fliegScore !== undefined && (
            <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
              <span className="text-[11px] text-ink-3 block font-mono">Flieg Score</span>
              <span className="text-base sm:text-lg font-bold text-ink-1">
                {analysis.fliegScore}/100
              </span>
              <div className="mt-1">
                <EvidenceTag tag="PREDICTED" size="sm" />
              </div>
            </div>
          )}

          {analysis?.spoilageProbability !== undefined && (
            <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
              <span className="text-[11px] text-ink-3 block font-mono">Spoilage Risk</span>
              <span className="text-base sm:text-lg font-bold text-ink-1">
                {Math.round(analysis.spoilageProbability * 100)}%
              </span>
              <div className="mt-1">
                <EvidenceTag tag="PREDICTED" size="sm" />
              </div>
            </div>
          )}

          {sample.metadata?.ph !== undefined && (
            <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
              <span className="text-[11px] text-ink-3 block font-mono">Silage pH</span>
              <span className="text-base sm:text-lg font-bold text-ink-1">
                {sample.metadata.ph} <span className="text-xs font-normal text-ink-2">pH</span>
              </span>
              <div className="mt-1">
                <EvidenceTag tag="SENSOR-MEASURED" size="sm" />
              </div>
            </div>
          )}

          {sample.metadata?.internalTemp !== undefined && (
            <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
              <span className="text-[11px] text-ink-3 block font-mono">Core Temp</span>
              <span className="text-base sm:text-lg font-bold text-ink-1">
                {sample.metadata.internalTemp}°C
              </span>
              <div className="mt-1">
                <EvidenceTag tag="SENSOR-MEASURED" size="sm" />
              </div>
            </div>
          )}

          {sample.metadata?.dryMatter !== undefined && (
            <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
              <span className="text-[11px] text-ink-3 block font-mono">Dry Matter (DM)</span>
              <span className="text-base sm:text-lg font-bold text-ink-1">
                {sample.metadata.dryMatter}%
              </span>
              <div className="mt-1">
                <EvidenceTag tag="ESTIMATED" size="sm" />
              </div>
            </div>
          )}

          {sample.physicalForm && (
            <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
              <span className="text-[11px] text-ink-3 block font-mono">Physical Form</span>
              <span className="text-sm font-semibold text-ink-1 capitalize">
                {sample.physicalForm}
              </span>
              <div className="mt-1">
                <EvidenceTag tag="DETECTED" size="sm" />
              </div>
            </div>
          )}

          {sample.metadata?.visibleMouldPct !== undefined && (
            <div className="p-3 rounded-2xl glass-surface-1 border border-edge">
              <span className="text-[11px] text-ink-3 block font-mono">Visible Mould</span>
              <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
                {sample.metadata.visibleMouldPct}%
              </span>
              <div className="mt-1">
                <EvidenceTag tag="DETECTED" size="sm" />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 3. Scientific Honesty & Provenance Box */}
      <motion.div
        variants={drawerItemVariants}
        className="p-3.5 rounded-2xl bg-forest/5 dark:bg-emerald-500/10 border border-forest/15 dark:border-emerald-500/20 space-y-1.5"
      >
        <div className="flex items-center gap-1.5 text-forest dark:text-emerald-400 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{t("drawer.provenance")}</span>
        </div>
        <p className="text-xs text-ink-2 leading-relaxed font-sans">
          {t("drawer.labNote")}
        </p>
      </motion.div>
    </SmoothDrawer>
  );
};
