import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import joblib
import numpy as np

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ml.preprocessing import remove_bad_bands
from ml.synthetic.generator import WAVELENGTHS
from ml.applicability_domain import ApplicabilityDomainEvaluator
from ml.rgb_engine import RGBQualityAndMouldEngine
from ml.assay_reader import ColorimetricAssayReader
from apps.api.app.rules.silage_engine import SilageRiskEngine

MODELS_DIR = ROOT_DIR / "ml" / "models"


class PashuPoshanInferencePipeline:
    def __init__(self):
        self.ad_evaluator: Optional[ApplicabilityDomainEvaluator] = None
        self.models: Dict[str, Any] = {}
        self.rgb_engine = RGBQualityAndMouldEngine()
        self.assay_reader = ColorimetricAssayReader()
        self.silage_engine = SilageRiskEngine()
        self._load_models()

    def _load_models(self):
        ad_path = MODELS_DIR / "applicability_domain.joblib"
        if ad_path.exists():
            self.ad_evaluator = joblib.load(ad_path)

        targets = ["moisture_dm", "crude_protein", "ndf", "adf"]
        for target in targets:
            m_path = MODELS_DIR / f"nir-{target}-plsr-v1.0.joblib"
            if m_path.exists():
                self.models[target] = joblib.load(m_path)

    def predict_spectrum(self, raw_wavelengths: np.ndarray, raw_absorbance: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs NIR spectral predictions through Applicability Domain safety envelope.
        """
        if self.ad_evaluator is None or not self.models:
            self._load_models()

        clean_w, clean_spec = remove_bad_bands(raw_wavelengths, raw_absorbance)
        if clean_spec.ndim == 1:
            clean_spec = clean_spec.reshape(1, -1)

        # 1. Applicability Domain Check
        ad_result = self.ad_evaluator.evaluate(clean_spec) if self.ad_evaluator else {"status": "NOT_APPLICABLE"}
        ad_status = ad_result.get("status", "NOT_APPLICABLE")

        envelopes = []
        target_meta = {
            "moisture_dm": {"target": "dry_matter", "unit": "% DM", "version": "nir-dm-plsr-v1.0", "uncertainty_half": 2.2},
            "crude_protein": {"target": "crude_protein", "unit": "% DM", "version": "nir-cp-plsr-v1.0", "uncertainty_half": 0.8},
            "ndf": {"target": "ndf", "unit": "% DM", "version": "nir-ndf-plsr-v1.0", "uncertainty_half": 2.5},
            "adf": {"target": "adf", "unit": "% DM", "version": "nir-adf-plsr-v1.0", "uncertainty_half": 1.6},
        }

        for target_key, meta in target_meta.items():
            if target_key in self.models:
                pipe = self.models[target_key]
                if ad_status == "INVALID":
                    # Hard safety rule: Never return a precise number when out of domain
                    envelope = {
                        "target": meta["target"],
                        "value": None,
                        "unit": meta["unit"],
                        "evidence_tag": "PREDICTED",
                        "confidence": 0.0,
                        "uncertainty": None,
                        "model_version": meta["version"],
                        "data_provenance": "synthetic_demo",
                        "modalities_used": ["nir"],
                        "modalities_missing": ["laboratory_reference"],
                        "applicability_domain": "INVALID",
                        "message": "Sample outside validated model range — laboratory confirmation recommended.",
                    }
                else:
                    pred_val = float(pipe.predict(clean_spec)[0])
                    u_half = meta["uncertainty_half"]
                    confidence = 0.92 if ad_status == "IN_DOMAIN" else 0.70

                    envelope = {
                        "target": meta["target"],
                        "value": round(pred_val, 2),
                        "unit": meta["unit"],
                        "evidence_tag": "PREDICTED",
                        "confidence": confidence,
                        "uncertainty": {
                            "type": "interval",
                            "lower": round(pred_val - u_half, 2),
                            "upper": round(pred_val + u_half, 2),
                            "level": 0.95,
                        },
                        "model_version": meta["version"],
                        "data_provenance": "synthetic_demo",
                        "modalities_used": ["nir"],
                        "modalities_missing": [],
                        "applicability_domain": ad_status,
                    }
                envelopes.append(envelope)

        return envelopes


pipeline = PashuPoshanInferencePipeline()
FeedShieldInferencePipeline = PashuPoshanInferencePipeline
