# FEEDSHIELD SIH26111 — FINAL FORENSIC METRICS & EVIDENCE AUDIT

> **Critical Model Score Policy:**  
> «ML performance metrics are intentionally left pending where model training/validation is still in progress. No performance number is to be fabricated for the SIH submission.»

**Evaluation Context:** Smart India Hackathon 2026 · Problem Statement SIH26111  
**Project:** FeedShield — AI-Enabled Rapid Feed & Silage Quality Testing System for Dairy Farmers  
**Organization:** Ministry of Fisheries, Animal Husbandry & Dairying (DAHD)  
**Scoring Rubric Weighting Status:** **NO VERIFIED PUBLIC 2026 WEIGHTING FOUND**  
*(Evaluated across standard SIH criteria: Novelty, Complexity, Clarity, Feasibility, Practicability, Sustainability, Impact Scale, UX, Future Progression)*

---

## 1. Master Score Matrix

| Category | Metric / Score | Current Value | Status | Evidence Source | PPT? | PDF? | Demo? | Final Required? |
|---|---|---|---|---|---|---|---|---|
| **System Integrity** | Forbidden Claims Policy Scan | 115 files · 0 violations | VERIFIED | `ml/claims_lint.py` | Yes | Yes | Yes | Yes |
| **System Testing** | Backend & ML Pytest Suite | 45 / 45 passed (100%) | VERIFIED | `apps/api/tests/`, `ml/tests/` | Yes | Yes | Yes | Yes |
| **System Testing** | Web Frontend Vitest Suite | 33 / 33 passed (100%) | VERIFIED | `apps/web/test/` | Yes | Yes | Yes | Yes |
| **Algorithm Parity** | Silage Rules Engine Parity | 25 / 25 golden cases | VERIFIED | `ml/tests/golden/silage_cases.json` | Yes | Yes | Yes | Yes |
| **PWA Routes** | Static Production Generation | 17 / 17 routes compiled | VERIFIED | `pnpm --filter web build` | Yes | Yes | Yes | Yes |
| **Git Baseline** | Clean Master Commit | `912cf60` (143 files) | VERIFIED | Git Repository Log | Yes | Yes | No | Yes |
| **UX Ergonomics** | Start Test Tap Count | 3 taps | MEASURED | `apps/web/app/` UI Flow | Yes | Yes | Yes | Yes |
| **UX Accessibility** | Touch Target Minimum | 48px × 48px | VERIFIED | `apps/web/tailwind.config.ts` | No | Yes | No | Yes |
| **UX Localization** | Languages Supported | 3 complete (en, hi, hinglish) + 1 stub (gu) | VERIFIED | `apps/web/locales/` | Yes | Yes | Yes | Yes |
| **Voice Readout** | Vernacular Audio Playback | Supported (Web Speech API) | VERIFIED | `apps/web/app/advisory/page.tsx` | Yes | Yes | Yes | Yes |
| **Offline Engine** | Local Storage Technology | IndexedDB via Dexie.js | VERIFIED | `apps/web/lib/db.ts` | Yes | Yes | Yes | Yes |
| **Offline Sync** | Outbox Idempotency & Diffing | Server-Authoritative Conflict Resolution | VERIFIED | `apps/api/app/routers/sync.py` | Yes | Yes | Yes | Yes |
| **Security** | Tamper-Evident Signatures | HMAC-SHA256 Tokenization | VERIFIED | `apps/api/app/services/traceability_service.py` | Yes | Yes | Yes | Yes |
| **Reporting** | Branded Offline Audit Report | Dynamic ReportLab PDF with QR | VERIFIED | `apps/api/app/services/pdf_service.py` | Yes | Yes | Yes | Yes |
| **Database** | Normalized Data Schema | 21 Tables (Alembic verified) | VERIFIED | `apps/api/app/models/` | No | Yes | No | Yes |
| **API Surface** | REST Endpoints Count | 21 Endpoints | VERIFIED | `apps/api/app/routers/` | No | Yes | No | Yes |
| **Silage Engine** | Deterministic Rules Count | 27 rules/bounds + 7 stages | VERIFIED | `silage_rules.yaml` | Yes | Yes | Yes | Yes |
| **NIR Demo Pipeline** | Synthetic Spectra Generated | 1,200 samples (401 bands) | DEMO-ONLY | `ml/synthetic/generator.py` | Yes | Yes | Yes | No |
| **NIR Calibration** | Moisture/DM PLSR (Synthetic) | $R^2 = 0.950$, $\text{RPD} = 4.45$ | DEMO-ONLY | `ml/metrics/model_registry_summary.json` | Yes | Yes | Yes | No |
| **NIR Calibration** | Crude Protein PLSR (Synthetic)| $R^2 = 0.907$, $\text{RPD} = 3.28$ | DEMO-ONLY | `ml/metrics/model_registry_summary.json` | Yes | Yes | Yes | No |
| **NIR Calibration** | NDF Fiber PLSR (Synthetic) | $R^2 = 0.726$, $\text{RPD} = 1.91$ | DEMO-ONLY | `ml/metrics/model_registry_summary.json` | Yes | Yes | Yes | No |
| **NIR Calibration** | ADF Fiber PLSR (Synthetic) | $R^2 = 0.798$, $\text{RPD} = 2.23$ | DEMO-ONLY | `ml/metrics/model_registry_summary.json` | Yes | Yes | Yes | No |
| **NIR Field Calibration**| Real Field Wet Chem Accuracy | PENDING — MODEL BUILD / VALIDATION IN PROGRESS | PENDING | Field Lab Campaign (Pending) | Yes | Yes | No | Yes |
| **Applicability Domain** | Hotelling $T^2$ ($T^2_{99}$) | 14.46 (Synthetic Set) | DEMO-ONLY | `ml/applicability_domain.py` | No | Yes | No | Yes |
| **Applicability Domain** | Q-residual ($Q_{99}$) | 0.02510 (Synthetic Set) | DEMO-ONLY | `ml/applicability_domain.py` | No | Yes | No | Yes |
| **Applicability Domain** | Real Farm Rejection Rate | PENDING — MODEL BUILD / VALIDATION IN PROGRESS | PENDING | Field Trials | Yes | Yes | No | Yes |
| **Computer Vision** | Image Quality Reject Engine | Blur, Lighting, Framing Heuristics | VERIFIED | `ml/rgb_engine.py` | Yes | Yes | Yes | Yes |
| **Computer Vision** | Deep Learning Classification | PENDING — MODEL BUILD / VALIDATION IN PROGRESS | PENDING | Indian Feed RGB Dataset | Yes | Yes | No | Yes |
| **Computer Vision** | Visible Mould Heuristic | HSV Mask Segmentation (ESTIMATED) | DEMO-ONLY | `ml/rgb_engine.py` | Yes | Yes | Yes | Yes |
| **Chemical Screening** | Colorimetric Reference Card Reader| CIELAB Delta E $\Delta E$ Normalization | VERIFIED | `ml/assay_reader.py` | Yes | Yes | Yes | Yes |
| **Chemical Screening** | Urea Assay False Negative Rate | PENDING — MODEL BUILD / VALIDATION IN PROGRESS | PENDING | Lab Validation Trial | Yes | Yes | No | Yes |
| **Sensors** | Core Silage pH Probe | Simulated Driver (0.01 pH res) | SIMULATED | `docs/HARDWARE.md` | Yes | Yes | Yes | Yes |
| **Sensors** | Bunker Core Temp Probe | Simulated Driver (0.1°C res) | SIMULATED | `docs/HARDWARE.md` | Yes | Yes | Yes | Yes |
| **Sensors** | Storage Telemetry Simulation | 3 Temporal Profiles (Healthy, Heating, Failure)| SIMULATED | `tools/iot_sim/pit_simulator.py` | Yes | Yes | Yes | Yes |
| **Hardware BOM** | Shared-Node Testing Station | ₹1,04,500 – ₹1,85,000 (Target) | ESTIMATED | `docs/HARDWARE.md` | Yes | Yes | No | Yes |
| **Hardware BOM** | Farmer Smartphone Probe Kit | ₹2,200 – ₹3,800 (Target) | ESTIMATED | `docs/HARDWARE.md` | Yes | Yes | No | Yes |

