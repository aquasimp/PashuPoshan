from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from apps.api.app.database import Base


class Traceability(Base):
    __tablename__ = "traceability"

    sample_id = Column(String, ForeignKey("samples.id"), primary_key=True)
    signature_hash = Column(String, nullable=False)
    signed_token = Column(String, nullable=False)
    verification_status = Column(String, default="Verified")  # Verified, Unverified, Tampered
    signed_at = Column(DateTime, default=datetime.utcnow)

    sample = relationship("Sample", back_populates="traceability")
