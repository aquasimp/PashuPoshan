# Model Card: nir-moisture_dm-plsr-v1.0

> **Scientific Honesty Banner:**  
> **Trained on synthetic demo data — NOT a validation of field accuracy**

---

## 1. Overview
* **Model Name:** NIR Dry Matter (% DM) Chemometric Model
* **Version:** `nir-moisture_dm-plsr-v1.0`
* **Model Hash:** `85451c8cea9a36a0`
* **Target Constituent:** Dry Matter (% DM)
* **Modality:** Diffuse Reflectance NIR Spectroscopy (920–1680 nm)
* **Architecture:** Standard Normal Variate (SNV) + Partial Least Squares Regression (PLSR, 8 Latent Variables)
* **Data Provenance:** `synthetic_demo`

---

## 2. Quantitative Performance Metrics
Tested on independent held-out partition (236 samples, zero farm overlap):

| Metric | Champion (PLSR) | SVR | Random Forest |
|---|---|---|---|
| **RMSEP** | **5.359** | 0.191 | 4.386 |
| **MAE** | **4.06** | 0.119 | 3.229 |
| **R²** | **0.9496** | 0.9999 | 0.9662 |
| **RPD** | **4.452** | 124.786 | 5.44 |
| **Bias** | -0.0413 | -0.0163 | -0.2273 |

---

## 3. Performance by Crop Type
| Crop Type | RMSEP | MAE | R² | RPD |
|---|---|---|---|---|
| **compound_feed** | 4.597 | 3.518 | -2.4132 | 0.541 |
| **maize_silage** | 4.267 | 3.396 | 0.2963 | 1.192 |
| **green_fodder** | 10.882 | 10.306 | -15.7969 | 0.244 |
| **sorghum_silage** | 4.306 | 3.259 | 0.0237 | 1.012 |

---

## 4. Applicability Domain Boundaries
* Evaluated via Hotelling $T^2$ ($T^2_{99} = 14.46$) and Q-residual ($Q_{99} = 0.02510$).
* Samples exceeding critical thresholds return `INVALID` with `value = null`.

---

## 5. Intended Use & Safety Limitations
* **Intended:** Rapid screening of dairy feed and silage batches at shared cooperative nodes.
* **Prohibited:** Universal laboratory replacement. Not validated on unground physical samples without calibration transfer.
