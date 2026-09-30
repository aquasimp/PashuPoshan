import glossaryData from "./speech-glossary.json";

export type SpeechLang = "en" | "hi" | "hinglish";

export function normalizeForSpeech(text: string, lang: SpeechLang = "en"): string {
  if (!text) return "";

  let cleaned = text;

  // 1. Remove Markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 2. Remove Markdown emphasis and headers
  cleaned = cleaned.replace(/[*_#`~>]/g, " ");

  // 3. Remove Emojis & Variation Selectors
  cleaned = cleaned.replace(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\uFE0E|\uFE0F)/g, "");

  // 4. Expand abbreviations and symbols based on language glossary
  const dict = glossaryData[lang] || glossaryData.en;
  for (const [key, replacement] of Object.entries(dict)) {
    // Escape regex special chars in key
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(escaped, "g"), replacement);
  }

  // 5. Clean up multiple whitespaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Splits text by sentence boundary (।, ., ?, !) and subdivides if any chunk exceeds maxChars.
 * Returns array of clean chunks <= maxChars.
 */
export function chunkSentenceText(text: string, maxChars: number = 180): string[] {
  if (!text) return [];

  // Match sentence terminators: Devanagari danda (।), English period (.), exclamation (!), question (?)
  const rawSentences = text
    .split(/([।\.\?!]+)/)
    .filter((s) => s.trim().length > 0);

  const sentences: string[] = [];
  for (let i = 0; i < rawSentences.length; i += 2) {
    const sent = rawSentences[i] || "";
    const punct = rawSentences[i + 1] || "";
    const full = (sent + punct).trim();
    if (full) sentences.push(full);
  }

  const result: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length <= maxChars) {
      result.push(sentence);
    } else {
      // Subdivide by commas or spaces
      const words = sentence.split(" ");
      let currentChunk = "";
      for (const word of words) {
        if ((currentChunk + " " + word).trim().length <= maxChars) {
          currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
        } else {
          if (currentChunk) result.push(currentChunk.trim());
          currentChunk = word;
        }
      }
      if (currentChunk) result.push(currentChunk.trim());
    }
  }

  return result.filter((c) => c.length > 0);
}
