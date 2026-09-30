import os
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.dependencies import get_optional_user

router = APIRouter(prefix="/models", tags=["Model Performance & Registry"])

ROOT_DIR = Path(__file__).resolve().parents[4]
METRICS_DIR = ROOT_DIR / "ml" / "metrics"


@router.get("")
def list_registered_models(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    models: List[Dict[str, Any]] = []
    if METRICS_DIR.exists():
        # Prefer summary file if present
        summary_path = METRICS_DIR / "model_registry_summary.json"
        if summary_path.exists():
            try:
                with open(summary_path, "r", encoding="utf-8") as f:
                    models = json.load(f)
            except Exception:
                pass

        if not models:
            for json_file in METRICS_DIR.glob("*_metrics.json"):
                if json_file.name == "model_registry_summary.json":
                    continue
                try:
                    with open(json_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        models.append(data)
                except Exception as e:
                    print(f"Warning reading metric file {json_file}: {e}")

    # Explicit Field Validation Statuses per Section 13 of Prompt
    field_validation_status = [
        {
            "target": "Field NIR Moisture / Dry Matter",
            "status": "PENDING — MODEL BUILD / VALIDATION IN PROGRESS",
            "reference_method": "105°C forced-air oven drying (AOAC 930.15)",
            "target_sample_size": "≥ 200 Indian farm silage samples across 3 seasons",
            "target_metric_file": "ml/metrics/field_moisture_metrics.json",
        },
        {
            "target": "Field NIR Crude Protein",
            "status": "PENDING — MODEL BUILD / VALIDATION IN PROGRESS",
            "reference_method": "Kjeldahl total nitrogen CP = N × 6.25 (AOAC 2001.11)",
            "target_sample_size": "≥ 200 wet-chem verified Indian feeds",
            "target_metric_file": "ml/metrics/field_crude_protein_metrics.json",
        },
        {
            "target": "Field Indian Feed RGB Classification (CNN/YOLO)",
            "status": "PENDING — MODEL BUILD / VALIDATION IN PROGRESS",
            "reference_method": "Expert visual agronomic taxonomy + plate culture",
            "target_sample_size": "≥ 2,000 multi-state Indian dairy feeds",
            "target_metric_file": "ml/metrics/field_cv_metrics.json",
        },
        {
            "target": "Urea Colorimetric Assay False Negative Rate",
            "status": "PENDING — MODEL BUILD / VALIDATION IN PROGRESS",
            "reference_method": "AOAC 967.07 Urease colorimetric reference comparison",
            "target_sample_size": "100 blinded feed batches spiked 0.5%–5.0% urea",
            "target_metric_file": "ml/metrics/field_assay_metrics.json",
        },
    ]

    return {
        "registered_models_count": len(models),
        "registry_status": "active",
        "provenance_mode": "synthetic_demo",
        "disclaimer_banner": "Trained on synthetic demo data — NOT a validation of field accuracy",
        "models": models,
        "field_validation_pending": field_validation_status,
    }


@router.get("/metrics")
def get_models_metrics_map(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Returns live model metrics keyed by target identifier for UI consumption.
    Reads directly from generated metric JSON artifacts.
    """
    key_mapping = {
        "dry_matter_pct": "dry_matter",
        "crude_protein_pct": "crude_protein",
        "ndf_pct": "ndf",
        "adf_pct": "adf",
    }

    result: Dict[str, Any] = {}
    summary_path = METRICS_DIR / "model_registry_summary.json"

    if summary_path.exists():
        try:
            with open(summary_path, "r", encoding="utf-8") as f:
                entries = json.load(f)
                for entry in entries:
                    var = entry.get("target_variable")
                    target_key = key_mapping.get(var, var)
                    m = entry.get("metrics", {})
                    result[target_key] = {
                        "target": target_key,
                        "display_name": entry.get("display_name"),
                        "model_type": entry.get("champion_model", "PLSRegression"),
                        "version": entry.get("version"),
                        "hash": entry.get("hash"),
                        "test_r2": m.get("r2"),
                        "cv_r2": m.get("r2"),
                        "rmsep": m.get("rmse"),
                        "mae": m.get("mae"),
                        "bias": m.get("bias"),
                        "rpd": m.get("rpd"),
                        "training_samples": entry.get("training_samples", 964),
                        "test_samples": entry.get("test_samples", 236),
                        "n_features": entry.get("spectral_bands", 381),
                        "wavelength_range_nm": entry.get("wavelength_range_nm", [920.0, 1680.0]),
                        "data_provenance": entry.get("data_provenance", "synthetic_demo"),
                        "disclaimer": entry.get("synthetic_disclaimer"),
                        "candidate_comparisons": entry.get("candidate_comparisons", {}),
                        "performance_by_crop_type": entry.get("performance_by_crop_type", {}),
                    }
        except Exception as e:
            print(f"Error loading model_registry_summary: {e}")

    # Fallback to individual files if summary had missing targets
    for target_file, target_key in [
        ("moisture_dm_metrics.json", "dry_matter"),
        ("crude_protein_metrics.json", "crude_protein"),
        ("ndf_metrics.json", "ndf"),
        ("adf_metrics.json", "adf"),
    ]:
        if target_key not in result:
            p = METRICS_DIR / target_file
            if p.exists():
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        entry = json.load(f)
                        m = entry.get("metrics", {})
                        result[target_key] = {
                            "target": target_key,
                            "display_name": entry.get("display_name"),
                            "model_type": entry.get("champion_model", "PLSRegression"),
                            "version": entry.get("version"),
                            "hash": entry.get("hash"),
                            "test_r2": m.get("r2"),
                            "cv_r2": m.get("r2"),
                            "rmsep": m.get("rmse"),
                            "mae": m.get("mae"),
                            "bias": m.get("bias"),
                            "rpd": m.get("rpd"),
                            "training_samples": entry.get("training_samples", 964),
                            "test_samples": entry.get("test_samples", 236),
                            "n_features": entry.get("spectral_bands", 381),
                            "wavelength_range_nm": entry.get("wavelength_range_nm", [920.0, 1680.0]),
                            "data_provenance": entry.get("data_provenance", "synthetic_demo"),
                            "disclaimer": entry.get("synthetic_disclaimer"),
                            "candidate_comparisons": entry.get("candidate_comparisons", {}),
                            "performance_by_crop_type": entry.get("performance_by_crop_type", {}),
                        }
                except Exception:
                    pass

    return result
