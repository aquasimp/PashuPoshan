import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "frosted" | "solid" | "hero" | "pill";
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  variant = "frosted",
  onClick,
}) => {
  const variantStyles = {
    // Frosted liquid-glass with specular top reflection and dark-mode adaptation
    frosted:
      "bg-surface/85 dark:bg-dark-surface/85 backdrop-blur-md border border-bone/80 dark:border-white/10 shadow-card text-ink dark:text-dark-ink [@media(prefers-reduced-transparency:reduce)]:bg-surface dark:[@media(prefers-reduced-transparency:reduce)]:bg-dark-surface [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none",
    solid:
      "bg-surface dark:bg-dark-surface border border-bone dark:border-white/10 shadow-card text-ink dark:text-dark-ink",
    hero:
      "bg-surface/92 dark:bg-dark-surface/92 backdrop-blur-lg border border-forest/20 dark:border-white/15 shadow-float text-ink dark:text-dark-ink [@media(prefers-reduced-transparency:reduce)]:bg-surface dark:[@media(prefers-reduced-transparency:reduce)]:bg-dark-surface",
    pill:
      "bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-md border border-bone/70 dark:border-white/10 shadow-subtle text-ink dark:text-dark-ink rounded-full",
  }[variant];

  const rounded = variant === "pill" ? "rounded-full" : "rounded-2xl";

  return (
    <div
      onClick={onClick}
      className={`${rounded} transition-all duration-200 ${variantStyles} ${className}`}
    >
      {children}
    </div>
  );
};
