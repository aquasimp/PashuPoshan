import os
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from apps.api.app.database import get_db
from apps.api.app.models.sample import Sample
from apps.api.app.models.analysis import Analysis
from apps.api.app.models.traceability import Traceability
from apps.api.app.services.traceability_service import verify_signed_token, compute_result_hash
from apps.api.app.services.pdf_service import generate_analysis_pdf

router = APIRouter(tags=["Traceability & Reports"])


@router.get("/verify/{sample_id}")
def verify_sample(
    sample_id: str,
    token: str = Query("", description="Cryptographic HMAC-SHA256 signature token"),
    db: Session = Depends(get_db),
):
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        return {
            "status": "Unverified",
            "sample_id": sample_id,
            "message": "Sample record not found on central registry. May be an unsynced offline provisional scan.",
        }

    latest_analysis = (
        db.query(Analysis)
        .filter(Analysis.sample_id == sample.id)
        .order_by(Analysis.created_at.desc())
        .first()
    )

    if not latest_analysis:
        return {
            "status": "Unverified",
            "sample_id": sample_id,
            "crop_name": sample.crop_or_feed_name,
            "message": "Sample registered but analytical evaluation is pending.",
        }

    # Recompute expected hash
    expected_hash = compute_result_hash(
        sample.id,
        latest_analysis.overall_risk,
        latest_analysis.action_decision,
        latest_analysis.predictions,
    )

    status_str, payload, msg = verify_signed_token(token, expected_result_hash=expected_hash)

    return {
        "status": status_str,
        "sample_id": sample.id,
        "crop_name": sample.crop_or_feed_name,
        "sample_type": sample.sample_type,
        "overall_risk": latest_analysis.overall_risk,
        "action_decision": latest_analysis.action_decision,
        "tested_date": latest_analysis.created_at.isoformat(),
        "modalities_used": latest_analysis.modalities_used,
        "evidence_tags": [p.evidence_tag for p in latest_analysis.predictions],
        "model_version": "nir-silage-fusion-v1.0",
        "data_provenance": "synthetic_demo",
        "message": msg,
    }


@router.post("/reports/{analysis_id}/pdf")
def download_analysis_report(
    analysis_id: str,
    lang: str = Query("en", description="Language code: en, hi, hinglish"),
    db: Session = Depends(get_db),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    sample = analysis.sample
    farm_name = sample.farm.name if sample.farm else "Independent Dairy Node"

    analysis_payload = {
        "sample_id": sample.id,
        "sample_type": sample.sample_type,
        "crop_name": sample.crop_or_feed_name,
        "physical_form": sample.physical_form or "Chopped Silage",
        "farm_name": farm_name,
        "collected_at": sample.collected_at.strftime("%Y-%m-%d"),
        "overall_risk": analysis.overall_risk,
        "action_decision": analysis.action_decision,
        "predictions": [
            {
                "target": p.target_name.replace("_", " ").title(),
                "value": p.value,
                "unit": p.unit,
                "evidence_tag": p.evidence_tag,
                "confidence": p.confidence,
                "uncertainty": p.uncertainty,
                "applicability_domain": p.applicability_domain,
            }
            for p in analysis.predictions
        ],
        "advisory": {
            "chain": {
                "result": analysis.advisory.headline_key if analysis.advisory else "Optimal preservation.",
                "issue": analysis.advisory.issue_key if analysis.advisory else "None detected.",
                "action": analysis.advisory.action_key if analysis.advisory else "Proceed with feeding.",
                "storage": analysis.advisory.storage_key if analysis.advisory else "Maintain plastic seal.",
                "risk": analysis.advisory.risk_key if analysis.advisory else "Low spoilage hazard.",
                "next_step": analysis.advisory.next_step_key if analysis.advisory else "Regular pit monitoring.",
            }
        },
    }

    pdf_path = generate_analysis_pdf(analysis_payload, lang=lang)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path),
    )
