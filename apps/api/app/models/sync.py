import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from apps.api.app.database import Base


class SyncQueue(Base):
    __tablename__ = "sync_queue"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False)
    payload_json = Column(JSON, nullable=False)
    status = Column(String, default="pending")  # pending, in_progress, completed, failed
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class SyncConflict(Base):
    __tablename__ = "sync_conflicts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"), nullable=True)
    client_id = Column(String, nullable=False)
    conflict_type = Column(String, nullable=False)
    server_state = Column(JSON, nullable=True)
    client_state = Column(JSON, nullable=True)
    resolution = Column(String, default="server_authoritative")  # server_authoritative, client_authoritative
    resolved_at = Column(DateTime, default=datetime.utcnow)
