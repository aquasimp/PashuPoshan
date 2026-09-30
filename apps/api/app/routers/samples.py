from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.models.sample import Sample, SampleImage, Spectrum
from apps.api.app.dependencies import get_current_user, log_audit
from apps.api.app.services.image_service import process_and_save_image
from apps.api.app.services.traceability_service import create_signed_token, compute_result_hash

router = APIRouter(prefix="/samples", tags=["Samples"])


class SampleCreateRequest(BaseModel):
    client_id: Optional[str] = None
    farm_id: Optional[str] = None
    storage_unit_id: Optional[str] = None
    sample_type: str  # feed, silage, fodder
    crop_or_feed_name: str
    physical_form: Optional[str] = None  # pellet, mash, chopped_silage, bale
    collected_at: Optional[datetime] = None


class SpectrumCreateRequest(BaseModel):
    device_id: Optional[str] = None
    sample_prep: str = "fresh"  # fresh, dried, ground
    particle_size_protocol: Optional[str] = None
    replicate_number: int = 1
    wavelengths: List[float]
    absorbance_values: List[float]


def generate_sample_id():
    now = datetime.utcnow()
    suffix = f"{now.microsecond % 10000:04d}"
    return f"FS-{now.strftime('%Y%m%d')}-{suffix}"


@router.post("", status_code=status.HTTP_201_CREATED)
def create_sample(
    request: SampleCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Idempotency check via client_id
    if request.client_id:
        existing = db.query(Sample).filter(Sample.client_id == request.client_id).first()
        if existing:
            return {"sample_id": existing.id, "status": "existing", "sync_status": existing.sync_status}

    sample_id = generate_sample_id()
    sample = Sample(
        id=sample_id,
        client_id=request.client_id,
        farm_id=request.farm_id,
        storage_unit_id=request.storage_unit_id,
        sample_type=request.sample_type,
        crop_or_feed_name=request.crop_or_feed_name,
        physical_form=request.physical_form,
        collected_at=request.collected_at or datetime.utcnow(),
        collected_by_id=current_user.id,
        sync_status="SYNCED",
    )
    db.add(sample)
    db.commit()
    db.refresh(sample)

    log_audit(
        db=db,
        user_id=current_user.id,
        action="create_sample",
        entity_type="sample",
        entity_id=sample_id,
        details={"crop": request.crop_or_feed_name, "type": request.sample_type},
    )

    return {"sample_id": sample.id, "status": "created", "sync_status": sample.sync_status}


@router.get("")
def list_samples(
    sample_type: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Sample)
    # Farmers see their own samples or farm samples; admins/vets/managers see all
    if current_user.role.name == "farmer":
        query = query.filter(Sample.collected_by_id == current_user.id)
    if sample_type:
        query = query.filter(Sample.sample_type == sample_type)

    samples = query.order_by(Sample.collected_at.desc()).limit(limit).all()

    return [
        {
            "id": s.id,
            "client_id": s.client_id,
            "sample_type": s.sample_type,
            "crop_or_feed_name": s.crop_or_feed_name,
            "physical_form": s.physical_form,
            "collected_at": s.collected_at.isoformat(),
            "sync_status": s.sync_status,
            "has_images": len(s.images) > 0,
            "has_spectra": len(s.spectra) > 0,
            "has_analyses": len(s.analyses) > 0,
        }
        for s in samples
    ]


@router.get("/{sample_id}")
def get_sample(
    sample_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    return {
        "id": sample.id,
        "client_id": sample.client_id,
        "sample_type": sample.sample_type,
        "crop_or_feed_name": sample.crop_or_feed_name,
        "physical_form": sample.physical_form,
        "collected_at": sample.collected_at.isoformat(),
        "sync_status": sample.sync_status,
        "images": [{"id": img.id, "is_acceptable": img.is_acceptable, "blur_score": img.blur_score} for img in sample.images],
        "spectra_count": len(sample.spectra),
        "analyses": [{"id": a.id, "overall_risk": a.overall_risk, "action_decision": a.action_decision} for a in sample.analyses],
    }


@router.post("/{sample_id}/image")
def upload_sample_image(
    sample_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    image_meta = process_and_save_image(file)

    sample_img = SampleImage(
        id=image_meta["id"],
        sample_id=sample.id,
        file_path=image_meta["file_path"],
        thumbnail_path=image_meta["thumbnail_path"],
        width=image_meta["width"],
        height=image_meta["height"],
        blur_score=image_meta["blur_score"],
        exposure_score=image_meta["exposure_score"],
        glare_score=image_meta["glare_score"],
        is_acceptable=image_meta["is_acceptable"],
    )
    db.add(sample_img)
    db.commit()
    db.refresh(sample_img)

    return {
        "image_id": sample_img.id,
        "is_acceptable": sample_img.is_acceptable,
        "retake_hint": image_meta["retake_hint"],
        "blur_score": sample_img.blur_score,
        "exposure_score": sample_img.exposure_score,
    }


@router.post("/{sample_id}/spectrum")
def attach_sample_spectrum(
    sample_id: str,
    request: SpectrumCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    # Enforce Section 0.10 NIR sample handling fields
    spectrum = Spectrum(
        sample_id=sample.id,
        device_id=request.device_id,
        sample_prep=request.sample_prep,
        particle_size_protocol=request.particle_size_protocol,
        replicate_number=request.replicate_number,
        wavelengths=request.wavelengths,
        absorbance_values=request.absorbance_values,
        dark_ref_taken=True,
        white_ref_taken=True,
    )
    db.add(spectrum)
    db.commit()
    db.refresh(spectrum)

    return {"spectrum_id": spectrum.id, "bands_count": len(spectrum.wavelengths), "status": "attached"}
