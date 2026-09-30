from typing import Dict, Any, Optional, List
import yaml
import os
from pathlib import Path


def load_rules(rules_path: Optional[str] = None) -> dict:
    if rules_path is None:
        rules_path = str(Path(__file__).resolve().parent / "silage_rules.yaml")
    with open(rules_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


DEFAULT_RULES = load_rules()


class SilageRiskEngine:
    def __init__(self, rules: Optional[dict] = None):
        self.rules = rules or DEFAULT_RULES

    def evaluate(
        self,
        ph: Optional[float] = None,
        internal_temp: Optional[float] = None,
        ambient_temp: Optional[float] = None,
        dry_matter_pct: Optional[float] = None,
        crop_type: str = "maize_silage",
        heating_rate: Optional[float] = None,
        days_open: Optional[int] = None,
        visible_mould_pct: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates silage risks across 6 canonical outputs.
        Enforces:
        1. No alert on absolute temperature alone (only temp differential or heating rate).
        2. Dry matter interaction with pH (wilted dry silage tolerates higher pH).
        3. Missing inputs return 'indeterminate', NEVER assumed zeros.
        4. Sensor sanity checks return sensor fault warning.
        """
        contributing_factors: List[str] = []
        bounds = self.rules.get("sensor_validity_bounds", {})

        # 1. Sensor Health Warning
        sensor_fault = False
        if ph is not None:
            if ph < bounds.get("ph_min", 2.5) or ph > bounds.get("ph_max", 9.0):
                sensor_fault = True
                contributing_factors.append(f"pH probe reading {ph:.2f} outside physical sensor range.")
        if internal_temp is not None:
            if internal_temp < bounds.get("internal_temp_min_c", -5.0) or internal_temp > bounds.get("internal_temp_max_c", 75.0):
                sensor_fault = True
                contributing_factors.append(f"Internal temp probe reading {internal_temp:.1f}°C outside valid sensor range.")
        if ambient_temp is not None:
            if ambient_temp < bounds.get("ambient_temp_min_c", -10.0) or ambient_temp > bounds.get("ambient_temp_max_c", 55.0):
                sensor_fault = True
                contributing_factors.append(f"Ambient temp reading {ambient_temp:.1f}°C outside valid sensor range.")

        sensor_health = "fault_detected" if sensor_fault else "normal"

        # 2. Heating Risk (Requires BOTH internal_temp AND ambient_temp)
        temp_rules = self.rules.get("temperature_rules", {})
        warn_delta = temp_rules.get("warning_delta_c", 5.0)
        crit_delta = temp_rules.get("critical_delta_c", 10.0)

        if internal_temp is not None and ambient_temp is not None:
            temp_diff = internal_temp - ambient_temp
            if temp_diff >= crit_delta:
                heating_risk = "high"
                contributing_factors.append(f"Internal temperature is {temp_diff:.1f}°C above ambient (critical aerobic heating threshold is {crit_delta}°C).")
            elif temp_diff >= warn_delta:
                heating_risk = "moderate"
                contributing_factors.append(f"Internal temperature is {temp_diff:.1f}°C above ambient (elevated heat accumulation).")
            else:
                heating_risk = "low"
        elif heating_rate is not None and heating_rate >= temp_rules.get("heating_rate_warning_c_per_day", 1.5):
            heating_risk = "moderate"
            contributing_factors.append(f"Pit heating rate is rising at {heating_rate:.1f}°C/day.")
        else:
            heating_risk = "indeterminate"

        # 3. Fermentation Failure Risk (pH evaluated in context of crop type and DM)
        crop_benchmarks = self.rules.get("crop_ph_benchmarks", {}).get(
            crop_type, self.rules.get("crop_ph_benchmarks", {}).get("default", {})
        )
        dm_rules = self.rules.get("dry_matter_interactions", {})
        norm_max_ph = crop_benchmarks.get("normal_max_ph", 4.3)
        crit_high_ph = crop_benchmarks.get("critical_high_ph", 4.7)

        # DM Context Adjustment
        if dry_matter_pct is not None and dry_matter_pct >= dm_rules.get("wilted_dry_threshold_pct", 45.0):
            # Drier/wilted silage has reduced lactic buffering capacity and safely tolerates slightly higher pH
            norm_max_ph += dm_rules.get("dry_ph_tolerance_bump", 0.35)
            crit_high_ph += dm_rules.get("dry_ph_tolerance_bump", 0.35)

        if ph is not None:
            if ph >= crit_high_ph:
                fermentation_risk = "high"
                contributing_factors.append(f"pH {ph:.2f} exceeds critical stability ceiling ({crit_high_ph:.2f}) for {crop_type}.")
            elif ph > norm_max_ph:
                fermentation_risk = "moderate"
                contributing_factors.append(f"pH {ph:.2f} is above optimal preservation range ({norm_max_ph:.2f}) for {crop_type}.")
            else:
                fermentation_risk = "low"
            
            # Check clostridial risk in wet silage
            if dry_matter_pct is not None and dry_matter_pct < dm_rules.get("wet_threshold_pct", 30.0) and ph > dm_rules.get("wet_clostridial_ph_risk", 4.5):
                fermentation_risk = "high"
                contributing_factors.append(f"High moisture ({100 - dry_matter_pct:.1f}%) combined with pH {ph:.2f} creates elevated clostridial / butyric acid risk.")
        else:
            fermentation_risk = "indeterminate"

        # 4. Air Ingress Risk (Combination of heating + days open or high temp diff)
        if heating_risk == "high" or (heating_risk == "moderate" and days_open is not None and days_open > 7):
            air_ingress_risk = "high"
            contributing_factors.append("Active pit face heating indicates prolonged atmospheric oxygen penetration.")
        elif heating_risk == "moderate":
            air_ingress_risk = "moderate"
        elif heating_risk == "low":
            air_ingress_risk = "low"
        else:
            air_ingress_risk = "indeterminate"

        # 5. Mould Risk
        if visible_mould_pct is not None:
            if visible_mould_pct > 5.0:
                mould_risk = "high"
                contributing_factors.append(f"Visible mould patches estimated at {visible_mould_pct:.1f}% of pit surface.")
            elif visible_mould_pct > 1.0:
                mould_risk = "moderate"
                contributing_factors.append(f"Localised mould colonies detected ({visible_mould_pct:.1f}%).")
            else:
                mould_risk = "low"
        elif air_ingress_risk in ["high", "moderate"] and fermentation_risk in ["high", "moderate"]:
            mould_risk = "moderate"
            contributing_factors.append("Combination of secondary heating and elevated pH promotes fungal sporulation.")
        else:
            mould_risk = "indeterminate"

        # 6. Spoilage Hazard (Composite worst risk)
        hazards = [air_ingress_risk, heating_risk, fermentation_risk, mould_risk]
        known_hazards = [h for h in hazards if h != "indeterminate"]
        if "high" in hazards:
            spoilage_risk = "high"
        elif "moderate" in hazards:
            spoilage_risk = "moderate"
        elif known_hazards and all(h == "low" for h in known_hazards):
            spoilage_risk = "low"
        else:
            spoilage_risk = "indeterminate"

        # 7. Action Decision (FEED / BLEND / RE-TEST / DISCARD)
        if sensor_fault:
            overall_risk = "ATTENTION"
            decision = "RE_TEST"
            contributing_factors.append("Sensor fault detected; recalibrate or replace probe and re-test.")
        elif spoilage_risk == "high" or mould_risk == "high" or fermentation_risk == "high":
            overall_risk = "HIGH RISK"
            decision = "DISCARD"
        elif spoilage_risk == "moderate" or heating_risk == "moderate" or fermentation_risk == "moderate":
            overall_risk = "ATTENTION"
            decision = "BLEND"
        elif spoilage_risk == "low":
            overall_risk = "GOOD"
            decision = "FEED"
        else:
            overall_risk = "ATTENTION"
            decision = "RE_TEST"

        return {
            "air_ingress_risk": air_ingress_risk,
            "heating_risk": heating_risk,
            "spoilage_risk": spoilage_risk,
            "fermentation_failure_risk": fermentation_risk,
            "mould_risk": mould_risk,
            "sensor_health_warning": sensor_health,
            "overall_risk": overall_risk,
            "action_decision": decision,
            "contributing_factors": contributing_factors,
        }
