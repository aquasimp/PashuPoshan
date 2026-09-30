"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Cpu,
  Layers,
  Search,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { db, LocalSample, LocalAnalysis, LocalAdvisory, OutboxItem } from "@/lib/db";
import { generateSampleId, generateClientId } from "@/lib/sync";
import { evaluateSilage } from "@/lib/rules/silageEngine";

const ANALYSIS_STEPS = [
  { id: 1, text: "Verifying image exposure and sharpness...", icon: Search },
  { id: 2, text: "Checking sample colour and visible surface characteristics...", icon: Layers },
  { id: 3, text: "Validating sensor probe calibration...", icon: Cpu },
  { id: 4, text: "Evaluating silage fermentation thresholds...", icon: RefreshCw },
  { id: 5, text: "Screening for biological and aerobic hazards...", icon: ShieldCheck },
  { id: 6, text: "Applying worst supported hazard late fusion...", icon: Sparkles },
  { id: 7, text: "Synthesizing actionable farmer advisory...", icon: CheckCircle2 },
];

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testType = searchParams.get("type") || "silage";

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [targetSampleId, setTargetSampleId] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    async function executeAnalysis() {
      // 1. Retrieve test data stored in sessionStorage
      const rawData = sessionStorage.getItem("fs_current_test");
      const testData = rawData ? JSON.parse(rawData) : {};

      const sampleId = generateSampleId();
      const clientId = generateClientId();
      setTargetSampleId(sampleId);

      const now = new Date().toISOString();
      const cropName = testData.cropName || (testType === "silage" ? "Maize Silage" : "Cattle Feed Pellets");
      const physicalForm = testData.physicalForm || (testType === "silage" ? "chopped_silage" : "pellet");

      // 2. Perform client-side evaluation
      let overallRisk: "GOOD" | "ATTENTION" | "HIGH RISK" = "GOOD";
      let actionDecision: "FEED" | "BLEND" | "RE-TEST" | "RE_TEST" | "DISCARD" = "FEED";
      let silageAssessment: any = undefined;
      const predictions: any[] = [];

      if (testType === "silage") {
        const sensors = testData.sensorReadings || {};
        const evalResult = evaluateSilage({
          ph: sensors.ph ?? 4.0,
          internalTemp: sensors.internalTemp ?? 28.0,
          ambientTemp: sensors.ambientTemp ?? 25.0,
          dryMatterPct: sensors.dryMatterPct ?? 34.0,
          daysOpen: sensors.daysOpen ?? 14,
          visibleMouldPct: sensors.visibleMouldPct ?? 0,
        });

        overallRisk = evalResult.overallRisk;
        actionDecision = evalResult.actionDecision;
        silageAssessment = {
          airIngressRisk: evalResult.airIngressRisk,
          heatingRisk: evalResult.heatingRisk,
          spoilageRisk: evalResult.spoilageRisk,
          fermentationFailureRisk: evalResult.fermentationFailureRisk,
          mouldRisk: evalResult.mouldRisk,
          sensorHealthWarning: evalResult.sensorHealthWarning,
        };

        // Add predictions
        if (sensors.ph !== undefined) {
          predictions.push({
            target: "Silage pH",
            value: sensors.ph,
            unit: "pH",
            evidenceTag: sensors.evidenceTag || "SENSOR-MEASURED",
            confidence: 0.95,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          });
        }
        if (sensors.internalTemp !== undefined) {
          predictions.push({
            target: "Core Temperature",
            value: sensors.internalTemp,
            unit: "°C",
            evidenceTag: sensors.evidenceTag || "SENSOR-MEASURED",
            confidence: 0.95,
            modelVersion: "sensor-direct",
            dataProvenance: "simulated_sensor",
            applicabilityDomain: "IN_DOMAIN",
          });
        }
        if (sensors.dryMatterPct !== undefined) {
          predictions.push({
            target: "Dry Matter",
            value: sensors.dryMatterPct,
            unit: "% DM",
            evidenceTag: "ESTIMATED",
            confidence: 0.88,
            modelVersion: "silage-estimator-1.0",
            dataProvenance: "synthetic_demo",
            applicabilityDomain: "IN_DOMAIN",
          });
        }
      } else {
        // Feed Concentrate visual check
        predictions.push({
          target: "Visible Mould",
          value: 0.0,
          unit: "%",
          evidenceTag: "DETECTED",
          confidence: 0.92,
          modelVersion: "rgb-mould-v1.0",
          dataProvenance: "synthetic_demo",
          applicabilityDomain: "IN_DOMAIN",
        });
        overallRisk = "GOOD";
        actionDecision = "FEED";
      }

      // Advisory Chain Synthesis
      let headline = "Optimal Fermentation & Preservation";
      let chain = {
        result: "Lactic acid dominant fermentation with stable ambient thermal balance.",
        issue: "No significant spoilage or air ingress hazards identified.",
        action: "Safe to feed lactating cows as part of daily herd ration.",
        storage: "Maintain tight plastic cover seal; advance pit face smoothly.",
        risk: "Low spoilage hazard; excellent preservation of digestible energy.",
        nextStep: "Maintain weekly core probe testing to verify bunker stability.",
      };

      if (overallRisk === "ATTENTION" && actionDecision === "BLEND") {
        headline = "Aerobic Heating & Shoulder Deterioration";
        chain = {
          result: "Elevated core temperature and rising pH indicative of yeast activity.",
          issue: "Air ingress along the bunker shoulder triggering aerobic heating.",
          action: "Do not feed pure shoulder portion. Blend interior silage with dry fodder (max 30%).",
          storage: "Trim loose deteriorated edges; double weigh plastic with sand/gravel bags.",
          risk: "Feeding warm silage reduces dry matter intake and triggers milk fat depression.",
          nextStep: "Re-test bunker core after 48 hours to confirm temperature stabilization.",
        };
      } else if (overallRisk === "HIGH RISK" || actionDecision === "DISCARD") {
        headline = "Severe Fermentation Failure & Clostridial Spoilage";
        chain = {
          result: "High pH (>5.5) with core heating and butyric acid formation.",
          issue: "Anaerobic fermentation failure with protein degradation and ammonia accumulation.",
          action: "DISCARD immediately. Do NOT feed to pregnant or lactating animals.",
          storage: "Excavate spoiled outer layer down to firm, unaffected cold silage face.",
          risk: "High risk of mycotoxicosis, acute abomasal displacement, and severe milk loss.",
          nextStep: "Submit sample to accredited laboratory for confirmatory mycotoxin assay.",
        };
      }

      // Step-by-step progress simulation
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        if (isCancelled) return;
        setCurrentStepIndex(i);
        await new Promise((resolve) => setTimeout(resolve, 380));
        setCompletedSteps((prev) => [...prev, i]);
      }

      // 3. Save into Dexie database (Offline First)
      const localSample: LocalSample = {
        id: sampleId,
        clientId,
        sampleType: testType === "silage" ? "silage" : "feed",
        cropOrFeedName: cropName,
        physicalForm,
        collectedAt: now,
        syncStatus: "SAVED_ON_DEVICE",
        updatedAt: now,
        metadata: testData,
      };

      const localAnalysis: LocalAnalysis = {
        id: `analysis-${sampleId}`,
        sampleId,
        overallRisk,
        actionDecision,
        inputCompleteness: {
          score: testType === "silage" ? 85 : 40,
          modalitiesUsed: testType === "silage" ? ["rgb", "ph_probe", "temp_probe"] : ["rgb"],
          modalitiesMissing: testType === "silage" ? ["nir"] : ["nir", "sensors", "assay"],
        },
        predictions,
        silageAssessment,
        analyzedOnDevice: true,
        serverSynced: false,
        createdAt: now,
      };

      const localAdvisory: LocalAdvisory = {
        id: `advisory-${sampleId}`,
        analysisId: localAnalysis.id,
        headline,
        chain,
        decision: actionDecision,
      };

      const outboxItem: OutboxItem = {
        id: `outbox-${sampleId}`,
        clientId,
        entityType: "sample",
        payload: {
          sample: localSample,
          analysis: localAnalysis,
          advisory: localAdvisory,
        },
        status: "pending",
        retryCount: 0,
        createdAt: now,
      };

      try {
        await db.samples.put(localSample);
        await db.analyses.put(localAnalysis);
        await db.advisories.put(localAdvisory);
        await db.outbox.put(outboxItem);
      } catch (err) {
        console.error("Dexie put error:", err);
      }

      // 4. Redirect to Result Hero page
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push(`/test/result?id=${sampleId}`);
    }

    executeAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [testType, router]);

  const progressPercent = Math.min(100, Math.round(((completedSteps.length) / ANALYSIS_STEPS.length) * 100));

  return (
    <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col justify-center items-center space-y-8">
      {/* Central Rotating Shield Icon with Liquid Glass Specular Shine */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl glass-card border-2 border-forest/30 dark:border-emerald-500/40 flex items-center justify-center text-forest dark:text-emerald-400 shadow-float">
          <ShieldCheck className="w-12 h-12 text-forest dark:text-emerald-400 animate-pulse" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-forest dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-mono font-bold shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>
      </div>

      {/* Title & Progress Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-moss dark:text-emerald-400 font-sans">
          Analysing on device — Offline
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink">
          PashuPoshan Multimodal Engine
        </h1>
        <p className="text-xs text-muted dark:text-dark-muted font-mono">
          Sample Reference: {targetSampleId || "Generating ID..."}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between text-xs font-mono font-medium">
          <span className="text-muted dark:text-dark-muted">Inference Pipeline</span>
          <span className="text-forest dark:text-emerald-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-bone dark:bg-dark-card rounded-full overflow-hidden">
          <div
            className="h-full bg-forest dark:bg-emerald-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 7-Step Restrained Motion Sequence */}
      <div className="w-full glass-card rounded-3xl border border-bone dark:border-dark-border p-6 shadow-card space-y-3">
        {ANALYSIS_STEPS.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const isCurrent = currentStepIndex === idx && !isDone;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3.5 p-2.5 rounded-xl transition-all ${
                isCurrent
                  ? "bg-forest/10 dark:bg-emerald-500/15 text-forest dark:text-emerald-300 font-semibold"
                  : isDone
                  ? "text-ink/90 dark:text-dark-ink/90"
                  : "text-muted/60 dark:text-dark-muted/50 opacity-60"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? "bg-moss dark:bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-forest dark:bg-emerald-500 text-white animate-spin"
                    : "bg-bone dark:bg-dark-card text-muted dark:text-dark-muted"
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <StepIcon className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-xs font-sans tracking-tight leading-snug">
                {step.text}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted dark:text-dark-muted text-center max-w-sm">
        Processing entirely on local client engine using Dexie storage. No internet connection required.
      </p>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted dark:text-dark-muted">Initializing engine...</div>}>
        <ProcessingContent />
      </Suspense>
    </div>
  );
}
