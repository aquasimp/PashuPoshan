# FeedShield Machine Learning & Scientific Architecture

This document defines the machine learning tasks, model specifications, training pipelines, and honesty boundaries in accordance with **CLAUDE.md Section 0.7 & 0.8**.

---

## 1. Machine Learning Task Matrix

| Model ID | Model Name & Purpose | Inputs | Target Variables | Data Available Today | Status | Justification / Honesty Boundary |
|---|---|---|---|---|---|---|
| **Model A** | NIR Nutrient Regression | NIR diffuse absorbance spectra (900–1700 nm, 401 bands, SNV/SG-1st derivative) | Dry Matter (DM %), Crude Protein (CP % DM), NDF (% DM), ADF (% DM) | 1,200 physically plausible synthetic spectra + published forage profiles | **BUILD (Synthetic Demo Benchmark)** | Built using PLSR baseline, SVR, Random Forest, and LightGBM with nested cross-validation. Clearly labeled `data_provenance = synthetic_demo` and badged **DEMO**. |
| **Model B** | NIR Applicability Domain & Spectral Anomaly | Preprocessed NIR spectra | Hotelling T² statistic, Q-residual, Anomaly score (0–1), Domain status (`IN_DOMAIN`, `CAUTION`, `INVALID`) | Fitted on Model A training set distribution | **BUILD** | Critical safety filter: PCA projection onto principal subspace; samples exceeding 99% confidence limits return `INVALID` with `value = null`. |
| **Model C** | Silage Multi-Factor Risk Engine | pH, Internal Temp (°C), Ambient Temp (°C), Moisture/DM (%), Storage Duration, Pit Sealing Status | Air-ingress risk, Heating risk, Spoilage risk, Fermentation-failure risk, Mould risk, Sensor-health warning | Peer-reviewed agricultural literature & silage fermentation science (Kung et al., McDonald et al.) | **BUILD (Rule-Based Expert Engine)** | Implemented in Python and mirrored identically in TypeScript for offline PWA operation. Verified against 25+ golden test cases. Missing inputs result in `indeterminate`, never assumed zeros. |
| **Model D** | RGB Image Quality & Visual Screening | RGB sample photograph (480p–1080p) | Blur metric (Laplacian variance), Exposure score, Glare ratio, Framing hint, Visual Mould estimation (`ESTIMATED`) | Classical computer vision heuristics (HSV color-space segmentation, local texture entropy) | **HEURISTIC** | In accordance with Section 0.7, RGB cannot measure chemical or toxicological parameters. Classical CV detects out-of-focus capture, poor lighting, and surface mold discoloration without false CNN accuracy claims. |
| **Model E** | Colorimetric Assay & Strip Reader | Cropped photo of test strip on standardized reference color card | Strip pad color (CIELAB ΔE matching), pH estimation (3.0–8.0), Urea screening status (`Normal` vs `Possible excess`) | Synthetic test card images + standard colorimetric calibration curves | **BUILD (CV Reference Matching)** | Strip detection, illumination normalization via reference patches, and CIELAB color distance calculation. If reference card validation fails, refuses to return a reading. |
| **Model F** | Multimodal Late Fusion & Decision Arbiter | Envelopes from Models A, B, C, D, E + Metadata | Overall sample risk (`GOOD`, `ATTENTION`, `HIGH RISK`), Operational action (`FEED`, `BLEND`, `RE-TEST`, `DISCARD`), Input completeness | Algorithmic logic matrix | **BUILD (Deterministic Fusion)** | Implements the **Worst Supported Hazard** principle: a critical failure in any single validated modality (e.g. silage heating or high mold) cannot be masked by favorable readings in other modalities. |

---

## 2. Preprocessing & Chemometrics Pipeline (Model A & B)

```
Raw Reflectance R(λ) 
  → Dark/White Correction: R_corr = (R_raw - R_dark) / (R_white - R_dark)
  → Pseudo-absorbance: A(λ) = log10(1 / R_corr)
  → Truncation of high-noise boundary bands (<950 nm, >1650 nm)
  → Replicate Averaging (median across 3–5 scans)
  → Standard Normal Variate (SNV) or Savitzky-Golay 1st Derivative (window=15, poly=2)
  → PCA Decomposition (k=6 components)
  → Hotelling T² & Q-residual checks
  → Chemometric Regression (PLSR / SVR / Random Forest)
  → 95% Confidence Interval Calculation
```

---

## 3. Applicability Domain Enforcement

For any test spectrum $x$:
1. Project into PCA score space: $t = x \cdot P$
2. Reconstruct spectrum: $\hat{x} = t \cdot P^T$
3. Residual vector: $e = x - \hat{x}$
4. Hotelling $T^2 = \sum_{i=1}^k \frac{t_i^2}{\lambda_i}$
5. $Q\text{-residual} = e \cdot e^T$

Thresholds $T^2_{\text{crit}}$ and $Q_{\text{crit}}$ are established at the 95th and 99th percentiles of the training distribution:
* $T^2 \le T^2_{95}$ and $Q \le Q_{95} \implies$ `IN_DOMAIN`
* $T^2_{95} < T^2 \le T^2_{99}$ or $Q_{95} < Q \le Q_{99} \implies$ `CAUTION`
* $T^2 > T^2_{99}$ or $Q > Q_{99} \implies$ `INVALID` (Output `value: null`, error: *"Sample outside validated model range — laboratory confirmation recommended."*)

---

## 4. Golden Test Vectors Parity Guarantee

The Silage Rules Engine exists as:
* Pure Python: `apps/api/app/rules/silage_engine.py` (loads `silage_rules.yaml`)
* Pure TypeScript: `apps/web/lib/rules/silageEngine.ts` (loads compiled `silage_rules.json`)

Both engines execute against `ml/tests/golden/silage_cases.json` (25+ diverse cases covering crop types, moisture extremes, aerobic heating, air ingress, and missing sensor conditions). Pytest and Vitest test suites assert 100% agreement.
