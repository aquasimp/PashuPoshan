# FeedShield — Canonical Machine Learning & Scientific Scorecard

> **Critical Model Score Policy:**  
> «ML performance metrics are intentionally left pending where model training/validation is still in progress. No performance number is to be fabricated for the SIH submission.»

---

## 1. NIR Chemometrics Nutritional Regression Scorecard

### A. Moisture / Dry Matter (% DM)
* **Constituent Target:** Dry Matter (% DM)
* **Analytical Range:** 20.0% to 94.0% DM
* **Spectral Modality:** 920–1680 nm (381 active bands after edge trimming)
* **Synthetic Calibration Benchmark (Current Baseline):**
  * MAE: 4.060%
  * RMSE / RMSEP: 5.359%
  * $R^2$: 0.9496
  * Bias: -0.0413
  * RPD: 4.452
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * STATUS: `PENDING`
  * Calibration Error (RMSEC): `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Validation Error (RMSECV): `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Independent Test Error (RMSEP): `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Real Sample Count: `PENDING (Target: 200)`
  * Independent Batches: `PENDING (Target: 15)`
  * Real Applicability Domain Coverage: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Out-of-Domain Rejection Rate: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Insertion Target File: `ml/metrics/field_moisture_metrics.json`

---

### B. Crude Protein (% DM)
* **Constituent Target:** Crude Protein (% DM)
* **Analytical Range:** 6.0% to 28.0% DM
* **Spectral Modality:** 920–1680 nm (Primary absorption: N-H overtone at 1510 nm)
* **Synthetic Calibration Benchmark (Current Baseline):**
  * MAE: 1.084%
  * RMSE / RMSEP: 1.465%
  * $R^2$: 0.9070
  * Bias: +0.0676
  * RPD: 3.278
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * STATUS: `PENDING`
  * Calibration Error (RMSEC): `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Validation Error (RMSECV): `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Independent Test Error (RMSEP): `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Real Sample Count: `PENDING (Target: 200)`
  * Reference Method: Kjeldahl Total Nitrogen ($\text{CP} = N \times 6.25$)
  * Insertion Target File: `ml/metrics/field_crude_protein_metrics.json`

---

### C. Neutral Detergent Fiber (NDF % DM)
* **Constituent Target:** Neutral Detergent Fiber (% DM)
* **Analytical Range:** 22.0% to 68.0% DM
* **Synthetic Calibration Benchmark (Current Baseline):**
  * MAE: 3.773%
  * RMSE / RMSEP: 4.908%
  * $R^2$: 0.7258
  * Bias: +0.2370
  * RPD: 1.910
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * STATUS: `PENDING`
  * Reference Method: Van Soest Neutral Detergent Digestion
  * Insertion Target File: `ml/metrics/field_ndf_metrics.json`

---

### D. Acid Detergent Fiber (ADF % DM)
* **Constituent Target:** Acid Detergent Fiber (% DM)
* **Analytical Range:** 12.0% to 46.0% DM
* **Synthetic Calibration Benchmark (Current Baseline):**
  * MAE: 2.357%
  * RMSE / RMSEP: 3.068%
  * $R^2$: 0.7984
  * Bias: +0.0747
  * RPD: 2.227
  * Provenance: `synthetic_demo`
* **Real Field Laboratory Validation:**
  * CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * STATUS: `PENDING`
  * Reference Method: Acid Detergent Solution Digestion
  * Insertion Target File: `ml/metrics/field_adf_metrics.json`

---

### E. Secondary Nutritional Constituents
* **Starch (% DM):** CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Crude Fat / Ether Extract (% DM):** CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Metabolizable Energy (ME MJ/kg):** CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Total Digestible Nutrients (TDN %):** CURRENT SCORE: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Insertion Target File:** `ml/metrics/secondary_nutrients.json`

---

## 2. Algorithm Comparison & Cross-Validation Matrix

> **Methodological Note:** On mathematically simulated spectra, non-linear algorithms (SVR/RF) memorize the underlying generative equations, yielding non-physically high metrics. For rigorous field work, Partial Least Squares Regression (PLSR) remains the industry gold standard.

| Target Variable | Algorithm | Cross-Validation Error | Test Set RMSEP | Test Set $R^2$ | Test Set RPD | Preprocessing Pipeline | Best Validated Model |
|---|---|---|---|---|---|---|---|
| **Dry Matter** | PLSR (8 LV) | CV RMSE = 5.21% | 5.359% | 0.9496 | 4.452 | SNV + Savitzky-Golay (1st der) | **PLSR Baseline** |
| | SVR (RBF) | CV RMSE = 0.18%* | 0.191%* | 0.9999* | 124.7* | SNV + Savitzky-Golay | *Overfit on equations |
| | Random Forest | CV RMSE = 4.15% | 4.386% | 0.9662 | 5.440 | SNV + Raw | Candidate |
| **Crude Protein** | PLSR (8 LV) | CV RMSE = 1.41% | 1.465% | 0.9070 | 3.278 | SNV + Savitzky-Golay (1st der) | **PLSR Baseline** |
| | SVR (RBF) | CV RMSE = 0.08%* | 0.087%* | 0.9997* | 55.2* | SNV + Savitzky-Golay | *Overfit on equations |
| | Random Forest | CV RMSE = 1.01% | 1.032% | 0.9538 | 4.654 | SNV + Raw | Candidate |
| **NDF Fiber** | PLSR (8 LV) | CV RMSE = 4.82% | 4.908% | 0.7258 | 1.910 | SNV + Savitzky-Golay (1st der) | **PLSR Baseline** |
| | SVR (RBF) | CV RMSE = 0.38%* | 0.393%* | 0.9982* | 23.8* | SNV + Savitzky-Golay | *Overfit on equations |
| | Random Forest | CV RMSE = 3.39% | 3.429% | 0.8662 | 2.733 | SNV + Raw | Candidate |
| **ADF Fiber** | PLSR (8 LV) | CV RMSE = 2.98% | 3.068% | 0.7984 | 2.227 | SNV + Savitzky-Golay (1st der) | **PLSR Baseline** |
| | SVR (RBF) | CV RMSE = 0.34%* | 0.354%* | 0.9973* | 19.3* | SNV + Savitzky-Golay | *Overfit on equations |
| | Random Forest | CV RMSE = 2.18% | 2.205% | 0.8959 | 3.099 | SNV + Raw | Candidate |

