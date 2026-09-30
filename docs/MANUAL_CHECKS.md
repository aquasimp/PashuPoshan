# FeedShield — Manual Verification Checklist
**Problem Statement:** SIH26111 · AI-Powered Feed & Silage Intelligence  
**Document Status:** PENDING HUMAN EXECUTION  
**Scope:** Device-specific audio testing, low-end GPU/CSS glass performance, Vercel production deployment renaming, and native Hindi agricultural review.

---

## 1. Device Audio & Speech Synthesis Verification Checklist

> [!IMPORTANT]
> Audio synthesis and speech output cannot be 100% certified by machine automated tests because browser Web Speech APIs (`window.speechSynthesis`) rely on device-specific TTS engines (Google Speech Services, Apple Siri TTS, Microsoft Natural Voices).
> In accordance with FeedShield scientific and claims guidelines, all audio output is marked:  
> **`NOT MACHINE-VERIFIED`** until verified on physical target devices below.

### 1.1 Test Matrix

| # | Target Device & Browser | Environment | Voice Language Setting | Expected Behaviour | Status |
|---|---|---|---|---|---|
| **A1** | **Android Phone** (Chrome 120+) | Online (Wi-Fi/5G) | हिन्दी (`hi-IN`) | Tap "सुनें" on Result or Advisory screen. Hindi voice speaks normalized Hindi advisory. Utterance chunks smoothly without cutting off. | `[ ] PENDING` |
| **A2** | **Android Phone** (Chrome 120+) | Offline (Airplane Mode) | हिन्दी (`hi-IN`) | Tap "सुनें". System ladder selects `localService === true` voice. If local Hindi voice is installed, speaks offline. If not, displays localized notice: "इस डिवाइस पर ऑफलाइन हिंदी आवाज उपलब्ध नहीं है". No crash. | `[ ] PENDING` |
| **A3** | **Desktop Chrome** (Windows 11 / macOS) | Online / Offline | हिन्दी / English (India) | Tap "Listen" / "सुनें". Correct voice speaks at 0.9x natural rate. "Stop" terminates speech instantly. "Replay" restarts from chunk 1. | `[ ] PENDING` |
| **A4** | **Desktop Edge** (Windows) | Online | हिन्दी (`hi-IN`) | Microsoft Natural Hindi voices (e.g., Swara/Madhur) selected. Pronunciation of technical terms ("पीएच", "शुष्क पदार्थ") is natural. | `[ ] PENDING` |
| **A5** | **iPhone / iPad** (iOS 16+ Safari) | Online | हिन्दी (`hi-IN`) | Audio does NOT autoplay on page load (Safari policy). Tapping "सुनें" initiates speech via Siri Hindi. No audio clipping. | `[ ] PENDING` |
| **A6** | **Device without Hindi TTS** (e.g. Minimal Linux / Restricted Android) | Offline / Online | हिन्दी (`hi-IN`) | Voice ladder detects lack of Hindi voice. Displays non-blocking notification: "इस डिवाइस में हिंदी आवाज़ नहीं मिली। आप डिवाइस सेटिंग्स में टेक्स्ट-टू-स्पीच जोड़ सकते हैं।" Never speaks Devanagari using an English voice. | `[ ] PENDING` |

### 1.2 Step-by-Step Audio Verification Protocol
1. Navigate to `http://localhost:3000/test/result?id=FS-20260930-W402` (or on mobile via local network IP).
2. Confirm the **Listen Control Bar** appears directly above the primary action buttons:
   - Contains: [Listen / सुनें] button (>= 48px height), Quick Language Switch pill (`हिं | EN`), and Status indicator.
3. Tap **Listen**:
   - Verify speech starts only upon explicit tap (zero autoplay).
   - Check that markdown asterisks, URLs, and evidence tags (e.g. `[RULE: FS-04]`) are stripped before speaking.
   - Check that numbers and units are expanded (e.g. "38 °C" spoken as "38 डिग्री सेल्सियस", "32% DM" as "32 प्रतिशत शुष्क पदार्थ").
4. Tap **Stop**:
   - Verify speech terminates immediately within 50ms without hanging or leaving pending utterances in queue.
5. Tap **Replay**:
   - Verify speech restarts cleanly from the first chunk.
6. Switch UI language from English to Hindi:
   - If Voice Language is set to "Follow App", verify voice switches to Hindi voice seamlessly.

---

## 2. Low-End Android Glass Look & Performance Verification

> [!NOTE]
> Liquid Glass uses multi-layer `backdrop-filter: blur(...)` with obsidian dark mode (`#030303`) and specular borders (`rgba(255,255,255,0.08)`).
> On low-end Android GPUs (Mali-G52, Adreno 610), excessive backdrop blur can cause scroll stutter. FeedShield implements an adaptive visual effects subsystem.

### 2.1 Test Matrix

