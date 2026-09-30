import os
import sys
import json
import hashlib
from datetime import datetime
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import joblib
import numpy as np
import pandas as pd
from sklearn.cross_decomposition import PLSRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline

from ml.synthetic.generator import generate_synthetic_dataset, WAVELENGTHS
from ml.preprocessing import StandardNormalVariate, SavitzkyGolayTransformer, remove_bad_bands
from ml.applicability_domain import ApplicabilityDomainEvaluator

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data" / "synthetic_demo"
MODELS_DIR = ROOT_DIR / "ml" / "models"
METRICS_DIR = ROOT_DIR / "ml" / "metrics"
CARDS_DIR = ROOT_DIR / "docs" / "model_cards"


def ensure_dirs():
    for d in [DATA_DIR, MODELS_DIR, METRICS_DIR, CARDS_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def calculate_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    bias = float(np.mean(y_pred - y_true))
    sd = np.std(y_true)
    rpd = float(sd / rmse) if rmse > 0 else 0.0
    return {
        "mae": round(float(mae), 3),
        "rmse": round(float(rmse), 3),
        "r2": round(float(r2), 4),
        "bias": round(bias, 4),
        "rpd": round(rpd, 3),
    }


def train_and_evaluate():
    ensure_dirs()
    print("[INFO] Starting FeedShield NIR Chemometric Training & Model Registration...")

    # Load or generate dataset
    df, spectra = generate_synthetic_dataset(n_samples=1200, seed=42)
    clean_w, clean_spectra = remove_bad_bands(WAVELENGTHS, spectra)

    # Fit Applicability Domain Evaluator on training population
    ad_evaluator = ApplicabilityDomainEvaluator(n_components=5)
    ad_evaluator.fit(clean_spectra)
    ad_path = MODELS_DIR / "applicability_domain.joblib"
    joblib.dump(ad_evaluator, ad_path)
    print(f"  + Applicability Domain filter calibrated and saved: {ad_path}")

    targets = [
        ("dry_matter_pct", "Dry Matter (% DM)", "moisture_dm"),
        ("crude_protein_pct", "Crude Protein (% DM)", "crude_protein"),
        ("ndf_pct", "Neutral Detergent Fiber (% DM)", "ndf"),
        ("adf_pct", "Acid Detergent Fiber (% DM)", "adf"),
    ]

    # Group split by farm_id to guarantee zero sample leakage between train and test partitions
    groups = df["farm_id"].values
    gkf = GroupKFold(n_splits=5)
    train_idx, test_idx = next(gkf.split(clean_spectra, df["dry_matter_pct"], groups))

    X_train, X_test = clean_spectra[train_idx], clean_spectra[test_idx]
    df_train, df_test = df.iloc[train_idx], df.iloc[test_idx]

    print(f"  + Partitioning: {len(X_train)} train samples, {len(X_test)} independent test samples.")
    # Verify strict zero leakage
    train_farms = set(df_train["farm_id"].unique())
    test_farms = set(df_test["farm_id"].unique())
    assert len(train_farms.intersection(test_farms)) == 0, "DATA LEAKAGE DETECTED: Farm exists in both train & test!"
    print("  + Zero-leakage verification passed: No farm/sample crosses partitions.")

    trained_registry = []

    for col_name, display_name, target_key in targets:
        y_train = df_train[col_name].values
        y_test = df_test[col_name].values

        # 1. Candidate 1: PLSR Baseline with SNV
        plsr_pipe = Pipeline([
            ("snv", StandardNormalVariate()),
            ("plsr", PLSRegression(n_components=8)),
        ])
        plsr_pipe.fit(X_train, y_train)
        pred_plsr = plsr_pipe.predict(X_test).flatten()
        m_plsr = calculate_metrics(y_test, pred_plsr)

        # 2. Candidate 2: SVR with Savitzky-Golay 1st Derivative
        svr_pipe = Pipeline([
            ("savgol", SavitzkyGolayTransformer(window_length=15, polyorder=2, deriv=1)),
            ("svr", SVR(C=10.0, epsilon=0.1)),
        ])
        svr_pipe.fit(X_train, y_train)
        pred_svr = svr_pipe.predict(X_test).flatten()
        m_svr = calculate_metrics(y_test, pred_svr)

        # 3. Candidate 3: Random Forest Regressor
        rf_pipe = Pipeline([
            ("snv", StandardNormalVariate()),
            ("rf", RandomForestRegressor(n_estimators=50, random_state=42, max_depth=10, n_jobs=-1)),
        ])
        rf_pipe.fit(X_train, y_train)
        pred_rf = rf_pipe.predict(X_test).flatten()
        m_rf = calculate_metrics(y_test, pred_rf)

        # Calculate error by crop type on test set for champion (PLSR)
        crop_errors = {}
        for crop in df_test["crop_type"].unique():
            c_mask = (df_test["crop_type"] == crop).values
            if np.sum(c_mask) > 0:
                crop_errors[crop] = calculate_metrics(y_test[c_mask], pred_plsr[c_mask])

        # Save Champion Model (PLSR)
        model_version = f"nir-{target_key}-plsr-v1.0"
        model_filename = f"{model_version}.joblib"
        model_path = MODELS_DIR / model_filename
        joblib.dump(plsr_pipe, model_path)

        # Compute hash
        with open(model_path, "rb") as f:
            model_hash = hashlib.sha256(f.read()).hexdigest()[:16]

        # Save Metrics JSON
        metric_data = {
            "model_name": f"NIR {display_name} Chemometric Model",
            "version": model_version,
            "target_variable": col_name,
            "display_name": display_name,
            "hash": model_hash,
            "data_provenance": "synthetic_demo",
            "synthetic_disclaimer": "Trained on synthetic demo data — NOT a validation of field accuracy",
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "spectral_bands": int(clean_spectra.shape[1]),
            "wavelength_range_nm": [float(clean_w[0]), float(clean_w[-1])],
            "champion_model": "PLSRegression",
            "metrics": m_plsr,
            "candidate_comparisons": {
                "PLSR": m_plsr,
                "SVR": m_svr,
                "RandomForest": m_rf,
            },
            "performance_by_crop_type": crop_errors,
            "trained_at": datetime.utcnow().isoformat(),
        }

        metric_path = METRICS_DIR / f"{target_key}_metrics.json"
        with open(metric_path, "w", encoding="utf-8") as f:
            json.dump(metric_data, f, indent=2)

        # Format crop error markdown table manually
        crop_rows = ["| Crop Type | RMSEP | MAE | R² | RPD |", "|---|---|---|---|---|"]
        for crop, c_metrics in crop_errors.items():
            crop_rows.append(f"| **{crop}** | {c_metrics['rmse']} | {c_metrics['mae']} | {c_metrics['r2']} | {c_metrics['rpd']} |")
        crop_table_md = "\n".join(crop_rows)

        # Generate Model Card
        card_content = f"""# Model Card: {model_version}

> **Scientific Honesty Banner:**  
> **Trained on synthetic demo data — NOT a validation of field accuracy**

---

## 1. Overview
* **Model Name:** {metric_data['model_name']}
* **Version:** `{model_version}`
* **Model Hash:** `{model_hash}`
* **Target Constituent:** {display_name}
* **Modality:** Diffuse Reflectance NIR Spectroscopy ({metric_data['wavelength_range_nm'][0]:.0f}–{metric_data['wavelength_range_nm'][1]:.0f} nm)
* **Architecture:** Standard Normal Variate (SNV) + Partial Least Squares Regression (PLSR, 8 Latent Variables)
* **Data Provenance:** `{metric_data['data_provenance']}`

---

## 2. Quantitative Performance Metrics
Tested on independent held-out partition ({len(X_test)} samples, zero farm overlap):

| Metric | Champion (PLSR) | SVR | Random Forest |
|---|---|---|---|
| **RMSEP** | **{m_plsr['rmse']}** | {m_svr['rmse']} | {m_rf['rmse']} |
| **MAE** | **{m_plsr['mae']}** | {m_svr['mae']} | {m_rf['mae']} |
| **R²** | **{m_plsr['r2']}** | {m_svr['r2']} | {m_rf['r2']} |
| **RPD** | **{m_plsr['rpd']}** | {m_svr['rpd']} | {m_rf['rpd']} |
| **Bias** | {m_plsr['bias']} | {m_svr['bias']} | {m_rf['bias']} |

---

## 3. Performance by Crop Type
{crop_table_md}

---

## 4. Applicability Domain Boundaries
* Evaluated via Hotelling $T^2$ ($T^2_{{99}} = {ad_evaluator.t2_99_:.2f}$) and Q-residual ($Q_{{99}} = {ad_evaluator.q_99_:.5f}$).
* Samples exceeding critical thresholds return `INVALID` with `value = null`.

---

## 5. Intended Use & Safety Limitations
* **Intended:** Rapid screening of dairy feed and silage batches at shared cooperative nodes.
* **Prohibited:** Universal laboratory replacement. Not validated on unground physical samples without calibration transfer.
"""
        card_path = CARDS_DIR / f"{model_version}.md"
        with open(card_path, "w", encoding="utf-8") as f:
            f.write(card_content)

        print(f"  + Trained {display_name} -> RMSE: {m_plsr['rmse']}, R2: {m_plsr['r2']}, RPD: {m_plsr['rpd']}")
        trained_registry.append(metric_data)

    # Save summary index of registered models
    with open(METRICS_DIR / "model_registry_summary.json", "w", encoding="utf-8") as f:
        json.dump(trained_registry, f, indent=2)

    print(f"[SUCCESS] All 4 nutritional chemometric models trained and cards saved to {CARDS_DIR}.")


if __name__ == "__main__":
    train_and_evaluate()
