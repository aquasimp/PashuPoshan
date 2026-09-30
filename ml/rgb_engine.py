from typing import Dict, Any, Tuple
import cv2
import numpy as np


class RGBQualityAndMouldEngine:
    """
    Classical Computer Vision Engine for image quality validation
    and visible mould estimation per CLAUDE.md Section 0.7.
    """
    def __init__(
        self,
        blur_threshold: float = 80.0,
        underexposed_threshold: float = 45.0,
        overexposed_threshold: float = 220.0,
        glare_threshold_pct: float = 8.0,
    ):
        self.blur_threshold = blur_threshold
        self.underexposed_threshold = underexposed_threshold
        self.overexposed_threshold = overexposed_threshold
        self.glare_threshold_pct = glare_threshold_pct

    def evaluate_quality(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Evaluates blur, exposure, glare, and framing.
        Returns is_acceptable, scores, and retake hint if defective.
        """
        if image_bgr is None or image_bgr.size == 0:
            return {
                "is_acceptable": False,
                "retake_hint": "No image data provided.",
                "blur_score": 0.0,
                "exposure_score": 0.0,
                "glare_pct": 0.0,
            }

        # 1. Blur via Laplacian variance
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # 2. Exposure via mean luminance
        mean_luminance = float(np.mean(gray))

        # 3. Glare via saturated pixels (luminance > 250)
        saturated_pixels = np.sum(gray >= 250)
        total_pixels = gray.size
        glare_pct = float((saturated_pixels / total_pixels) * 100.0)

        # 4. Framing via aspect ratio and center region variance
        h, w = gray.shape
        center_crop = gray[int(h * 0.25):int(h * 0.75), int(w * 0.25):int(w * 0.75)]
        center_var = float(np.var(center_crop))

        is_acceptable = True
        retake_hint = None

        if mean_luminance < self.underexposed_threshold:
            is_acceptable = False
            retake_hint = "Improve lighting."
        elif mean_luminance > self.overexposed_threshold or glare_pct > self.glare_threshold_pct:
            is_acceptable = False
            retake_hint = "Improve lighting."
        elif laplacian_var < self.blur_threshold:
            is_acceptable = False
            retake_hint = "Hold camera steady."
        elif center_var < 15.0:
            is_acceptable = False
            retake_hint = "Move closer."

        return {
            "is_acceptable": is_acceptable,
            "retake_hint": retake_hint,
            "blur_score": round(laplacian_var, 2),
            "exposure_score": round(mean_luminance, 2),
            "glare_pct": round(glare_pct, 2),
            "center_variance": round(center_var, 2),
        }

    def estimate_visible_mould(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Classical CV heuristic for visible surface mold discoloration.
        Tagged ESTIMATED per Section 0.6.
        """
        if image_bgr is None or image_bgr.size == 0:
            return {
                "visible_mould_pct": None,
                "evidence_tag": "ESTIMATED",
                "risk": "indeterminate",
                "disclaimer": "No image available for visible mould estimation.",
            }

        hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
        
        # Mold discoloration in silage typically appears as grayish-white or bluish-green patches
        # White / gray mold mask (low saturation, high value)
        white_gray_mask = cv2.inRange(hsv, np.array([0, 0, 180]), np.array([180, 45, 255]))
        # Green / blue-green mold mask (Hue 40-90, moderate saturation)
        green_mold_mask = cv2.inRange(hsv, np.array([40, 50, 60]), np.array([90, 255, 200]))

        combined_mold_mask = cv2.bitwise_or(white_gray_mask, green_mold_mask)
        mold_pixels = np.count_nonzero(combined_mold_mask)
        total_pixels = image_bgr.shape[0] * image_bgr.shape[1]
        mould_pct = float((mold_pixels / total_pixels) * 100.0)

        # Risk stratification
        if mould_pct > 5.0:
            risk = "high"
        elif mould_pct > 1.0:
            risk = "moderate"
        else:
            risk = "low"

        return {
            "visible_mould_pct": round(mould_pct, 2),
            "evidence_tag": "ESTIMATED",
            "risk": risk,
            "label": "Visible mould risk",
            "disclaimer": "Heuristic visual estimate only. Does not measure mycotoxin concentration.",
        }
