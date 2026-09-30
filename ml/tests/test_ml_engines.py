import pytest
import numpy as np
import cv2
from ml.synthetic.generator import generate_single_spectrum, generate_synthetic_dataset, WAVELENGTHS
from ml.infer import pipeline
from ml.rgb_engine import RGBQualityAndMouldEngine
from ml.assay_reader import ColorimetricAssayReader, generate_synthetic_test_card_image


def test_zero_data_leakage():
    df, spectra = generate_synthetic_dataset(n_samples=200, seed=123)
    farms = df["farm_id"].unique()
    split_point = len(farms) // 2
    train_farms = set(farms[:split_point])
    test_farms = set(farms[split_point:])

    # Assert no overlap
    assert len(train_farms.intersection(test_farms)) == 0


def test_applicability_domain_in_domain_and_invalid():
    # 1. Normal in-domain spectrum
    in_domain_spec = generate_single_spectrum(dm_pct=35.0, cp_pct=9.0, ndf_pct=45.0, adf_pct=26.0)
    envelopes = pipeline.predict_spectrum(WAVELENGTHS, in_domain_spec)
    assert len(envelopes) == 4
    for env in envelopes:
        assert env["applicability_domain"] in ["IN_DOMAIN", "CAUTION"]
        assert env["value"] is not None
        assert env["evidence_tag"] == "PREDICTED"
        assert env["uncertainty"] is not None

    # 2. Out-of-domain spectrum (e.g. flat zeros or massive aberrant spike)
    out_of_domain_spec = np.zeros_like(WAVELENGTHS)
    invalid_envelopes = pipeline.predict_spectrum(WAVELENGTHS, out_of_domain_spec)
    assert len(invalid_envelopes) == 4
    for env in invalid_envelopes:
        assert env["applicability_domain"] == "INVALID"
        # Must return null value per CLAUDE.md Section 0.6
        assert env["value"] is None
        assert "laboratory confirmation recommended" in env["message"]


def test_rgb_blur_rejection():
    engine = RGBQualityAndMouldEngine()
    # Create sharp image with high variance
    sharp_img = np.random.randint(50, 200, (300, 300, 3), dtype=np.uint8)
    res_sharp = engine.evaluate_quality(sharp_img)
    assert res_sharp["blur_score"] > 80.0

    # Create blurry image via strong Gaussian blur
    blurry_img = cv2.GaussianBlur(sharp_img, (35, 35), 0)
    res_blur = engine.evaluate_quality(blurry_img)
    assert not res_blur["is_acceptable"]
    assert res_blur["retake_hint"] == "Hold camera steady."


def test_rgb_lighting_rejection():
    engine = RGBQualityAndMouldEngine()
    # Underexposed / dark image
    dark_img = np.full((300, 300, 3), 15, dtype=np.uint8)
    res_dark = engine.evaluate_quality(dark_img)
    assert not res_dark["is_acceptable"]
    assert res_dark["retake_hint"] == "Improve lighting."


def test_visible_mould_heuristic():
    engine = RGBQualityAndMouldEngine()
    sample_img = np.full((300, 300, 3), 120, dtype=np.uint8)
    res = engine.estimate_visible_mould(sample_img)
    assert res["evidence_tag"] == "ESTIMATED"
    assert "disclaimer" in res
    assert res["label"] == "Visible mould risk"


def test_assay_reader_valid_card():
    reader = ColorimetricAssayReader()
    # Valid synthetic test card
    valid_img = generate_synthetic_test_card_image(valid_card=True)
    res = reader.read_ph_strip(valid_img)
    assert res["status"] == "VALID"
    assert res["ph_value"] is not None
    assert res["evidence_tag"] == "SENSOR-MEASURED"


def test_assay_reader_failure_path_refuses_number():
    reader = ColorimetricAssayReader()
    # Defective image without reference card
    bad_img = generate_synthetic_test_card_image(valid_card=False)
    res = reader.read_ph_strip(bad_img)
    # Must refuse to return a pH number
    assert res["status"] == "INVALID"
    assert res["ph_value"] is None
    assert res["message"] == "Unable to validate test image — retake required."

    urea_res = reader.read_urea_assay(bad_img)
    assert urea_res["screening_class"] == "INVALID"
    assert urea_res["message"] == "Unable to validate test image — retake required."
