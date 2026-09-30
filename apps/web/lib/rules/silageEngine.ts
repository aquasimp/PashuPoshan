import silageRules from "./silage_rules.json";

export interface SilageEvaluationInputs {
  ph?: number;
  internalTemp?: number;
  ambientTemp?: number;
  dryMatterPct?: number;
  cropType?: string;
  heatingRate?: number;
  daysOpen?: number;
  visibleMouldPct?: number;
}
export type RiskLevel = "low" | "moderate" | "high" | "indeterminate";
export type DecisionType = "FEED" | "BLEND" | "RE-TEST" | "RE_TEST" | "DISCARD";

export interface SilageEvaluationOutput {
  airIngressRisk: RiskLevel;
  heatingRisk: RiskLevel;
  spoilageRisk: RiskLevel;
  fermentationFailureRisk: RiskLevel;
  mouldRisk: RiskLevel;
  sensorHealthWarning: "normal" | "fault_detected" | "indeterminate";
  overallRisk: "GOOD" | "ATTENTION" | "HIGH RISK";
  actionDecision: DecisionType;
  contributingFactors: string[];
}

export function evaluateSilage(inputs: SilageEvaluationInputs): SilageEvaluationOutput {
  const {
    ph,
    internalTemp,
    ambientTemp,
    dryMatterPct,
    cropType = "maize_silage",
    heatingRate,
    daysOpen,
    visibleMouldPct,
  } = inputs;

  const rules: any = silageRules;
  const contributingFactors: string[] = [];
  const bounds = rules.sensor_validity_bounds || {};

  // 1. Sensor Health Warning
  let sensorFault = false;
  if (ph !== undefined && ph !== null) {
    if (ph < (bounds.ph_min ?? 2.5) || ph > (bounds.ph_max ?? 9.0)) {
      sensorFault = true;
      contributingFactors.push(`pH probe reading ${ph.toFixed(2)} outside physical sensor range.`);
    }
  }
  if (internalTemp !== undefined && internalTemp !== null) {
    if (internalTemp < (bounds.internal_temp_min_c ?? -5.0) || internalTemp > (bounds.internal_temp_max_c ?? 75.0)) {
      sensorFault = true;
      contributingFactors.push(`Internal temp probe reading ${internalTemp.toFixed(1)}°C outside valid sensor range.`);
    }
  }
  if (ambientTemp !== undefined && ambientTemp !== null) {
    if (ambientTemp < (bounds.ambient_temp_min_c ?? -10.0) || ambientTemp > (bounds.ambient_temp_max_c ?? 55.0)) {
      sensorFault = true;
      contributingFactors.push(`Ambient temp reading ${ambientTemp.toFixed(1)}°C outside valid sensor range.`);
    }
  }

  const sensorHealthWarning = sensorFault ? "fault_detected" : "normal";

  // 2. Heating Risk
  const tempRules = rules.temperature_rules || {};
  const warnDelta = tempRules.warning_delta_c ?? 5.0;
  const critDelta = tempRules.critical_delta_c ?? 10.0;

  let heatingRisk: RiskLevel = "indeterminate";
  if (internalTemp !== undefined && internalTemp !== null && ambientTemp !== undefined && ambientTemp !== null) {
    const tempDiff = internalTemp - ambientTemp;
    if (tempDiff >= critDelta) {
      heatingRisk = "high";
      contributingFactors.push(`Internal temperature is ${tempDiff.toFixed(1)}°C above ambient (critical aerobic heating threshold is ${critDelta}°C).`);
    } else if (tempDiff >= warnDelta) {
      heatingRisk = "moderate";
      contributingFactors.push(`Internal temperature is ${tempDiff.toFixed(1)}°C above ambient (elevated heat accumulation).`);
    } else {
      heatingRisk = "low";
    }
  } else if (heatingRate !== undefined && heatingRate !== null && heatingRate >= (tempRules.heating_rate_warning_c_per_day ?? 1.5)) {
    heatingRisk = "moderate";
    contributingFactors.push(`Pit heating rate is rising at ${heatingRate.toFixed(1)}°C/day.`);
  }

  // 3. Fermentation Failure Risk
  const cropBenchmarks =
    rules.crop_ph_benchmarks?.[cropType] || rules.crop_ph_benchmarks?.default || {};
  const dmRules = rules.dry_matter_interactions || {};
  let normMaxPh = cropBenchmarks.normal_max_ph ?? 4.3;
  let critHighPh = cropBenchmarks.critical_high_ph ?? 4.7;

  if (dryMatterPct !== undefined && dryMatterPct !== null && dryMatterPct >= (dmRules.wilted_dry_threshold_pct ?? 45.0)) {
    normMaxPh += dmRules.dry_ph_tolerance_bump ?? 0.35;
    critHighPh += dmRules.dry_ph_tolerance_bump ?? 0.35;
  }

  let fermentationFailureRisk: RiskLevel = "indeterminate";
  if (ph !== undefined && ph !== null) {
    if (ph >= critHighPh) {
      fermentationFailureRisk = "high";
      contributingFactors.push(`pH ${ph.toFixed(2)} exceeds critical stability ceiling (${critHighPh.toFixed(2)}) for ${cropType}.`);
    } else if (ph > normMaxPh) {
      fermentationFailureRisk = "moderate";
      contributingFactors.push(`pH ${ph.toFixed(2)} is above optimal preservation range (${normMaxPh.toFixed(2)}) for ${cropType}.`);
    } else {
      fermentationFailureRisk = "low";
    }

    if (
      dryMatterPct !== undefined &&
      dryMatterPct !== null &&
      dryMatterPct < (dmRules.wet_threshold_pct ?? 30.0) &&
      ph > (dmRules.wet_clostridial_ph_risk ?? 4.5)
    ) {
      fermentationFailureRisk = "high";
      contributingFactors.push(`High moisture (${(100 - dryMatterPct).toFixed(1)}%) combined with pH ${ph.toFixed(2)} creates elevated clostridial / butyric acid risk.`);
    }
  }

  // 4. Air Ingress Risk
  let airIngressRisk: RiskLevel = "indeterminate";
  if (heatingRisk === "high" || (heatingRisk === "moderate" && daysOpen !== undefined && daysOpen > 7)) {
    airIngressRisk = "high";
    contributingFactors.push("Active pit face heating indicates prolonged atmospheric oxygen penetration.");
  } else if (heatingRisk === "moderate") {
    airIngressRisk = "moderate";
  } else if (heatingRisk === "low") {
    airIngressRisk = "low";
  }

  // 5. Mould Risk
  let mouldRisk: RiskLevel = "indeterminate";
  if (visibleMouldPct !== undefined && visibleMouldPct !== null) {
    if (visibleMouldPct > 5.0) {
      mouldRisk = "high";
      contributingFactors.push(`Visible mould patches estimated at ${visibleMouldPct.toFixed(1)}% of pit surface.`);
    } else if (visibleMouldPct > 1.0) {
      mouldRisk = "moderate";
      contributingFactors.push(`Localised mould colonies detected (${visibleMouldPct.toFixed(1)}%).`);
    } else {
      mouldRisk = "low";
    }
  } else if (
    (airIngressRisk === "high" || airIngressRisk === "moderate") &&
    (fermentationFailureRisk === "high" || fermentationFailureRisk === "moderate")
  ) {
    mouldRisk = "moderate";
    contributingFactors.push("Combination of secondary heating and elevated pH promotes fungal sporulation.");
  }

  // 6. Spoilage Hazard
  const hazards = [airIngressRisk, heatingRisk, fermentationFailureRisk, mouldRisk];
  const knownHazards = hazards.filter((h) => h !== "indeterminate");
  let spoilageRisk: RiskLevel = "indeterminate";
  if (hazards.includes("high")) {
    spoilageRisk = "high";
  } else if (hazards.includes("moderate")) {
    spoilageRisk = "moderate";
  } else if (knownHazards.length > 0 && knownHazards.every((h) => h === "low")) {
    spoilageRisk = "low";
  } else {
    spoilageRisk = "indeterminate";
  }

  // 7. Action Decision
  let overallRisk: "GOOD" | "ATTENTION" | "HIGH RISK" = "GOOD";
  let actionDecision: DecisionType = "FEED";

  if (sensorFault) {
    overallRisk = "ATTENTION";
    actionDecision = "RE_TEST";
    contributingFactors.push("Sensor fault detected; recalibrate or replace probe and re-test.");
  } else if (spoilageRisk === "high" || mouldRisk === "high" || fermentationFailureRisk === "high") {
    overallRisk = "HIGH RISK";
    actionDecision = "DISCARD";
  } else if (spoilageRisk === "moderate" || heatingRisk === "moderate" || fermentationFailureRisk === "moderate") {
    overallRisk = "ATTENTION";
    actionDecision = "BLEND";
  } else if (spoilageRisk === "low") {
    overallRisk = "GOOD";
    actionDecision = "FEED";
  } else {
    overallRisk = "ATTENTION";
    actionDecision = "RE_TEST";
  }

  return {
    airIngressRisk,
    heatingRisk,
    spoilageRisk,
    fermentationFailureRisk,
    mouldRisk,
    sensorHealthWarning,
    overallRisk,
    actionDecision,
    contributingFactors,
  };
}
