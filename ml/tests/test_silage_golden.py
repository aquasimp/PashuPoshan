import json
import pytest
from pathlib import Path
from apps.api.app.rules.silage_engine import SilageRiskEngine

GOLDEN_PATH = Path(__file__).resolve().parent / "golden" / "silage_cases.json"


def load_golden_cases():
    with open(GOLDEN_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def engine():
    return SilageRiskEngine()


@pytest.mark.parametrize("case", load_golden_cases(), ids=lambda c: c["id"])
def test_silage_golden_case(engine, case):
    inputs = case["inputs"]
    expected = case["expected"]

    result = engine.evaluate(
        ph=inputs.get("ph"),
        internal_temp=inputs.get("internal_temp"),
        ambient_temp=inputs.get("ambient_temp"),
        dry_matter_pct=inputs.get("dry_matter_pct"),
        crop_type=inputs.get("crop_type", "maize_silage"),
        heating_rate=inputs.get("heating_rate"),
        days_open=inputs.get("days_open"),
        visible_mould_pct=inputs.get("visible_mould_pct"),
    )

    assert result["air_ingress_risk"] == expected["air_ingress_risk"], f"Air ingress mismatch in {case['id']}"
    assert result["heating_risk"] == expected["heating_risk"], f"Heating risk mismatch in {case['id']}"
    assert result["spoilage_risk"] == expected["spoilage_risk"], f"Spoilage risk mismatch in {case['id']}"
    assert result["fermentation_failure_risk"] == expected["fermentation_failure_risk"], f"Fermentation failure mismatch in {case['id']}"
    assert result["mould_risk"] == expected["mould_risk"], f"Mould risk mismatch in {case['id']}"
    assert result["sensor_health_warning"] == expected["sensor_health_warning"], f"Sensor health mismatch in {case['id']}"
    assert result["overall_risk"] == expected["overall_risk"], f"Overall risk mismatch in {case['id']}"
    assert result["action_decision"] == expected["action_decision"], f"Action decision mismatch in {case['id']}"
