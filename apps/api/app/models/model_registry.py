import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from apps.api.app.database import Base


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    model_name = Column(String, nullable=False, index=True)
    version = Column(String, nullable=False)
    modality = Column(String, nullable=False)  # nir, rgb, sensors, assay, rules
    target_variable = Column(String, nullable=False)
    data_provenance = Column(String, nullable=False)  # synthetic_demo, real_field, public_dataset
    weights_path = Column(String, nullable=True)
    metrics_path = Column(String, nullable=True)
    hyperparameters = Column(JSON, nullable=True)
    status = Column(String, default="active")  # active, archived, candidate
    trained_at = Column(DateTime, default=datetime.utcnow)
