"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LiquidGlass, LiquidGlassProps } from "./LiquidGlass";

export interface LiquidGlassCardProps extends LiquidGlassProps {
  variant?: "default" | "elevated" | "hero";
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  variant = "default",
  level,
  className,
  children,
  ...props
}) => {
  const resolvedLevel = level ?? (variant === "hero" ? 2 : variant === "elevated" ? 2 : 1);

  return (
    <LiquidGlass
      level={resolvedLevel}
      className={twMerge(
        clsx(
          "rounded-3xl p-6 sm:p-7 transition-all duration-200",
          variant === "hero" && "border-2 border-forest/20 dark:border-emerald-500/30",
          className
        )
      )}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
};
