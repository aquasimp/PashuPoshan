import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "frosted" | "solid" | "hero";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "frosted",
}) => {
  const variantStyles = {
    // Frosted glass with graceful fallback for prefers-reduced-transparency
    frosted:
      "bg-surface/90 backdrop-blur-md border border-bone/80 shadow-card [@media(prefers-reduced-transparency:reduce)]:bg-surface [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none",
    solid: "bg-surface border border-bone shadow-card",
    hero:
      "bg-surface/95 backdrop-blur-lg border border-forest/15 shadow-float [@media(prefers-reduced-transparency:reduce)]:bg-surface",
  }[variant];

  return (
    <div className={`rounded-2xl transition-all duration-200 ${variantStyles} ${className}`}>
      {children}
    </div>
  );
};
