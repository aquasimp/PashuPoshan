# FEEDSHIELD — FINAL POLISH PASS v2
## SIH26111 · AUDIT · FIX · POLISH · VERIFY · DO NOT REBUILD

Paste as one message into the agent working in the existing FeedShield repo. It runs the workstreams W0 to W9 in order without waiting for me, and stops only when blocked.

---

## 0. MISSION AND GROUND RULES

The app is functionally built and deployed. This is the final quality pass. The product must become visually excellent, stable, scientifically honest, fully localized (English, हिन्दी, Hinglish), responsive, accessible, and judge-ready.

**Do not** rebuild the architecture, replace working backend systems, remove functionality, weaken or delete tests, fabricate scientific claims, or fabricate ML scores.

**Precedence.** This prompt overrides the *design* rules in `CLAUDE.md` section 0.13 where they conflict (glass is now allowed on more surfaces). Everything else in `CLAUDE.md` still binds: evidence tags, claims policy (0.7), data rules (0.8), honesty rules. Keep two design rules from 0.13: **never nest glass on glass**, and **always provide a solid fallback**.

**Freedom and limits.** You have full UX/UI freedom over layout, composition, spacing, navigation structure and motion. You do **not** have freedom over routes, API contracts, data flow, evidence-tag semantics, or `data-testid` selectors. If a redesign changes a selector or label, update the Playwright test deliberately and list the change in the report. Never loosen an assertion to make a test pass.

**Status vocabulary (use in every report).**
- `VERIFIED` = you ran it and have output, a screenshot or a file as evidence
- `PARTIAL` = some of it works, say what does not
- `NOT VERIFIED` = you could not run it (say why)
- `FAILED` = it ran and failed

Never write "implemented" or "done" for anything that is not `VERIFIED`. Audio output can never be machine-verified; mark it `NOT MACHINE-VERIFIED` and give me the manual checklist (sections 9.6 and 10).

**Safety valves.** At most 2 fix-and-recheck iterations per defect class, then log it in `docs/KNOWN_GAPS.md` and move on. Commit locally after each workstream. **Do not push or deploy** unless I say so.

---

## 1. CANONICAL IDENTITY — LOCKED

| Field | Value |
|---|---|
| Product | **FeedShield** |
| Subtitle | AI-Powered Feed & Silage Intelligence |
| Tagline | Test. Understand. Act. |
| Problem statement ID | **SIH26111** (never "26111" alone) |
| Problem | Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers |
| Organization | Ministry of Fisheries, Animal Husbandry & Dairying |
| Theme | Agriculture, FoodTech & Rural Development |

The live site is titled **PashuPoshan**. Replace it with **FeedShield** everywhere product-facing: `<title>` on every route, navbar, landing, demo pages, admin, models, PDF, QR page, language bundles, aria-labels, loading and error screens, manifest `name` and `short_name`, favicon and apple-touch-icon, Open Graph tags, and documentation that describes the product.

**Brand sweep.** Search the whole repo (including built output, i18n, `public/`, PDF templates, docs) for `PashuPoshan`, `PashuPoshann`, `KhurakCheck`, and any standalone `26111` (not preceded by `SIH`). Classify every hit as intentional or not. Fix the unintentional ones. Allowed leftovers: the deployment hostname in docs, and one "renamed from" note in the changelog.

**Enforce it.** Add a `brand-lint` check beside the claims linter: built output, i18n bundles, manifest, metadata and generated PDF text must not contain the old names, and every route's `<title>` must contain "FeedShield". The Vercel hostname (`pashuposhann.vercel.app`) cannot be changed from code; do not touch it. In the report, recommend renaming the Vercel project and domain as a manual step for me.

---

## 2. FINDINGS FROM THE LIVE SITE (fetched today; re-verify each one)

If you cannot open the live site, say `NOT VERIFIED` and compare against the local production build instead. Do not assume the live site and the repo match.

