"use client";

import React, { useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface (Level 3 Glass) */}
      <div
        className={twMerge(
          clsx(
            "relative w-full glass-surface-3 rounded-3xl p-6 sm:p-7 shadow-float border border-edge z-10 my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150",
            maxWidthClasses[maxWidth],
            className
          )
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-edge shrink-0">
          {title && (
            <h3 className="font-display font-bold text-xl text-ink-1">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 -mr-2 rounded-xl text-ink-2 hover:text-ink-1 hover:bg-glass-1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Surface (Level 3 Glass) */}
      <div
        className={twMerge(
          clsx(
            "relative w-full glass-surface-3 rounded-t-3xl p-6 shadow-float border-t border-edge z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200",
            className
          )
        )}
      >
        <div className="mx-auto w-12 h-1.5 rounded-full bg-edge-hi mb-4 shrink-0" />
        <div className="flex items-center justify-between pb-3 border-b border-edge shrink-0">
          {title && (
            <h3 className="font-display font-bold text-lg text-ink-1">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            className="p-2 -mr-2 rounded-xl text-ink-2 hover:text-ink-1 hover:bg-glass-1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto flex-1 pb-4">{children}</div>
      </div>
    </div>
  );
};
