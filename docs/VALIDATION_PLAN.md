# FeedShield Scientific Validation Plan

This document outlines the protocols required to validate FeedShield across representative sampling, instrument repeatability, operator reproducibility, and cross-seasonal/geographic deployments per **CLAUDE.md Section 0.10 & 0.11**.

---

## 1. Representative Sampling Protocol

NIR and probe assessments are only as valid as the physical sample presented. A standard grab sample from a single surface point is frequently misleading:

1. **Silage Pit Sampling:**
   * Minimum 5 core samples collected at varying depths (top 30 cm, middle core, bottom 30 cm, left face, right face).
   * Composite mixing on a clean tarpaulin followed by quartering down to a 500 g laboratory test aliquot.
   * Silage temperature must be measured 30–50 cm inside the face to eliminate ambient surface cooling/heating bias.
2. **Compound Feed Bags:**
   * Sampling spear inserted diagonally across at least 10% of bags in a delivery batch.
   * Visual inspection for moisture clumping, insect webbing, or packaging tears.

---

## 2. Repeatability & Reproducibility (R&R) Studies

To establish measurement uncertainty for the prediction envelope:

* **Repeatability (Same Operator, Same Instrument, Replicate Scans):**
  * 10 consecutive scans of the same sample without repositioning.
  * Standard deviation of reflectance $\sigma_R(\lambda)$ must not exceed 0.005 absorbance units across 950–1650 nm.
* **Reproducibility (Different Operators, Re-packing):**
  * 3 operators each independently repacking the sample cup 5 times.
  * Standard Error of Laboratory Repack (SELP) quantified and integrated into prediction uncertainty bounds.
* **Cross-Instrument Calibration Transfer:**
  * Master-to-slave calibration transfer using Shenk's algorithm or Piecewise Direct Standardization (PDS).
  * Instruments lacking calibration transfer profiles are flagged with an uncalibrated instrument warning.

---

## 3. Seasonal & Geographic Calibration Strategy

Feed composition varies substantially across Indian agro-climatic zones (e.g. Punjab wheat/maize vs Tamil Nadu sorghum/paddy straw):
1. **Initial Stratification:** Calibration models must include samples across 3 distinct harvesting seasons (Kharif, Rabi, Zaid).
2. **Moisture Range Splitting:** High-moisture fresh chop (>70% moisture) and dry wilted silage (<55% moisture) have distinct light scattering properties and require dedicated sub-models.
3. **Continuous Expansion via Paired Collection:** As co-ops upload paired wet-chemistry results, calibration domains are updated bi-annually with explicit model versioning (`nir-silage-plsr-v1.1`, etc.).
