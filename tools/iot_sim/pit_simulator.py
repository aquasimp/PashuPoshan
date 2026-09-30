import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from apps.api.app.database import SessionLocal
from apps.api.app.models.farm import StorageUnit
from apps.api.app.models.sample import SensorReading
from apps.api.app.rules.silage_engine import SilageRiskEngine


def generate_pit_telemetry(profile: str = "healthy", n_points: int = 24):
    """
    Generates time-series sensor readings across three silage physiological profiles:
    - 'healthy': Stable low pH, ambient-following core temperature
    - 'air_ingress_heating': Temperature differential rising above +10C
    - 'fermentation_failure': Elevated pH > 5.0 with wet secondary fermentation
    """
    now = datetime.utcnow()
    readings = []
    engine = SilageRiskEngine()

    base_ambient = 25.0

    for i in range(n_points):
        timestamp = now - timedelta(hours=(n_points - 1 - i))
        # Daily diurnal ambient temperature oscillation (20C night to 30C afternoon)
        ambient_temp = base_ambient + 5.0 * random.uniform(-1.0, 1.0)

        if profile == "healthy":
            internal_temp = ambient_temp + random.uniform(-0.8, 1.5)
            ph = round(random.uniform(3.85, 4.10), 2)
            o2_pct = round(random.uniform(0.1, 0.4), 2)
            co2_pct = round(random.uniform(12.0, 18.0), 1)
        elif profile == "air_ingress_heating":
            # Progressively heating up due to aerobic exposure
            heat_progress = float(i) / float(n_points)
            temp_delta = 2.0 + (heat_progress * 14.0)  # delta reaches up to 16C!
            internal_temp = ambient_temp + temp_delta + random.uniform(-0.5, 0.5)
            ph = round(4.0 + (heat_progress * 0.9), 2)
            o2_pct = round(1.0 + (heat_progress * 4.5), 2)
            co2_pct = round(15.0 - (heat_progress * 8.0), 1)
        else:  # fermentation_failure
            internal_temp = ambient_temp + random.uniform(2.0, 4.5)
            ph = round(random.uniform(5.20, 5.75), 2)
            o2_pct = round(random.uniform(0.5, 1.5), 2)
            co2_pct = round(random.uniform(6.0, 10.0), 1)

        eval_res = engine.evaluate(
            ph=ph,
            internal_temp=internal_temp,
            ambient_temp=ambient_temp,
            dry_matter_pct=34.0,
            crop_type="maize_silage"
        )

        readings.append({
            "timestamp": timestamp.isoformat(),
            "internal_temperature": round(float(internal_temp), 1),
            "ambient_temperature": round(float(ambient_temp), 1),
            "temp_differential": round(float(internal_temp - ambient_temp), 1),
            "ph": ph,
            "o2_percent": o2_pct,
            "co2_percent": co2_pct,
            "data_provenance": "simulated_sensor",
            "heating_risk": eval_res["heating_risk"],
            "air_ingress_risk": eval_res["air_ingress_risk"],
            "spoilage_risk": eval_res["spoilage_risk"],
        })

    return readings


def seed_simulated_readings_to_db():
    db = SessionLocal()
    try:
        storage_units = db.query(StorageUnit).all()
        if not storage_units:
            print("[WARN] No storage units found in DB to attach readings to. Run seed_data.py first.")
            return

        for unit in storage_units:
            # Map unit to a profile
            if "Corn" in unit.name:
                prof = "healthy"
            elif "Central" in unit.name:
                prof = "air_ingress_heating"
            else:
                prof = "fermentation_failure"

            telemetry = generate_pit_telemetry(profile=prof, n_points=36)
            for r in telemetry:
                reading = SensorReading(
                    storage_unit_id=unit.id,
                    ph=r["ph"],
                    internal_temperature=r["internal_temperature"],
                    ambient_temperature=r["ambient_temperature"],
                    ambient_humidity=65.0,
                    o2_percent=r["o2_percent"],
                    co2_percent=r["co2_percent"],
                    data_provenance="simulated_sensor",
                    recorded_at=datetime.fromisoformat(r["timestamp"]),
                )
                db.add(reading)
            db.commit()
            print(f"[INFO] Populated 36 telemetry readings for '{unit.name}' (profile: {prof}).")

    finally:
        db.close()


if __name__ == "__main__":
    seed_simulated_readings_to_db()
