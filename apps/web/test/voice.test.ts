import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeForSpeech, chunkSentenceText } from "../lib/voice/speech-normalizer";
import { VoiceEngine } from "../lib/voice/voiceEngine";

describe("Voice Engine & Speech Normalizer Unit Tests", () => {
  describe("Speech Normalizer", () => {
    it("normalizes units and technical terms in English", () => {
      const input = "Silage core temperature is 38 °C with 32 % DM and pH 4.2. ΔT is +6 °C.";
      const out = normalizeForSpeech(input, "en");
      expect(out).toContain("38 degrees Celsius");
      expect(out).toContain("32 percent dry matter");
      expect(out).toContain("P H 4.2");
      expect(out).toContain("plus 6 degrees Celsius");
    });

    it("normalizes units and technical terms in Hindi", () => {
      const input = "साइलेज का तापमान 40 °C है तथा 35 % DM है। पीएच 5.4 है। ΔT +8 °C है।";
      const out = normalizeForSpeech(input, "hi");
      expect(out).toContain("40 डिग्री सेल्सियस");
      expect(out).toContain("35 प्रतिशत शुष्क पदार्थ");
      expect(out).toContain("पीएच 5.4");
      expect(out).toContain("तापमान अंतर प्लस 8 डिग्री सेल्सियस");
    });

    it("normalizes units and technical terms in Hinglish", () => {
      const input = "Silage core temp 42 °C hai, 30 % DM aur pH 5.6. ΔT +10 °C mila.";
      const out = normalizeForSpeech(input, "hinglish");
      expect(out).toContain("42 degree Celsius");
      expect(out).toContain("30 percent dry matter");
      expect(out).toContain("pH 5.6");
    });

    it("strips markdown symbols and emoji cleanly", () => {
      const input = "**ALERT:** [Inspect Pit](https://example.com) ⚠️ High risk mould detected!";
      const out = normalizeForSpeech(input, "en");
      expect(out).not.toContain("**");
      expect(out).not.toContain("https://");
      expect(out).not.toContain("⚠️");
      expect(out).toContain("ALERT: Inspect Pit High risk mould detected!");
    });

    it("chunks text into pieces under 180 characters", () => {
      const longText =
        "साइलेज गड्ढा नंबर 2 में हवा का रिसाव पाया गया है। आंतरिक तापमान सामान्य से 8 डिग्री अधिक है। फफूंद लगने का भारी खतरा है। कृपया खराब हिस्से को काटकर अलग करें। बचे हुए साइलेज को सूखे चारे के साथ मिलाकर खिलाएं। पशु चिकित्सक से संपर्क करें।";
      const chunks = chunkSentenceText(longText, 180);
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(180);
      });
    });
  });

  describe("VoiceEngine Selection Ladder", () => {
    let mockVoices: any[];
    let mockSynth: any;

    beforeEach(() => {
      mockVoices = [
        {
          voiceURI: "hi-in-local",
          name: "Google Hindi Local",
          lang: "hi-IN",
          localService: true,
          default: false,
        },
        {
          voiceURI: "hi-in-network",
          name: "Google Hindi Network",
          lang: "hi-IN",
          localService: false,
          default: true,
        },
        {
          voiceURI: "en-in-local",
          name: "Google English India Local",
          lang: "en-IN",
          localService: true,
          default: false,
        },
        {
          voiceURI: "en-us-default",
          name: "Google US English",
          lang: "en-US",
          localService: true,
          default: true,
        },
      ];

      mockSynth = {
        getVoices: vi.fn(() => mockVoices),
        speak: vi.fn(),
        cancel: vi.fn(),
        onvoiceschanged: null,
      };

      (global as any).window = {
        speechSynthesis: mockSynth,
      };
      (global as any).document = {
        addEventListener: vi.fn(),
        hidden: false,
      };
      (global as any).navigator = {
        onLine: true,
      };
    });

    it("prefers exact locale match when online", () => {
      const engine = new VoiceEngine();
      const voice = engine.selectVoice("hi-IN");
      expect(voice).toBeDefined();
      expect(voice?.lang).toBe("hi-IN");
    });

    it("prefers localService voice when offline", () => {
      (global as any).navigator.onLine = false;
      const engine = new VoiceEngine();
      const voice = engine.selectVoice("hi-IN");
      expect(voice).toBeDefined();
      expect(voice?.localService).toBe(true);
    });

    it("returns saved voiceURI if still available", () => {
      const engine = new VoiceEngine();
      const voice = engine.selectVoice("hi-IN", "hi-in-local");
      expect(voice?.voiceURI).toBe("hi-in-local");
    });

    it("falls back to language prefix if exact regional dialect missing", () => {
      mockVoices = [
        { voiceURI: "hi-generic", name: "Hindi Generic", lang: "hi", localService: true, default: true },
      ];
      mockSynth.getVoices = vi.fn(() => mockVoices);
      const engine = new VoiceEngine();
      const voice = engine.selectVoice("hi-IN");
      expect(voice?.voiceURI).toBe("hi-generic");
    });

    it("returns null if no voice matches language ladder", () => {
      mockVoices = [
        { voiceURI: "es-es", name: "Spanish", lang: "es-ES", localService: true, default: true },
      ];
      mockSynth.getVoices = vi.fn(() => mockVoices);
      const engine = new VoiceEngine();
      const voice = engine.selectVoice("hi-IN");
      expect(voice).toBeNull();
    });

    it("safety check prevents reading Devanagari with an English voice", () => {
      const engine = new VoiceEngine();
      const didSpeak = engine.speak("नमस्ते यह परीक्षण है", "en-IN");
      expect(didSpeak).toBe(false);
      expect(mockSynth.speak).not.toHaveBeenCalled();
    });
  });
});
