"use client";

import { normalizeForSpeech, chunkSentenceText, SpeechLang } from "./speech-normalizer";

export interface VoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export type VoiceState = "idle" | "speaking" | "paused" | "error" | "unsupported";

export class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private queue: string[] = [];
  private currentLang: "hi-IN" | "en-IN" = "hi-IN";
  private onStateChange?: (state: VoiceState) => void;

  constructor(onStateChange?: (state: VoiceState) => void) {
    this.onStateChange = onStateChange;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
      // Cancel speech if page hidden
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.stop();
        }
      });
    } else {
      this.onStateChange?.("unsupported");
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableVoices(): VoiceOption[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices.map((v) => ({
      voiceURI: v.voiceURI,
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      default: v.default,
    }));
  }

  /**
   * Selection ladder for target language code L ('hi-IN', 'en-IN')
   * 1. Saved voiceURI matching L
   * 2. Exact locale match (offline prefers localService === true)
   * 3. Any voice whose lang starts with language prefix (hi, en)
   * 4. Return null if none available.
   */
  public selectVoice(targetLang: "hi-IN" | "en-IN", savedVoiceUri?: string): SpeechSynthesisVoice | null {
    if (!this.synth || this.voices.length === 0) {
      this.loadVoices();
    }
    if (this.voices.length === 0) return null;

    const langPrefix = targetLang.split("-")[0].toLowerCase();
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    // 1. Saved voiceURI
    if (savedVoiceUri) {
      const match = this.voices.find(
        (v) => v.voiceURI === savedVoiceUri && v.lang.toLowerCase().startsWith(langPrefix)
      );
      if (match) return match;
    }

    // 2. Exact locale match
    const exactMatches = this.voices.filter(
      (v) => v.lang.toLowerCase().replace("_", "-") === targetLang.toLowerCase()
    );
    if (exactMatches.length > 0) {
      if (isOffline) {
        const local = exactMatches.find((v) => v.localService);
        if (local) return local;
      }
      return exactMatches[0];
    }

    // 3. Prefix match
    const prefixMatches = this.voices.filter((v) =>
      v.lang.toLowerCase().startsWith(langPrefix)
    );
    if (prefixMatches.length > 0) {
      if (isOffline) {
        const local = prefixMatches.find((v) => v.localService);
        if (local) return local;
      }
      return prefixMatches[0];
    }

    // 4. No matching voice in ladder
    return null;
  }

  public hasVoiceFor(targetLang: "hi-IN" | "en-IN"): boolean {
    return this.selectVoice(targetLang) !== null;
  }

  /**
   * Reads raw advisory text, normalizes it, chunks it by sentence (<=180 chars),
   * and plays the chunks sequentially.
   */
  public speak(
    rawText: string,
    targetLang: "hi-IN" | "en-IN" = "hi-IN",
    options: { rate?: number; pitch?: number; savedVoiceUri?: string } = {}
  ): boolean {
    if (!this.synth) {
      this.onStateChange?.("unsupported");
      return false;
    }

    this.stop();

    const selectedVoice = this.selectVoice(targetLang, options.savedVoiceUri);

    // Rule: Never read Devanagari with an English voice, or the reverse
    const hasDevanagari = /[\u0900-\u097F]/.test(rawText);
    if (targetLang === "en-IN" && hasDevanagari) {
      console.warn("Safety Check: Cannot read Devanagari script with English voice.");
      this.onStateChange?.("error");
      return false;
    }

    if (!selectedVoice) {
      this.onStateChange?.("error");
      return false;
    }

    const speechLangType: SpeechLang = targetLang === "hi-IN" ? "hi" : "en";
    const normalized = normalizeForSpeech(rawText, speechLangType);
    const chunks = chunkSentenceText(normalized, 180);

    if (chunks.length === 0) return false;

    this.queue = [...chunks];
    this.currentLang = targetLang;
    this.isSpeaking = true;
    this.onStateChange?.("speaking");

    this.playNextChunk(selectedVoice, targetLang, options.rate, options.pitch);
    return true;
  }

  private playNextChunk(
    voice: SpeechSynthesisVoice,
    targetLang: "hi-IN" | "en-IN",
    customRate?: number,
    pitch: number = 1.0
  ) {
    if (!this.synth || this.queue.length === 0 || !this.isSpeaking) {
      this.isSpeaking = false;
      this.onStateChange?.("idle");
      return;
    }

    const chunk = this.queue.shift()!;
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.voice = voice;
    utterance.lang = targetLang;
    utterance.pitch = pitch;
    // Default rate: 0.9 for Hindi for clarity; 1.0 for English
    utterance.rate = customRate ?? (targetLang === "hi-IN" ? 0.9 : 1.0);

    utterance.onend = () => {
      if (this.queue.length > 0 && this.isSpeaking) {
        this.playNextChunk(voice, targetLang, customRate, pitch);
      } else {
        this.isSpeaking = false;
        this.onStateChange?.("idle");
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis chunk error:", e);
      this.isSpeaking = false;
      this.onStateChange?.("error");
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    this.isSpeaking = false;
    this.queue = [];
    if (this.synth) {
      this.synth.cancel();
    }
    this.onStateChange?.("idle");
  }
}
