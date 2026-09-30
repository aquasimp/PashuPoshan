import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from apps.api.app.database import Base


class Sample(Base):
    __tablename__ = "samples"

    id = Column(String, primary_key=True)  # Format: FS-YYYYMMDD-XXXX
    client_id = Column(String, unique=True, nullable=True, index=True)  # Client offline UUID for idempotency
    farm_id = Column(String, ForeignKey("farms.id"), nullable=True)
    storage_unit_id = Column(String, ForeignKey("storage_units.id"), nullable=True)
    sample_type = Column(String, nullable=False)  # feed, silage, fodder
    crop_or_feed_name = Column(String, nullable=False)
    physical_form = Column(String, nullable=True)  # pellet, mash, chopped_silage, bale, grain
    collected_at = Column(DateTime, default=datetime.utcnow)
    collected_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    sync_status = Column(String, default="SAVED_ON_DEVICE")  # SAVED_ON_DEVICE, QUEUED, SYNCING, SYNCED, FAILED
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farm = relationship("Farm", back_populates="samples")
    storage_unit = relationship("StorageUnit", back_populates="samples")
    collected_by = relationship("User", back_populates="samples")

    images = relationship("SampleImage", back_populates="sample", cascade="all, delete-orphan")
    spectra = relationship("Spectrum", back_populates="sample", cascade="all, delete-orphan")
    sensor_readings = relationship("SensorReading", back_populates="sample", cascade="all, delete-orphan")
    assays = relationship("Assay", back_populates="sample", cascade="all, delete-orphan")
    laboratory_results = relationship("LaboratoryResult", back_populates="sample", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="sample", cascade="all, delete-orphan")
    traceability = relationship("Traceability", back_populates="sample", uselist=False, cascade="all, delete-orphan")


class SampleImage(Base):
    __tablename__ = "sample_images"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"), nullable=False)
    file_path = Column(String, nullable=False)
    thumbnail_path = Column(String, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    blur_score = Column(Float, nullable=True)
    glare_score = Column(Float, nullable=True)
    exposure_score = Column(Float, nullable=True)
    is_acceptable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sample = relationship("Sample", back_populates="images")


class Spectrum(Base):
    __tablename__ = "spectra"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"), nullable=False)
    device_id = Column(String, ForeignKey("devices.id"), nullable=True)
    sample_prep = Column(String, default="fresh")  # fresh, dried, ground
    particle_size_protocol = Column(String, nullable=True)
    replicate_number = Column(Integer, default=1)
    wavelengths = Column(JSON, nullable=False)  # List of wavelength values (nm)
    absorbance_values = Column(JSON, nullable=False)  # List of absorbance values
    dark_ref_taken = Column(Boolean, default=True)
    white_ref_taken = Column(Boolean, default=True)
    acquired_at = Column(DateTime, default=datetime.utcnow)

    sample = relationship("Sample", back_populates="spectra")
    device = relationship("Device", back_populates="spectra")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"), nullable=True)
    storage_unit_id = Column(String, ForeignKey("storage_units.id"), nullable=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=True)
    ph = Column(Float, nullable=True)
    internal_temperature = Column(Float, nullable=True)
    ambient_temperature = Column(Float, nullable=True)
    ambient_humidity = Column(Float, nullable=True)
    o2_percent = Column(Float, nullable=True)
    co2_percent = Column(Float, nullable=True)
    data_provenance = Column(String, default="simulated_sensor")
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    sample = relationship("Sample", back_populates="sensor_readings")
    storage_unit = relationship("StorageUnit", back_populates="sensor_readings")
    device = relationship("Device", back_populates="sensor_readings")


class Assay(Base):
    __tablename__ = "assays"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"), nullable=False)
    assay_type = Column(String, nullable=False)  # urea_strip, ph_strip, aflatoxin_lateral_flow
    image_path = Column(String, nullable=True)
    reference_card_detected = Column(Boolean, default=False)
    delta_e_values = Column(JSON, nullable=True)
    qualitative_result = Column(String, nullable=True)
    data_provenance = Column(String, default="real_field")
    created_at = Column(DateTime, default=datetime.utcnow)

    sample = relationship("Sample", back_populates="assays")


class LaboratoryResult(Base):
    __tablename__ = "laboratory_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"), nullable=False)
    lab_name = Column(String, nullable=False)
    test_method = Column(String, nullable=False)  # Kjeldahl, Soxhlet, VanSoest, HPLC
    crude_protein = Column(Float, nullable=True)
    dry_matter = Column(Float, nullable=True)
    ndf = Column(Float, nullable=True)
    adf = Column(Float, nullable=True)
    aflatoxin_b1_ppb = Column(Float, nullable=True)
    certified_at = Column(DateTime, default=datetime.utcnow)

    sample = relationship("Sample", back_populates="laboratory_results")
