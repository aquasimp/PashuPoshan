import os
import json
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.dependencies import get_current_user

router = APIRouter(prefix="/models", tags=["Model Performance & Registry"])

ROOT_DIR = Path(__file__).resolve().parents[4]
METRICS_DIR = ROOT_DIR / "ml" / "metrics"


@router.get("")
def list_registered_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    models = []
    if METRICS_DIR.exists():
        for json_file in METRICS_DIR.glob("*_metrics.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    models.append(data)
            except Exception as e:
                print(f"Warning reading metric file {json_file}: {e}")

    # Fallback to summary file if individual metrics are bundled
    summary_path = METRICS_DIR / "model_registry_summary.json"
    if not models and summary_path.exists():
        try:
            with open(summary_path, "r", encoding="utf-8") as f:
                models = json.load(f)
        except Exception:
            pass

    return {
        "registered_models_count": len(models),
        "registry_status": "active",
        "models": models,
        "disclaimer_banner": "Trained on synthetic demo data — NOT a validation of field accuracy",
    }
