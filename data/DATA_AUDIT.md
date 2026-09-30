# PashuPoshan Data Audit

**Date of Audit:** 2026-09-30  
**Auditor:** PashuPoshan AI Systems Engineering Team  
**Evaluation Standard:** CLAUDE.md Section 0.8 (Data Rule — Decision Ladder)

---

## 1. Official SIH26111 Folder Evaluation (Rung 1)

* **Source URL:** `https://drive.google.com/drive/folders/1KrErp9hRfLlaWw3gqvWFo1EpQiU1qtbG`
* **Access Status:** **INACCESSIBLE / BLOCKED** (Requires interactive Google Workspace authorization and permissions not granted in non-interactive environment).
* **Action:** Per CLAUDE.md Section 0.8 Rung 1 and Recovery Prompt line 810, recorded as inaccessible; proceeding under `PROCEED-FALLBACK` to Rungs 2, 3, and 4.
* **Integrity Guarantee:** No unverified or synthetic data will be claimed as the official SIH26111 dataset.

---

## 2. Inventory and Modality Audit Table

| Dataset ID | Modality | Matrix / Material | Target Variables & Units | Sample Count | Provenance | Leakage Risk & Partitioning Strategy | Usability Status |
|---|---|---|---|---|---|---|---|
| **SIH26111-RAW** | Mixed | Cattle feed, Silage | Unknown | 0 available | Official SIH Drive | N/A | **INACCESSIBLE** |
| **FORAGE-NIR-PUB** | NIR (900–1700 nm) | Maize silage, alfalfa, mixed fodder | DM (%), CP (% DM), NDF (% DM), ADF (% DM) | ~450 spectra (public reference literature profiles) | Published agricultural spectral libraries & reference calibrations | Stratified by physical sample ID, farm batch, and cutting period | **APPROVED (Benchmark Reference)** |
| **FEEDSHIELD-SYNTH-NIR** | NIR Diffuse Reflectance (900–1700 nm, 2 nm step, 401 bands) | Compound cattle feed, maize silage, green fodder | Moisture/DM (% 10-85%), Crude Protein (% 6-28%), NDF (% 25-65%), ADF (% 15-45%) | 1,200 synthesized physically-plausible spectra | `ml/synthetic/generator.py` (Gaussian absorption bands + baseline tilt + scatter + noise) | Strict group split by synthetic `batch_id` and `farm_id` (70/15/15) | **APPROVED FOR DEMO & BENCHMARK** (`data_provenance = synthetic_demo`) |
| **FEEDSHIELD-SYNTH-SILAGE** | Sensor telemetry | Silage pit / bunker / bale | Internal Temp (°C), Ambient Temp (°C), pH (3.5–7.5), Moisture (% DM), O2/CO2 (%) | 500 time-series profiles across 3 conditions (Healthy, Air Ingress, Fermentation Failure) | `tools/iot_sim/` generator | Time-series partition by storage pit ID | **APPROVED FOR SIMULATION & TESTING** (`data_provenance = simulated_sensor`) |
| **FEEDSHIELD-IMG-EVAL** | RGB Photography | Dairy cattle feed pellets, mash, silage samples | Surface mould, discoloration, foreign objects, reference color card | 120 curated & annotated test images | Synthetic test cards & open licensed agricultural test plates | Partitioned by capture batch | **APPROVED FOR CV PIPELINE & HEURISTICS** (Tagged `ESTIMATED`) |

---

## 3. Data Integrity & Leakage Prevention Rules

1. **Physical Sample Independence:** A physical feed sample scanned multiple times (replicates) or rotated must have all its replicates assigned to the same train, validation, or test partition.
2. **Preprocessing Isolation:** Standard Normal Variate (SNV), Savitzky-Golay filtering, and PCA whitening must be fitted exclusively inside training folds during cross-validation.
3. **Applicability Domain Constraints:** Outlier spectra or compositions beyond the verified training envelope must trigger `INVALID` with `value = null`.
4. **Honesty Enforcement:** All synthetic records carry `data_provenance: synthetic_demo`. All UI outputs derived from these carry the **DEMO** badge.
