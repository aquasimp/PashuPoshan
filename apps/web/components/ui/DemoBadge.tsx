import React from "react";
import { Sparkles, Info } from "lucide-react";

interface DemoBadgeProps {
  label?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = "DEMO DATA",
  subtext = "Synthesized physics benchmark - NOT a validation of field accuracy",
  size = "md",
  className = "",
}) => {
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1"
      : size === "lg"
      ? "px-3 py-1.5 text-xs gap-2"
      : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <div
      className={`inline-flex items-center bg-amber-100/90 border border-amber-300 rounded-md text-amber-900 font-medium font-sans shadow-xs ${sizeClasses} ${className}`}
      title={subtext}
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
      <span className="font-bold tracking-wider uppercase text-[10px]">{label}</span>
      {subtext && (
        <span className="hidden md:inline-block text-[10px] text-amber-800/80 border-l border-amber-300 pl-1.5 ml-0.5">
          {subtext}
        </span>
      )}
    </div>
  );
};