---

## 3. Applicability Domain & Out-of-Domain Boundaries

* **Method:** PCA Hotelling $T^2$ + Residual Reconstruction Error ($Q$-Residual).
* **Principal Components:** 5 Latent Eigenmodes accounting for 98.4% of spectral variance.
* **Calibrated Confidence Thresholds:**
  * 95th Percentile: $T^2_{95} = 10.423$, $Q_{95} = 0.01824$
  * 99th Percentile: $T^2_{99} = 14.460$, $Q_{99} = 0.02510$
* **Synthetic Evaluation Performance:**
  * Total Test Spectra Evaluated: 236
  * IN_DOMAIN: 96.6% (228 spectra)
  * CAUTION: 2.5% (6 spectra)
  * INVALID: 0.9% (2 spectra rejected)
* **Real Field Campaign Performance:**
  * IN_DOMAIN: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * CAUTION: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * INVALID: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`

---

## 4. Spectral Anomaly & Chemical Adulteration

* **Urea Screening (Optical / Plain Photo):**
  * Status: Strictly Prohibited
  * Enforcement: Automatic rejection with message: *"Urea cannot be assessed from this image alone."*
* **Urea Screening (Colorimetric Reference Card Assay):**
  * Status: Prototype Integration Verified
  * Classification: Qualitative Screening (`NORMAL` vs `POSSIBLE_EXCESS_UREA`)
  * Accuracy: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Sensitivity: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * Specificity: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
  * **FALSE NEGATIVE RATE:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS` *(Mandatory reporting before commercial deployment)*
  * **FALSE POSITIVE RATE:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Inorganic Contamination (Sand/Silica Screening via NIR Anomaly):**
  * Method: Q-residual anomaly score
  * Label: *"Suspected inorganic contamination — confirmatory laboratory test recommended."*
  * Status: `DEMO-ONLY / RESEARCH PROTOTYPE`

---

## 5. Computer Vision & Optical Image Engine

### A. Image Quality Pre-Screening (Classical Computer Vision)
* Blur Rejection Accuracy: 100% on tested synthetic test suite ($N=15$)
* Lighting / Exposure Rejection Accuracy: 100% ($N=15$)
* Framing / Scale Rejection Accuracy: 100% ($N=10$)
* False Rejection Rate on Daylight Samples: `PENDING FIELD TRIALS`
* False Acceptance Rate on Motion Blur: `PENDING FIELD TRIALS`

### B. Deep Learning Feed Classification & Visible Mould
* Feed Category Classification F1: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* Visible Mould Detection F1: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* Mould Segmentation IoU / Dice: `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* Visible Mould Heuristic (HSV Mask): Functional prototype labeled `ESTIMATED`.

---

## 6. Colorimetric pH Strip Reader

* **Method:** CIELAB Euclidean distance ($\Delta E$) matching against 6-point buffer standards (pH 3.0 to 8.0) with reference card corner detection.
* **pH MAE:** `PENDING — CALIBRATION TEST IN PROGRESS`
* **RMSE:** `PENDING — CALIBRATION TEST IN PROGRESS`
* **Lighting Failure Rejection Rate:** 100% when reference card is obscured or lighting std &lt; 20.
* **Status:** `PROTOTYPE / DEMO VALIDATION ONLY`

---

## 7. Mycotoxin & Aflatoxin Policy

* **Direct Camera Aflatoxin Claim:** **STRICTLY FORBIDDEN** (Blocked by Claims Linter).
* **Silage Hazard Classification:** Labeled strictly as `INDICATIVE MYCOTOXIN RISK` based on temperature rise, high pH, and visible mould.
* **Rapid Assay Sensitivity / Specificity:** `PENDING — MODEL BUILD / VALIDATION IN PROGRESS`
* **Limit of Detection (LOD):** N/A (No quantitative claim made).

---

## 8. Deterministic Silage Fermentation Engine

* **Total Deterministic Rule Constants:** 27
* **Evaluation Stages:** 7 (Sensor validity, air ingress, heating, fermentation, mould, spoilage, action decision)
* **Total Golden Benchmark Test Cases:** 25
* **Verified Pass Rate:** 25 / 25 (100.0%)
* **Cross-Platform Parity:**
  * Python (`apps/api/app/rules/silage_engine.py`): 25 / 25 PASS
  * TypeScript (`apps/web/lib/rules/silageEngine.ts`): 25 / 25 PASS
  * Discrepancies: 0 (100% Parity)