| Route | Visual Effects Setting | Target FPS | Expected Visual Quality | Status |
|---|---|---|---|---|
| **`/` (Home)** | `Auto` (Default) | >= 55 FPS | Smooth scroll past Hero card, Alert banner, and Feature grid. Glass cards render crisp borders without lagging scroll. | `[ ] PENDING` |
| **`/` (Home)** | `Full` | Check FPS | Full saturation + 16px blur + ambient glows active. | `[ ] PENDING` |
| **`/` (Home)** | `Minimal / Off` | 60 FPS | Solid dark fallback (`rgba(18, 18, 18, 0.95)` / `var(--bg-1)`). Zero backdrop-filter blur applied. Ultra-fast rendering on $80 Android devices. | `[ ] PENDING` |
| **`/demo/hero`** | `Auto` | >= 50 FPS | Stepper navigation and interactive chart rendering operate without frame drops. | `[ ] PENDING` |
| **`/test/result`** | `Auto` | >= 55 FPS | Metric breakdown cards, liquid-glass risk meters, and advisory cards scroll smoothly. | `[ ] PENDING` |

### 2.2 How to Verify on Physical Device:
1. Open Chrome DevTools > Remote Devices (or open Chrome on device directly).
2. Enable "Rendering" tab in DevTools > Check **Frame Rendering Stats** (FPS meter).
3. Scroll through Home, Hero Demo, and Result pages.
4. Navigate to `/settings` > Visual Effects:
   - Toggle between **Auto**, **Full**, and **Reduced**.
   - Verify the CSS class changes on `<html>` (`effects-auto`, `effects-full`, `effects-reduced`).
   - In **Reduced** mode, verify `backdrop-filter: none` is applied and solid contrast-safe fallbacks appear without visual artifacts.

---

## 3. Vercel Production Project & Domain Rename Guide

When you are ready to update the live Vercel deployment from the temporary `PashuPoshan` slug to canonical **FeedShield**:

### 3.1 Step-by-Step Vercel Rename
1. **Log in to Vercel Dashboard:**
   - Go to [https://vercel.com/dashboard](https://vercel.com/dashboard).
2. **Locate Existing Project:**
   - Select the project currently named `pashuposhan` (or `pashuposhann`).
3. **Rename Project in Settings:**
   - Go to **Settings** > **General** > **Project Name**.
   - Change project name to: `feedshield` (or `feedshield-sih`).
   - Click **Save**.
4. **Update Production Domains:**
   - Go to **Settings** > **Domains**.
   - Add new domain: `feedshield.vercel.app` (or your custom domain).
   - If desired, keep `pashuposhann.vercel.app` as a redirect to `feedshield.vercel.app` so existing QR codes and demo links continue functioning seamlessly.
5. **Verify Environment Variables:**
   - Go to **Settings** > **Environment Variables**.
   - Verify `NEXT_PUBLIC_APP_URL` is set to `https://feedshield.vercel.app`.
   - Verify `NEXT_PUBLIC_API_URL` points to the active API backend.
6. **Trigger Fresh Deployment:**
   - In terminal:
     ```powershell
     git push origin main
     ```
   - Or deploy via Vercel CLI:
     ```powershell
     vercel --prod
     ```

---

## 4. Native Hindi Agricultural Specialist Review Guide

> [!IMPORTANT]
> The automated i18n audit (`scripts/i18n_audit.py`) guarantees key parity, zero placeholder bugs, zero Devanagari-in-English leaks, and adherence to `i18n/glossary.md`.
> However, agricultural terminology nuances require human validation by a native Hindi speaker familiar with Indian dairy and silage practices.

### 4.1 Review Instructions
1. Open [`docs/I18N_REVIEW_NEEDED.md`](file:///c:/Users/anura/Downloads/FeedShield/docs/I18N_REVIEW_NEEDED.md).
2. Review the 16 flagged agricultural phrases across the 4 core domains:
   - **Silage Fermentation Terms:**
     - Pit silage: गड्ढा साइलेज (pit silage)
     - Aerobic heating: हवा लगने से गर्म होना (aerobic heating)
     - Inoculant: साइलेज कल्चर (inoculant)
   - **Feed Quality & Spoilage:**
     - Moisture content: नमी (moisture)
     - Dry matter: शुष्क पदार्थ (dry matter)
     - Mould / Mycotoxin risk: फफूंद जोखिम (mould risk)
   - **Actionable 4-Way Farmer Decisions:**
     - `FEED`: खिलाएं (सुरक्षित)
     - `BLEND`: मिलाकर खिलाएं
     - `RE_TEST`: पुनः परीक्षण करें
     - `DISCARD`: नष्ट करें / न खिलाएं
   - **Transparency & Screening Disclaimer:**
     - "यह केवल त्वरित स्क्रीनिंग परिणाम है; प्रयोगशाला प्रमाणन नहीं।"
3. Provide corrections or approve in `docs/I18N_REVIEW_NEEDED.md`.
4. Apply approved changes to `apps/web/locales/hi.json` and `apps/web/locales/hinglish.json`.
5. Run `make test-i18n` to verify parity remains 100%.
