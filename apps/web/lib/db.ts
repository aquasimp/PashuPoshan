import Dexie, { Table } from "dexie";

export interface LocalSample {
  id: string; // FS-YYYYMMDD-XXXX or temp client UUID
  clientId: string; // Client UUID for idempotency
  sampleType: "feed" | "silage" | "fodder";
  cropOrFeedName: string;
  physicalForm?: string;
  collectedAt: string;
  syncStatus: "SAVED_ON_DEVICE" | "QUEUED" | "SYNCING" | "SYNCED" | "FAILED";
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface LocalImage {
  id: string;
  sampleId: string;
  dataUrl: string;
  blurScore?: number;
  glareScore?: number;
  exposureScore?: number;
  isAcceptable: boolean;
  createdAt: string;
}

export interface LocalAnalysis {
  id: string;
  sampleId: string;
  overallRisk: "GOOD" | "ATTENTION" | "HIGH RISK";
  actionDecision: "FEED" | "BLEND" | "RE-TEST" | "RE_TEST" | "DISCARD";
  inputCompleteness: {
    score: number;
    modalitiesUsed: string[];
    modalitiesMissing: string[];
  };
  predictions: Array<{
    target: string;
    value: number | null;
    unit: string;
    evidenceTag: string;
    confidence?: number;
    uncertainty?: any;
    modelVersion: string;
    dataProvenance: string;
    applicabilityDomain: string;
  }>;
  silageAssessment?: {
    airIngressRisk: string;
    heatingRisk: string;
    spoilageRisk: string;
    fermentationFailureRisk: string;
    mouldRisk: string;
    sensorHealthWarning: string;
  };
  analyzedOnDevice: boolean;
  serverSynced: boolean;
  createdAt: string;
}

export interface LocalAdvisory {
  id: string;
  analysisId: string;
  headline: string;
  chain: {
    result: string;
    issue: string;
    action: string;
    storage: string;
    risk: string;
    nextStep: string;
  };
  decision: "FEED" | "BLEND" | "RE-TEST" | "RE_TEST" | "DISCARD";
}

export interface OutboxItem {
  id: string;
  clientId: string;
  entityType: "sample" | "image" | "sensor_reading";
  payload: any;
  status: "pending" | "syncing" | "synced" | "failed";
  retryCount: number;
  lastError?: string;
  createdAt: string;
}

export class FeedShieldDatabase extends Dexie {
  samples!: Table<LocalSample, string>;
  images!: Table<LocalImage, string>;
  analyses!: Table<LocalAnalysis, string>;
  advisories!: Table<LocalAdvisory, string>;
  outbox!: Table<OutboxItem, string>;

  constructor() {
    super("FeedShieldLocalDB");
    this.version(1).stores({
      samples: "id, clientId, sampleType, syncStatus, collectedAt",
      images: "id, sampleId, isAcceptable",
      analyses: "id, sampleId, overallRisk, analyzedOnDevice, createdAt",
      advisories: "id, analysisId, decision",
      outbox: "id, clientId, entityType, status, createdAt",
    });
  }
}

export const db = new FeedShieldDatabase();
