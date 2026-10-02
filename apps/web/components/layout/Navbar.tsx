"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Wifi,
  WifiOff,
  ChevronDown,
  Home,
  PlusCircle,
  History,
  RefreshCw,
  MoreHorizontal,
  Compass,
  Layers,
  Sparkles,
  BarChart3,
  Warehouse,
  Settings,
  Palette,
  ExternalLink,
  Download,
  Smartphone,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CompactLanguageSelect } from "@/components/ui/CompactLanguageSelect";
import { Sheet } from "@/components/ui/liquid-glass";
import { db } from "@/lib/db";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkOutbox = async () => {
      try {
        const count = await db.outbox.where("status").equals("pending").count();
        setPendingSyncCount(count);
      } catch (e) {
        // Dexie might not be ready during hydration
      }
    };
    checkOutbox();
    const interval = setInterval(checkOutbox, 4000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Close desktop "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreOpen]);

  // Primary 4 desktop links
  const primaryLinks = [
    { href: "/test", label: t("nav.test") },
    { href: "/demo/hero", label: t("nav.demo") },
    { href: "/history", label: t("nav.history") },
    { href: "/models", label: t("nav.models") },
  ];

  // Secondary items for "More" menu
  const secondaryLinks = [
    { href: "/download", label: t("nav.download"), icon: Smartphone },
    { href: "/demo/tour", label: t("nav.tour"), icon: Compass },
    { href: "/compare", label: t("nav.compare"), icon: Layers },
    { href: "/storage", label: t("nav.storage"), icon: Warehouse },
    { href: "/sync", label: `${t("nav.sync")} (${pendingSyncCount})`, icon: RefreshCw },
    { href: "/admin", label: t("nav.admin"), icon: BarChart3 },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
    { href: "/design-system", label: t("nav.designSystem"), icon: Palette },
  ];

  const isMoreActive = secondaryLinks.some((l) => pathname === l.href);

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 py-2.5 glass-surface-2 backdrop-blur-xl border-b border-edge transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand + SIH26111 Chip */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-forest dark:bg-emerald-950/80 border border-forest/30 dark:border-emerald-600/40 flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform flex-shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-base sm:text-lg text-ink-1 tracking-tight leading-none">
                  PashuPoshan
                </span>
                <span className="text-[10px] text-ink-3 hidden sm:block tracking-wide">
                  AI Feed &amp; Silage
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-moss/10 dark:bg-moss/20 text-moss dark:text-emerald-300 border border-moss/20 dark:border-moss/40">
              SIH26111
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs xl:text-sm font-medium">
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? "glass-surface-active border border-edge text-forest dark:text-emerald-300 font-semibold shadow-subtle"
                      : "text-ink-2 hover:text-ink-1 hover:glass-surface-1"
                  }`}
                >
                  <span className="text-balance leading-normal">{link.label}</span>
                </Link>
              );
            })}

            {/* Desktop "More" Dropdown Menu */}
            <div ref={moreRef} className="relative inline-block">
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                aria-haspopup="true"
                aria-expanded={isMoreOpen}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isMoreActive
                    ? "glass-surface-active border border-edge text-forest dark:text-emerald-300 font-semibold"
                    : "text-ink-2 hover:text-ink-1 hover:glass-surface-1"
                }`}
              >
                <span>{t("nav.more")}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? "rotate-180" : ""}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-2xl glass-surface-3 border border-edge shadow-elevated z-50 animate-in fade-in zoom-in-95 duration-150">
                  {secondaryLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMoreOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "glass-surface-active text-forest dark:text-emerald-300 font-semibold border border-edge"
                            : "text-ink-2 hover:text-ink-1 hover:glass-surface-2"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-forest dark:text-emerald-400 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Action Controls Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Download APK Quick Action Pill */}
            <Link
              href="/download"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest/10 hover:bg-forest/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-forest dark:text-emerald-300 border border-forest/20 dark:border-emerald-500/30 transition-all hover:scale-105"
              title="Download Android APK (v1.0 • 5.7 MB)"
              id="nav-btn-download-apk"
            >
              <Download className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
              <span>{t("nav.download")}</span>
            </Link>

            {/* Online / Offline Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border font-sans ${
                isOnline
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60"
              }`}
              title={isOnline ? "Online Sync Active" : "Offline On-Device Mode"}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-moss dark:text-emerald-400" />
                  <span className="hidden sm:inline">{t("nav.online")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span className="hidden sm:inline">{t("nav.offline")}</span>
                </>
              )}
            </div>

            {/* Sync Badge if pending items */}
            {pendingSyncCount > 0 && (
              <Link
                href="/sync"
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:scale-105 transition-transform"
                title={`${pendingSyncCount} items queued for sync`}
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{pendingSyncCount}</span>
              </Link>
            )}

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle compact />

            {/* Compact Language Selector Dropdown */}
            <CompactLanguageSelect />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Thumb-reachable Navigation) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-surface-3 backdrop-blur-xl border-t border-edge py-1.5 px-2 flex items-center justify-around shadow-float"
      >
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all ${
            pathname === "/"
              ? "text-forest dark:text-emerald-300 font-semibold"
              : "text-ink-2 hover:text-ink-1"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-sans">{t("nav.home")}</span>
        </Link>

        <Link
          href="/test"
          aria-current={pathname === "/test" ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all ${
            pathname === "/test"
              ? "text-forest dark:text-emerald-300 font-semibold"
              : "text-ink-2 hover:text-ink-1"
          }`}
        >
          <PlusCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-sans">{t("nav.test")}</span>
        </Link>

        <Link
          href="/history"
          aria-current={pathname === "/history" ? "page" : undefined}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all ${
            pathname === "/history"
              ? "text-forest dark:text-emerald-300 font-semibold"
              : "text-ink-2 hover:text-ink-1"
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-sans">{t("nav.history")}</span>
        </Link>

        <Link
          href="/sync"
          aria-current={pathname === "/sync" ? "page" : undefined}
          className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all ${
            pathname === "/sync"
              ? "text-forest dark:text-emerald-300 font-semibold"
              : "text-ink-2 hover:text-ink-1"
          }`}
        >
          <RefreshCw className="w-5 h-5 mb-0.5" />
          {pendingSyncCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {pendingSyncCount}
            </span>
          )}
          <span className="text-[10px] leading-tight font-sans">{t("nav.sync")}</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileSheetOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all ${
            isMobileSheetOpen || isMoreActive
              ? "text-forest dark:text-emerald-300 font-semibold"
              : "text-ink-2 hover:text-ink-1"
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-sans">{t("nav.more")}</span>
        </button>
      </nav>

      {/* Mobile "More" Sheet Modal */}
      <Sheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        title={t("nav.moreModules")}
      >
        <div className="space-y-2">
          {/* Download Android App Promo in Sheet */}
          <Link
            href="/download"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-ink-1 transition-all"
          >
            <Smartphone className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <span>{t("nav.download")}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-forest dark:text-emerald-300">
                  v1.0 · 5.7 MB
                </span>
              </div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.download")}</div>
            </div>
          </Link>

          <Link
            href="/demo/hero"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <Sparkles className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.demo")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.demo")}</div>
            </div>
          </Link>

          <Link
            href="/demo/tour"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <Compass className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.tour")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.tour")}</div>
            </div>
          </Link>

          <Link
            href="/models"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <Layers className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.models")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.models")}</div>
            </div>
          </Link>

          <Link
            href="/compare"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <Layers className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.compare")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.compare")}</div>
            </div>
          </Link>

          <Link
            href="/storage"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <Warehouse className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.storage")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.storage")}</div>
            </div>
          </Link>

          <Link
            href="/settings"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <Settings className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.settings")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.settings")}</div>
            </div>
          </Link>

          <Link
            href="/admin"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <BarChart3 className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.admin")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.admin")}</div>
            </div>
          </Link>

          <Link
            href="/design-system"
            onClick={() => setIsMobileSheetOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl glass-surface-1 hover:glass-surface-2 border border-edge text-ink-1 transition-all"
          >
            <Palette className="w-5 h-5 text-forest dark:text-emerald-400" />
            <div>
              <div className="text-sm font-semibold">{t("nav.designSystem")}</div>
              <div className="text-xs text-ink-2">{t("nav.subtitles.designSystem")}</div>
            </div>
          </Link>

          <div className="pt-4 mt-2 border-t border-edge flex items-center justify-between text-xs text-ink-3">
            <span className="font-mono">SIH26111 · PashuPoshan</span>
            <span className="font-sans">Offline-first AI System</span>
          </div>
        </div>
      </Sheet>
    </>
  );
};
