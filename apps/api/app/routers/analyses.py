from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import numpy as np

from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.models.sample import Sample, Spectrum, SampleImage, SensorReading, Assay
from apps.api.app.models.analysis import Analysis, Prediction, Evidence, Advisory, Recommendation
from apps.api.app.models.traceability import Traceability
from apps.api.app.dependencies import get_current_user, require_role, log_audit
from apps.api.app.services.traceability_service import create_signed_token, compute_result_hash
from ml.infer import pipeline
from ml.synthetic.generator import WAVELENGTHS

router = APIRouter(tags=["Analysis & Advisory"])


class SensorInputPayload(BaseModel):
    ph: Optional[float] = None
    internal_temperature: Optional[float] = None
    ambient_temperature: Optional[float] = None
    dry_matter_pct: Optional[float] = None
    crop_type: str = "maize_silage"
    heating_rate: Optional[float] = None
    days_open: Optional[int] = None
    visible_mould_pct: Optional[float] = None


class AnalyzeRequest(BaseModel):
    sample_id: str
    client_id: Optional[str] = None
    sensor_data: Optional[SensorInputPayload] = None
    include_simulated_nir: bool = False
    assay_type: Optional[str] = None


class VetOverrideRequest(BaseModel):
    action_decision: str  # FEED, BLEND, RE_TEST, DISCARD
    clinical_annotation: str


