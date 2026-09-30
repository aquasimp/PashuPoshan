import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Ensure repo root is on sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from apps.api.app.database import SessionLocal, engine, Base
from apps.api.app.models.user import Role, User
from apps.api.app.models.farm import Farm, StorageUnit
from apps.api.app.models.device import Device
from apps.api.app.security import get_password_hash


def seed():
    print("[INFO] Seeding PashuPoshan database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Roles
        role_definitions = [
            ("farmer", "Dairy Farmer - Operates mobile PWA, tests feed/silage, receives vernacular advisories"),
            ("cooperative_manager", "Cooperative / BMC Manager - Oversees shared node, multi-farmer batches, storage alerts"),
            ("veterinarian", "Veterinarian / Nutritionist - Inspects spectral evidence, annotates or overrides recommendations"),
            ("admin", "Platform Administrator - Oversees system health, model registry, audit logs, and data collection"),
        ]

        roles_by_name = {}
        for name, desc in role_definitions:
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=desc)
                db.add(role)
                db.commit()
                db.refresh(role)
                print(f"  + Created Role: {name}")
            roles_by_name[name] = role

        # 2. Seed Users
        user_definitions = [
            ("farmer@pashuposhan.in", "Farmer@123", "Ramesh Patel (रमेश पटेल)", "9876543210", "farmer"),
            ("manager@pashuposhan.in", "Manager@123", "Sunil Sharma (सुनील शर्मा)", "9876543211", "cooperative_manager"),
            ("vet@pashuposhan.in", "Vet@123", "Dr. Ananya Rao (डॉ. अनन्या राव)", "9876543212", "veterinarian"),
            ("admin@pashuposhan.in", "Admin@123", "PashuPoshan Admin", "9876543213", "admin"),
            # Backward-compatible aliases for existing automated test suites
            ("farmer@feedshield.in", "Farmer@123", "Ramesh Patel (रमेश पटेल)", "9876543210", "farmer"),
            ("manager@feedshield.in", "Manager@123", "Sunil Sharma (सुनील शर्मा)", "9876543211", "cooperative_manager"),
            ("vet@feedshield.in", "Vet@123", "Dr. Ananya Rao (डॉ. अनन्या राव)", "9876543212", "veterinarian"),
            ("admin@feedshield.in", "Admin@123", "FeedShield Admin", "9876543213", "admin"),
        ]

        users_by_email = {}
        for email, password, full_name, phone, role_name in user_definitions:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    hashed_password=get_password_hash(password),
                    full_name=full_name,
                    phone=phone,
                    role_id=roles_by_name[role_name].id,
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"  + Created Demo User: {email} ({role_name})")
            users_by_email[email] = user

        # 3. Seed Farms
        farmer_user = users_by_email["farmer@feedshield.in"]
        manager_user = users_by_email["manager@feedshield.in"]

        farm = db.query(Farm).filter(Farm.name == "Kailash Dairy Farm [DEMO]").first()
        if not farm:
            farm = Farm(
                name="Kailash Dairy Farm [DEMO]",
                owner_id=farmer_user.id,
                village="Anand Rural",
                district="Anand",
                state="Gujarat",
                latitude=22.5645,
                longitude=72.9289
            )
            db.add(farm)
            db.commit()
            db.refresh(farm)
            print(f"  + Created Demo Farm: {farm.name}")

        coop_farm = db.query(Farm).filter(Farm.name == "Surabhi Cooperative BMC Unit [DEMO]").first()
        if not coop_farm:
            coop_farm = Farm(
                name="Surabhi Cooperative BMC Unit [DEMO]",
                owner_id=manager_user.id,
                village="Taraori",
                district="Karnal",
                state="Haryana",
                latitude=29.8000,
                longitude=76.9200
            )
            db.add(coop_farm)
            db.commit()
            db.refresh(coop_farm)
            print(f"  + Created Demo Cooperative Center: {coop_farm.name}")

        # 4. Seed Storage Units
        storage_units = [
            (farm.id, "Bunker Silo A - Corn [DEMO]", "bunker", 60.0, datetime.utcnow() - timedelta(days=60)),
            (farm.id, "Pit Silo B - Sorghum [DEMO]", "pit", 35.0, datetime.utcnow() - timedelta(days=35)),
            (coop_farm.id, "Central Silage Bunker 1 [DEMO]", "bunker", 250.0, datetime.utcnow() - timedelta(days=90)),
        ]

        for farm_id, name, unit_type, cap, seal_dt in storage_units:
            unit = db.query(StorageUnit).filter(StorageUnit.name == name).first()
            if not unit:
                unit = StorageUnit(
                    farm_id=farm_id,
                    name=name,
                    unit_type=unit_type,
                    capacity_tons=cap,
                    sealing_date=seal_dt,
                    opening_date=seal_dt + timedelta(days=40)
                )
                db.add(unit)
                db.commit()
                print(f"  + Created Demo Storage Unit: {name}")

        # 5. Seed Devices
        devices = [
            ("nir_spectrometer", "NIR-SIM-9001", "PashuPoshan NIR Pro (Simulated)", "v2.4", True),
            ("ph_probe", "PROBE-SIM-4001", "Digital pH/Temp AgroProbe (Simulated)", "v1.1", True),
            ("assay_reader", "ASSAY-SIM-2001", "PashuPoshan Colorimetric Card Reader", "v1.0", True),
        ]

        for dev_type, serial, model, fw, is_sim in devices:
            dev = db.query(Device).filter(Device.serial_number == serial).first()
            if not dev:
                dev = Device(
                    device_type=dev_type,
                    serial_number=serial,
                    model_name=model,
                    firmware_version=fw,
                    is_simulated=is_sim
                )
                db.add(dev)
                db.commit()
                print(f"  + Created Device: {model} ({serial})")

        print("[SUCCESS] PashuPoshan database seed completed successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