1. **Brand:** title and navbar say "PashuPoshan".
2. **Navbar crowding:** 8 text links (Feed & Silage Quality, Start New Test, Hero Demo, Judge Tour, Models, Recent Sample Tests, Sync, Admin) plus the online indicator and three language buttons sit in one row.
3. **Zoom blocked:** the viewport meta has `maximum-scale=1, user-scalable=no`. This blocks pinch-zoom and fails accessibility. Remove it. Make sure every input is at least 16px so iOS does not zoom on focus.
4. **Theme colour:** `theme-color` is fixed at `#1F4D3A`. Provide one per scheme via `media` attributes and update it when the theme changes.
5. **Hero copy overclaims.** "Instant AI evaluation of … moisture, core bunker heating … directly on your smartphone" contradicts the claims policy. Moisture, pH and heating need sensors or a test node. Rewrite (through i18n, all three languages), for example: *"Test your feed. Understand the risk. Act with confidence."* with the subline *"Screen silage and feed with your phone camera, simple sensors and shared testing nodes, with clear guidance on what needs a laboratory test."*
6. **Real organisation name in demo data.** "Anand Cooperative Milk Union" is a real institution. Replace it, and any other real names, with clearly fictional ones. Keep the DEMO badge.
7. **Alert card without provenance.** "Active Pit Warnings … Aerobic Core Heating Detected (+12°C above ambient)" shows a simulated result with no DEMO badge and no evidence tag. Add DEMO and `ESTIMATED` (rule-based). Do not use the word "Detected" for rule output; that word belongs to the `DETECTED` tag (visual observation). Use "Heating risk: high (+12 °C above ambient)".
8. Only the node banner says SIMULATED. Every synthetic-fed element needs its own DEMO badge.

Also run the claims linter against the **hero and landing copy**. It missed item 5, so extend its phrase list (for example "instant", "directly on your smartphone", "detects urea", "detected" used for non-visual results) and add tests.

---

## 3. WORKSTREAMS — RUN IN ORDER

### W0 — Baseline
- Run everything first: claims lint, pytest, Vitest, silage parity, Playwright, production build. Record the counts in `docs/POLISH_BASELINE.md`. The reported baseline was pytest 45/45, Vitest 33/33, parity 25/25, routes 17/17, claims 0 violations. Confirm or correct it.
- Capture screenshots of the live site and the local build for all 17 routes at 390×844 and 1440×900 (light mode). Save under `qa/baseline/`.
- List every defect you see in `docs/POLISH_BASELINE.md`, with route and viewport.

### W1 — Tokens, theme system, liquid-glass primitives (section 4)
### W2 — Localization audit and glossary (section 8). Done **before** layout work so long Hindi strings exist when you test overflow.
### W3 — Navbar and buttons (section 5)
### W4 — Screens (section 6)
### W5 — Overflow, responsive and accessibility sweep with automated matrix tests (section 7)
### W6 — Voice output including the Hindi option (section 9)
### W7 — ML demo pipeline and UI integration (section 11)
### W8 — PDF and QR (section 12)
### W9 — Full verification, screenshots, Lighthouse, brand sweep, final report (section 13)

At the end of each workstream: update `docs/PROGRESS.md`, run the tests that the workstream could have broken, commit locally, continue.

---

## 4. DESIGN SYSTEM — TOKENS, THEME, LIQUID GLASS

**Approach.** Fix issues in shared tokens and primitives, never with screen-specific hacks. If two screens share a problem, fix the component.

### 4.1 Theme system
- Modes: **Light / Dark / System.** Persist the choice (localStorage plus Dexie, so it survives reload, navigation, offline and restart).
- **No flash of wrong theme:** a tiny blocking inline script in `<head>` sets the theme class and `color-scheme` before first paint; use `suppressHydrationWarning` on `<html>`.
- Charts, badges, forms, tables, maps of colour, the PDF preview and the QR card all respond to the theme via tokens. No hard-coded hex in components.
- Update `theme-color` per resolved theme.

