# FeedShield Machine Learning Model Limitations & Operational Boundaries

In accordance with **CLAUDE.md Section 0.7 & 0.8**, this document describes the scientific, physical, and calibration boundaries of all models implemented in FeedShield.

---

## 1. Chemometric NIR Nutritional Models (`nir-*-plsr-v1.0`)

* **Training Data Provenance:** Synthesized physically plausible diffuse reflectance spectra (401 bands, 900–1700 nm).
* **Calibration Domain:**
  * Dry Matter: 20% to 94%
  * Crude Protein: 6% to 28% DM
  * NDF: 22% to 68% DM
  * ADF: 12% to 46% DM
* **Mandatory Banner:**
  > **Trained on synthetic demo data — NOT a validation of field accuracy**
* **Primary Failure Modes:**
  1. *Out-of-Domain Spectra:* Physical samples differing in particle size, moisture extremes, or unmodeled mineral adulteration trigger Hotelling $T^2$ / Q-residual limits (`INVALID`), returning `value = null`.
  2. *Unground Physical Samples:* Direct unground silage scans exhibit high light scattering variance. Scanning fresh chop requires replicate averaging (3–5 scans) or standardized sample grinding protocol.
  3. *Uncalibrated Spectrometers:* Deploying across different physical spectrometer hardware without Piecewise Direct Standardization (PDS) transfer profiles invalidates accuracy.

---

## 2. Classical RGB Computer Vision Heuristics

* **Scope of Capability:**
  * Blur detection via Laplacian variance ($\text{Var}(\nabla^2 I) < 80.0 \implies$ *"Hold camera steady."*).
  * Lighting validation ($I_{\text{mean}} < 45 \implies$ *"Improve lighting."*).
  * Colorimetric segmentation for visible surface mould colonies (`ESTIMATED`).
* **Absolute Scientific Boundaries:**
  * RGB images **CANNOT** measure protein, fibre, minerals, moisture, or fermentation acids.
  * RGB images **CANNOT** detect or quantify aflatoxins, mycotoxins, or invisible adulterants (e.g. dissolved urea).
  * Visible absence of surface mould does NOT guarantee absence of mycotoxins.

---

## 3. Silage Fermentation Risk Engine

* **Rules Ground Truth:** Derived from peer-reviewed literature (Kung et al. 2018, McDonald et al. 1991, Pahlow et al. 2003).
* **Operational Rules:**
  * Silage pH cannot be interpreted with a single static number; optimal pH varies from 3.7 (wet corn silage) to 4.8 (wilted legume silage).
  * Heating alerts require temperature differential relative to ambient temperature ($T_{\text{int}} - T_{\text{amb}} \ge 5.0^\circ\text{C}$); absolute temperature alone is never an alert trigger.
  * Missing sensors produce `indeterminate` risk ratings, never assumed healthy defaults.
