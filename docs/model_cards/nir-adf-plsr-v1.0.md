# Model Card: nir-adf-plsr-v1.0

> **Scientific Honesty Banner:**  
> **Trained on synthetic demo data — NOT a validation of field accuracy**

---

## 1. Overview
* **Model Name:** NIR Acid Detergent Fiber (% DM) Chemometric Model
* **Version:** `nir-adf-plsr-v1.0`
* **Model Hash:** `b2bd2d00050af57a`
* **Target Constituent:** Acid Detergent Fiber (% DM)
* **Modality:** Diffuse Reflectance NIR Spectroscopy (920–1680 nm)
* **Architecture:** Standard Normal Variate (SNV) + Partial Least Squares Regression (PLSR, 8 Latent Variables)
* **Data Provenance:** `synthetic_demo`

---

## 2. Quantitative Performance Metrics
Tested on independent held-out partition (236 samples, zero farm overlap):

| Metric | Champion (PLSR) | SVR | Random Forest |
|---|---|---|---|
| **RMSEP** | **3.068** | 0.354 | 2.205 |
| **MAE** | **2.357** | 0.255 | 1.719 |
| **R²** | **0.7984** | 0.9973 | 0.8959 |
| **RPD** | **2.227** | 19.288 | 3.099 |
| **Bias** | 0.0747 | -0.0081 | 0.1197 |

---

## 3. Performance by Crop Type
| Crop Type | RMSEP | MAE | R² | RPD |
|---|---|---|---|---|
| **compound_feed** | 4.033 | 3.121 | -0.7944 | 0.747 |
| **maize_silage** | 2.479 | 1.983 | 0.7318 | 1.931 |
| **green_fodder** | 4.437 | 3.996 | -0.6191 | 0.786 |
| **sorghum_silage** | 2.224 | 1.697 | 0.7244 | 1.905 |

---

## 4. Applicability Domain Boundaries
* Evaluated via Hotelling $T^2$ ($T^2_{99} = 14.46$) and Q-residual ($Q_{99} = 0.02510$).
* Samples exceeding critical thresholds return `INVALID` with `value = null`.

---

## 5. Intended Use & Safety Limitations
* **Intended:** Rapid screening of dairy feed and silage batches at shared cooperative nodes.
* **Prohibited:** Universal laboratory replacement. Not validated on unground physical samples without calibration transfer.
