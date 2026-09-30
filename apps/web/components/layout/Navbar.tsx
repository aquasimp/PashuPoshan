"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Wifi, WifiOff, Menu, X, BarChart3, Cpu, Sparkles, Navigation } from "lucide-react";
import { LanguageSwitcher, useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { db } from "@/lib/db";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check Dexie outbox for pending sync
    const checkOutbox = async () => {
      try {
        const count = await db.outbox.where("status").equals("pending").count();
        setPendingSyncCount(count);
      } catch (e) {
        // Dexie might not be ready in SSR
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

  const navLinks = [
    { href: "/", label: t("farmer.homeTitle") },
    { href: "/test", label: t("farmer.startTest") },
    { href: "/demo/hero", label: "Hero Demo" },
    { href: "/demo/tour", label: "Judge Tour" },
    { href: "/models", label: "Models" },
    { href: "/history", label: t("farmer.recentTests") },
    { href: "/sync", label: `Sync (${pendingSyncCount})` },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 py-2.5 glass-nav transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-forest dark:bg-dark-forest flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-all">
            <ShieldCheck className="w-5 h-5 text-mist" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-forest dark:text-dark-ink tracking-tight block leading-none">
              PashuPoshan
            </span>
            <span className="text-[10px] text-muted dark:text-dark-muted tracking-wider uppercase font-sans">
              SIH26111
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-1 ${
                pathname === link.href
                  ? "text-forest dark:text-dark-forest border-b-2 border-forest dark:border-dark-forest font-semibold"
                  : "text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className={`transition-colors py-1 flex items-center gap-1 ${
              pathname === "/admin"
                ? "text-forest dark:text-dark-forest border-b-2 border-forest dark:border-dark-forest font-semibold"
                : "text-muted dark:text-dark-muted hover:text-ink dark:hover:text-dark-ink"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline status indicator */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border font-sans ${
              isOnline
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60"
            }`}
            title={isOnline ? "Online Central Sync Active" : "Working Offline on Local Device"}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-moss dark:text-emerald-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle compact />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-ink dark:text-dark-ink hover:bg-bone dark:hover:bg-dark-card transition-colors border border-transparent hover:border-bone dark:hover:border-white/10"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden pt-3 pb-2 border-t border-bone/80 dark:border-white/10 mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-forest dark:bg-dark-forest text-white"
                  : "text-ink dark:text-dark-ink hover:bg-bone dark:hover:bg-dark-card"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-bone/60 dark:border-white/10 flex items-center justify-between px-3">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-muted dark:text-dark-muted hover:text-forest dark:hover:text-dark-forest flex items-center gap-1.5 py-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Center</span>
            </Link>
            <Link
              href="/design-system"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-muted dark:text-dark-muted hover:text-forest dark:hover:text-dark-forest py-1"
            >
              <span>Design System</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
