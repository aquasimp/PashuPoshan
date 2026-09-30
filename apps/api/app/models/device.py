import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from apps.api.app.database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_type = Column(String, nullable=False)  # nir_spectrometer, ph_probe, temp_probe, gas_sensor, assay_reader
    serial_number = Column(String, unique=True, nullable=False, index=True)
    model_name = Column(String, nullable=False)
    firmware_version = Column(String, nullable=True)
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    spectra = relationship("Spectrum", back_populates="device")
    sensor_readings = relationship("SensorReading", back_populates="device")