### 4.2 Semantic tokens (starting values, tune by eye)

Dark (pitch-black base):
```
--bg-0:        #030303                 page
--bg-1:        #0A0D0B                 raised regions
--glass-1:     rgba(15, 20, 17, 0.64)  surface
--glass-2:     rgba(22, 29, 24, 0.72)  elevated
--glass-3:     rgba(30, 40, 33, 0.82)  nav, modal, sheet
--glass-active:rgba(58, 92, 70, 0.34)  selected / active
--edge:        rgba(236, 241, 230, 0.10)
--edge-hi:     rgba(250, 246, 236, 0.16)   1px top inner highlight
--ink-1: #F3EDDD   --ink-2: #B9C2B6   --ink-3: #8A958B
--primary: forest/sage solid, --amber: muted, --terracotta: restrained
```
Light (warm agritech, evolved toward glass):
```
--bg-0: #FAF6EC   --bg-1: #F3EDDD
--glass-1: rgba(255, 253, 247, 0.62)   --glass-2: rgba(255, 253, 247, 0.78)   --glass-3: rgba(255, 253, 247, 0.88)
--edge: rgba(31, 77, 58, 0.12)   --edge-hi: rgba(255, 255, 255, 0.70)
--ink-1: #23302A   --ink-2: #4B5A50   --ink-3: #6E7A70
--shadow: warm, rgba(35, 48, 42, 0.10)
```
Six distinct dark levels must be visually separable without bright colour: background, surface, elevated glass, active, modal, navigation.

### 4.3 What makes glass look real on near-black
Blur has nothing to refract on flat `#030303`, so glass looks like a flat grey card. Fix it with a **static ambient layer** behind content: two or three very low-opacity radial forest-green glows and a faint grain, fixed to the page. No animated gradients. In light mode, use a soft warm ivory-to-bone wash with faint sage glows.

Glass recipe: translucent tint + `backdrop-filter: blur(12px to 20px) saturate(1.3 to 1.6)` + 1px `--edge` border + 1px `--edge-hi` top inner highlight + layered soft shadow + optional very subtle specular highlight that follows the pointer (hover-capable devices only, disabled on touch and reduced motion).

### 4.4 Glass budget (performance and legibility)
- At most **3 backdrop-filter layers visible at once**. Never on repeating list items, table rows, or chart internals. Never glass on glass.
- Blur cap: 20px desktop, 14px mobile.
- Body text sits on a surface tint strong enough to pass **4.5:1 contrast against the worst-case backdrop** (test light and dark patches behind it).
- `@supports not (backdrop-filter)` gives a solid fallback with equivalent contrast.
- Respect `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`, and `prefers-reduced-motion`.
- Add an in-app **Visual effects: Auto / Full / Reduced** setting (browser support for reduced-transparency varies). Auto = Reduced when the browser asks for it or the device reports low memory.
- Dense tables use a solid or near-solid surface with a glass toolbar or header, not glass cells.

### 4.5 Primitives
Reuse an equivalent if one exists; otherwise create: `LiquidGlass` (base), `LiquidGlassCard`, `LiquidGlassPanel`, `LiquidGlassButton`, `LiquidGlassPill`, `LiquidGlassNav`, `LiquidGlassToolbar`, plus `Sheet` and `Modal` on the same tokens. All read semantic tokens only. Add them to `/design-system` with light and dark examples, long-Hindi examples, focus states, and the solid fallback.

Avoid: cheap frosted blobs, thick white borders, rainbow gradients, neon, cyberpunk glow, purple AI look, navy, electric blue, cyan.

---

## 5. NAVBAR AND BUTTONS

### 5.1 Navbar
Requirements: FeedShield prominent, SIH26111 visible but secondary, obvious active route, usable language selector, online/offline indicator always visible, theme toggle reachable, excellent mobile navigation, text always readable on glass.

