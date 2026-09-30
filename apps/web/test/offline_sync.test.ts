import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../lib/db";
import { evaluateSilage } from "../lib/rules/silageEngine";
import { generateSampleId, generateClientId } from "../lib/sync";

describe("FeedShield Offline-First PWA & Dexie Sync Engine", () => {
  beforeEach(async () => {
    await db.samples.clear();
    await db.analyses.clear();
    await db.advisories.clear();
    await db.outbox.clear();
  });

  it("creates an offline sample record with unique FS ID and SAVED_ON_DEVICE status", async () => {
    const sampleId = generateSampleId();
    const clientId = generateClientId();
    const now = new Date().toISOString();

    expect(sampleId).toMatch(/^FS-\d{8}-[A-Z0-9]{4}$/);

    await db.samples.put({
      id: sampleId,
      clientId,
      sampleType: "silage",
      cropOrFeedName: "Corn Silage (Bunker #1)",
      physicalForm: "chopped_silage",
      collectedAt: now,
      syncStatus: "SAVED_ON_DEVICE",
      updatedAt: now,
    });

    const saved = await db.samples.get(sampleId);
    expect(saved).toBeDefined();
    expect(saved?.syncStatus).toBe("SAVED_ON_DEVICE");
    expect(saved?.cropOrFeedName).toBe("Corn Silage (Bunker #1)");
  });

  it("evaluates silage risks entirely on-device without network dependency", () => {
    // Testing Healthy Corn Silage on client
    const healthy = evaluateSilage({
      ph: 4.0,
      internalTemp: 26.0,
      ambientTemp: 24.5,
      dryMatterPct: 34.0,
    });

    expect(healthy.overallRisk).toBe("GOOD");
    expect(healthy.actionDecision).toBe("FEED");
    expect(healthy.heatingRisk).toBe("low");

    // Testing Moderate Aerobic Warning on client
    const moderate = evaluateSilage({
      ph: 4.4,
      internalTemp: 32.0,
      ambientTemp: 25.0,
      dryMatterPct: 35.0,
    });

    expect(moderate.overallRisk).toBe("ATTENTION");
    expect(moderate.actionDecision).toBe("BLEND");

    // Testing Severe Heating & Spoilage
    const severe = evaluateSilage({
      ph: 5.3,
      internalTemp: 41.0,
      ambientTemp: 25.0,
      dryMatterPct: 38.0,
    });

    expect(severe.overallRisk).toBe("HIGH RISK");
    expect(severe.actionDecision).toBe("DISCARD");
    expect(severe.heatingRisk).toBe("high");
  });

  it("enqueues analysis into Dexie outbox and transitions to SYNCED upon push", async () => {
    const sampleId = generateSampleId();
    const clientId = generateClientId();
    const now = new Date().toISOString();

    await db.samples.put({
      id: sampleId,
      clientId,
      sampleType: "silage",
      cropOrFeedName: "Sorghum Silage",
      collectedAt: now,
      syncStatus: "SAVED_ON_DEVICE",
      updatedAt: now,
    });

    await db.outbox.put({
      id: `outbox-${sampleId}`,
      clientId,
      entityType: "sample",
      payload: { id: sampleId, crop: "Sorghum Silage" },
      status: "pending",
      retryCount: 0,
      createdAt: now,
    });

    const pendingCount = await db.outbox.where("status").equals("pending").count();
    expect(pendingCount).toBe(1);

    // Simulate successful sync push
    await db.outbox.update(`outbox-${sampleId}`, { status: "synced" });
    await db.samples.update(sampleId, { syncStatus: "SYNCED" });

    const syncedSample = await db.samples.get(sampleId);
    expect(syncedSample?.syncStatus).toBe("SYNCED");

    const remainingPending = await db.outbox.where("status").equals("pending").count();
    expect(remainingPending).toBe(0);
  });
});
