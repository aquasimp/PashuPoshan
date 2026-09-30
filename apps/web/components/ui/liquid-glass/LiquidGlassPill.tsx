"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LiquidGlass } from "./LiquidGlass";

export interface LiquidGlassPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export const LiquidGlassPill: React.FC<LiquidGlassPillProps> = ({
  active = false,
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const variantClasses = {
    default: "border-edge text-ink-2",
    success: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-400/30",
    warning: "bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-400/35",
    danger: "bg-rose-500/15 text-rose-900 dark:text-rose-300 border-rose-400/35",
    info: "bg-forest/10 dark:bg-emerald-500/15 text-forest dark:text-emerald-300 border-forest/20 dark:border-emerald-500/30",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full font-medium font-sans border backdrop-blur-md select-none transition-colors",
          sizeClasses[size],
          variantClasses[variant],
          active && "glass-surface-active font-semibold",
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
