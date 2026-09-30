"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Upload,
  Eye,
  Sliders,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { useI18n } from "@/lib/i18n";

function CaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testType = searchParams.get("type") || "silage";
  const { t } = useI18n();

  // Form states
  const [cropName, setCropName] = useState(
    testType === "silage" ? "Maize Silage" : "Cattle Feed Pellets"
  );
  const [physicalForm, setPhysicalForm] = useState(
    testType === "silage" ? "chopped_silage" : "pellet"
  );
  const [storageUnit, setStorageUnit] = useState("Bunker Pit #1");

  // Simulated image QA states
  const [qaState, setQaState] = useState<"good" | "blur" | "dark" | "distance">("good");
  const [blurScore, setBlurScore] = useState(82);
  const [exposureScore, setExposureScore] = useState(88);
  const [distanceScore, setDistanceScore] = useState(85);

  const setSimulatedProfile = (type: "good" | "blur" | "dark" | "distance") => {
    setQaState(type);
    if (type === "good") {
      setBlurScore(84);
      setExposureScore(88);
      setDistanceScore(85);
    } else if (type === "blur") {
      setBlurScore(28); // Fails blur
      setExposureScore(80);
      setDistanceScore(75);
    } else if (type === "dark") {
      setBlurScore(75);
      setExposureScore(24); // Fails lighting
      setDistanceScore(80);
    } else if (type === "distance") {
      setBlurScore(70);
      setExposureScore(75);
      setDistanceScore(30); // Fails distance
    }
  };

  const isBlurValid = blurScore >= 50;
  const isExposureValid = exposureScore >= 50;
  const isDistanceValid = distanceScore >= 50;
  const isOverallQaAcceptable = isBlurValid && isExposureValid && isDistanceValid;

  const handleProceed = () => {
    // Store preliminary metadata in sessionStorage for the flow
    const testData = {
      testType,
      cropName,
      physicalForm,
      storageUnit,
      qa: {
        blurScore,
        exposureScore,
        distanceScore,
        isAcceptable: isOverallQaAcceptable,
      },
    };
    sessionStorage.setItem("fs_current_test", JSON.stringify(testData));

    if (testType === "silage") {
      router.push(`/test/silage?type=${testType}`);
    } else {
      router.push(`/test/processing?type=${testType}`);
    }
  };

    return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
        <Link href="/test" className="hover:text-forest dark:hover:text-emerald-400 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Select Protocol</span>
        </Link>
        <span>/</span>
        <span className="text-ink dark:text-dark-ink font-medium">Capture & Image QA</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-moss dark:text-emerald-400">
            Step 2 of 4
          </span>
          <DemoBadge label="SIMULATED CAMERA" size="sm" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-dark-ink">
          {t("farmer.capturePrompt")}
        </h1>
        <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">
          {t("farmer.captureHint")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Viewfinder Column */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-[4/3] rounded-3xl bg-neutral-900 overflow-hidden border-2 border-stone-700 dark:border-stone-600 shadow-float flex items-center justify-center">
            {/* Simulated Live Camera Feed / Background Sample Image */}
            <div
              className={`absolute inset-0 transition-all duration-300 ${
                qaState === "blur" ? "blur-md opacity-60" : ""
              } ${qaState === "dark" ? "brightness-25" : "brightness-100"}`}
              style={{
                backgroundImage:
                  testType === "silage"
                    ? "radial-gradient(circle at 50% 50%, #526E38 0%, #354924 60%, #1c2713 100%)"
                    : "radial-gradient(circle at 50% 50%, #A27B5C 0%, #6E4E37 60%, #3F2B1D 100%)",
              }}
            >
              {/* Texture dots to simulate grain/pellets */}
              <div className="w-full h-full opacity-30 flex flex-wrap gap-4 p-8 items-center justify-center">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full ${
                      testType === "silage" ? "bg-amber-100/40 w-3 h-4" : "bg-amber-800/80 w-4 h-4"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Live Camera Framing Guide Overlay */}
            <div className="absolute inset-8 border-2 border-white/60 border-dashed rounded-2xl pointer-events-none flex flex-col justify-between p-4 backdrop-blur-[1px]">
              <div className="flex justify-between text-[11px] text-white/90 font-mono">
                <span>[ LIVE FRAMING GUIDE ]</span>
                <span>4:3 MATRIX</span>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-white/90 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-white/90 font-mono">
                <span>10-25 cm DISTANCE</span>
                <span className={isOverallQaAcceptable ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {isOverallQaAcceptable ? "QA PASS" : "ADJUST FRAME"}
                </span>
              </div>
            </div>

            {/* Real-time Quality Alerts Overlay Banner */}
            {!isOverallQaAcceptable && (
              <div className="absolute bottom-4 left-4 right-4 bg-terracotta/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-float backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
                  <span>
                    {!isBlurValid
                      ? t("farmer.retakeBlur")
                      : !isExposureValid
                      ? t("farmer.retakeLighting")
                      : t("farmer.retakeDistance")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulatedProfile("good")}
                  className="underline text-[11px] font-bold uppercase hover:text-mist"
                >
                  Auto-Fix
                </button>
              </div>
            )}
          </div>

          {/* Preset Buttons for Demo / Judge Evaluation */}
          <div className="glass-card p-3.5 rounded-2xl border border-bone dark:border-dark-border space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-dark-muted block">
              Simulate Quality Edge Cases:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSimulatedProfile("good")}
                className={`px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
                  qaState === "good"
                    ? "bg-forest dark:bg-emerald-600 text-white border-forest dark:border-emerald-600 shadow-sm"
                    : "bg-ivory dark:bg-dark-card text-ink dark:text-dark-ink hover:bg-bone dark:hover:bg-dark-surface border-bone dark:border-dark-border"
                }`}
              >
                Clear / Pass
              </button>
              <button
                type="button"
                onClick={() => setSimulatedProfile("blur")}
                className={`px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
                  qaState === "blur"
                    ? "bg-terracotta text-white border-terracotta shadow-sm"
                    : "bg-ivory dark:bg-dark-card text-ink dark:text-dark-ink hover:bg-bone dark:hover:bg-dark-surface border-bone dark:border-dark-border"
                }`}
              >
                Blurry
              </button>
              <button
                type="button"
                onClick={() => setSimulatedProfile("dark")}
                className={`px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
                  qaState === "dark"
                    ? "bg-terracotta text-white border-terracotta shadow-sm"
                    : "bg-ivory dark:bg-dark-card text-ink dark:text-dark-ink hover:bg-bone dark:hover:bg-dark-surface border-bone dark:border-dark-border"
                }`}
              >
                Dark / Glare
              </button>
              <button
                type="button"
                onClick={() => setSimulatedProfile("distance")}
                className={`px-2.5 py-1.5 rounded-xl border font-medium transition-all ${
                  qaState === "distance"
                    ? "bg-terracotta text-white border-terracotta shadow-sm"
                    : "bg-ivory dark:bg-dark-card text-ink dark:text-dark-ink hover:bg-bone dark:hover:bg-dark-surface border-bone dark:border-dark-border"
                }`}
              >
                Too Far
              </button>
            </div>
          </div>
        </div>

        {/* Metadata & QA Scores Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Image QA Scores */}
          <div className="glass-card p-5 rounded-3xl border border-bone dark:border-dark-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">Image QA Health</h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isOverallQaAcceptable
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    : "bg-rose-50 dark:bg-rose-950/40 text-terracotta border border-rose-200 dark:border-rose-800/60"
                }`}
              >
                {isOverallQaAcceptable ? "Validated" : "Action Required"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted dark:text-dark-muted">Sharpness / Focus</span>
                  <span className="font-mono font-medium text-ink dark:text-dark-ink">{blurScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-bone dark:bg-dark-card rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isBlurValid ? "bg-moss dark:bg-emerald-500" : "bg-terracotta"
                    }`}
                    style={{ width: `${blurScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted dark:text-dark-muted">Uniform Illumination</span>
                  <span className="font-mono font-medium text-ink dark:text-dark-ink">{exposureScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-bone dark:bg-dark-card rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isExposureValid ? "bg-moss dark:bg-emerald-500" : "bg-terracotta"
                    }`}
                    style={{ width: `${exposureScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted dark:text-dark-muted">Framing & Scale</span>
                  <span className="font-mono font-medium text-ink dark:text-dark-ink">{distanceScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-bone dark:bg-dark-card rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isDistanceValid ? "bg-moss dark:bg-emerald-500" : "bg-terracotta"
                    }`}
                    style={{ width: `${distanceScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sample Metadata Fields */}
          <div className="glass-card p-5 rounded-3xl border border-bone dark:border-dark-border shadow-card space-y-4">
            <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">Sample Metadata</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted dark:text-dark-muted font-medium mb-1">Crop / Feed Type</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-dark-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-emerald-400 text-xs"
                >
                  {testType === "silage" ? (
                    <>
                      <option value="Maize Silage">Maize / Corn Silage (मक्का साइलेज)</option>
                      <option value="Sorghum Silage">Sorghum Silage (ज्वार साइलेज)</option>
                      <option value="Pearl Millet Silage">Pearl Millet / Bajra Silage</option>
                      <option value="Oat Silage">Oat Silage (जई साइलेज)</option>
                    </>
                  ) : (
                    <>
                      <option value="Cattle Feed Pellets">Cattle Feed Pellets (BIS Type II)</option>
                      <option value="Mustard Oil Cake">Mustard Oil Cake (सरसों की खल)</option>
                      <option value="Cottonseed Cake">Cottonseed Cake (बिनौला खल)</option>
                      <option value="Wheat Bran Mash">Wheat Bran Mash (गेहूं का चोकर)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-muted dark:text-dark-muted font-medium mb-1">Physical Form</label>
                <select
                  value={physicalForm}
                  onChange={(e) => setPhysicalForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-dark-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-emerald-400 text-xs"
                >
                  {testType === "silage" ? (
                    <>
                      <option value="chopped_silage">Chopped & Compacted Silage</option>
                      <option value="round_bale">Wrapped Round Bale</option>
                      <option value="bunker_face">Bunker Pit Face Sample</option>
                    </>
                  ) : (
                    <>
                      <option value="pellet">Manufactured Pellets (4-6 mm)</option>
                      <option value="mash">Coarse Mash / Flour</option>
                      <option value="cake">Pressed Cake Flakes</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-muted dark:text-dark-muted font-medium mb-1">Storage Unit / Pit</label>
                <input
                  type="text"
                  value={storageUnit}
                  onChange={(e) => setStorageUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-dark-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-emerald-400 text-xs font-sans"
                  placeholder="e.g. Bunker Pit #1"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleProceed}
              className={`w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold text-sm shadow-md transition-all ${
                isOverallQaAcceptable
                  ? "bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white shadow-forest/20"
                  : "bg-terracotta hover:bg-terracotta/90 text-white"
              }`}
              id="btn-confirm-capture"
            >
              <span>
                {isOverallQaAcceptable
                  ? testType === "silage"
                    ? "Proceed to Sensor Readings"
                    : "Run Visual Analysis"
                  : "Proceed Anyway (With QA Warning)"}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CapturePage() {
  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted dark:text-dark-muted">Loading viewfinder...</div>}>
        <CaptureContent />
      </Suspense>
    </div>
  );
}
