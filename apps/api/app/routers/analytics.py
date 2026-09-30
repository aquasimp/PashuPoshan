from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.models.sample import Sample, SensorReading
from apps.api.app.models.farm import Farm, StorageUnit
from apps.api.app.models.analysis import Analysis, Prediction
from apps.api.app.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_samples = db.query(Sample).count()
    total_analyses = db.query(Analysis).count()
    total_farms = db.query(Farm).count()
    total_storage_units = db.query(StorageUnit).count()

    # Risk distributions
    good_count = db.query(Analysis).filter(Analysis.overall_risk == "GOOD").count()
    attention_count = db.query(Analysis).filter(Analysis.overall_risk == "ATTENTION").count()
    high_risk_count = db.query(Analysis).filter(Analysis.overall_risk.in_(["HIGH RISK", "HIGH_RISK"])).count()

    return {
        "total_samples": total_samples,
        "total_analyses": total_analyses,
        "total_farms": total_farms,
        "total_storage_units": total_storage_units,
        "quality_distribution": {
            "GOOD": good_count,
            "ATTENTION": attention_count,
            "HIGH_RISK": high_risk_count,
        },
        "advisory_decisions": {
            "FEED": db.query(Analysis).filter(Analysis.action_decision == "FEED").count(),
            "BLEND": db.query(Analysis).filter(Analysis.action_decision == "BLEND").count(),
            "RE_TEST": db.query(Analysis).filter(Analysis.action_decision == "RE_TEST").count(),
            "DISCARD": db.query(Analysis).filter(Analysis.action_decision == "DISCARD").count(),
        },
    }


@router.get("/trends")
def get_analytics_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Simulated 7-day trend
    now = datetime.utcnow()
    timeline = []
    for i in range(7):
        day = now - timedelta(days=6 - i)
        day_str = day.strftime("%b %d")
        timeline.append({
            "date": day_str,
            "tests_conducted": 12 + (i * 3) + (i % 2),
            "good_pct": 75 - (i % 3),
            "attention_pct": 20 + (i % 2),
            "high_risk_pct": 5 + (i % 2),
            "avg_moisture_pct": 34.2 + (i * 0.1),
            "avg_protein_pct": 8.6 + (i * 0.05),
        })

    return {
        "trend_days": 7,
        "timeline": timeline,
    }


@router.get("/alerts")
def get_active_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Retrieve storage units with active elevated temperature differential (> 5.0C)
    units = db.query(StorageUnit).all()
    active_alerts = []

    for u in units:
        latest = (
            db.query(SensorReading)
            .filter(SensorReading.storage_unit_id == u.id)
            .order_by(SensorReading.recorded_at.desc())
            .first()
        )
        if latest and latest.internal_temperature is not None and latest.ambient_temperature is not None:
            diff = latest.internal_temperature - latest.ambient_temperature
            if diff >= 5.0:
                active_alerts.append({
                    "storage_unit_id": u.id,
                    "storage_unit_name": u.name,
                    "farm_name": u.farm.name if u.farm else "Unknown",
                    "severity": "CRITICAL" if diff >= 10.0 else "WARNING",
                    "temp_differential": round(diff, 1),
                    "internal_temp": latest.internal_temperature,
                    "ambient_temp": latest.ambient_temperature,
                    "ph": latest.ph,
                    "recorded_at": latest.recorded_at.isoformat(),
                    "recommended_action": "Inspect plastic seal for puncture; speed up face feeding rate.",
                })

    return {
        "active_alerts_count": len(active_alerts),
        "alerts": active_alerts,
    }
