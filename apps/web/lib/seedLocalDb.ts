import { db, LocalSample, LocalAnalysis, LocalAdvisory } from "./db";

export async function ensureDemoDataLoaded() {
  try {
    const count = await db.samples.count();
    if (count > 0) return;

    const samples: LocalSample[] = [
      {
        id: "FS-20260930-H801",
        clientId: "demo-sample-01",
        sampleType: "silage",
        cropOrFeedName: "Maize Silage (Pit #1)",
        physicalForm: "Chopped Silage",
        collectedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        syncStatus: "SYNCED",
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        metadata: {
          pit: "Bunker Pit #1",
          ph: 4.0,
          internalTemp: 27.5,
          ambientTemp: 25.0,
          dryMatter: 34.0,
        },
      },
      {
        id: "FS-20260930-W402",
        clientId: "demo-sample-02",
        sampleType: "silage",
        cropOrFeedName: "Sorghum Silage (Pit #2 - Shoulder)",
        physicalForm: "Chopped Silage",
        collectedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        syncStatus: "SAVED_ON_DEVICE",
        updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        metadata: {
          pit: "Bunker Pit #2",
          ph: 5.4,
          internalTemp: 38.0,
          ambientTemp: 26.0,
          dryMatter: 37.5,
        },
      },
      {
        id: "FS-20260929-F903",
        clientId: "demo-sample-03",
        sampleType: "feed",
        cropOrFeedName: "Cattle Feed Pellets (Lot 14)",
        physicalForm: "Pellets",
        collectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        syncStatus: "SYNCED",
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        metadata: {
          lot: "Lot 14-North",
          visualQuality: "Clean, dry, uniform pellets",
        },
      },
      {
        id: "FS-20260928-S104",
        clientId: "demo-sample-04",
        sampleType: "silage",
        cropOrFeedName: "Corn Silage (Bunker #3 - Aerobic Crust)",
        physicalForm: "Chopped Silage",
        collectedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        syncStatus: "SYNCED",
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        metadata: {
          pit: "Bunker #3",
          ph: 5.9,
          internalTemp: 44.0,
          ambientTemp: 28.0,
          dryMatter: 23.5,
          visibleMouldPct: 15,
        },
      },
    ];

    const analyses: LocalAnalysis[] = [
      {
        id: "analysis-01",
        sampleId: "FS-20260930-H801",
        overallRisk: "GOOD",
        actionDecision: "FEED",
        inputCompleteness: {
          score: 85,
          modalitiesUsed: ["rgb", "ph_probe", "temp_probe"],
          modalitiesMissing: ["nir"],
        },
        predictions: [
          {
            target: "Silage pH",
            value: 4.0,
            unit: "pH",
            evidenceTag: "SENSOR-MEASURED",
            confidence: 0.95,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          },
          {
            target: "Core Temperature",
            value: 27.5,
            unit: "°C",
            evidenceTag: "SENSOR-MEASURED",
            confidence: 0.95,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          },
          {
            target: "Dry Matter (Estimated)",
            value: 34.0,
            unit: "% DM",
            evidenceTag: "ESTIMATED",
            confidence: 0.85,
            modelVersion: "silage-estimator-1.0",
            dataProvenance: "synthetic_demo",
            applicabilityDomain: "IN_DOMAIN",
          },
        ],
        silageAssessment: {
          airIngressRisk: "low",
          heatingRisk: "low",
          spoilageRisk: "low",
          fermentationFailureRisk: "low",
          mouldRisk: "low",
          sensorHealthWarning: "normal",
        },
        analyzedOnDevice: true,
        serverSynced: true,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "analysis-02",
        sampleId: "FS-20260930-W402",
        overallRisk: "ATTENTION",
        actionDecision: "BLEND",
        inputCompleteness: {
          score: 85,
          modalitiesUsed: ["rgb", "ph_probe", "temp_probe"],
          modalitiesMissing: ["nir"],
        },
        predictions: [
          {
            target: "Silage pH",
            value: 5.4,
            unit: "pH",
            evidenceTag: "SENSOR-MEASURED",
            confidence: 0.92,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          },
          {
            target: "Core Temperature",
            value: 38.0,
            unit: "°C",
            evidenceTag: "SENSOR-MEASURED",
            confidence: 0.92,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          },
          {
            target: "Dry Matter (Estimated)",
            value: 37.5,
            unit: "% DM",
            evidenceTag: "ESTIMATED",
            confidence: 0.85,
            modelVersion: "silage-estimator-1.0",
            dataProvenance: "synthetic_demo",
            applicabilityDomain: "IN_DOMAIN",
          },
        ],
        silageAssessment: {
          airIngressRisk: "high",
          heatingRisk: "high",
          spoilageRisk: "moderate",
          fermentationFailureRisk: "moderate",
          mouldRisk: "moderate",
          sensorHealthWarning: "normal",
        },
        analyzedOnDevice: true,
        serverSynced: false,
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: "analysis-03",
        sampleId: "FS-20260929-F903",
        overallRisk: "GOOD",
        actionDecision: "FEED",
        inputCompleteness: {
          score: 40,
          modalitiesUsed: ["rgb"],
          modalitiesMissing: ["nir", "sensors", "assay"],
        },
        predictions: [
          {
            target: "Visible Mould",
            value: 0.0,
            unit: "%",
            evidenceTag: "DETECTED",
            confidence: 0.94,
            modelVersion: "rgb-mould-v1.0",
            dataProvenance: "synthetic_demo",
            applicabilityDomain: "IN_DOMAIN",
          },
        ],
        analyzedOnDevice: true,
        serverSynced: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "analysis-04",
        sampleId: "FS-20260928-S104",
        overallRisk: "HIGH RISK",
        actionDecision: "DISCARD",
        inputCompleteness: {
          score: 85,
          modalitiesUsed: ["rgb", "ph_probe", "temp_probe"],
          modalitiesMissing: ["nir"],
        },
        predictions: [
          {
            target: "Silage pH",
            value: 5.9,
            unit: "pH",
            evidenceTag: "SENSOR-MEASURED",
            confidence: 0.94,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          },
          {
            target: "Core Temperature",
            value: 44.0,
            unit: "°C",
            evidenceTag: "SENSOR-MEASURED",
            confidence: 0.94,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          },
        ],
        silageAssessment: {
          airIngressRisk: "high",
          heatingRisk: "high",
          spoilageRisk: "high",
          fermentationFailureRisk: "high",
          mouldRisk: "high",
          sensorHealthWarning: "normal",
        },
        analyzedOnDevice: true,
        serverSynced: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];

    const advisories: LocalAdvisory[] = [
      {
        id: "advisory-01",
        analysisId: "analysis-01",
        headline: "Optimal Fermentation Quality",
        chain: {
          result: "Lactic acid dominant fermentation with pH 4.0 and ambient thermal stability.",
          issue: "No significant spoilage or air ingress hazards identified.",
          action: "Safe to feed lactating dairy cows as part of daily total mixed ration (TMR).",
          storage: "Maintain tight bunker plastic seal after each face removal.",
          risk: "Low spoilage hazard; excellent preservation of digestible nutrients.",
          nextStep: "Maintain weekly core probe testing to verify bunker stability.",
        },
        decision: "FEED",
      },
      {
        id: "advisory-02",
        analysisId: "analysis-02",
        headline: "Aerobic Heating & Shoulder Air Ingress",
        chain: {
          result: "Elevated core temperature (+12°C above ambient) with elevated pH 5.4.",
          issue: "Air ingress along bunker shoulder triggering yeast aerobic proliferation.",
          action: "Do not feed pure shoulder layer. Blend unaffected interior silage with high-quality dry fodder at a maximum 30% ratio.",
          storage: "Cut away deteriorated shoulder edge; weigh down plastic with double gravel bags.",
          risk: "Feeding hot silage reduces rumen motility and causes butterfat depression.",
          nextStep: "Re-test bunker core after 48 hours to confirm temperature descent.",
        },
        decision: "BLEND",
      },
      {
        id: "advisory-03",
        analysisId: "analysis-03",
        headline: "Visual Pellet Integrity Normal",
        chain: {
          result: "Pellet consistency is uniform with zero visible mould spores.",
          issue: "Urea cannot be assessed from this image alone. Nutrition: Not measured without NIR.",
          action: "Proceed with standard herd ration feeding.",
          storage: "Store feed bags on wooden pallets away from damp concrete walls.",
          risk: "Low physical hazard.",
          nextStep: "Optional lab NIR scan for exact crude protein and energy verification.",
        },
        decision: "FEED",
      },
      {
        id: "advisory-04",
        analysisId: "analysis-04",
        headline: "Severe Clostridial & Mould Spoilage",
        chain: {
          result: "pH 5.9 with core heating to 44°C and visible mould proliferation.",
          issue: "Fermentation failure and extensive aerobic degradation with butyric acid presence.",
          action: "DISCARD immediately. Do NOT feed to pregnant or lactating animals.",
          storage: "Excavate spoiled outer layer down to unaffected silage face.",
          risk: "High risk of mycotoxicosis, acute abomasal displacement, and severe milk loss.",
          nextStep: "Submit sample to accredited animal nutrition laboratory for mycotoxin assay.",
        },
        decision: "DISCARD",
      },
    ];

    await db.samples.bulkAdd(samples);
    await db.analyses.bulkAdd(analyses);
    await db.advisories.bulkAdd(advisories);
    console.log("FeedShield demo data seeded in local Dexie DB.");
  } catch (err) {
    console.error("Failed to seed demo data in Dexie:", err);
  }
}
