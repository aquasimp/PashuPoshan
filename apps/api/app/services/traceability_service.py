import hmac
import hashlib
import base64
import json
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from apps.api.app.config import settings


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def b64url_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))


def compute_result_hash(sample_id: str, overall_risk: str, action_decision: str, predictions: list) -> str:
    serialized = f"{sample_id}:{overall_risk}:{action_decision}:{len(predictions)}"
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]


def create_signed_token(sample_id: str, result_hash: str) -> str:
    payload = {
        "sid": sample_id,
        "iat": int(datetime.utcnow().timestamp()),
        "v": "1.0",
        "result_hash": result_hash,
    }
    payload_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
    payload_b64 = b64url_encode(payload_bytes)

    # HMAC-SHA256 signature
    sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).digest()
    sig_b64 = b64url_encode(sig)

    return f"{payload_b64}.{sig_b64}"


def verify_signed_token(token: str, expected_result_hash: Optional[str] = None) -> Tuple[str, Optional[Dict[str, Any]], str]:
    """
    Verifies signed verification token.
    Returns: (status: 'Verified' | 'Unverified' | 'Tampered', payload, detail_message)
    """
    if not token or "." not in token:
        return "Unverified", None, "Token missing or malformed; provisional offline scan."

    parts = token.split(".")
    if len(parts) != 2:
        return "Tampered", None, "Invalid token structure."

    payload_b64, sig_b64 = parts[0], parts[1]

    # Verify HMAC
    expected_sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).digest()
    actual_sig = b64url_decode(sig_b64)

    if not hmac.compare_digest(expected_sig, actual_sig):
        return "Tampered", None, "Cryptographic signature mismatch! Certificate may have been altered."

    try:
        payload = json.loads(b64url_decode(payload_b64).decode("utf-8"))
    except Exception:
        return "Tampered", None, "Corrupted token payload."

    if expected_result_hash and payload.get("result_hash") != expected_result_hash:
        return "Tampered", payload, "Result hash mismatch between signed token and database record."

    return "Verified", payload, "Authentic FeedShield verification certificate."
