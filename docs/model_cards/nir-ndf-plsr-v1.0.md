# Model Card: nir-ndf-plsr-v1.0

> **Scientific Honesty Banner:**  
> **Trained on synthetic demo data — NOT a validation of field accuracy**

---

## 1. Overview
* **Model Name:** NIR Neutral Detergent Fiber (% DM) Chemometric Model
* **Version:** `nir-ndf-plsr-v1.0`
* **Model Hash:** `6cf27173934247af`
* **Target Constituent:** Neutral Detergent Fiber (% DM)
* **Modality:** Diffuse Reflectance NIR Spectroscopy (920–1680 nm)
* **Architecture:** Standard Normal Variate (SNV) + Partial Least Squares Regression (PLSR, 8 Latent Variables)
* **Data Provenance:** `synthetic_demo`

---

## 2. Quantitative Performance Metrics
Tested on independent held-out partition (236 samples, zero farm overlap):

| Metric | Champion (PLSR) | SVR | Random Forest |
|---|---|---|---|
| **RMSEP** | **4.908** | 0.393 | 3.429 |
| **MAE** | **3.773** | 0.271 | 2.689 |
| **R²** | **0.7258** | 0.9982 | 0.8662 |
| **RPD** | **1.91** | 23.859 | 2.733 |
| **Bias** | 0.237 | 0.0054 | 0.2383 |

---

## 3. Performance by Crop Type
| Crop Type | RMSEP | MAE | R² | RPD |
|---|---|---|---|---|
| **compound_feed** | 6.346 | 4.948 | -1.1314 | 0.685 |
| **maize_silage** | 3.824 | 3.07 | 0.6035 | 1.588 |
| **green_fodder** | 7.56 | 6.845 | -1.5582 | 0.625 |
| **sorghum_silage** | 3.604 | 2.751 | 0.6536 | 1.699 |

---

## 4. Applicability Domain Boundaries
* Evaluated via Hotelling $T^2$ ($T^2_{99} = 14.46$) and Q-residual ($Q_{99} = 0.02510$).
* Samples exceeding critical thresholds return `INVALID` with `value = null`.

---

## 5. Intended Use & Safety Limitations
* **Intended:** Rapid screening of dairy feed and silage batches at shared cooperative nodes.
* **Prohibited:** Universal laboratory replacement. Not validated on unground physical samples without calibration transfer.