Recommended default (change it if you have a better idea, and say why):
- **Desktop:** brand plus small `SIH26111` chip on the left; 4 primary links (Test, Demo, History, Models); a "More" menu (Judge Tour, Compare, Sync, Admin); on the right a grouped cluster: language select (one compact menu, not three buttons), theme toggle, online/offline pill, Sync count badge.
- **Mobile:** slim top bar (brand, compact status, theme, language) plus a **bottom tab bar** with 4 to 5 thumb-reachable destinations (Home, Test, History, Sync, More). `SIH26111` moves into the More sheet or footer.
- Role-aware: farmers do not see Admin.
- Active state uses a glass "active" pill plus `aria-current="page"`, not colour alone.
- Label text never truncates in the bar; long Hindi labels use the More menu or wrap to two lines by design.

### 5.2 Buttons
- **Primary:** dominant hybrid finish (deep forest solid with glass edge highlight and soft depth; in dark, a muted forest solid with ivory text), strong contrast, tactile press state, elegant hover.
- **Secondary:** lighter translucent glass with strong readable text.
- **Danger:** restrained but obvious.
- **Ghost / icon:** at least 48×48 touch target, visible focus ring, aria-label.
- All buttons: `min-height: 48px`, `min-width: 0`, icon `flex: none`, label may wrap to two lines with `text-wrap: balance`, line-height at least 1.5, no fixed widths.
- Test with: "Start New Test" / "नया टेस्ट शुरू करें" / "New test start karo", and the longest label in each language. No clipping in light or dark.

---

## 6. SCREENS — COMPOSITION GUIDANCE

Decide your own layouts. Every screen must answer the farmer's four questions: **What do I do? What did FeedShield find? What does it mean? What should I do next?**

- **Farmer home:** one dominant CTA (Start New Test), the two test types as large cards, recent tests, offline status. Not an analytics dashboard.
- **Result screen (flagship):** one clear hierarchy: sample and quality first, then risk and decision, then evidence, confidence and modalities, then measurements and predictions, then the advisory and next action, with Listen (voice) close to the advisory. Use glass to create hierarchy, not to wrap every statistic. Keep the evidence tags, INPUT COMPLETENESS component, DEMO badges and the exact claim strings legible.
- **Hero Demo `/demo/hero`:** Healthy vs Spoiled Silage, side by side: visual difference, pH, moisture/DM, temperature, risk, visible evidence, recommendation. Liquid glass on the control and information layers. Powerful but honest: DEMO badge visible; outputs from the real pipeline.
- **Judge Tour `/demo/tour`:** about 3 minutes, deliberate pacing, skip and back controls, progress indicator, same narrative order: Problem → Capture → Multimodal inputs → Analysis → Evidence → Risk → Advisory → Offline → Traceability → ML/Data roadmap.
- **Admin / Models:** "FeedShield Intelligence Command Center": model status, real metrics, provenance, applicability-domain, dataset status, sample analytics, storage analytics, traceability. Charts and tables lead; glass toolbars and headers, solid data surfaces. The Models screen shows the four pending chips from section 11.
- **QR verification, History, Compare, Sync, Capture, Silage inputs, Processing, Advisory, Design System:** apply the same system. No orphaned old styling.
- Replace the landing hero copy and the alert card per section 2.

---

## 7. OVERFLOW, RESPONSIVE, ACCESSIBILITY — MEASURABLE

**Target: zero unintentional overflow.** Do not shrink text as the fix. Use `min-width: 0`, flex/grid behaviour, wrapping, `overflow-wrap`, max-widths and sensible truncation.

**Devanagari clipping** is usually caused by tight line-height plus `overflow: hidden`. Use line-height of at least 1.5 for Devanagari text, avoid `letter-spacing` on it, avoid `truncate` on headings and buttons, and test with Noto Sans Devanagari loaded (`font-display: swap` with a fallback and size-adjust to avoid layout shift).