---

## 2. ML Scoreboard & Status

### A. NIR Nutrition Chemometric Models (920–1680 nm)

#### 1. Dry Matter / Moisture (% DM)
* **Synthetic Training Partition (964 train / 236 test):**
  * MAE: 4.060%
  * RMSE / RMSEP: 5.359%
  * $R^2$: 0.9496
  * Bias: -0.0413
  * RPD: 4.452
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Status: PENDING
  * Insertion Target: `ml/metrics/field_moisture_metrics.json`
  * Required Real Set: $\ge 200$ wet-chemistry verified Indian farm silage samples across 3 seasons.

#### 2. Crude Protein (% DM)
* **Synthetic Training Partition (964 train / 236 test):**
  * MAE: 1.084%
  * RMSE / RMSEP: 1.465%
  * $R^2$: 0.9070
  * Bias: +0.0676
  * RPD: 3.278
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Status: PENDING
  * Insertion Target: `ml/metrics/field_crude_protein_metrics.json`
  * Required Real Set: Kjeldahl nitrogen reference comparisons.

#### 3. Neutral Detergent Fiber (NDF % DM)
* **Synthetic Training Partition (964 train / 236 test):**
  * MAE: 3.773%
  * RMSE / RMSEP: 4.908%
  * $R^2$: 0.7258
  * Bias: +0.2370
  * RPD: 1.910
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Status: PENDING
  * Insertion Target: `ml/metrics/field_ndf_metrics.json`

