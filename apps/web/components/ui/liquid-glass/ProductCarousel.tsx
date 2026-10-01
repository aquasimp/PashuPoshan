"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StatusChip, StatusLevel } from "@/components/ui/StatusChip";
import { EvidenceTag, EvidenceTagType } from "@/components/ui/EvidenceTag";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { useI18n } from "@/lib/i18n";

export interface CarouselItemMetric {
  label: string;
  value: string | number;
  unit?: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  sampleType?: "silage" | "feed" | string;
  physicalForm?: string;
  image?: string;
  imageSrc?: string;
  date?: string;
  status?: StatusLevel;
  qualityStatus?: string;
  riskState?: string;
  decision?: "FEED" | "BLEND" | "RE-TEST" | "RE_TEST" | "DISCARD" | string;
  evidenceTag?: EvidenceTagType | string;
  isDemo?: boolean;
  metrics?: CarouselItemMetric[];
  badge?: string;
  href?: string;
  onClick?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  secondaryActionLabel?: string;
}

export interface ProductCarouselProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  items: CarouselItem[];
  onItemClick?: (item: CarouselItem) => void;
  onCardClick?: (item: CarouselItem) => void;
  viewAllHref?: string;
  viewAllLabel?: string;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  className?: string;
  cardWidth?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

