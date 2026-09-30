# Model Card: nir-crude_protein-plsr-v1.0

> **Scientific Honesty Banner:**  
> **Trained on synthetic demo data — NOT a validation of field accuracy**

---

## 1. Overview
* **Model Name:** NIR Crude Protein (% DM) Chemometric Model
* **Version:** `nir-crude_protein-plsr-v1.0`
* **Model Hash:** `eca77604108b29e8`
* **Target Constituent:** Crude Protein (% DM)
* **Modality:** Diffuse Reflectance NIR Spectroscopy (920–1680 nm)
* **Architecture:** Standard Normal Variate (SNV) + Partial Least Squares Regression (PLSR, 8 Latent Variables)
* **Data Provenance:** `synthetic_demo`

---

## 2. Quantitative Performance Metrics
Tested on independent held-out partition (236 samples, zero farm overlap):

| Metric | Champion (PLSR) | SVR | Random Forest |
|---|---|---|---|
| **RMSEP** | **1.465** | 0.087 | 1.032 |
| **MAE** | **1.084** | 0.069 | 0.765 |
| **R²** | **0.907** | 0.9997 | 0.9538 |
| **RPD** | **3.278** | 55.225 | 4.654 |
| **Bias** | 0.0676 | 0.0031 | 0.1047 |

---

## 3. Performance by Crop Type
| Crop Type | RMSEP | MAE | R² | RPD |
|---|---|---|---|---|
| **compound_feed** | 2.128 | 1.826 | 0.534 | 1.465 |
| **maize_silage** | 0.838 | 0.681 | 0.4486 | 1.347 |
| **green_fodder** | 2.498 | 2.095 | -0.0014 | 0.999 |
| **sorghum_silage** | 0.929 | 0.711 | 0.4052 | 1.297 |

---

## 4. Applicability Domain Boundaries
* Evaluated via Hotelling $T^2$ ($T^2_{99} = 14.46$) and Q-residual ($Q_{99} = 0.02510$).
* Samples exceeding critical thresholds return `INVALID` with `value = null`.

---

## 5. Intended Use & Safety Limitations
* **Intended:** Rapid screening of dairy feed and silage batches at shared cooperative nodes.
* **Prohibited:** Universal laboratory replacement. Not validated on unground physical samples without calibration transfer.
