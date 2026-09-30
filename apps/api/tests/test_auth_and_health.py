import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app
from apps.api.app.dependencies import require_role
from apps.api.app.database import SessionLocal
from tools.seed.seed_data import seed

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    seed()


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "feedshield-api"


@pytest.mark.parametrize("email,password,expected_role", [
    ("farmer@feedshield.in", "Farmer@123", "farmer"),
    ("manager@feedshield.in", "Manager@123", "cooperative_manager"),
    ("vet@feedshield.in", "Vet@123", "veterinarian"),
    ("admin@feedshield.in", "Admin@123", "admin"),
])
def test_login_all_four_roles(email, password, expected_role):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == expected_role
    assert data["user"]["email"] == email


def test_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={"email": "farmer@feedshield.in", "password": "WrongPassword"})
    assert response.status_code == 401
    assert "error" in response.json()


def test_get_me_authenticated():
    # Login as farmer
    login_resp = client.post("/api/v1/auth/login", json={"email": "farmer@feedshield.in", "password": "Farmer@123"})
    token = login_resp.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "farmer@feedshield.in"
    assert data["role"] == "farmer"


def test_unauthenticated_request():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "error" in response.json()


def test_role_based_access_control():
    # Add a temporary test route restricted to admin
    @app.get("/api/v1/test-admin-only")
    def admin_only_endpoint(user=pytest.importorskip("fastapi").Depends(require_role(["admin"]))):
        return {"status": "ok", "user": user.email}

    # 1. Login as Farmer
    farmer_token = client.post("/api/v1/auth/login", json={"email": "farmer@feedshield.in", "password": "Farmer@123"}).json()["access_token"]
    forbidden_resp = client.get("/api/v1/test-admin-only", headers={"Authorization": f"Bearer {farmer_token}"})
    assert forbidden_resp.status_code == 403
    assert "Access denied" in forbidden_resp.json()["error"]["message"]

    # 2. Login as Admin
    admin_token = client.post("/api/v1/auth/login", json={"email": "admin@feedshield.in", "password": "Admin@123"}).json()["access_token"]
    allowed_resp = client.get("/api/v1/test-admin-only", headers={"Authorization": f"Bearer {admin_token}"})
    assert allowed_resp.status_code == 200
    assert allowed_resp.json()["user"] == "admin@feedshield.in"
