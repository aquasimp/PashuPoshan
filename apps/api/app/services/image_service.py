import os
import uuid
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
from fastapi import UploadFile, HTTPException, status
from apps.api.app.config import settings
from ml.rgb_engine import RGBQualityAndMouldEngine

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

rgb_engine = RGBQualityAndMouldEngine()


def process_and_save_image(file: UploadFile) -> dict:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file.content_type}'. Allowed types: {list(ALLOWED_MIME_TYPES)}"
        )

    file_bytes = file.file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 15MB ({len(file_bytes)} bytes uploaded)."
        )

    # Decode via OpenCV
    nparr = np.frombuffer(file_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to decode image data. Corrupted or unsupported format."
        )

    # 1. Run Quality Check
    qa_results = rgb_engine.evaluate_quality(img_bgr)

    # 2. Strip EXIF via PIL recreation
    pil_img = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
    # Reset file pointer and re-save without EXIF metadata
    image_id = str(uuid.uuid4())
    filename = f"{image_id}.jpg"
    thumb_filename = f"{image_id}_thumb.jpg"

    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    thumb_path = os.path.join(settings.UPLOAD_DIR, thumb_filename)

    # Save clean stripped compressed JPEG
    pil_img.save(file_path, "JPEG", quality=85, optimize=True)

    # Create thumbnail
    pil_thumb = pil_img.copy()
    pil_thumb.thumbnail((256, 256))
    pil_thumb.save(thumb_path, "JPEG", quality=80)

    h, w, _ = img_bgr.shape

    return {
        "id": image_id,
        "file_path": file_path,
        "thumbnail_path": thumb_path,
        "width": w,
        "height": h,
        "blur_score": qa_results["blur_score"],
        "exposure_score": qa_results["exposure_score"],
        "glare_score": qa_results["glare_pct"],
        "is_acceptable": qa_results["is_acceptable"],
        "retake_hint": qa_results["retake_hint"],
    }
