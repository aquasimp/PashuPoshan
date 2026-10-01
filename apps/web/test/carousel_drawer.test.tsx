import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ProductCarousel,
  CarouselItem,
  SmoothDrawer,
  SampleDetailDrawer,
} from "../components/ui/liquid-glass";
import { I18nProvider } from "../lib/i18n";
import { LocalSample, LocalAnalysis } from "../lib/db";

describe("ProductCarousel Component", () => {
  beforeEach(() => {
    // Mock scrollBy and scrollTo for JSDOM
    window.HTMLElement.prototype.scrollBy = vi.fn();
    window.HTMLElement.prototype.scrollTo = vi.fn();
  });

  const testItems: CarouselItem[] = [
    {
      id: "TEST-01",
      title: "Corn Silage Pit North",
      subtitle: "SILAGE • Oct 2, 2026",
      qualityStatus: "EXCELLENT",
      riskState: "NORMAL",
      evidenceTag: "PREDICTED",
      isDemo: true,
      actionLabel: "Inspect",
      onAction: vi.fn(),
    },
    {
      id: "TEST-02",
      title: "मक्के का साइलेज — अत्यधिक नमी और एरोबिक हीटिंग का जोखिम (Long Hindi String)",
      subtitle: "साइलेज • 02 अक्टूबर 2026",
      qualityStatus: "WARNING",
      riskState: "ATTENTION",
      evidenceTag: "DETECTED",
      isDemo: false,
      actionLabel: "Quick View",
      onAction: vi.fn(),
    },
    {
      id: "TEST-03",
      title: "Commercial Cattle Feed Pellet Batch #449 (Hinglish: Storage me dampness detect hui hai)",
      subtitle: "FEED • Oct 1, 2026",
      qualityStatus: "CRITICAL",
      riskState: "HIGH RISK",
      evidenceTag: "SENSOR-MEASURED",
      isDemo: true,
      actionLabel: "Inspect",
      onAction: vi.fn(),
    },
  ];

  it("renders carousel items with title, subtitle, evidence tag and demo status", () => {
    render(
      <I18nProvider>
        <ProductCarousel items={testItems} />
      </I18nProvider>
    );

    expect(screen.getByText("Corn Silage Pit North")).toBeInTheDocument();
    expect(
      screen.getByText(/मक्के का साइलेज — अत्यधिक नमी और एरोबिक हीटिंग का जोखिम/)
    ).toBeInTheDocument();
    expect(screen.getByText("PREDICTED")).toBeInTheDocument();
    expect(screen.getByText("DETECTED")).toBeInTheDocument();
    expect(screen.getByText("SENSOR-MEASURED")).toBeInTheDocument();
    expect(screen.getAllByText("DEMO").length).toBeGreaterThan(0);
  });

  it("triggers onAction when action button is clicked", () => {
    render(
      <I18nProvider>
        <ProductCarousel items={testItems} />
      </I18nProvider>
    );

    const actionButtons = screen.getAllByRole("button", { name: /Inspect|Quick View/i });
    fireEvent.click(actionButtons[0]);
    expect(testItems[0].onAction).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard navigation with ArrowRight and ArrowLeft", () => {
    render(
      <I18nProvider>
        <ProductCarousel items={testItems} />
      </I18nProvider>
    );

    const container = screen.getByRole("region", { name: /Recent Sample Tests/i });
    fireEvent.keyDown(container, { key: "ArrowRight" });
    expect(window.HTMLElement.prototype.scrollBy).toHaveBeenCalled();
  });

  it("renders empty state gracefully when no items are provided", () => {
    render(
      <I18nProvider>
        <ProductCarousel items={[]} />
      </I18nProvider>
    );

    expect(screen.getByText(/No items recorded yet/i)).toBeInTheDocument();
  });

  it("renders loading skeleton state when loading is true", () => {
    const { container } = render(
      <I18nProvider>
        <ProductCarousel items={[]} loading={true} />
      </I18nProvider>
    );

    const skeletonCards = container.querySelectorAll(".animate-pulse");
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it("renders error state when error message is supplied", () => {
    render(
      <I18nProvider>
        <ProductCarousel items={[]} error="Telemetry connection failed" />
      </I18nProvider>
    );

    expect(screen.getByText("Telemetry connection failed")).toBeInTheDocument();
  });
});

describe("SmoothDrawer Component", () => {
  it("renders content and title when open", () => {
    render(
      <I18nProvider>
        <SmoothDrawer
          isOpen={true}
          onClose={vi.fn()}
          title="Field Inspection Drawer"
          description="Detailed telemetry and sensor data"
        >
          <p>Drawer inner content test</p>
        </SmoothDrawer>
      </I18nProvider>
    );

    expect(screen.getByText("Field Inspection Drawer")).toBeInTheDocument();
    expect(screen.getByText("Detailed telemetry and sensor data")).toBeInTheDocument();
    expect(screen.getByText("Drawer inner content test")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <I18nProvider>
        <SmoothDrawer isOpen={true} onClose={handleClose} title="Drawer Title">
          <div>Content</div>
        </SmoothDrawer>
      </I18nProvider>
    );

    const closeBtn = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <I18nProvider>
        <SmoothDrawer isOpen={true} onClose={handleClose} title="Drawer Title">
          <div>Content</div>
        </SmoothDrawer>
      </I18nProvider>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when isOpen is false", () => {
    render(
      <I18nProvider>
        <SmoothDrawer isOpen={false} onClose={vi.fn()} title="Closed Drawer">
          <p>Hidden Content</p>
        </SmoothDrawer>
      </I18nProvider>
    );

    expect(screen.queryByText("Closed Drawer")).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden Content")).not.toBeInTheDocument();
  });
});

describe("SampleDetailDrawer Integration Component", () => {
  const mockSample: LocalSample = {
    id: "DEMO-SMP-991",
    clientId: "client-test-991",
    cropOrFeedName: "High Moisture Maize Silage",
    sampleType: "silage",
    physicalForm: "chopped",
    collectedAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
    syncStatus: "SAVED_ON_DEVICE",
    metadata: {
      notes: "DEMO pit benchmark",
      photoUri: "/images/silage-good.svg",
      ph: 5.4,
      internalTemp: 38.5,
    },
  };

  const mockAnalysis: LocalAnalysis = {
    id: "analysis-991",
    sampleId: "DEMO-SMP-991",
    overallRisk: "HIGH RISK",
    actionDecision: "DISCARD",
    inputCompleteness: {
      score: 0.8,
      modalitiesUsed: ["rgb", "sensors"],
      modalitiesMissing: [],
    },
    predictions: [
      {
        target: "spoilageProbability",
        value: 0.88,
        unit: "prob",
        evidenceTag: "PREDICTED",
        modelVersion: "2.1",
        dataProvenance: "DEMO",
        applicabilityDomain: "silage",
      },
    ],
    fliegScore: 42,
    silagePh: 5.4,
    spoilageProbability: 0.88,
    aflatoxinRiskLevel: "HIGH",
    confidenceInterval: "HIGH",
    modelSignature: "sha256-edge-ensemble-v2.1",
    recommendationSummary: "Discard spoiled layer to avoid aflatoxin contamination in herd.",
    analyzedOnDevice: true,
    serverSynced: false,
    createdAt: "2026-10-02T10:00:05.000Z",
  } as LocalAnalysis;

  it("renders sample details, metrics, and DEMO badge when opened", () => {
    render(
      <I18nProvider>
        <SampleDetailDrawer
          sample={mockSample}
          analysis={mockAnalysis}
          isOpen={true}
          onClose={vi.fn()}
        />
      </I18nProvider>
    );

    expect(screen.getByText(/DEMO-SMP-991/)).toBeInTheDocument();
    expect(screen.getByText("High Moisture Maize Silage")).toBeInTheDocument();
    expect(screen.getAllByText("PREDICTED").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DEMO").length).toBeGreaterThan(0);
    expect(screen.getByText("42/100")).toBeInTheDocument();
    expect(screen.getByText("5.4")).toBeInTheDocument();
    expect(screen.getAllByText("HIGH RISK").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DISCARD").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Discard spoiled layer to avoid aflatoxin contamination/)
    ).toBeInTheDocument();
  });
});
