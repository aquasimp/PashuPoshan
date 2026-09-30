# FeedShield — Technical PDF Metrics Master Sheet
*(Comprehensive Engineering Reference for SIH26111 Technical Report)*

> **Scientific Honesty & Verification Standard:**  
> «ML performance metrics are intentionally left pending where model training/validation is still in progress. No performance number is to be fabricated for the SIH submission.»

---

## 1. System & Architecture Verification

* **Automated Claims Policy Enforcement:** 115 files scanned · 0 violations (`ml/claims_lint.py`).
* **Backend Pytest Test Suite:** 45 / 45 passed (100% test pass rate across auth, workflow, ML, and parity).
* **Frontend Vitest Test Suite:** 33 / 33 passed (100% test pass rate across parity, smoke, and Dexie offline sync).
* **Cross-Language Rules Parity:** 25 / 25 golden cases matching identically between Python and TypeScript.
* **Production Static Routes:** 17 static routes generated (`pnpm --filter web build`).
* **Database Tables:** 21 tables managed via SQLAlchemy 2 and verified with Alembic migrations (`c7ad2d7eb88b`).
* **REST API Endpoints:** 21 endpoints mounted on `/api/v1`.
* **Git Version Baseline:** Commit `912cf60` (143 tracked source files).

---

## 2. Machine Learning & Chemometrics Metrics

### A. Synthetic Demonstration Models (Baseline Reference)
* **Training Partition:** 964 spectra | **Held-out Test Partition:** 236 spectra.
* **Spectral Resolution:** 381 active bands (920.0 nm to 1680.0 nm) at 2.0 nm intervals.
* **Moisture / Dry Matter (% DM):**
  * Champion: PLSR (8 latent variables)
  * RMSEP: 5.359% | MAE: 4.060% | $R^2$: 0.9496 | Bias: -0.0413 | RPD: 4.452
  * Provenance: `synthetic_demo`
* **Crude Protein (% DM):**
  * Champion: PLSR (8 latent variables)
  * RMSEP: 1.465% | MAE: 1.084% | $R^2$: 0.9070 | Bias: +0.0676 | RPD: 3.278
  * Provenance: `synthetic_demo`
* **Neutral Detergent Fiber (NDF % DM):**
  * Champion: PLSR (8 latent variables)
  * RMSEP: 4.908% | MAE: 3.773% | $R^2$: 0.7258 | Bias: +0.2370 | RPD: 1.910
* **Acid Detergent Fiber (ADF % DM):**
  * Champion: PLSR (8 latent variables)
  * RMSEP: 3.068% | MAE: 2.357% | $R^2$: 0.7984 | Bias: +0.0747 | RPD: 2.227

### B. Real Field Campaign Validation (Field Wet Chemistry Ground Truth)
* **Field Moisture RMSEP:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Field Crude Protein RMSEP:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Field NDF RMSEP:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Field ADF RMSEP:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Target Sample Size:** 200 real Indian farm silage cores paired with Kjeldahl and oven drying wet chemistry.

---

## 3. Spectroscopy & Applicability Domain

* **Preprocessing Transforms:** Standard Normal Variate (SNV), Multiplicative Scatter Correction (MSC), Detrending (2nd degree polynomial), Savitzky-Golay (window=15, polyorder=2, 1st & 2nd derivative).
* **Multivariate Distance Thresholds (Synthetic Set):**
  * Hotelling $T^2$ ($T^2_{95} = 10.423$, $T^2_{99} = 14.460$)
  * $Q$-Residual ($Q_{95} = 0.01824$, $Q_{99} = 0.02510$)
* **Synthetic Test Set Domain Coverage:**
  * `IN_DOMAIN`: 96.6% (228 / 236)
  * `CAUTION`: 2.5% (6 / 236)
  * `INVALID`: 0.9% (2 / 236) — Safely rejected extreme unrepresented spectra.