**Automated overflow matrix (Playwright, must pass).** Every route × viewports {390×844, 412×915, 768×1024, 1280×800, 1440×900, 1536×864} × locales {en, hi, hinglish} × themes {light, dark}. For each combination assert:
1. `document.documentElement.scrollWidth <= window.innerWidth`.
2. No visible element extends past the viewport unless inside a container marked `data-scroll`.
3. No element with `overflow: hidden` has `scrollWidth > clientWidth` or `scrollHeight > clientHeight` unless it is marked `data-truncate` and has a title or tooltip.
4. Open every modal and sheet in that combination; each fits inside the viewport.
5. Chart labels are not clipped (check bounding boxes against the chart container).
Report the combination count and the pass count.

**Accessibility (must pass):** axe on every route in both themes and in hi; keyboard navigation and visible focus everywhere; semantic landmarks; 48px targets; aria-labels including localized ones; reduced motion, reduced transparency, `prefers-contrast`; zoom works (item 3 in section 2); colour never the only status signal.

---

## 8. LOCALIZATION — FULL PROJECT (English · हिन्दी · Hinglish)

**Scope:** navbar, buttons, headings, descriptions, forms, validation errors, empty states, loading and processing text, results, advisories, risk, storage, models, admin, demo, judge tour, QR page, PDF, accessibility labels, tooltips, and voice prompts. **No hard-coded visible strings in components.**

**Automated audit (`scripts/i18n-audit`, output `docs/I18N_AUDIT.md`, wired into `make test`):**
1. Key parity across en, hi, hinglish (missing and extra keys).
2. Placeholder parity (`{name}`, plurals) per key.
3. Empty or fallback strings; hi strings identical to English (allow-list for brand terms and unit symbols).
4. Script check: `hi` values contain Devanagari; `hinglish` values are Roman script.
5. Hard-coded string scan in components (lint rule such as `react/jsx-no-literals` or an equivalent, with an allow-list).
6. Glossary consistency: banned synonyms per term.
7. Length report: any key where hi or hinglish is more than 1.6× the English length, so layout tests target it.
Target: zero missing P0 and P1 keys.

**Glossary.** Create `i18n/glossary.md`: one approved term per concept in each language (silage, feed/fodder, moisture, dry matter, protein, fibre, spoilage, mould, heating, air ingress, screening, laboratory confirmation, sample, advisory, sync, offline, and the four decisions FEED / BLEND / RE-TEST / DISCARD). Use it for every string.

**English:** concise, professional, natural, farmer-friendly where appropriate. Remove generic AI buzzwords.

**Hindi:** natural spoken agricultural Hindi, not word-for-word machine translation. Keep widely used English terms where farmers actually use them (for example "pH", "साइलेज"). Test long strings in buttons, cards and the navbar.

**Hinglish:** real spoken Indian Hinglish in Roman script. Good: "Feed mein moisture zyada hai, isliye spoilage ka risk badh sakta hai." Bad: "Feed mein moisture adhik hone ke karan deterioration risk increment hota hai."

**Honesty about quality.** You cannot certify native-level Hindi. Collect every string you are not fully confident about into `docs/I18N_REVIEW_NEEDED.md` for a human native reviewer. Do not claim the wording is reviewed.

Claims policy applies to all three languages, and the claims linter must scan all of them.

---

## 9. VOICE OUTPUT — WITH HINDI VOICE OPTION