/* Botanical Agritech SVG Visual Fallback when no direct photo URL is supplied */
function FeedItemVisual({
  item,
}: {
  item: CarouselItem;
}) {
  const isSilage = item.sampleType === "silage" || item.title.toLowerCase().includes("silage");
  const isHighRisk = item.status === "HIGH RISK" || item.decision === "DISCARD";
  const isAttention = item.status === "ATTENTION" || item.decision === "BLEND";

  // If user provided a genuine image
  if (item.image) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-bg-1 border border-edge/60">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 280px, 320px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>
    );
  }

  // Pure SVG editorial AgriTech visual representation
  return (
    <div
      className={clsx(
        "relative aspect-[16/10] w-full overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between p-3.5 select-none",
        isHighRisk
          ? "bg-gradient-to-br from-terracotta/25 via-terracotta/10 to-bg-1 dark:from-terracotta/30 dark:via-[#1c0e0b] dark:to-bg-0 border-terracotta/30"
          : isAttention
          ? "bg-gradient-to-br from-amber/25 via-amber/10 to-bg-1 dark:from-amber/25 dark:via-[#1c160b] dark:to-bg-0 border-amber/30"
          : isSilage
          ? "bg-gradient-to-br from-forest/20 via-moss/10 to-bg-1 dark:from-forest/30 dark:via-[#0e1a14] dark:to-bg-0 border-forest/20 dark:border-emerald-500/25"
          : "bg-gradient-to-br from-amber-600/15 via-amber-500/5 to-bg-1 dark:from-amber-600/20 dark:via-[#16120b] dark:to-bg-0 border-edge"
      )}
    >
      {/* Background Graphic Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.08] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`pat-${item.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-${item.id})`} />
      </svg>

      {/* Top Graphic Accent */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <div
            className={clsx(
              "w-7 h-7 rounded-xl flex items-center justify-center border shadow-xs",
              isHighRisk
                ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/30"
                : isAttention
                ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400/30"
                : isSilage
                ? "bg-forest/15 dark:bg-emerald-500/20 text-forest dark:text-emerald-300 border-forest/20 dark:border-emerald-400/30"
                : "bg-amber-600/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
            )}
          >
            {isSilage ? (
              <Thermometer className="w-3.5 h-3.5" />
            ) : isHighRisk ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <Layers className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-2 font-mono">
            {item.physicalForm || item.sampleType || "Sample"}
          </span>
        </div>

        {item.isDemo && <DemoBadge label="DEMO" size="sm" />}
      </div>

      {/* Bottom Center Visual Representation */}
      <div className="relative z-10 flex items-end justify-between">
        <span className="text-[10px] font-mono text-ink-3 dark:text-dark-muted px-2 py-0.5 rounded-md bg-bg-0/80 dark:bg-bg-1/80 border border-edge backdrop-blur-xs">
          {item.id}
        </span>
        {item.evidenceTag && <EvidenceTag tag={item.evidenceTag} size="sm" />}
      </div>
    </div>
  );
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  items,
  onItemClick,
  onCardClick,
  viewAllHref,
  viewAllLabel,
  loading = false,
  error,
  emptyMessage,
  emptyAction,
  className,
  cardWidth = "md",
  ariaLabel,
}) => {
  const { t } = useI18n();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollBounds, { passive: true });
    window.addEventListener("resize", checkScrollBounds);

    return () => {
      el.removeEventListener("scroll", checkScrollBounds);
      window.removeEventListener("resize", checkScrollBounds);
    };
  }, [items, checkScrollBounds]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardEl = el.querySelector<HTMLElement>("[data-carousel-card]");
    const scrollStep = cardEl ? cardEl.offsetWidth + 16 : 300;
    el.scrollBy({
      left: direction === "left" ? -scrollStep : scrollStep,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByAmount("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByAmount("right");
    }
  };

  const cardWidthClass = {
    sm: "w-[240px] sm:w-[260px]",
    md: "w-[270px] sm:w-[295px] md:w-[320px]",
    lg: "w-[300px] sm:w-[340px] md:w-[360px]",
  }[cardWidth];

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel || (typeof title === "string" ? title : t("carousel.recentTestsTitle"))}
      className={twMerge("w-full py-2", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Header with Title and Scroll Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 px-1">
        <div>
          {title && (
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-1 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-ink-2 mt-0.5 leading-relaxed font-sans">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-semibold text-forest dark:text-emerald-400 hover:text-deep dark:hover:text-emerald-300 flex items-center gap-1 mr-2 hover:underline transition-colors"
            >
              <span>{viewAllLabel || t("carousel.viewAll")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canScrollLeft}
              aria-label={t("carousel.scrollLeft")}
              className={clsx(
                "w-9 h-9 rounded-2xl flex items-center justify-center border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-forest dark:focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px]",
                canScrollLeft
                  ? "bg-glass-2 border-edge text-ink-1 hover:bg-glass-3 hover:border-edge-hi hover:scale-105 active:scale-95 shadow-subtle cursor-pointer"
                  : "bg-glass-1 border-edge/40 text-ink-3/40 cursor-not-allowed opacity-50"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canScrollRight}
              aria-label={t("carousel.scrollRight")}
              className={clsx(
                "w-9 h-9 rounded-2xl flex items-center justify-center border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-forest dark:focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px]",
                canScrollRight
                  ? "bg-glass-2 border-edge text-ink-1 hover:bg-glass-3 hover:border-edge-hi hover:scale-105 active:scale-95 shadow-subtle cursor-pointer"
                  : "bg-glass-1 border-edge/40 text-ink-3/40 cursor-not-allowed opacity-50"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error ? (
        <div className="p-8 text-center glass-surface-1 rounded-3xl border border-rose-500/20 my-2 space-y-3">
          <AlertTriangle className="w-8 h-8 mx-auto text-rose-500 dark:text-rose-400 mb-1" />
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </p>
        </div>
      ) : loading ? (
        /* Loading Skeleton State */
        <div className="flex gap-4 overflow-hidden py-2 px-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={clsx(
                cardWidthClass,
                "flex-none rounded-3xl p-4 glass-surface-1 border border-edge animate-pulse space-y-3"
              )}
            >
              <div className="aspect-[16/10] rounded-2xl bg-bg-1 dark:bg-dark-card/60" />
              <div className="h-4 bg-bg-1 dark:bg-dark-card/60 rounded-md w-3/4" />
              <div className="h-3 bg-bg-1 dark:bg-dark-card/60 rounded-md w-1/2" />
              <div className="h-10 bg-bg-1 dark:bg-dark-card/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="p-8 text-center glass-surface-1 rounded-3xl border border-edge my-2 space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-forest/50 dark:text-emerald-400/50 mb-1" />
          <p className="text-sm font-medium text-ink-2">
            {emptyMessage || t("carousel.noItems")}
          </p>
          {emptyAction && (
            <Link
              href={emptyAction.href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest dark:bg-emerald-600 text-white text-xs font-semibold hover:bg-deep transition-colors"
            >
              <span>{emptyAction.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        /* Horizontal Snap Scroll Container */
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          aria-label={t("carousel.recentTestsTitle")}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-forest dark:focus-visible:ring-emerald-400 rounded-3xl"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              data-carousel-card="true"
              className={clsx(
                cardWidthClass,
                "flex-none snap-start group relative rounded-3xl p-4 sm:p-5 glass-surface-1 border border-edge hover:border-forest/40 dark:hover:border-emerald-500/40 hover:glass-surface-2 hover:-translate-y-1 transition-all duration-300 shadow-subtle hover:shadow-card flex flex-col justify-between"
              )}
            >
              <div className="space-y-3">
                {/* 1. Card Visual Header */}
                <FeedItemVisual item={item} />

                {/* 2. Quality Status & Decision Pill */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                  {item.status && <StatusChip status={item.status} size="sm" />}
                  {item.decision && (
                    <span
                      className={clsx(
                        "text-[11px] font-bold px-2 py-0.5 rounded-md border tracking-wide",
                        item.decision === "FEED"
                          ? "bg-emerald-500/10 text-forest dark:text-emerald-300 border-emerald-500/20"
                          : item.decision === "BLEND"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : item.decision === "RE_TEST"
                          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                      )}
                    >
                      {item.decision}
                    </span>
                  )}
                </div>

                {/* 3. Sample ID + Title */}
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-ink-1 group-hover:text-forest dark:group-hover:text-emerald-300 transition-colors line-clamp-1 leading-snug break-words">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-ink-2 mt-0.5 line-clamp-2 leading-relaxed break-words font-sans">
                      {item.subtitle}
                    </p>
                  )}
                  {item.date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-3 mt-1.5 font-sans">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{item.date}</span>
                    </div>
                  )}
                </div>

                {/* 4. Key Metrics Grid (if any) */}
                {item.metrics && item.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                    {item.metrics.slice(0, 3).map((m, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded-xl bg-bg-1/80 dark:bg-bg-1/90 border border-edge text-center"
                      >
                        <span className="text-[10px] text-ink-3 block font-mono uppercase tracking-tight truncate">
                          {m.label}
                        </span>
                        <span className="text-xs font-bold text-ink-1 block truncate">
                          {m.value}
                          {m.unit && <span className="text-[10px] font-normal text-ink-2 ml-0.5">{m.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Action Footer */}
              <div className="mt-4 pt-3 border-t border-edge/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (item.onAction) item.onAction();
                    else if (item.onClick) item.onClick();
                    else if (onCardClick) onCardClick(item);
                    else if (onItemClick) onItemClick(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest/10 dark:bg-emerald-500/15 text-forest dark:text-emerald-300 hover:bg-forest hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all text-xs font-semibold min-h-[36px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{item.actionLabel || t("carousel.quickView")}</span>
                </button>

                <Link
                  href={item.href || `/test/result?id=${item.id}`}
                  className="text-xs font-semibold text-ink-2 hover:text-forest dark:hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-all py-1 min-h-[36px]"
                >
                  <span>{item.secondaryActionLabel || t("carousel.viewResult")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
