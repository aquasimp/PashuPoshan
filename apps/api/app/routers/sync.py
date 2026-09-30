from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.models.sample import Sample
from apps.api.app.models.analysis import Analysis
from apps.api.app.models.sync import SyncConflict, SyncQueue
from apps.api.app.dependencies import get_current_user

router = APIRouter(prefix="/sync", tags=["Offline Sync"])


class SyncItemPayload(BaseModel):
    client_id: str
    entity_type: str  # sample, analysis
    data: Dict[str, Any]
    client_updated_at: str


class SyncPushRequest(BaseModel):
    items: List[SyncItemPayload]


@router.post("/push")
def sync_push(
    request: SyncPushRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    processed = []
    conflicts_logged = []

    for item in request.items:
        cid = item.client_id
        entity_type = item.entity_type
        payload = item.data

        if entity_type == "sample":
            existing = db.query(Sample).filter(Sample.client_id == cid).first()
            if existing:
                # Idempotency / Conflict resolution
                # Server is authoritative for analyses; client is authoritative for drafts
                client_dt = datetime.fromisoformat(item.client_updated_at)
                if existing.updated_at and existing.updated_at > client_dt:
                    conflict = SyncConflict(
                        sample_id=existing.id,
                        client_id=cid,
                        conflict_type="SAMPLE_METADATA_VERSION_MISMATCH",
                        server_state={"updated_at": existing.updated_at.isoformat(), "crop": existing.crop_or_feed_name},
                        client_state={"updated_at": item.client_updated_at, "crop": payload.get("crop_or_feed_name")},
                        resolution="server_authoritative",
                    )
                    db.add(conflict)
                    conflicts_logged.append(cid)
                    status_action = "server_preserved"
                else:
                    existing.crop_or_feed_name = payload.get("crop_or_feed_name", existing.crop_or_feed_name)
                    existing.physical_form = payload.get("physical_form", existing.physical_form)
                    existing.updated_at = datetime.utcnow()
                    status_action = "updated"
                sample_id = existing.id
            else:
                # Create sample
                now = datetime.utcnow()
                suffix = f"{now.microsecond % 10000:04d}"
                sample_id = f"FS-{now.strftime('%Y%m%d')}-{suffix}"
                new_sample = Sample(
                    id=sample_id,
                    client_id=cid,
                    sample_type=payload.get("sample_type", "silage"),
                    crop_or_feed_name=payload.get("crop_or_feed_name", "Maize Silage"),
                    physical_form=payload.get("physical_form", "chopped_silage"),
                    collected_by_id=current_user.id,
                    sync_status="SYNCED",
                    collected_at=datetime.fromisoformat(payload.get("collected_at", now.isoformat())),
                )
                db.add(new_sample)
                status_action = "created"

            processed.append({"client_id": cid, "server_id": sample_id, "status": status_action})

    db.commit()

    return {
        "status": "success",
        "processed_count": len(processed),
        "conflicts_count": len(conflicts_logged),
        "results": processed,
    }


@router.get("/pull")
def sync_pull(
    since: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Sample)
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
            query = query.filter(Sample.updated_at >= since_dt)
        except Exception:
            pass

    samples = query.order_by(Sample.updated_at.desc()).limit(100).all()

    return {
        "sync_timestamp": datetime.utcnow().isoformat(),
        "samples": [
            {
                "id": s.id,
                "client_id": s.client_id,
                "sample_type": s.sample_type,
                "crop_or_feed_name": s.crop_or_feed_name,
                "physical_form": s.physical_form,
                "sync_status": s.sync_status,
                "updated_at": s.updated_at.isoformat() if s.updated_at else s.collected_at.isoformat(),
                "latest_analysis": {
                    "overall_risk": s.analyses[-1].overall_risk,
                    "action_decision": s.analyses[-1].action_decision,
                } if s.analyses else None,
            }
            for s in samples
        ],
    }