### 9.1 Behaviour
- A large **Listen** button on the Result and Advisory screens (localized label, icon plus text, 48px+), plus **Stop** and **Replay**. Do not build Pause; it is unreliable across mobile browsers.
- **Voice language is a separate setting** from the app language, so a farmer can use an English screen with Hindi speech. Options: **Follow app language / हिन्दी / English (India)**. A compact quick switch (for example "हिं | EN") sits next to Listen.
- **Never autoplay.** Speech starts only from a tap (required on iOS Safari and good practice everywhere). Auto-read is an opt-in setting, off by default.
- The text spoken is the **localized advisory** rendered in the *voice* language (render the advisory keys with that locale, independent of the UI locale). It is not the raw screen text.

### 9.2 Speech text per language
- **English:** the localized English advisory, normalized for speech.
- **Hindi:** the Hindi advisory in Devanagari, read by a Hindi voice.
- **Hinglish:** Roman-script Hinglish is read badly by both Hindi and English voices. Keep the on-screen Hinglish in Roman, and add a `speech.*` variant for each advisory key: the same sentence in Devanagari, with common technical words such as "moisture" or "pH" allowed in Latin script. Voice: Hindi voice first, English (India) as fallback with the Roman text.
- **Speech normalizer** (`speech-normalizer` plus `speech-glossary.{en,hi,hinglish}.json`): strip evidence-tag chips, icons, emoji and markdown; expand units and abbreviations (for example `38 °C` → "38 डिग्री सेल्सियस", `32 % DM` → "32 प्रतिशत शुष्क पदार्थ", `pH 6.2` → "पीएच 6.2", `NDF` and `ADF` spelled out); format numbers with the voice locale; read DEMO or screening qualifiers where they change the meaning (for example "यह केवल स्क्रीनिंग परिणाम है, प्रयोगशाला जाँच की सलाह दी जाती है").

### 9.3 Voice engine (`lib/voice/`)
- Use `window.speechSynthesis`. Feature-detect it; if missing, show a localized "voice not supported in this browser" notice and keep the text.
- Load voices asynchronously: handle an empty `getVoices()` and the `voiceschanged` event, with a short timeout.
- **Selection ladder** for target language L (`hi-IN`, `en-IN`):
  1. Saved `voiceURI` if it still exists and matches L.
  2. Exact locale match. When offline (`navigator.onLine === false`) prefer `localService === true`; when online prefer the higher-quality voice.
  3. Any voice whose `lang` starts with the language code (`hi`, `en`).
  4. None available: show the localized no-voice notice. **Never read Devanagari with an English voice, or the reverse.**
- Never hard-code voice names (they differ per platform). Show the chosen voice name and an "offline / needs internet" label in Settings.
- Set both `utterance.voice` and `utterance.lang`.
- **Chunk** the text by sentence (split on `।`, `.`, `?`, `!`) into pieces of about 180 characters or fewer and play them in sequence, because some browsers cut off long utterances.
- Cancel on Stop, route change, voice-language change, component unmount and `visibilitychange` to hidden.
- Rate default 0.9 for Hindi (adjustable Slow / Normal / Fast), pitch 1.

### 9.4 Voice settings (Settings screen)
Voice on/off · Voice language (Follow app / हिन्दी / English (India)) · Speed · Voice picker filtered to the chosen language · **Test voice** button speaking a fixed localized sentence · Auto-read (off by default). Persist in Dexie/localStorage.

### 9.5 No Hindi voice installed, or offline without a local voice
Show a localized notice explaining that this device has no Hindi voice (or none that works offline), that the text is still available, and that a Hindi voice can be added in the device's text-to-speech settings. Do not guess exact menu paths. Offer to switch voice language to English (India) only when the user chooses to.

### 9.6 Tests
- **Vitest** with a mocked `speechSynthesis`: selection ladder (every rung, including offline preference and the no-voice case), chunking, normalizer output for 5 real advisories in each of the three languages, cancel on unmount and route change.
- **Playwright** with `speechSynthesis` stubbed via `addInitScript`: tap Listen with voice language Hindi → assert utterance `lang === "hi-IN"` and the text matches `/[\u0900-\u097F]/`; Hinglish → Devanagari speech text; English → `en-IN` and no Devanagari; switch voice language mid-session; Stop cancels; no speech starts without a tap.
- Add the `voice.*` and `speech.*` keys to the i18n audit and the claims linter.
- Report audio as `NOT MACHINE-VERIFIED` and include the manual checklist below.

