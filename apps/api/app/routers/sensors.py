from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.models.farm import StorageUnit
from apps.api.app.models.sample import SensorReading
from apps.api.app.dependencies import get_current_user
from ml.infer import pipeline

router = APIRouter(tags=["Sensors & Storage"])


class IngestSensorReadingRequest(BaseModel):
    storage_unit_id: str
    sample_id: Optional[str] = None
    device_id: Optional[str] = None
    ph: Optional[float] = None
    internal_temperature: Optional[float] = None
    ambient_temperature: Optional[float] = None
    ambient_humidity: Optional[float] = None
    o2_percent: Optional[float] = None
    co2_percent: Optional[float] = None
    crop_type: str = "maize_silage"


@router.get("/storage-units")
def list_storage_units(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    units = db.query(StorageUnit).all()
    result = []
    for u in units:
        latest = (
            db.query(SensorReading)
            .filter(SensorReading.storage_unit_id == u.id)
            .order_by(SensorReading.recorded_at.desc())
            .first()
        )
        result.append({
            "id": u.id,
            "name": u.name,
            "farm_name": u.farm.name if u.farm else "Unknown Farm",
            "unit_type": u.unit_type,
            "capacity_tons": u.capacity_tons,
            "latest_reading": {
                "ph": latest.ph if latest else None,
                "internal_temperature": latest.internal_temperature if latest else None,
                "ambient_temperature": latest.ambient_temperature if latest else None,
                "recorded_at": latest.recorded_at.isoformat() if latest else None,
            } if latest else None,
        })
    return result


@router.get("/storage-units/{unit_id}/readings")
def get_storage_unit_readings(
    unit_id: str,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    unit = db.query(StorageUnit).filter(StorageUnit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Storage unit not found")

    readings = (
        db.query(SensorReading)
        .filter(SensorReading.storage_unit_id == unit.id)
        .order_by(SensorReading.recorded_at.asc())
        .limit(limit)
        .all()
    )

    series = []
    for r in readings:
        temp_diff = (
            r.internal_temperature - r.ambient_temperature
            if r.internal_temperature is not None and r.ambient_temperature is not None
            else None
        )
        series.append({
            "id": r.id,
            "timestamp": r.recorded_at.isoformat(),
            "ph": r.ph,
            "internal_temperature": r.internal_temperature,
            "ambient_temperature": r.ambient_temperature,
            "temp_differential": round(temp_diff, 1) if temp_diff is not None else None,
            "o2_percent": r.o2_percent,
            "co2_percent": r.co2_percent,
            "data_provenance": r.data_provenance,
        })

    return {"unit_id": unit.id, "unit_name": unit.name, "readings_count": len(series), "readings": series}


@router.post("/sensors/readings", status_code=status.HTTP_201_CREATED)
def ingest_reading(
    request: IngestSensorReadingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    unit = db.query(StorageUnit).filter(StorageUnit.id == request.storage_unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Storage unit not found")

    reading = SensorReading(
        storage_unit_id=unit.id,
        sample_id=request.sample_id,
        device_id=request.device_id,
        ph=request.ph,
        internal_temperature=request.internal_temperature,
        ambient_temperature=request.ambient_temperature,
        ambient_humidity=request.ambient_humidity,
        o2_percent=request.o2_percent,
        co2_percent=request.co2_percent,
        data_provenance="simulated_sensor",
        recorded_at=datetime.utcnow(),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # Evaluate silage risk on the incoming reading
    eval_res = pipeline.silage_engine.evaluate(
        ph=request.ph,
        internal_temp=request.internal_temperature,
        ambient_temp=request.ambient_temperature,
        crop_type=request.crop_type,
    )

    alert = None
    if eval_res["heating_risk"] in ["high", "moderate"]:
        diff = request.internal_temperature - request.ambient_temperature
        alert = {
            "severity": "CRITICAL" if eval_res["heating_risk"] == "high" else "WARNING",
            "message": f"Storage Unit '{unit.name}' heating detected: core temp is {diff:.1f}°C above ambient.",
            "factors": eval_res["contributing_factors"],
        }

    return {"reading_id": reading.id, "status": "recorded", "alert": alert}
