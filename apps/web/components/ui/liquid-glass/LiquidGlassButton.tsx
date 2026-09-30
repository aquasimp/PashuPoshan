"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface LiquidGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2.5 font-sans font-semibold rounded-2xl select-none min-h-[48px] min-w-0 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-forest dark:focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-3 text-sm leading-relaxed",
    lg: "px-7 py-3.5 text-base leading-relaxed",
  };

  const variantClasses = {
    primary:
      "bg-forest dark:bg-[#235841] text-white dark:text-[#F3EDDD] border border-white/20 dark:border-white/15 shadow-float hover:bg-deep dark:hover:bg-[#2C6E52] hover:-translate-y-0.5",
    secondary:
      "bg-glass-2 text-ink-1 dark:text-ink-1 border border-edge hover:border-edge-hi hover:bg-glass-3 shadow-subtle hover:-translate-y-0.5",
    danger:
      "bg-rose-600/90 text-white border border-rose-400/40 hover:bg-rose-700 shadow-subtle hover:-translate-y-0.5",
    ghost:
      "bg-transparent text-ink-2 hover:text-ink-1 hover:bg-glass-1 border border-transparent hover:border-edge",
  };

  return (
    <button
      disabled={disabled}
      className={twMerge(
        clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)
      )}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className="flex-none shrink-0">{icon}</span>
      )}
      {children && (
        <span className="text-balance text-center leading-[1.5] break-words">
          {children}
        </span>
      )}
      {icon && iconPosition === "right" && (
        <span className="flex-none shrink-0">{icon}</span>
      )}
    </button>
  );
};