**Manual audio checklist (I will run this myself):** Android Chrome online with Hindi voice · Android Chrome offline · desktop Chrome · desktop Edge · iPhone Safari (Hindi voice) · a device with no Hindi voice (notice appears, no wrong-language speech).

---

## 10. MANUAL CHECKS (I RUN THESE; YOU PREPARE THEM)

Write `docs/MANUAL_CHECKS.md` with short step-by-step instructions for:
1. The audio checklist in section 9.6.
2. Glass look and performance on a real low-end Android phone (scroll smoothness on Home, Result and Hero Demo, with Visual effects on Auto and on Full).
3. Renaming the Vercel project and domain from PashuPoshan to FeedShield, and redeploying after I review your commits.
4. Native-speaker review of `docs/I18N_REVIEW_NEEDED.md`.

---

## 11. ML DEMO PIPELINE — ACTUALLY RUN IT

Do not just read the code. Execute it.

1. Find the training entrypoint (for example `make train`). Verify the dataset actually on disk in `data/synthetic_demo/` and the existing synthetic NIR data. Print shape, counts, generator seed and a content hash. If the data is missing or stale, regenerate it with the repo's generator and record that.
2. Train and evaluate for **moisture/DM, crude protein, NDF, ADF**: PLSR baseline plus the supported comparators already in the repo (SVR, Random Forest, and XGBoost or LightGBM, whichever is installed). Do not add other models.
3. Splits by physical sample (and batch where present); repeated scans stay together; preprocessing chosen inside CV; independent held-out test set.
4. Write metrics to generated files (JSON) per model and target: MAE, RMSE/RMSEP, R², bias, RPD, train count, test count, applicability-domain coverage (percentage of test samples `IN_DOMAIN`), provenance `synthetic_demo`, seed, data hash, timestamp. Regenerate model cards and update the registry.
5. **Frontend never hard-codes metrics.** The Models screen reads them through `GET /models`. Add a check (grep or test) that no metric literal is hard-coded in `apps/web`.
6. **Synthetic labelling on every metric view:** the `DEMO` badge, `synthetic_demo`, and the string "Not a validation of field accuracy." Synthetic R² is likely to be very high; show it with the banner and never present it as accuracy in the tour or the pitch. Use judge-safe wording such as "Pipeline verified on synthetic data; field validation pending."
7. **Pending chips** (localized, no numbers, no synthetic substitutes): REAL FIELD NIR: PENDING · REAL INDIAN FEED IMAGE MODEL: PENDING · REAL UREA VALIDATION: PENDING · REAL EXTERNAL VALIDATION: PENDING.
8. **End-to-end integration test:** fixed-seed synthetic sample → `ml.infer` value → `POST /analyze` prediction envelope (same value within tolerance) → rendered on the Result screen (Playwright reads the DOM value and compares it to the API value) → model information shows the same `model_version`. Add a **perturbation test**: change the input spectrum and confirm the output value changes (proves it is not hard-coded). Add an out-of-domain spectrum case returning `INVALID` with a null value and the correct warning string.
9. If the live site is frontend-only (API hosted elsewhere or absent), document how the frontend reaches the API and run this test against the local API. Say so in the report.
10. If the pipeline fails, fix the pipeline. Never patch numbers. If you cannot fix it, mark `FAILED` or `NOT VERIFIED`.

Evidence tags, claims policy and out-of-domain warnings remain exactly as in `CLAUDE.md`.

---

## 12. PDF AND QR

