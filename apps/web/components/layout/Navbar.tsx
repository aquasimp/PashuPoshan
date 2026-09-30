"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Wifi, WifiOff, RefreshCw, Menu, X, FileText, History, BarChart3, Database } from "lucide-react";
import { LanguageSwitcher, useI18n } from "@/lib/i18n";
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
    { href: "/history", label: t("farmer.recentTests") },
    { href: "/compare", label: "Compare" },
    { href: "/demo/hero", label: "Hero Demo" },
    { href: "/sync", label: `Sync (${pendingSyncCount})` },
    { href: "/design-system", label: "Design" },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-surface/90 backdrop-blur-md border-b border-bone shadow-subtle [@media(prefers-reduced-transparency:reduce)]:bg-surface">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-white shadow-card group-hover:bg-deep transition-colors">
            <ShieldCheck className="w-5 h-5 text-mist" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-forest tracking-tight block leading-none">
              FeedShield
            </span>
            <span className="text-[10px] text-muted tracking-wider uppercase font-sans">
              SIH26111
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-1 ${
                pathname === link.href
                  ? "text-forest border-b-2 border-forest font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Online/Offline status indicator */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border font-sans ${
              isOnline
                ? "bg-emerald-50 text-forest border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}
            title={isOnline ? "Online Central Sync Active" : "Working Offline on Local Device"}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-moss" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Offline</span>
              </>
            )}
          </div>

          <LanguageSwitcher />

          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-ink hover:bg-bone transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 border-t border-bone mt-2 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === link.href ? "bg-forest text-white" : "text-ink hover:bg-bone"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-3 pt-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-muted hover:text-forest flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin & Analytics Center</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
