import io
import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app
from tools.seed.seed_data import seed

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def init_db():
    seed()


def get_token(email: str = "farmer@feedshield.in", password: str = "Farmer@123") -> str:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


def test_full_sample_and_analysis_workflow():
    token = get_token("farmer@feedshield.in", "Farmer@123")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Sample
    sample_resp = client.post(
        "/api/v1/samples",
        json={
            "sample_type": "silage",
            "crop_or_feed_name": "Maize Silage Hybrid 900",
            "physical_form": "chopped_silage",
        },
        headers=headers,
    )
    assert sample_resp.status_code == 201
    sample_id = sample_resp.json()["sample_id"]
    assert sample_id.startswith("FS-")

    # 2. Upload Sample Image
    # Create fake 100x100 RGB JPEG in memory
    import numpy as np
    import cv2
    img = np.random.randint(50, 200, (200, 200, 3), dtype=np.uint8)
    _, img_encoded = cv2.imencode(".jpg", img)
    img_io = io.BytesIO(img_encoded.tobytes())

    upload_resp = client.post(
        f"/api/v1/samples/{sample_id}/image",
        files={"file": ("test.jpg", img_io, "image/jpeg")},
        headers=headers,
    )
    assert upload_resp.status_code == 200
    assert upload_resp.json()["is_acceptable"] is True

    # 3. Run Analysis with Sensor Readings & Simulated NIR
    analyze_resp = client.post(
        "/api/v1/analyze",
        json={
            "sample_id": sample_id,
            "sensor_data": {
                "ph": 3.95,
                "internal_temperature": 25.0,
                "ambient_temperature": 24.5,
                "dry_matter_pct": 34.0,
                "crop_type": "maize_silage",
            },
            "include_simulated_nir": True,
        },
        headers=headers,
    )
    assert analyze_resp.status_code == 201
    ana_data = analyze_resp.json()

    assert ana_data["overall_risk"] == "GOOD"
    assert ana_data["action_decision"] == "FEED"
    assert "nir" in ana_data["input_completeness"]["modalities_used"]
    assert "sensors" in ana_data["input_completeness"]["modalities_used"]
    assert len(ana_data["predictions"]) >= 4  # pH, DM, CP, NDF, ADF
    signed_token = ana_data["signed_token"]
    analysis_id = ana_data["analysis_id"]

    # 4. Verify Cryptographic Token
    verify_resp = client.get(f"/api/v1/verify/{sample_id}?token={signed_token}")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "Verified"

    # 5. Tamper Detection Test
    tampered_token = signed_token[:-4] + "FAIL"
    tamper_resp = client.get(f"/api/v1/verify/{sample_id}?token={tampered_token}")
    assert tamper_resp.status_code == 200
    assert tamper_resp.json()["status"] == "Tampered"

    # 6. Generate ReportLab PDF Report
    pdf_resp = client.post(f"/api/v1/reports/{analysis_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000  # Non-empty PDF stream

    # 7. Explainability Endpoint
    explain_resp = client.get(f"/api/v1/analyses/{analysis_id}/explain", headers=headers)
    assert explain_resp.status_code == 200
    assert "farmer_explanation" in explain_resp.json()
    assert len(explain_resp.json()["expert_evidence"]["influential_absorption_bands"]) > 0


def test_veterinarian_override():
    farmer_token = get_token("farmer@feedshield.in", "Farmer@123")
    vet_token = get_token("vet@feedshield.in", "Vet@123")

    # Create sample and analyze
    s_resp = client.post(
        "/api/v1/samples",
        json={"sample_type": "silage", "crop_or_feed_name": "Test Vet Override Silage"},
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    sid = s_resp.json()["sample_id"]

    a_resp = client.post(
        "/api/v1/analyze",
        json={"sample_id": sid, "sensor_data": {"ph": 4.1, "internal_temperature": 25.0, "ambient_temperature": 24.5}},
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    aid = a_resp.json()["analysis_id"]

    # Farmer attempts override -> Forbidden (403)
    farmer_override = client.post(
        f"/api/v1/advisories/{aid}/override",
        json={"action_decision": "BLEND", "clinical_annotation": "Farmer trying to override"},
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert farmer_override.status_code == 403

    # Vet performs override -> 200 OK
    vet_override = client.post(
        f"/api/v1/advisories/{aid}/override",
        json={"action_decision": "BLEND", "clinical_annotation": "Mild butyric odor noted on tactile clinical inspection"},
        headers={"Authorization": f"Bearer {vet_token}"},
    )
    assert vet_override.status_code == 200
    assert vet_override.json()["status"] == "overridden"
    assert vet_override.json()["new_decision"] == "BLEND"


def test_sync_push_idempotency():
    import uuid
    token = get_token("farmer@feedshield.in", "Farmer@123")
    headers = {"Authorization": f"Bearer {token}"}
    client_id = f"offline-sample-uuid-{uuid.uuid4()}"

    push_payload = {
        "items": [
            {
                "client_id": client_id,
                "entity_type": "sample",
                "data": {
                    "crop_or_feed_name": "Offline Silage Pit 1",
                    "sample_type": "silage",
                    "physical_form": "chopped_silage",
                    "collected_at": "2026-09-30T10:00:00",
                },
                "client_updated_at": "2026-09-30T10:00:00",
            }
        ]
    }

    # First push: Created
    resp1 = client.post("/api/v1/sync/push", json=push_payload, headers=headers)
    assert resp1.status_code == 200
    assert resp1.json()["processed_count"] == 1
    assert resp1.json()["results"][0]["status"] == "created"
    first_server_id = resp1.json()["results"][0]["server_id"]

    # Second push with identical client_id: Idempotent (not duplicated!)
    resp2 = client.post("/api/v1/sync/push", json=push_payload, headers=headers)
    assert resp2.status_code == 200
    assert resp2.json()["results"][0]["server_id"] == first_server_id
    assert resp2.json()["results"][0]["status"] in ["updated", "server_preserved"]


def test_models_registry_endpoint():
    token = get_token("admin@feedshield.in", "Admin@123")
    resp = client.get("/api/v1/models", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["registered_models_count"] >= 4
    for m in data["models"]:
        assert "metrics" in m
        assert "rmse" in m["metrics"]
        assert m["data_provenance"] == "synthetic_demo"
