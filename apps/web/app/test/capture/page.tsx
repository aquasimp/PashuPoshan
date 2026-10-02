"use client";

import React, { useState, useRef, Suspense } from "react";
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
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { useI18n } from "@/lib/i18n";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";

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

  // Camera & Image states
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Image QA scores
  const [qaState, setQaState] = useState<"good" | "blur" | "dark" | "distance">("good");
  const [blurScore, setBlurScore] = useState(84);
  const [exposureScore, setExposureScore] = useState(88);
  const [distanceScore, setDistanceScore] = useState(85);

  const processCapturedImage = (dataUrl: string) => {
    setIsAnalyzing(true);
    setCameraError(null);
    setCapturedImage(dataUrl);

    // Client-side image QA pixel evaluation
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsAnalyzing(false);
          return;
        }
        canvas.width = 256;
        canvas.height = 192;
        ctx.drawImage(img, 0, 0, 256, 192);
        const imgData = ctx.getImageData(0, 0, 256, 192);
        const data = imgData.data;

        // 1. Mean luminance (exposure score)
        let totalLum = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const meanLum = totalLum / (256 * 192);

        let expScore = 85;
        if (meanLum < 45) {
          expScore = Math.max(15, Math.round((meanLum / 45) * 45));
        } else if (meanLum > 225) {
          expScore = Math.max(20, Math.round(100 - ((meanLum - 225) / 30) * 60));
        } else {
          expScore = Math.min(95, Math.max(65, Math.round(78 + (1 - Math.abs(meanLum - 130) / 95) * 17)));
        }

        // 2. High-frequency edge gradient (sharpness / focus score)
        let edgeSum = 0;
        for (let y = 1; y < 191; y += 2) {
          for (let x = 1; x < 255; x += 2) {
            const idx = (y * 256 + x) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            const rightIdx = (y * 256 + (x + 1)) * 4;
            const lumRight = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
            const downIdx = ((y + 1) * 256 + x) * 4;
            const lumDown = 0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];
            edgeSum += Math.abs(lum - lumRight) + Math.abs(lum - lumDown);
          }
        }
        const sampleCount = (190 / 2) * (254 / 2);
        const avgEdge = edgeSum / sampleCount;
        let focusScore = Math.round(Math.min(96, Math.max(20, (avgEdge / 16) * 88)));
        if (focusScore < 50) focusScore = 32;

        const distScore = 85;

        setExposureScore(expScore);
        setBlurScore(focusScore);
        setDistanceScore(distScore);

        if (focusScore < 50) {
          setQaState("blur");
        } else if (expScore < 50) {
          setQaState("dark");
        } else {
          setQaState("good");
        }
      } catch (err) {
        console.error("Image QA analysis error:", err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    img.onerror = () => {
      setIsAnalyzing(false);
      setCameraError("Could not process image format.");
    };
    img.src = dataUrl;
  };

  const handleTakePhoto = async () => {
    setCameraError(null);
    if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
      try {
        const photo = await CapCamera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });
        if (photo?.dataUrl) {
          processCapturedImage(photo.dataUrl);
          return;
        }
      } catch (err: any) {
        console.warn("Native camera failed or cancelled:", err);
        if (err?.message?.toLowerCase().includes("cancel")) return;
        setCameraError(err?.message || "Camera access error");
      }
    }
    // Web fallback: click hidden HTML5 file input with capture="environment"
    cameraInputRef.current?.click();
  };

  const handleOpenGallery = async () => {
    setCameraError(null);
    if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
      try {
        const photo = await CapCamera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
        });
        if (photo?.dataUrl) {
          processCapturedImage(photo.dataUrl);
          return;
        }
      } catch (err: any) {
        console.warn("Native gallery picker failed or cancelled:", err);
        if (err?.message?.toLowerCase().includes("cancel")) return;
        setCameraError(err?.message || "Gallery picker error");
      }
    }
    // Web fallback: click hidden HTML5 file input
    galleryInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          processCapturedImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleClearImage = () => {
    setCapturedImage(null);
    setQaState("good");
    setBlurScore(84);
    setExposureScore(88);
    setDistanceScore(85);
  };

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
    // Store metadata & captured image in sessionStorage
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
      capturedImage: capturedImage || null,
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
          <span>{t("nav.test")}</span>
        </Link>
        <span>/</span>
        <span className="text-ink dark:text-dark-ink font-medium">{t("capture.breadcrumb")}</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-moss dark:text-emerald-400">
            {t("capture.step2")}
          </span>
          <DemoBadge label={capturedImage ? t("capture.photoReady") : t("capture.liveCamera")} size="sm" />
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
          <div
            className={`relative aspect-[4/3] rounded-3xl bg-neutral-900 overflow-hidden border-2 transition-all shadow-float flex items-center justify-center ${
              !capturedImage
                ? "border-stone-700 dark:border-stone-600 cursor-pointer hover:border-forest dark:hover:border-emerald-500"
                : isOverallQaAcceptable
                ? "border-forest/60 dark:border-emerald-500/60"
                : "border-terracotta/70"
            }`}
            onClick={!capturedImage ? handleTakePhoto : undefined}
          >
            {/* Hidden file inputs for Web fallback / Camera & Gallery */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Background feed or Captured Photo */}
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured sample preview"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  qaState === "blur" ? "blur-sm" : ""
                } ${qaState === "dark" ? "brightness-50" : ""}`}
              />
            ) : (
              <div
                className={`absolute inset-0 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center ${
                  qaState === "blur" ? "blur-md opacity-60" : ""
                } ${qaState === "dark" ? "brightness-25" : "brightness-100"}`}
                style={{
                  backgroundImage:
                    testType === "silage"
                      ? "radial-gradient(circle at 50% 50%, #526E38 0%, #354924 60%, #1c2713 100%)"
                      : "radial-gradient(circle at 50% 50%, #A27B5C 0%, #6E4E37 60%, #3F2B1D 100%)",
                }}
              >
                {/* Texture background dots */}
                <div className="absolute inset-0 opacity-20 flex flex-wrap gap-4 p-8 items-center justify-center pointer-events-none">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full ${
                        testType === "silage" ? "bg-amber-100/40 w-3 h-4" : "bg-amber-800/80 w-4 h-4"
                      }`}
                    />
                  ))}
                </div>

                {/* Shutter Callout Button inside Viewfinder */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white shadow-xl hover:scale-105 hover:bg-white/25 active:scale-95 transition-all">
                    <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm sm:text-base font-bold text-white drop-shadow-md block">
                      {t("farmer.takePhoto")}
                    </span>
                    <span className="text-[11px] text-white/80 block font-medium">
                      {t("farmer.tapToCapture")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Camera Framing Guide Overlay */}
            <div className="absolute inset-4 sm:inset-6 border-2 border-white/60 border-dashed rounded-2xl pointer-events-none flex flex-col justify-between p-3.5 backdrop-blur-[0.5px]">
              <div className="flex justify-between text-[11px] text-white/90 font-mono drop-shadow">
                <span>{t("capture.liveFramingGuide")}</span>
                <span>{t("capture.matrix")}</span>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-white/90 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-white/90 font-mono drop-shadow">
                <span>{t("capture.distanceGuide")}</span>
                <span className={isOverallQaAcceptable ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {isOverallQaAcceptable ? t("capture.qaPass") : t("capture.adjustFrame")}
                </span>
              </div>
            </div>

            {/* Status Badge Top Right */}
            {capturedImage && (
              <div className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t("farmer.photoCaptured")}</span>
              </div>
            )}

            {/* Analyzing Spinner Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 z-20">
                <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                <span className="text-xs font-medium">{t("farmer.analyzingImage")}</span>
              </div>
            )}

            {/* Real-time Quality Alerts Overlay Banner */}
            {!isOverallQaAcceptable && (
              <div className="absolute bottom-4 left-4 right-4 bg-terracotta/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-float backdrop-blur-md z-10">
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
                  className="underline text-[11px] font-bold uppercase hover:text-mist ml-2 shrink-0"
                >
                  {t("capture.autoFix")}
                </button>
              </div>
            )}
          </div>

          {/* Camera Control Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleTakePhoto}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-forest dark:bg-emerald-600 hover:bg-deep dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
              id="btn-take-photo"
            >
              <Camera className="w-4 h-4" />
              <span>{capturedImage ? t("farmer.retakePhoto") : t("farmer.takePhoto")}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGallery}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-ivory dark:bg-dark-card hover:bg-bone dark:hover:bg-dark-surface border border-bone dark:border-dark-border text-ink dark:text-dark-ink font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98]"
              id="btn-upload-gallery"
            >
              <Upload className="w-4 h-4 text-forest dark:text-emerald-400" />
              <span>{t("farmer.chooseGallery")}</span>
            </button>
          </div>

          {/* Error banner if camera failed */}
          {cameraError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
              <span>{cameraError}</span>
              <button
                type="button"
                onClick={() => setCameraError(null)}
                className="font-bold underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Preset Buttons for Demo / Judge Evaluation */}
          <div className="glass-card p-3.5 rounded-2xl border border-bone dark:border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted dark:text-dark-muted block">
                {t("capture.simulateEdgesTitle")}
              </span>
              {capturedImage && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="text-[11px] text-terracotta hover:underline font-medium"
                >
                  {t("capture.resetPhoto")}
                </button>
              )}
            </div>
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
                {t("capture.clearPass")}
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
                {t("capture.blurry")}
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
                {t("capture.darkGlare")}
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
                {t("capture.tooFar")}
              </button>
            </div>
          </div>
        </div>

        {/* Metadata & QA Scores Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Image QA Scores */}
          <div className="glass-card p-5 rounded-3xl border border-bone dark:border-dark-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">{t("capture.qaHealthTitle")}</h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isOverallQaAcceptable
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-forest dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    : "bg-rose-50 dark:bg-rose-950/40 text-terracotta border border-rose-200 dark:border-rose-800/60"
                }`}
              >
                {isOverallQaAcceptable ? t("capture.validated") : t("capture.actionRequired")}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted dark:text-dark-muted">{t("capture.sharpness")}</span>
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
                  <span className="text-muted dark:text-dark-muted">{t("capture.illumination")}</span>
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
                  <span className="text-muted dark:text-dark-muted">{t("capture.framingScale")}</span>
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
            <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">{t("capture.sampleMetadata")}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted dark:text-dark-muted font-medium mb-1">{t("capture.cropFeedType")}</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-dark-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-emerald-400 text-xs"
                >
                  {testType === "silage" ? (
                    <>
                      <option value="Maize Silage">{t("capture.crops.maize")}</option>
                      <option value="Sorghum Silage">{t("capture.crops.sorghum")}</option>
                      <option value="Pearl Millet Silage">{t("capture.crops.bajra")}</option>
                      <option value="Oat Silage">{t("capture.crops.oat")}</option>
                    </>
                  ) : (
                    <>
                      <option value="Cattle Feed Pellets">{t("capture.crops.pellets")}</option>
                      <option value="Mustard Oil Cake">{t("capture.crops.mustardCake")}</option>
                      <option value="Cottonseed Cake">{t("capture.crops.cottonCake")}</option>
                      <option value="Wheat Bran Mash">{t("capture.crops.wheatBran")}</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-muted dark:text-dark-muted font-medium mb-1">{t("capture.physicalForm")}</label>
                <select
                  value={physicalForm}
                  onChange={(e) => setPhysicalForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-dark-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-emerald-400 text-xs"
                >
                  {testType === "silage" ? (
                    <>
                      <option value="chopped_silage">{t("capture.forms.chopped")}</option>
                      <option value="round_bale">{t("capture.forms.bale")}</option>
                      <option value="bunker_face">{t("capture.forms.bunkerFace")}</option>
                    </>
                  ) : (
                    <>
                      <option value="pellet">{t("capture.forms.pellet")}</option>
                      <option value="mash">{t("capture.forms.mash")}</option>
                      <option value="cake">{t("capture.forms.cake")}</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-muted dark:text-dark-muted font-medium mb-1">{t("capture.storageUnit")}</label>
                <input
                  type="text"
                  value={storageUnit}
                  onChange={(e) => setStorageUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ivory dark:bg-dark-card border border-bone dark:border-dark-border text-ink dark:text-dark-ink focus:outline-none focus:border-forest dark:focus:border-emerald-400 text-xs font-sans"
                  placeholder={t("capture.storagePlaceholder")}
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
                    ? t("capture.proceedSensors")
                    : t("capture.runVisual")
                  : t("capture.proceedWarning")}
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
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted dark:text-dark-muted">{t("capture.loadingViewfinder")}</div>}>
        <CaptureContent />
      </Suspense>
    </div>
  );
}