#### 4. Acid Detergent Fiber (ADF % DM)
* **Synthetic Training Partition (964 train / 236 test):**
  * MAE: 2.357%
  * RMSE / RMSEP: 3.068%
  * $R^2$: 0.7984
  * Bias: +0.0747
  * RPD: 2.227
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Status: PENDING
  * Insertion Target: `ml/metrics/field_adf_metrics.json`

#### 5. Secondary Targets (Starch, Crude Fat, ME/TDN Energy)
* CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* Status: PENDING
* Insertion Target: `ml/metrics/secondary_nutrients.json`

---

## 3. NIR Model Algorithm Comparisons (Synthetic Calibration Set)

| Target Constituent | Model Family | Test RMSEP | Test MAE | Test $R^2$ | Test RPD | Applicability Domain Failure Rate | Best Validated Model |
|---|---|---|---|---|---|---|---|
| **Dry Matter (% DM)** | PLSR (8 Latent Vars) | 5.359 | 4.060 | 0.9496 | 4.452 | 0.85% (Synthetic) | PLSR Baseline |
| | SVR (RBF Kernel) | 0.191* | 0.119* | 0.9999* | 124.7* | 0.85% (Synthetic) | *Overfit on synthetic physics equations |
| | Random Forest (150 trees) | 4.386 | 3.229 | 0.9662 | 5.440 | 0.85% (Synthetic) | Candidate |
| **Crude Protein (% DM)** | PLSR (8 Latent Vars) | 1.465 | 1.084 | 0.9070 | 3.278 | 0.85% (Synthetic) | PLSR Baseline |
| | SVR (RBF Kernel) | 0.087* | 0.069* | 0.9997* | 55.2* | 0.85% (Synthetic) | *Overfit on synthetic physics equations |
| | Random Forest (150 trees) | 1.032 | 0.765 | 0.9538 | 4.654 | 0.85% (Synthetic) | Candidate |
| **NDF (% DM)** | PLSR (8 Latent Vars) | 4.908 | 3.773 | 0.7258 | 1.910 | 0.85% (Synthetic) | PLSR Baseline |
| | SVR (RBF Kernel) | 0.393* | 0.271* | 0.9982* | 23.8* | 0.85% (Synthetic) | *Overfit on synthetic physics equations |
| | Random Forest (150 trees) | 3.429 | 2.689 | 0.8662 | 2.733 | 0.85% (Synthetic) | Candidate |
| **ADF (% DM)** | PLSR (8 Latent Vars) | 3.068 | 2.357 | 0.7984 | 2.227 | 0.85% (Synthetic) | PLSR Baseline |
| | SVR (RBF Kernel) | 0.354* | 0.255* | 0.9973* | 19.3* | 0.85% (Synthetic) | *Overfit on synthetic physics equations |
| | Random Forest (150 trees) | 2.205 | 1.719 | 0.8959 | 3.099 | 0.85% (Synthetic) | Candidate |

> **Scientific Audit Note:** Non-linear models (SVR/RF) show near-perfect metrics on mathematically generated spectra because synthetic data is generated via deterministic Gaussian absorption functions. For real field data, PLSR remains the primary benchmark to avoid non-physical overfitting.

---

## 4. Applicability Domain Coverage

* **Methodology:** Principal Component Analysis (5 components) evaluating Hotelling $T^2$ distance and $Q$-residual reconstruction error.
* **Calibrated Thresholds (from 964 calibration spectra):**
  * $T^2_{95} = 10.423$, $T^2_{99} = 14.460$
  * $Q_{95} = 0.01824$, $Q_{99} = 0.02510$
* **Synthetic Test Set Evaluation (236 spectra):**
  * `IN_DOMAIN`: 96.6% (228 / 236)
  * `CAUTION`: 2.5% (6 / 236)
  * `INVALID`: 0.9% (2 / 236) — Correctly rejected out-of-domain extreme spectra.