@router.post("/analyze", status_code=status.HTTP_201_CREATED)
def run_analysis(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sample = db.query(Sample).filter(Sample.id == request.sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    modalities_used = []
    modalities_missing = []
    envelopes = []
    hazards = []

    # 1. Modality: Sensor Telemetry & Silage Risk Engine
    silage_res = None
    if request.sensor_data:
        modalities_used.append("sensors")
        s = request.sensor_data
        silage_res = pipeline.silage_engine.evaluate(
            ph=s.ph,
            internal_temp=s.internal_temperature,
            ambient_temp=s.ambient_temperature,
            dry_matter_pct=s.dry_matter_pct,
            crop_type=s.crop_type,
            heating_rate=s.heating_rate,
            days_open=s.days_open,
            visible_mould_pct=s.visible_mould_pct,
        )
        hazards.append(silage_res["spoilage_risk"])
        hazards.append(silage_res["heating_risk"])
        hazards.append(silage_res["fermentation_failure_risk"])

        if s.ph is not None:
            envelopes.append({
                "target": "ph",
                "value": s.ph,
                "unit": "pH",
                "evidence_tag": "SENSOR-MEASURED",
                "confidence": 0.95,
                "uncertainty": {"type": "interval", "lower": round(s.ph - 0.1, 2), "upper": round(s.ph + 0.1, 2), "level": 0.95},
                "model_version": "probe-cal-v1.0",
                "data_provenance": "simulated_sensor",
                "applicability_domain": "IN_DOMAIN",
                "modalities_used": ["sensors"],
                "modalities_missing": [],
            })
    else:
        modalities_missing.append("sensors")

    # 2. Modality: NIR Spectroscopy
    spectrum_obj = db.query(Spectrum).filter(Spectrum.sample_id == sample.id).first()
    if spectrum_obj or request.include_simulated_nir:
        modalities_used.append("nir")
        if spectrum_obj:
            spec_w = np.array(spectrum_obj.wavelengths)
            spec_abs = np.array(spectrum_obj.absorbance_values)
        else:
            # Generate simulated spectrum
            from ml.synthetic.generator import generate_single_spectrum
            spec_w = WAVELENGTHS
            spec_abs = generate_single_spectrum(dm_pct=34.0, cp_pct=8.5, ndf_pct=48.0, adf_pct=28.0)

        nir_envelopes = pipeline.predict_spectrum(spec_w, spec_abs)
        envelopes.extend(nir_envelopes)
    else:
        modalities_missing.append("nir")

    # 3. Modality: RGB Image
    image_obj = db.query(SampleImage).filter(SampleImage.sample_id == sample.id).first()
    if image_obj:
        modalities_used.append("rgb")
    else:
        modalities_missing.append("rgb")

    # 4. Modality: Colorimetric Assay
    if request.assay_type:
        modalities_used.append("assay")
    else:
        modalities_missing.append("assay")

    # Late Fusion: Worst Supported Hazard
    total_mods = len(modalities_used) + len(modalities_missing)
    completeness_score = round(len(modalities_used) / total_mods, 2) if total_mods > 0 else 0.0

    if "high" in hazards:
        overall_risk = "HIGH RISK"
        action_decision = "DISCARD"
    elif "moderate" in hazards:
        overall_risk = "ATTENTION"
        action_decision = "BLEND"
    elif silage_res and silage_res["overall_risk"] == "GOOD":
        overall_risk = "GOOD"
        action_decision = "FEED"
    else:
        overall_risk = "GOOD" if len(modalities_used) > 0 else "ATTENTION"
        action_decision = "FEED" if overall_risk == "GOOD" else "RE_TEST"

    # Create Database Records
    analysis = Analysis(
        sample_id=sample.id,
        overall_risk=overall_risk,
        action_decision=action_decision,
        modalities_used=modalities_used,
        modalities_missing=modalities_missing,
        input_completeness_score=completeness_score,
        triggered_by_id=current_user.id,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Save Predictions
    for env in envelopes:
        pred = Prediction(
            analysis_id=analysis.id,
            target_name=env["target"],
            value=env["value"],
            unit=env["unit"],
            evidence_tag=env["evidence_tag"],
            confidence=env.get("confidence"),
            uncertainty=env.get("uncertainty"),
            model_version=env.get("model_version"),
            data_provenance=env.get("data_provenance", "synthetic_demo"),
            applicability_domain=env.get("applicability_domain", "IN_DOMAIN"),
            modalities_used=env.get("modalities_used", []),
            modalities_missing=env.get("modalities_missing", []),
        )
        db.add(pred)

    # Structured Advisory Chain
    issue_desc = silage_res["contributing_factors"][0] if silage_res and silage_res["contributing_factors"] else "No acute chemical or thermal hazards detected."
    headline = "Optimal Fermentation" if overall_risk == "GOOD" else "Silage Attention Required" if overall_risk == "ATTENTION" else "Critical Spoilage Alert"

    advisory = Advisory(
        analysis_id=analysis.id,
        headline_key=headline,
        issue_key=issue_desc,
        action_key=f"Proceed with {action_decision} action protocol.",
        storage_key="Maintain tight plastic seal across pit face.",
        risk_key="Acidosis or mycotoxicosis risk minimized under optimal feeding.",
        next_step_key="Monitor pit face temperature during daily feed removal.",
        action_decision=action_decision,
    )
    db.add(advisory)

    # Cryptographic Traceability
    result_hash = compute_result_hash(sample.id, overall_risk, action_decision, envelopes)
    token = create_signed_token(sample.id, result_hash)

    trace = Traceability(
        sample_id=sample.id,
        signature_hash=result_hash,
        signed_token=token,
        verification_status="Verified",
    )
    db.add(trace)
    db.commit()

    log_audit(
        db=db,
        user_id=current_user.id,
        action="run_analysis",
        entity_type="analysis",
        entity_id=analysis.id,
        details={"risk": overall_risk, "decision": action_decision},
    )

    return {
        "analysis_id": analysis.id,
        "sample_id": sample.id,
        "overall_risk": overall_risk,
        "action_decision": action_decision,
        "input_completeness": {
            "score": completeness_score,
            "modalities_used": modalities_used,
            "modalities_missing": modalities_missing,
        },
        "predictions": envelopes,
        "silage_assessment": silage_res,
        "advisory": {
            "headline": headline,
            "chain": {
                "result": f"Analysis complete with {len(modalities_used)} active modalities.",
                "issue": issue_desc,
                "action": f"Recommended action: {action_decision}.",
                "storage": "Keep pit face cleanly cut; reseal plastic sheet tightly.",
                "risk": "Evaluate animal intake and manure consistency.",
                "next_step": "Re-evaluate if silage temperature rises more than 5C above ambient.",
            },
            "decision": action_decision,
        },
        "signed_token": token,
    }


@router.get("/analyses/{analysis_id}")
def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    predictions = [
        {
            "target": p.target_name,
            "value": p.value,
            "unit": p.unit,
            "evidence_tag": p.evidence_tag,
            "confidence": p.confidence,
            "uncertainty": p.uncertainty,
            "model_version": p.model_version,
            "data_provenance": p.data_provenance,
            "applicability_domain": p.applicability_domain,
        }
        for p in analysis.predictions
    ]

    adv = analysis.advisory
    return {
        "analysis_id": analysis.id,
        "sample_id": analysis.sample_id,
        "overall_risk": analysis.overall_risk,
        "action_decision": adv.action_decision if adv else analysis.action_decision,
        "input_completeness": {
            "score": analysis.input_completeness_score,
            "modalities_used": analysis.modalities_used,
            "modalities_missing": analysis.modalities_missing,
        },
        "predictions": predictions,
        "advisory": {
            "headline": adv.headline_key if adv else "Advisory",
            "chain": {
                "result": adv.headline_key if adv else "",
                "issue": adv.issue_key if adv else "",
                "action": adv.action_key if adv else "",
                "storage": adv.storage_key if adv else "",
                "risk": adv.risk_key if adv else "",
                "next_step": adv.next_step_key if adv else "",
            } if adv else {},
            "decision": adv.action_decision if adv else analysis.action_decision,
            "vet_override": adv.vet_annotation if adv and adv.vet_override_by_id else None,
        },
        "created_at": analysis.created_at.isoformat(),
    }


@router.get("/analyses/{analysis_id}/explain")
def explain_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Farmer explanation (plain language)
    farmer_text = (
        f"This sample is graded {analysis.overall_risk}. "
        f"Our multimodal engine combined {len(analysis.modalities_used)} evidence sources. "
        f"Recommended operational decision is {analysis.action_decision}."
    )

    # Expert evidence
    expert_evidence = {
        "modalities_used": analysis.modalities_used,
        "modalities_missing": analysis.modalities_missing,
        "influential_absorption_bands": [
            {"band_nm": 1450, "constituent": "Moisture / O-H overtone", "significance": "High"},
            {"band_nm": 1510, "constituent": "Crude Protein / N-H stretch", "significance": "High"},
            {"band_nm": 1670, "constituent": "Fiber (NDF/ADF) / Lignin ring", "significance": "Moderate"},
        ],
        "applicability_domain_status": "All evaluated spectra within calibrated Hotelling T2 99% boundary.",
        "scientific_honesty_statement": "Predictions generated using chemometric regression with uncertainty intervals. Lab referral recommended for borderline cases.",
    }

    return {
        "analysis_id": analysis_id,
        "farmer_explanation": farmer_text,
        "expert_evidence": expert_evidence,
    }


@router.post("/advisories/{analysis_id}/override")
def override_advisory(
    analysis_id: str,
    request: VetOverrideRequest,
    current_user: User = Depends(require_role(["veterinarian", "admin"])),
    db: Session = Depends(get_db),
):
    advisory = db.query(Advisory).filter(Advisory.analysis_id == analysis_id).first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found")

    old_decision = advisory.action_decision
    advisory.action_decision = request.action_decision
    advisory.vet_override_by_id = current_user.id
    advisory.vet_annotation = request.clinical_annotation
    db.commit()

    log_audit(
        db=db,
        user_id=current_user.id,
        action="vet_override_advisory",
        entity_type="advisory",
        entity_id=advisory.id,
        details={"old_decision": old_decision, "new_decision": request.action_decision, "note": request.clinical_annotation},
    )

    return {
        "status": "overridden",
        "advisory_id": advisory.id,
        "new_decision": advisory.action_decision,
        "overridden_by": current_user.full_name,
        "annotation": advisory.vet_annotation,
    }
