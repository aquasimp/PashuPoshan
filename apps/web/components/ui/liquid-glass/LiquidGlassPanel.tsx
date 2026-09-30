"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LiquidGlass, LiquidGlassProps } from "./LiquidGlass";

export interface LiquidGlassPanelProps extends Omit<LiquidGlassProps, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const LiquidGlassPanel: React.FC<LiquidGlassPanelProps> = ({
  title,
  subtitle,
  action,
  level = 2,
  className,
  children,
  ...props
}) => {
  return (
    <LiquidGlass
      level={level}
      className={twMerge(clsx("rounded-3xl p-6 sm:p-8 space-y-4", className))}
      {...props}
    >
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-edge">
          <div>
            {title && (
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ink-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-ink-2 mt-0.5 leading-relaxed font-sans">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </LiquidGlass>
  );
};

export const LiquidGlassToolbar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          "glass-surface-3 p-2 rounded-2xl border border-edge flex items-center gap-2 flex-wrap",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
