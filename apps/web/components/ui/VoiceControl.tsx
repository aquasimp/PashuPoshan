"use client";

import React from "react";
import { Volume2, Square, RotateCcw, AlertCircle, Languages } from "lucide-react";
import { useVoice } from "@/lib/voice/useVoice";
import { useI18n } from "@/lib/i18n";
import { LiquidGlassButton } from "./liquid-glass/LiquidGlassButton";

interface VoiceControlProps {
  textToSpeak: string;
  className?: string;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ textToSpeak, className = "" }) => {
  const { t } = useI18n();
  const {
    isSpeaking,
    resolvedLang,
    speak,
    stop,
    replay,
    toggleVoiceLanguage,
    hasTargetVoice,
    voiceState,
  } = useVoice();

  const handleListen = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(textToSpeak);
    }
  };

  if (voiceState === "unsupported") {
    return (
      <div className={`p-3 rounded-2xl glass-surface-1 border border-edge text-xs text-ink-2 flex items-center gap-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>{t("voice.notSupported")}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Main Listen / Stop Button (48px+ touch target, balanced text) */}
        {!isSpeaking ? (
          <LiquidGlassButton
            type="button"
            variant="primary"
            size="md"
            icon={<Volume2 className="w-5 h-5 text-emerald-300" />}
            onClick={handleListen}
            className="flex-1 sm:flex-initial min-h-[48px] px-6 shadow-float"
            id="btn-voice-listen"
          >
            <span>{t("voice.listen")}</span>
          </LiquidGlassButton>
        ) : (
          <LiquidGlassButton
            type="button"
            variant="danger"
            size="md"
            icon={<Square className="w-4 h-4 text-white fill-white" />}
            onClick={stop}
            className="flex-1 sm:flex-initial min-h-[48px] px-6 animate-pulse"
            id="btn-voice-stop"
          >
            <span>{t("voice.stop")}</span>
          </LiquidGlassButton>
        )}

        {/* Replay Button */}
        <LiquidGlassButton
          type="button"
          variant="secondary"
          size="md"
          icon={<RotateCcw className="w-4 h-4 text-forest dark:text-emerald-400" />}
          onClick={replay}
          title={t("voice.replay")}
          aria-label={t("voice.replay")}
          className="min-h-[48px] min-w-[48px] px-3.5"
          id="btn-voice-replay"
        >
          <span className="hidden sm:inline">{t("voice.replay")}</span>
        </LiquidGlassButton>

        {/* Quick Voice Language Switch (e.g. "हिं | EN") */}
        <button
          type="button"
          onClick={toggleVoiceLanguage}
          className="min-h-[48px] px-3 rounded-2xl glass-surface-2 hover:glass-surface-3 border border-edge flex items-center gap-1.5 text-xs font-semibold text-ink-1 transition-all focus-visible:ring-2 focus-visible:ring-forest"
          title="Switch Voice Language between Hindi and English"
        >
          <Languages className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
          <span className="font-mono">
            {resolvedLang === "hi-IN" ? "हिन्दी" : "EN (India)"}
          </span>
        </button>
      </div>

      {/* No Voice Available Alert notice */}
      {!hasTargetVoice && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t("voice.noVoiceNotice")}
          </p>
        </div>
      )}
    </div>
  );
};