* **Field Farm Holdout Set:**
  * `IN_DOMAIN`: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * `CAUTION`: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * `INVALID`: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`

---

## 5. Chemical Adulteration & Assays

### A. Urea Adulteration Screening
* **Camera-Only Photo:** Strictly tagged `NOT MEASURED` with mandatory banner: *"Urea cannot be assessed from this image alone."*
* **Colorimetric Assay Reader (Urease Ammonia Reaction):**
  * Reference Card Detection Accuracy: 100% (synthetic card set, $N=20$)
  * False Negative Rate: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * False Positive Rate: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Screening Classification: Qualitative only (`NORMAL` vs `POSSIBLE_EXCESS_UREA`)
  * Mandatory Disclaimer: *"Screening result — confirmatory laboratory test recommended."*

### B. Mycotoxin & Aflatoxin Detection
* **Camera-Only Photo:** Prohibited from claiming aflatoxin detection.
* **Silage Engine Integration:** Classified strictly as `INDICATIVE MYCOTOXIN RISK` driven by aerobic heating ($\Delta T \ge 10^\circ\text{C}$), high pH ($\text{pH} \ge 5.5$), and visible mould colonies.
* **Limit of Detection (LOD):** Not applicable for camera (No direct quantification claim). Lateral flow assay reader integration status: Architecture ready, field validation PENDING.

---

## 6. Silage Risk Engine Audit

* **Deterministic Rules Count:** 27 threshold constants + 7 progressive evaluation stages.
* **Golden Benchmark Cases:** 25 independent scenarios covering optimal silage, clostridial rotting, aerobic heating, air ingress, and sensor faults.
* **Golden Pass Rate:** 25 / 25 (100.0%)
* **Cross-Language Parity:**
  * Python (`apps/api/app/rules/silage_engine.py`): 25 / 25 Pass
  * TypeScript (`apps/web/lib/rules/silageEngine.ts`): 25 / 25 Pass
  * Parity Mismatch Count: 0 (100% mathematical parity)
* **Sensor-Fault Behavior:** Out-of-bounds input (e.g. pH 11.2 or Temp 80°C) triggers `sensor_health_warning = "fault_detected"` and forces `action_decision = "RE-TEST"`.
* **Missing-Input Behavior:** If sensor inputs are omitted, engine returns `spoilage_risk = "indeterminate"`, never assuming a healthy default.

---

## 7. Storage Monitoring & Sensor Telemetry

* **Simulated Hardware Status:** Visibly badged `SIMULATED` / `DEMO` across all UI and API channels.
* **Bunker Sensor Telemetry (3 Profiles):**
  * *Profile 1 (Healthy Fermentation):* Internal 26.5°C, Ambient 25.0°C ($\Delta T = +1.5^\circ\text{C}$), pH 3.9, Heating rate 0.1°C/day.
  * *Profile 2 (Aerobic Heating Ingress):* Internal 41.0°C, Ambient 26.0°C ($\Delta T = +15.0^\circ\text{C}$), pH 5.4, Heating rate +2.8°C/day.
  * *Profile 3 (Clostridial Collapse):* Internal 33.0°C, Ambient 25.0°C, pH 5.9, Moisture 78% (seepage).
* **Alert Trigger Accuracy:** 100% on simulated profiles ($N=30$ runs).
* **Time-to-Alert:** Instantaneous on telemetry push (&lt; 200 ms).

---

## 8. Offline PWA & Sync Performance

* **Offline Test Execution Rate:** 100% (Fully functional without network connectivity).
* **Local Storage Technology:** Dexie.js (IndexedDB wrapper) with 5 object stores.
* **Sync Conflict Policy:** Server-Authoritative for official lab analysis; client-authoritative for offline field drafts.
* **Sync Diffing Display:** Side-by-side "Updated after Sync" comparing local draft with cloud verification.
* **HMAC-SHA256 Token Signature Time:** &lt; 2 ms.
* **PDF Report Generation Time:** ~180 ms (ReportLab).

---

## 9. Performance & Latency (Target vs Measured)

| Component | Target Metric | Measured Value | Environment |
|---|---|---|---|
| **Frontend Initial Load** | &lt; 2.0 s | 1.12 s | Localhost Chromium |
| **Start-to-Test Taps** | $\le 3$ taps | **3 taps** | Measured on `/` → `/test` → `/test/capture` |
| **7-Step Processing Sequence** | 2.5 – 3.5 s | **2.66 s** | Client Animation Sequence |
| **API `/analyses/` Latency (p95)** | &lt; 500 ms | **84 ms** | Local FastAPI / SQLite |
| **QR Verification Latency** | &lt; 200 ms | **35 ms** | Local FastAPI |
| **Next.js Production Build** | Clean build | **17/17 routes compiled** | Production Next.js 14.2.5 |
| **Lighthouse Mobile Score** | &gt; 90 | `PENDING — CI AUDIT RUN REQUIRED` | Mobile Profile |

---

## 10. Code Quality & Repository Inventory

* **Total Tracked Files:** 143 files committed (`912cf60`)
* **Total Automated Tests:** 78 tests passing
  * Pytest (Backend + ML): 45 / 45
  * Vitest (Web + Parity + Sync): 33 / 33
* **Static Production Routes:** 17 routes
* **Database Models:** 21 tables
* **API Endpoints:** 21 endpoints
* **Claims Linter Enforcement:** 115 files scanned · 0 violations
* **TypeScript Strictness:** 0 compilation errors
