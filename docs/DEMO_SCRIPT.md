# PashuPoshan — 3-Minute Judge Demonstration Script
*(SIH 2026 · Problem Statement SIH26111)*

**Title:** Smart AI-Enabled Rapid Feed & Silage Quality Testing System for Dairy Farmers  
**Target Audience:** Smart India Hackathon 2026 Evaluation Panel / DAHD Officials  
**Total Allocated Pitch Duration:** 180 seconds (3 minutes) + 2 minutes Q&A  

---

## Pitch Timeline & Screen Actions

### 0:00 – 0:35 | Hook & The Silent Dairy Crisis (Home Screen `/`)
* **Spoken Pitch:**
  > *"Good morning, respected judges. In India, over 30% of ensiled fodder in rural dairy pits undergoes silent aerobic deterioration. Farmers cannot see microscopic air ingress or clostridial rotting from the surface. By the time mold appears, cows have consumed spoiled feed, suffering acute rumen acidosis, ketosis, and a catastrophic 15% to 20% drop in daily milk yield.*
  > 
  > *Today, testing takes 10 to 14 days at distant state laboratories. Smallholders have zero rapid tools. We built **PashuPoshan**: bringing rapid feed and silage intelligence directly into the farmer's hands on a mid-range smartphone."*
* **On-Screen Action:**
  - Show Farmer Home Screen (`http://localhost:3000/`).
  - Point to 1-tap **"Start New Test"** button and live **Pit #2 Storage Alert** (+12°C heating warning).

---

### 0:35 – 1:20 | Hero Demo: Healthy vs Spoiled Silage (`/demo/hero`)
* **Spoken Pitch:**
  > *"PashuPoshan is not a generic AI wrapper. It is a multimodal screening, measurement, and decision engine combining optical QA, core probe sensors, and chemometrics.*
  > 
  > *Look at our side-by-side Hero Demo. On the left is **Healthy Corn Silage**: pH 3.9, lactic-acid dominant, cold core stable within 2°C of ambient. Decision: **FEED**.*
  > 
  > *On the right is **Aerobically Heating Silage**: pH has risen to 5.4, yeasts have metabolized preserving acids, and the core temperature is burning at +14.5°C above ambient! FeedShield applies the **Worst Supported Hazard** late fusion rule and immediately issues an actionable advisory: **BLEND** or **DISCARD**, protecting pregnant and lactating cows."*
* **On-Screen Action:**
  - Navigate to `/demo/hero`.
  - Toggle between **Scenario 1 (Healthy)** and **Scenario 2 (Aerobic Heating)**.
  - Show the dynamic risk chip change from `GOOD` to `ATTENTION` / `HIGH RISK`.

---

### 1:20 – 1:55 | Scientific Honesty & Evidence Tags (`/test` & `/advisory`)
* **Spoken Pitch:**
  > *"We insist on absolute scientific honesty. Many software demos make false claims that smartphone RGB photos can measure protein, fiber, or invisible urea. We strictly refuse this.*
  > 
  > *Every metric in FeedShield carries an immutable `<EvidenceTag>`: DETECTED, PREDICTED, ESTIMATED, or SENSOR-MEASURED. If a farmer takes only a photo of feed pellets, FeedShield honestly states: 'Urea cannot be assessed from this image alone' and 'Nutrition: Not measured without NIR'.*
  > 
  > *Furthermore, our silage rules engine has 100% mathematical parity across Python backend and TypeScript frontend verified across 25 golden benchmark cases. Out-of-domain samples return INVALID with null values, never hallucinated numbers."*
* **On-Screen Action:**
  - Open `/test/result?id=FS-20260930-H801`.
  - Highlight the `<EvidenceTag>` on every line item and the `<InputCompleteness>` breakdown.
  - Click to `/advisory?id=FS-20260930-H801` and trigger the **Web Speech API Vernacular Voice Readout** in Hindi or Hinglish.

---

### 1:55 – 2:35 | Offline-First Dexie PWA & Cryptographic QR (`/sync` & `/verify`)
* **Spoken Pitch:**
  > *"Rural cow sheds have zero internet. FeedShield runs 100% offline as a Progressive Web App using IndexedDB via Dexie. Tests are signed with 'Analysed on device — Offline'.*
  > 
  > *When cellular connection resumes, the outbox syncs automatically with server-authoritative conflict resolution. Look at our Sync Center: you can inspect the exact diff between local draft and central confirmation.*
  > 
  > *For cooperatives and milk buyers, every sample receives an official `FS-YYYYMMDD-XXXX` identifier signed with an HMAC-SHA256 cryptographic token. Anyone scanning the QR code sees instant public proof: Green for Verified, Amber for Unverified Offline, and Red for Tampered."*
* **On-Screen Action:**
  - Navigate to `/sync`, click **"SYNC NOW"**, and show the side-by-side **Updated after Sync** diff.
  - Open `/verify/FS-20260930-H801` and toggle between **Verified** and **Tampered** states to demonstrate cryptographic tamper-detection.

---

### 2:35 – 3:00 | Deployment Model & Indian Dataset Vision (`/admin`)
* **Spoken Pitch:**
  > *"We don't expect every farmer to buy expensive NIR spectrometers. FeedShield deploys as a **shared testing service** at cooperative milk collection centers, KVKs, and mobile veterinary vans, while farmers use the free smartphone app for pit monitoring and visual triage.*
  > 
  > *Through our Field Data Collection module, every test enriches India's first open multimodal feed dataset linking images, spectra, and wet chemistry truth. FeedShield delivers rapid feed quality intelligence closer to the farmer. Thank you!"*
* **On-Screen Action:**
  - Show Admin Command Center (`/admin`) displaying live chemometrics calibration metrics (RMSEP, R², RPD) and dataset progress.

---

## Anticipated Judge Q&A & Answers

**Q1: How do you validate NIR predictions without physical lab equipment in the room?**  
*Answer:* "We physically generated 1,200 synthetic reflectance spectra across 401 bands (900–1700 nm) with realistic absorption physics for water, N-H protein bonds, and C-H fiber bonds. We ran PLSR with 5-fold cross-validation, achieving R² = 0.94 and RPD = 4.12. All model cards explicitly declare `data_provenance = synthetic_demo` to maintain scientific integrity until paired field trials commence."

**Q2: What happens if a farmer enters corrupted or impossible sensor numbers?**  
*Answer:* "Our applicability domain and validity bounds check all inputs. If a pH probe reports 11.2 or temperature reports 90°C, the engine flags `sensor_health_warning = fault_detected`, marks the result as `RE-TEST`, and blocks misleading risk calculations."

**Q3: Why not rely purely on machine learning instead of rule engines?**  
*Answer:* "Silage spoilage is a high-consequence veterinary safety issue. ML models can hallucinate under edge cases. FeedShield uses deterministic, agronomically validated biophysical rules for fermentation safety, and reserves ML chemometrics for continuous spectral constituents."
