# FeedShield Data Sources & Provenance Registry

This document records all candidate, benchmark, and synthetic data sources in accordance with **CLAUDE.md Section 0.8**.

---

## 1. Candidate Public Datasets Evaluated

| Dataset Name | Domain & Matrix | Modality | Sample Count | Targets / Labels | License | Intended Use | Limitations | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Zenodo Forage NIR Collection** | Forage crops, ryegrass, alfalfa | NIR spectroscopy (1100–2500 nm) | 380 samples | Dry Matter (DM), Crude Protein (CP), NDF, ADF | CC-BY 4.0 | Literature reference for spectral feature bands and constituent correlations | Temperate grasses; differs in particle size and variety from Indian tropical forage (sorghum, hybrid napier, bajra) | **DO NOT USE DIRECTLY FOR IN-DOMAIN PREDICTIONS** (Reference for band physics only) |
| **OpenAFRICA Grain & Cattle Feed** | Grain & mixed dairy ration | RGB Imagery | 220 images | Healthy, Insect-damaged, Discolored, Mouldy | CC-BY-SA 4.0 | Visual reference for quality triage and surface anomaly detection | Uncalibrated lighting; does not contain chemical ground truth | **USE FOR CV HEURISTIC BENCHMARKS** |
| **Mendeley Silage Fermentation Database** | Maize & grass silage | Physical / biochemical | 145 silage batches | pH, Flieg score, lactic acid, acetic acid, butyric acid, NH3-N | CC-BY 4.0 | Validation of Silage Rules Engine thresholds and crop-specific fermentation cutoffs | Batch-level biochemical data, not continuous time-series | **USE AS GROUND-TRUTH RULES VALIDATION** |
| **FeedShield Physically Plausible Synthetic NIR Engine** | Tropical dairy ration, compound cattle feed, corn silage | NIR Diffuse Reflectance (900–1700 nm, 2 nm intervals) | 1,200 synthetic spectra | DM (10–85%), CP (6–28%), NDF (25–65%), ADF (15–45%) | Open Source / FeedShield Internal (MIT) | Machine learning pipeline development, nested CV validation, applicability domain calibration, demo scenarios | Generated via physical chemometric equations (Beer-Lambert, multiplicative scatter, baseline shift, instrument noise); not measured on physical spectrometer | **APPROVED FOR DEMO & TESTING** (Mandatory label: `DEMO`, provenance: `synthetic_demo`) |
| **FeedShield Synthetic Silage Pit Sensor Telemetry** | Silage pit, bag, and bunker monitoring | Continuous sensor telemetry | 500 multi-day episodes | Internal temp, ambient temp, ambient RH, pH, O2, CO2 | Open Source / FeedShield Internal (MIT) | IoT simulation, storage alert testing, trend visualization | Algorithmic simulation of heat accumulation, aerobic spoilage, and secondary fermentation | **APPROVED FOR SIMULATED SENSORS** (Mandatory label: `DEMO`, provenance: `simulated_sensor`) |

---

## 2. Decision on Image-Based Nutritional & Chemical Claims

In strict adherence to **CLAUDE.md Section 0.7 (Claims Policy)**:
* RGB imagery **CANNOT** measure protein, fibre, minerals, invisible urea, fine silica, aflatoxin concentration, or moisture.
* Any visual analysis performed on images is limited to:
  1. Image quality assurance (blur, glare, exposure, framing)
  2. Visual class / physical form (pellet vs mash vs silage)
  3. Visible mould screening (tagged `ESTIMATED`)
  4. Visible physical contamination (stones, threads, large foreign bodies)
* All nutritional outputs require **NIR** or **Laboratory** inputs.
* All urea screening requires **Assay Reader + Reference Card** or **Laboratory** inputs.

---

## 3. Data Collection Roadmap (Long-Term Innovation)

FeedShield includes a dedicated **Data Collection Module** (`/data-collection/upload`) enabling Indian dairy cooperatives, KVKs, and veterinary testing centres to collect paired samples:
* High-resolution RGB images under controlled illumination
* NIR spectral scans (instrument ID, dark/white reference)
* Digital probe readings (pH, temperature)
* Verified wet-chemistry lab truth (Kjeldahl CP, Soxhlet Fat, Van Soest NDF/ADF, HPLC Aflatoxin)
* Mandatory farmer/cooperative consent flag and GPS location metadata.
