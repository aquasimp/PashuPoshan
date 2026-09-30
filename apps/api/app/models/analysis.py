import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from apps.api.app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"), nullable=False)
    overall_risk = Column(String, nullable=False)  # GOOD, ATTENTION, HIGH_RISK
    action_decision = Column(String, nullable=False)  # FEED, BLEND, RE_TEST, DISCARD
    modalities_used = Column(JSON, nullable=False)  # ["rgb", "nir", "sensors"]
    modalities_missing = Column(JSON, nullable=False)  # ["assay"]
    input_completeness_score = Column(Float, default=1.0)
    triggered_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    sample = relationship("Sample", back_populates="analyses")
    triggered_by = relationship("User")
    predictions = relationship("Prediction", back_populates="analysis", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="analysis", cascade="all, delete-orphan")
    advisory = relationship("Advisory", back_populates="analysis", uselist=False, cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=False)
    target_name = Column(String, nullable=False)  # dry_matter, crude_protein, ndf, adf, ph, mould_risk
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)  # %, % DM, pH
    evidence_tag = Column(String, nullable=False)  # DETECTED, PREDICTED, ESTIMATED, USER-ENTERED, SENSOR-MEASURED, DEMO
    confidence = Column(Float, nullable=True)
    uncertainty = Column(JSON, nullable=True)  # {"type": "interval", "lower": 60.1, "upper": 64.7, "level": 0.95}
    model_version = Column(String, nullable=True)
    data_provenance = Column(String, nullable=False)  # real_field, public_dataset, synthetic_demo, simulated_sensor
    applicability_domain = Column(String, default="NOT_APPLICABLE")  # IN_DOMAIN, CAUTION, INVALID, NOT_APPLICABLE
    modalities_used = Column(JSON, nullable=True)
    modalities_missing = Column(JSON, nullable=True)

    analysis = relationship("Analysis", back_populates="predictions")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=False)
    modality = Column(String, nullable=False)  # rgb, nir, sensors, assay, rules
    evidence_tag = Column(String, nullable=False)
    key = Column(String, nullable=False)
    value_summary = Column(String, nullable=False)
    details_json = Column(JSON, nullable=True)

    analysis = relationship("Analysis", back_populates="evidence")


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=False)
    headline_key = Column(String, nullable=False)
    issue_key = Column(String, nullable=False)
    action_key = Column(String, nullable=False)
    storage_key = Column(String, nullable=False)
    risk_key = Column(String, nullable=False)
    next_step_key = Column(String, nullable=False)
    action_decision = Column(String, nullable=False)  # FEED, BLEND, RE_TEST, DISCARD
    vet_override_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    vet_annotation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="advisory")
    vet_override_by = relationship("User")
    recommendations = relationship("Recommendation", back_populates="advisory", cascade="all, delete-orphan")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    advisory_id = Column(String, ForeignKey("advisories.id"), nullable=False)
    step_order = Column(Integer, default=1)
    recommendation_key = Column(String, nullable=False)
    severity = Column(String, default="info")  # info, warning, critical

    advisory = relationship("Advisory", back_populates="recommendations")
