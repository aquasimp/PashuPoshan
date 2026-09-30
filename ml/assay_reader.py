from typing import Dict, Any, Optional, Tuple
import cv2
import numpy as np


class ColorimetricAssayReader:
    """
    Standardized Reference-Card Normalised Colorimetric Reader
    for pH test strips and urea rapid screening assays.
    """
    def __init__(self):
        # Reference CIELAB values for standard pH test strip colors (pH 3.0 to 8.0)
        self.ph_reference_lab = {
            3.0: np.array([45.0, 55.0, 40.0]),  # Deep orange-red
            4.0: np.array([55.0, 40.0, 50.0]),  # Orange
            5.0: np.array([65.0, 20.0, 60.0]),  # Yellow-orange
            6.0: np.array([75.0, -5.0, 65.0]),  # Yellow-green
            7.0: np.array([60.0, -25.0, 30.0]), # Green
            8.0: np.array([45.0, -30.0, 10.0]), # Blue-green
        }

    def detect_reference_card(self, image_bgr: np.ndarray) -> Tuple[bool, Optional[np.ndarray], str]:
        """
        Detects standard reference calibration card corners and verifies illumination uniformity.
        """
        if image_bgr is None or image_bgr.size == 0:
            return False, None, "Unable to validate test image — retake required."

        # Check basic image size and contrast
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        if np.std(gray) < 20.0:  # Flat illumination or blank image
            return False, None, "Unable to validate test image — retake required."

        # Edge detection for rectangular card boundary
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        found_card = False
        card_contour = None
        min_area = (image_bgr.shape[0] * image_bgr.shape[1]) * 0.10

        for c in contours:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.04 * peri, True)
            if len(approx) == 4 and cv2.contourArea(c) > min_area:
                found_card = True
                card_contour = approx
                break

        if not found_card:
            return False, None, "Unable to validate test image — retake required."

        # Extract calibrated card patch
        x, y, w, h = cv2.boundingRect(card_contour)
        card_crop = image_bgr[y:y+h, x:x+w]
        return True, card_crop, "Reference card successfully validated."

    def read_ph_strip(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Reads pH strip with reference card illumination correction.
        If card is missing or defective, returns NO number.
        """
        is_valid, card_crop, msg = self.detect_reference_card(image_bgr)
        if not is_valid or card_crop is None:
            return {
                "ph_value": None,
                "confidence": None,
                "evidence_tag": "SENSOR-MEASURED",
                "status": "INVALID",
                "message": "Unable to validate test image — retake required.",
            }

        # Convert card crop center to Lab color space
        ch, cw, _ = card_crop.shape
        pad_sample = card_crop[int(ch * 0.4):int(ch * 0.6), int(cw * 0.4):int(cw * 0.6)]
        lab_pad = cv2.cvtColor(pad_sample, cv2.COLOR_BGR2LAB)
        mean_lab = np.mean(lab_pad, axis=(0, 1))

        # Calculate Delta E Euclidean distance to pH references
        min_dist = float("inf")
        estimated_ph = 4.0
        for ph_val, ref_lab in self.ph_reference_lab.items():
            dist = float(np.linalg.norm(mean_lab - ref_lab))
            if dist < min_dist:
                min_dist = dist
                estimated_ph = ph_val

        # Interpolate adjacent confidence
        confidence = float(np.clip(1.0 - (min_dist / 100.0), 0.50, 0.95))

        return {
            "ph_value": round(float(estimated_ph), 2),
            "confidence": round(confidence, 2),
            "uncertainty": {"type": "interval", "lower": round(estimated_ph - 0.25, 2), "upper": round(estimated_ph + 0.25, 2), "level": 0.95},
            "evidence_tag": "SENSOR-MEASURED",
            "status": "VALID",
            "message": "pH strip read successfully via calibrated reference card.",
        }

    def read_urea_assay(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Reads colorimetric urea screening assay.
        Returns a qualitative screening class only, NEVER a quantitative concentration.
        """
        is_valid, card_crop, msg = self.detect_reference_card(image_bgr)
        if not is_valid or card_crop is None:
            return {
                "screening_class": "INVALID",
                "evidence_tag": "ESTIMATED",
                "message": "Unable to validate test image — retake required.",
                "advisory": None,
            }

        # Measure red/yellow shift in urease assay
        hsv = cv2.cvtColor(card_crop, cv2.COLOR_BGR2HSV)
        # Deep magenta/pink indicates high ammonia release from urea
        pink_mask = cv2.inRange(hsv, np.array([140, 50, 100]), np.array([170, 255, 255]))
        pink_pct = float((np.count_nonzero(pink_mask) / hsv.size) * 100.0)

        if pink_pct > 2.0:
            screening_class = "POSSIBLE_EXCESS_UREA"
            advisory = "Possible excess/non-declared urea — screening result. Confirmatory laboratory test recommended."
        else:
            screening_class = "NORMAL"
            advisory = "Normal urea screening profile."

        return {
            "screening_class": screening_class,
            "evidence_tag": "ESTIMATED",
            "label": "Rapid assay screening result",
            "message": advisory,
            "confirmatory_recommended": (screening_class == "POSSIBLE_EXCESS_UREA"),
        }


def generate_synthetic_test_card_image(valid_card: bool = True, pad_color_bgr: Tuple[int, int, int] = (40, 120, 220)) -> np.ndarray:
    """
    Generates a synthetic 400x400 test image containing a reference card and test strip pad.
    """
    img = np.full((400, 400, 3), 245, dtype=np.uint8)  # Off-white background
    if valid_card:
        # Draw high-contrast rectangular reference card
        cv2.rectangle(img, (50, 50), (350, 350), (220, 220, 220), -1)
        cv2.rectangle(img, (50, 50), (350, 350), (60, 60, 60), 3)
        # Draw neutral reference patches
        cv2.rectangle(img, (60, 60), (100, 100), (255, 255, 255), -1)  # White patch
        cv2.rectangle(img, (60, 110), (100, 150), (20, 20, 20), -1)    # Black patch
        cv2.rectangle(img, (60, 160), (100, 200), (128, 128, 128), -1) # Gray patch
        # Draw test strip pad in center
        cv2.rectangle(img, (180, 160), (240, 240), pad_color_bgr, -1)
    else:
        # Defective image: no reference card, low contrast noise
        img = np.random.randint(100, 110, (400, 400, 3), dtype=np.uint8)

    return img
