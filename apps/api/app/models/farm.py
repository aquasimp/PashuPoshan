import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from apps.api.app.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    village = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    storage_units = relationship("StorageUnit", back_populates="farm", cascade="all, delete-orphan")
    samples = relationship("Sample", back_populates="farm")


class StorageUnit(Base):
    __tablename__ = "storage_units"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    name = Column(String, nullable=False)
    unit_type = Column(String, nullable=False)  # pit, bunker, bag, tower, stack
    capacity_tons = Column(Float, nullable=True)
    sealing_date = Column(DateTime, nullable=True)
    opening_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="storage_units")
    samples = relationship("Sample", back_populates="storage_unit")
    sensor_readings = relationship("SensorReading", back_populates="storage_unit")