Generate a report in **each** of en, hi, hinglish for a demo sample and for a real-pipeline sample. Render pages to images and inspect them. Verify: FeedShield branding, SIH26111, localized labels, correct Devanagari (no missing glyphs or boxes), evidence tags, DEMO labels, model version and provenance, disclaimer, no text overflow or clipped tables. Decode the QR image programmatically and confirm it returns the verification URL. Run the claims and brand linters over the extracted PDF text. Also verify the QR verification page shows Verified / Unverified / Tampered correctly in light and dark.

---

## 13. FINAL VERIFICATION AND REPORT

**Run everything and report real output:** claims lint (extended), brand lint, i18n audit, pytest, Vitest, silage parity (25/25 or better), Playwright including the overflow matrix and the offline E2E, production build, ML training, ML integration test, axe, Lighthouse. Nothing that passed before may regress. New behaviour needs new tests; test counts must not go down.

**Lighthouse:** run against the production build (not dev) in mobile mode for Home, Result and Hero Demo. Record performance, accessibility, best-practices and SEO as measured, plus the run conditions. The target for mobile performance is 85 or more where realistic. If the glass effects cost too much, reduce blur, layers or shadows and re-run. Never estimate a score.

**Screenshots (`qa/polish/`).** All 16 screens (Home, Test selection, Capture, Silage inputs, Processing, Result, Advisory, History, Compare, Sync, QR, Hero Demo, Judge Tour, Models, Admin, Design System) in English, light and dark, at 390×844 and 1440×900. Plus Home, Result, Advisory, Hero Demo and Models in Hindi and Hinglish, light and dark, at both viewports. **Look at every image yourself** and list each defect found and fixed (overflow, clipping, weak hierarchy, inconsistent glass, spacing, contrast, awkward translation, cramped navigation, broken buttons, inconsistent radii, responsive breakage).

**Final report:** write `docs/FINAL_AUDIT_REPORT.md` and give me a summary. Include:
1. A table of the acceptance list below, each row `VERIFIED / PARTIAL / NOT VERIFIED / FAILED` with evidence (command, output, file path or screenshot).
2. Test counts before and after.
3. The ML metrics table exactly as generated, labelled synthetic.
4. Lighthouse numbers with conditions.
5. Overflow matrix: combinations run and passed.
6. Brand sweep results.
7. Strings needing native review, and known gaps.
8. What I must do manually: the audio checklist, renaming the Vercel project, and deployment.

**Acceptance list**
- [ ] FeedShield and SIH26111 consistent everywhere; no PashuPoshan or KhurakCheck; brand lint passes
- [ ] Pinch-zoom works; per-theme `theme-color`
- [ ] Hero copy, alert card and demo data honest (no overclaims, no real organisation names, DEMO and evidence tags present)
- [ ] Navbar redesigned; buttons redesigned; no clipping in en, hi, hinglish
- [ ] Liquid-glass primitives in `/design-system`; glass budget respected; solid fallbacks; Visual effects setting
- [ ] Light mode polished; pitch-black dark mode polished with visible depth levels
- [ ] Theme Light / Dark / System persists, no flash
- [ ] Farmer flow, Result, Hero Demo, Judge Tour, Admin, Models, QR polished
- [ ] Overflow matrix passes; axe passes; reduced motion and transparency honoured
- [ ] i18n audit: zero missing P0 and P1 keys; glossary applied; review list written
- [ ] Voice: Listen / Stop / Replay, separate voice language, Hindi voice option, selection ladder, no wrong-language fallback, no autoplay, tests pass, audio marked NOT MACHINE-VERIFIED
- [ ] ML demo pipeline executed; metrics generated, labelled synthetic; four field items PENDING; UI value traced to model output; perturbation and out-of-domain tests pass
- [ ] PDF (3 languages) and QR verified
- [ ] Claims lint, pytest, Vitest, parity, Playwright, production build all pass; Lighthouse recorded

Do not report "implemented" for anything not `VERIFIED`. Finish every workstream, verify, then deliver the audit report.
