"use client";

import React, { useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  interactive?: boolean;
  active?: boolean;
  solidFallback?: boolean;
  children?: React.ReactNode;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  level = 1,
  interactive = false,
  active = false,
  solidFallback = false,
  className,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const levelClass =
    level === 3
      ? "glass-surface-3"
      : level === 2
      ? "glass-surface-2"
      : "glass-surface-1";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={twMerge(
        clsx(
          "relative overflow-hidden transition-all duration-200",
          solidFallback ? "bg-bg-1 border border-edge" : levelClass,
          active && "glass-surface-active",
          interactive && "hover:-translate-y-0.5 hover:shadow-float cursor-pointer",
          className
        )
      )}
      {...props}
    >
      {interactive && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-[inherit]"
          style={{
            background:
              "radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255, 255, 255, 0.08), transparent 40%)",
          }}
        />
      )}
      {children}
    </div>
  );
};
