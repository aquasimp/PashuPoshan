# PashuPoshan UI Flow & Screen Inventory

This document defines the 23-screen inventory across all user roles, detailed tap-count paths for farmers, and UI state guidelines per **CLAUDE.md Section 0.4 & 0.13**.

---

## 1. 23-Screen Inventory Matrix

| Screen # | Screen Identifier | Primary Persona | Priority Tier | Description & Key UI Elements |
|---|---|---|---|---|
| **01** | `SCR-FARMER-HOME` | Farmer | **P0** | Quick Start button, recent test summary, storage alerts, offline indicator, language switcher. |
| **02** | `SCR-TEST-SELECT` | Farmer | **P0** | High-contrast visual cards: **Feed Concentrate / Fodder Test** vs **Silage Fermentation Test**. |
| **03** | `SCR-CAPTURE-QA` | Farmer | **P0** | Live camera viewfinder, framing guide, real-time blur/glare/lighting feedback, retake prompts. |
| **04** | `SCR-SILAGE-SENSORS` | Farmer | **P0** | Input cards for pH, internal temp, ambient temp, moisture/DM (manual or simulated probe connection). |
| **05** | `SCR-NIR-SCAN` | Shared Node / Farmer | **P1** | NIR spectrometer interface, dark/white reference indicator, replicate scan counter (1–5). |
| **06** | `SCR-ASSAY-READER` | Shared Node / Farmer | **P1** | Reference-card camera overlay, test-pad alignment guide, CIELAB normalization status. |
| **07** | `SCR-SAMPLE-CONFIRM` | Farmer | **P0** | Sample metadata review (crop type, physical form, batch/farm), offline draft preview. |
| **08** | `SCR-ANALYSIS-PROGRESS`| Farmer | **P0** | Restrained 7-step motion sequence: *"Reading colour..."* → *"Reviewing sensors..."* → *"Combining evidence..."* |
| **09** | `SCR-RESULT-HERO` | Farmer | **P0** | Quality gauge (`GOOD` / `ATTENTION` / `HIGH RISK`), exact claims policy strings, input completeness card, evidence tags. |
| **10** | `SCR-ADVISORY-VOICE` | Farmer | **P0** | Decision card (`FEED` / `BLEND` / `RE-TEST` / `DISCARD`), 6-step advisory chain, Web Speech API audio player. |
| **11** | `SCR-HISTORY` | Farmer | **P0** | Chronological timeline of farm samples, risk badges, sync state chips, search/filter. |
| **12** | `SCR-COMPARE` | Farmer / Vet | **P1** | Side-by-side comparison of 2 samples with diffs in DM, CP, pH, and visual characteristics. |
| **13** | `SCR-TRACE-QR` | Farmer / Buyer | **P0** | High-contrast QR code display, `FS-YYYYMMDD-XXXX` ID, digital certificate download button. |
| **14** | `SCR-SYNC-CENTER` | Farmer | **P0** | Outbox list, sync queue status (`Saved on device` → `Synced`), "SYNC NOW" button, result diffs. |
| **15** | `SCR-SETTINGS-LANG` | All | **P0** | English, Hindi (हिन्दी), Hinglish selectors, voice playback toggle, dark/light contrast settings. |
| **16** | `SCR-COOP-DASH` | Coop Manager | **P1** | Farmer test volume, village quality distribution, high-risk sample triage queue, batch stats. |
| **17** | `SCR-STORAGE-MONITOR`| Coop Manager / Farmer | **P1** | Pit temperature differential charts, heating rate trends, aerobic deterioration warnings. |
| **18** | `SCR-EXPLAINABILITY` | Vet / Nutritionist | **P1** | Factor contribution breakdown, influential NIR absorption bands, classical image overlay. |
| **19** | `SCR-VET-OVERRIDE` | Veterinarian | **P1** | Professional override dialog, clinical observation notes, signed audit record. |
| **20** | `SCR-ADMIN-COMMAND` | Admin | **P1** | System health, user/role management, audit logs, sync conflict resolution. |
| **21** | `SCR-MODEL-REGISTRY` | Admin / Researcher | **P1** | Active model cards, verified calibration metrics (RMSEP, R², RPD), synthetic model banner. |
| **22** | `SCR-DATA-COLLECT` | Admin / Field Tech | **P1** | Paired multimodal ingestion form (RGB, NIR, sensors, lab reference wet chemistry, GPS consent). |
| **23** | `SCR-PUBLIC-VERIFY` | Public / Consumer | **P0** | Glassmorphic verification card: **Verified** (green), **Unverified** (yellow), **Tampered** (red). |

---

## 2. Farmer Core Workflow: Maximum 3 Taps to START TEST

FeedShield ensures illiterate or semi-literate dairy farmers can initiate an evaluation in 3 taps or fewer:

```
[1. Open App / Home Screen]
       │
       ▼ Tap 1: Big Green "Start New Test" (नया टेस्ट शुरू करें) Button
[2. Test Selection Dialog]
       │
       ▼ Tap 2: Select "Silage Test" (साइलेज टेस्ट) or "Feed Test" (पशु आहार)
[3. Direct Viewfinder / Camera Active]
       │
       ▼ Tap 3: Shutter "Capture Sample" (फ़ोटो लें)
```
*Result:* Within 3 taps, image is acquired and entered into the validation sequence.

---

## 3. Dedicated Demonstration Views

* **Hero Demo Screen (`/demo/hero`):** Interactive side-by-side comparison of **Healthy Silage** (pH 4.0, green-olive, sweet-acidic, ambient temp, zero mould) vs **Spoiled Silage** (pH 5.8, dark brown/slimy, heating +8°C above ambient, aerobic spoilage mould).
* **Judge Guided Tour (`/demo/tour`):** 7-step guided modal walkthrough (Problem → Hero Demo → Evidence Tags → NIR Applicability Domain → Offline PWA & Sync → Signed QR & PDF → Roadmap).
* **Design System Showcase (`/design-system`):** Interactive reference for all typography, color tokens, evidence badges, glass cards, and status chips.
