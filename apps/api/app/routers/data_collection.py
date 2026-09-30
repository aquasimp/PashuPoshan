from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.models.sample import Sample, LaboratoryResult, SampleImage, Spectrum, SensorReading, Assay
from apps.api.app.dependencies import get_current_user, require_role, log_audit

router = APIRouter(prefix="/data-collection", tags=["Field Data Collection"])


class LabTruthPayload(BaseModel):
    lab_name: str
    test_method: str  # Kjeldahl, Soxhlet, VanSoest, HPLC
    crude_protein: Optional[float] = None
    dry_matter: Optional[float] = None
    ndf: Optional[float] = None
    adf: Optional[float] = None
    aflatoxin_b1_ppb: Optional[float] = None


class DataCollectionUploadRequest(BaseModel):
    consent_granted: bool  # Mandatory farmer / co-op consent
    crop_or_feed_name: str
    sample_type: str = "silage"
    physical_form: str = "chopped_silage"
    farm_id: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    device_model: Optional[str] = None
    lighting_condition: str = "uniform_daylight"
    lab_reference: LabTruthPayload


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_field_collection_sample(
    request: DataCollectionUploadRequest,
    current_user: User = Depends(require_role(["admin", "veterinarian"])),
    db: Session = Depends(get_db),
):
    if not request.consent_granted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandatory data collection consent flag was not granted by provider."
        )

    now = datetime.utcnow()
    suffix = f"{now.microsecond % 10000:04d}"
    sample_id = f"FS-COLLECT-{now.strftime('%Y%m%d')}-{suffix}"

    sample = Sample(
        id=sample_id,
        farm_id=request.farm_id,
        sample_type=request.sample_type,
        crop_or_feed_name=request.crop_or_feed_name,
        physical_form=request.physical_form,
        collected_at=now,
        collected_by_id=current_user.id,
        sync_status="SYNCED",
    )
    db.add(sample)

    # Attach verified wet-chemistry lab ground truth
    lab_ref = request.lab_reference
    lab_result = LaboratoryResult(
        sample_id=sample_id,
        lab_name=lab_ref.lab_name,
        test_method=lab_ref.test_method,
        crude_protein=lab_ref.crude_protein,
        dry_matter=lab_ref.dry_matter,
        ndf=lab_ref.ndf,
        adf=lab_ref.adf,
        aflatoxin_b1_ppb=lab_ref.aflatoxin_b1_ppb,
        certified_at=now,
    )
    db.add(lab_result)
    db.commit()

    log_audit(
        db=db,
        user_id=current_user.id,
        action="paired_data_collection_upload",
        entity_type="sample",
        entity_id=sample_id,
        details={"lab": lab_ref.lab_name, "crop": request.crop_or_feed_name},
    )

    return {
        "status": "success",
        "sample_id": sample_id,
        "message": "Paired multimodal sample and certified laboratory truth successfully registered.",
    }


@router.get("/stats")
def get_dataset_growth_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_samples = db.query(Sample).count()
    total_images = db.query(SampleImage).count()
    total_spectra = db.query(Spectrum).count()
    total_labs = db.query(LaboratoryResult).count()
    total_silage = db.query(Sample).filter(Sample.sample_type == "silage").count()
    total_assays = db.query(Assay).count()

    return {
        "total_paired_samples": total_samples,
        "rgb_images_collected": total_images,
        "spectral_scans_registered": total_spectra,
        "laboratory_reference_truth": total_labs,
        "silage_samples_cataloged": total_silage,
        "assay_strip_scans": total_assays,
        "growth_target": 5000,
        "data_provenance_standard": "Indian Agricultural Paired Benchmark v1",
    }