* **Field Farm Holdout Domain Coverage:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`

---

## 4. Sensors & Hardware Telemetry

* **Core Silage pH Probe:**
  * Range: 2.5 to 9.0 pH | Resolution: 0.01 pH | Accuracy: ±0.05 pH (Simulated)
  * Calibration: Buffer 4.0 and 7.0 standard protocol.
* **Bunker Core Temperature Probe:**
  * Range: -5.0°C to 75.0°C | Resolution: 0.1°C | Accuracy: ±0.5°C (Simulated)
* **Ambient Air Reference Probe:**
  * Range: -10.0°C to 55.0°C | Resolution: 0.1°C (Simulated)
* **Thermal Differential Thresholds:**
  * Aerobic Heating Warning: $\Delta T \ge 5.0^\circ\text{C}$
  * Critical Aerobic Spoilage: $\Delta T \ge 10.0^\circ\text{C}$
  * Rapid Heating Rate Alarm: $\ge 1.5^\circ\text{C} / \text{day}$
* **Hardware Status:** Visibly labeled `SIMULATED` across UI/API.

---

## 5. Silage Fermentation Engine

* **Deterministic Rule Constraints:** 27 thresholds + 7 evaluation stages.
* **Crop Specific pH Windows:**
  * Maize Silage: Normal 3.70 – 4.20 | Critical High 4.60
  * Sorghum Silage: Normal 3.90 – 4.40 | Critical High 4.80
  * Grass/Legume: Normal 4.30 – 4.80 | Critical High 5.20
* **Dry Matter Modifiers:**
  * Wilted Silage (DM $\ge 45\%$): $+0.35\text{ pH}$ tolerance bump.
  * Wet Silage (DM $< 30\%$): Elevated clostridial risk if $\text{pH} > 4.50$.
* **Golden Benchmark Parity:** 25 / 25 Cases (100% Python ↔ TypeScript Parity).
* **Missing Input Handling:** Returns `indeterminate` for unmeasured risks.
* **Sensor Fault Handling:** Out-of-bounds inputs force `RE-TEST` recommendation.

---

## 6. Computer Vision & Colorimetric Assays

* **Image Quality Rejection Engine (Classical CV):**
  * Blur Threshold: Laplacian Variance $< 80.0 \implies$ *"Hold camera steady."*
  * Underexposure Threshold: Mean Luminance $< 45.0 \implies$ *"Improve lighting."*
  * Overexposure Threshold: Mean Luminance $> 220.0 \implies$ *"Improve lighting."*
  * Glare Ceiling: $> 8.0\%$ saturated pixels ($>250$) $\implies$ *"Improve lighting."*
  * Framing Check: Center Crop Variance $< 15.0 \implies$ *"Move closer."*
* **Visible Mould Detection:** HSV color mask segmentation tagged `ESTIMATED`.
* **Deep Learning Image Classification (CNN / YOLO):** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`.
* **Colorimetric Assay Reader:**
  * Calibration: Delta E ($\Delta E$) Euclidean distance matching in CIELAB color space.
  * Lighting Correction: 4-corner reference card normalization.
  * False Negative Rate: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`.
  * Urea Screening Rule: Qualitative screening result only; explicit disclaimer: *"Urea cannot be assessed from this image alone."*

---

## 7. Offline PWA & Data Synchronization

* **Client Storage:** IndexedDB via Dexie.js (`FeedShieldLocalDB`).
* **Offline Execution Capability:** 100% of core silage risk engine runs locally without internet.
* **Sync Conflict Policy:** Server-authoritative for lab analyses; client-authoritative for field drafts.
* **Sync Diffing:** Side-by-side "Updated after Sync" comparing local draft with cloud verification.
* **Service Worker Cache:** Pre-caches app shell, fonts, and offline fallback page.

---

## 8. Cryptographic Traceability & Security

* **Sample ID Format:** `FS-YYYYMMDD-XXXX` (Date + 4-character alphanumeric suffix).
* **Cryptographic Protocol:** HMAC-SHA256 digital signature token.
* **Verification States:**
  * `Verified` (Cryptographic signature and payload hash match registry).
  * `Unverified` (Valid draft structure, pending central synchronization).
  * `Tampered` (Cryptographic signature mismatch or payload altered).
* **PDF Report Generation:** ReportLab dynamic PDF with embedded high-contrast QR code.

---

## 9. Performance & Execution Latencies

* **Farmer Start-Test Flow:** 3 taps (Measured).
* **Client Motion Sequence:** 2.66 seconds across 7 stages (Measured).
* **Backend `/analyses/` Latency (p95):** 84 ms (Measured on local FastAPI instance).
* **Public QR Verification Latency:** 35 ms (Measured).
* **HMAC Signature Generation:** &lt; 2 ms.
* **Lighthouse Mobile Score:** `PENDING — CI AUDIT RUN REQUIRED`.

---

## 10. Hardware Bill of Materials (BOM) & Economics

| Subsystem | Target Hardware Component | Target Cost (INR) | Cost Classification |
|---|---|---|---|
| **Core Probe Node** | Stainless Steel Spear + DS18B20 Temp + Glass pH Probe | ₹2,200 – ₹3,800 | Estimated Engineering Prototype |
| **Telemetry Node** | ESP32-WROOM-32D + Solar Li-ion Power Management | ₹1,500 – ₹2,400 | Current Retail Market |
| **Shared NIR Station** | MEMS-based InGaAs NIR Spectrometer (900–1700 nm) | ₹95,000 – ₹1,65,000 | Quotation-Based Industry Target |
| **Consumables** | Calibration Buffers (pH 4.0/7.0) + Test Cards (100 pack) | ₹350 – ₹600 | Retail Consumable |
| **Total Farmer Kit** | Handheld probe + reference card (uses existing phone) | ₹2,200 – ₹3,800 | Projected Target |
| **Total Shared Node** | Full NIR + Probe + ESP32 Base Station | ₹1,04,500 – ₹1,85,000 | Projected Cooperative Investment |

---

## 11. Scientific Validation Plan

* **Repeatability:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Reproducibility:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Batch Holdout Validation:** Verified on 236 synthetic batches; field batch holdout `PENDING`.
* **Geographic & Seasonal Generalization:** `FUTURE FIELD VALIDATION TARGET`.
* **Laboratory Comparison (Wet Chem):** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`.

---

## 12. Deployment Architecture

* **Deployment Model:** Shared Testing Service (Cooperatives, Milk Collection Centres, KVKs, Mobile Vans).
* **Farmer Access:** Free PWA smartphone app for pit monitoring, image QA, and visual silage triage.
* **Traceability Integration:** QR code printouts for bulk tanker lots and silage bunker sales.
