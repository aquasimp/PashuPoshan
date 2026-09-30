"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VoiceEngine, VoiceState } from "./voiceEngine";
import { useI18n, Locale } from "@/lib/i18n";

export type VoiceLanguageSetting = "follow" | "hi-IN" | "en-IN";

export function useVoice() {
  const { locale } = useI18n();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceLanguage, setVoiceLanguageState] = useState<VoiceLanguageSetting>("follow");
  const [hasHindiVoice, setHasHindiVoice] = useState<boolean>(true);
  const [hasEnglishVoice, setHasEnglishVoice] = useState<boolean>(true);
  const [lastSpokenText, setLastSpokenText] = useState<string>("");

  const engineRef = useRef<VoiceEngine | null>(null);

  useEffect(() => {
    const savedSetting = localStorage.getItem("feedshield_voice_lang") as VoiceLanguageSetting;
    if (savedSetting) {
      setVoiceLanguageState(savedSetting);
    }

    const engine = new VoiceEngine((state) => {
      setVoiceState(state);
    });
    engineRef.current = engine;

    // Check voices
    setTimeout(() => {
      setHasHindiVoice(engine.hasVoiceFor("hi-IN"));
      setHasEnglishVoice(engine.hasVoiceFor("en-IN"));
    }, 500);

    return () => {
      engine.stop();
    };
  }, []);

  const setVoiceLanguage = useCallback((lang: VoiceLanguageSetting) => {
    setVoiceLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("feedshield_voice_lang", lang);
    }
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);

  // Determine actual target voice language
  const resolvedLang: "hi-IN" | "en-IN" =
    voiceLanguage === "hi-IN"
      ? "hi-IN"
      : voiceLanguage === "en-IN"
      ? "en-IN"
      : locale === "en"
      ? "en-IN"
      : "hi-IN";

  const speak = useCallback(
    (text: string, customLang?: "hi-IN" | "en-IN") => {
      if (!engineRef.current || !text) return false;
      const target = customLang ?? resolvedLang;
      setLastSpokenText(text);
      return engineRef.current.speak(text, target);
    },
    [resolvedLang]
  );

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const replay = useCallback(() => {
    if (lastSpokenText) {
      speak(lastSpokenText);
    }
  }, [lastSpokenText, speak]);

  const toggleVoiceLanguage = useCallback(() => {
    if (resolvedLang === "hi-IN") {
      setVoiceLanguage("en-IN");
    } else {
      setVoiceLanguage("hi-IN");
    }
  }, [resolvedLang, setVoiceLanguage]);

  return {
    voiceState,
    isSpeaking: voiceState === "speaking",
    voiceLanguage,
    resolvedLang,
    setVoiceLanguage,
    toggleVoiceLanguage,
    speak,
    stop,
    replay,
    hasHindiVoice,
    hasEnglishVoice,
    hasTargetVoice: resolvedLang === "hi-IN" ? hasHindiVoice : hasEnglishVoice,
  };
}
