# Adding a New Regional Language to FeedShield

FeedShield is architected for India's 22 official languages. This guide provides the protocol to add and field-verify a new regional language.

---

## 1. Directory Structure

Language bundles are located in `apps/web/locales/`:
* Core production languages: `en.json`, `hi.json`, `hinglish.json`
* Regional language stubs: `apps/web/locales/stubs/{code}.json`
  * Supported codes: `bn` (Bengali), `mr` (Marathi), `gu` (Gujarati), `pa` (Punjabi), `ta` (Tamil), `te` (Telugu), `kn` (Kannada), `ml` (Malayalam), `or` (Odia).

---

## 2. Step-by-Step Integration

1. **Copy the Reference Bundle:**
   Copy `apps/web/locales/en.json` to `apps/web/locales/{code}.json`.
2. **Translate Namespaces:**
   Translate keys across the 6 canonical namespaces: `common`, `farmer`, `results`, `advisory`, `report`, `admin`.
3. **Strict Compliance with Claims Policy:**
   Under **CLAUDE.md Section 0.7**, the following claims phrases must preserve their exact scientific and regulatory meaning without dilution:
   * *"Urea cannot be assessed from this image alone."*
   * *"Possible excess/non-declared urea — screening result. Confirmatory laboratory test recommended."*
   * *"Sample outside validated model range — laboratory confirmation recommended."*
   * *"Trained on synthetic demo data — NOT a validation of field accuracy"*
4. **Run the Claims Linter:**
   ```bash
   python ml/claims_lint.py
   ```
5. **Register Locale in UI:**
   Add the language metadata into `apps/web/lib/i18n.tsx`.
6. **Voice Synthesis Verification:**
   Verify that the browser's Web Speech API (`window.speechSynthesis.getVoices()`) provides a compatible regional voice synthesizer for `{code}-IN`.
