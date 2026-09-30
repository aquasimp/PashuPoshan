import { describe, it, expect } from "vitest";
import { evaluateSilage } from "../lib/rules/silageEngine";
import goldenCases from "../../../ml/tests/golden/silage_cases.json";

describe("Silage Rules Engine Parity Guarantee (Vitest vs Pytest)", () => {
  goldenCases.forEach((c: any) => {
    it(`evaluates ${c.id}: ${c.description}`, () => {
      const inputs = c.inputs;
      const expected = c.expected;

      const result = evaluateSilage({
        ph: inputs.ph,
        internalTemp: inputs.internal_temp,
        ambientTemp: inputs.ambient_temp,
        dryMatterPct: inputs.dry_matter_pct,
        cropType: inputs.crop_type || "maize_silage",
        heatingRate: inputs.heating_rate,
        daysOpen: inputs.days_open,
        visibleMouldPct: inputs.visible_mould_pct,
      });

      expect(result.airIngressRisk).toBe(expected.air_ingress_risk);
      expect(result.heatingRisk).toBe(expected.heating_risk);
      expect(result.spoilageRisk).toBe(expected.spoilage_risk);
      expect(result.fermentationFailureRisk).toBe(expected.fermentation_failure_risk);
      expect(result.mouldRisk).toBe(expected.mould_risk);
      expect(result.sensorHealthWarning).toBe(expected.sensor_health_warning);
      expect(result.overallRisk).toBe(expected.overall_risk);
      expect(result.actionDecision).toBe(expected.action_decision);
    });
  });
});
