import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceTag } from "../components/ui/EvidenceTag";
import { StatusChip } from "../components/ui/StatusChip";
import { DemoBadge } from "../components/ui/DemoBadge";
import { InputCompleteness } from "../components/ui/InputCompleteness";
import { I18nProvider, useI18n } from "../lib/i18n";

describe("PashuPoshan Design System Smoke Tests", () => {
  it("renders all canonical evidence tags correctly", () => {
    const tags = ["DETECTED", "PREDICTED", "ESTIMATED", "USER-ENTERED", "SENSOR-MEASURED", "DEMO"] as const;
    tags.forEach((tag) => {
      const { unmount } = render(<EvidenceTag tag={tag} />);
      expect(screen.getByText(tag)).toBeInTheDocument();
      unmount();
    });
  });

  it("renders status chips with correct labels", () => {
    render(<StatusChip status="GOOD" />);
    expect(screen.getByText("GOOD")).toBeInTheDocument();

    render(<StatusChip status="HIGH RISK" />);
    expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
  });

  it("renders demo badge with disclaimer", () => {
    render(<DemoBadge label="TEST DEMO" subtext="Not a field test" />);
    expect(screen.getByText("TEST DEMO")).toBeInTheDocument();
    expect(screen.getByText("Not a field test")).toBeInTheDocument();
  });

  it("renders input completeness with score calculation", () => {
    render(
      <InputCompleteness
        modalitiesUsed={["rgb", "nir"]}
        modalitiesMissing={["sensors", "assay"]}
        score={0.5}
      />
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Visual Image (RGB)")).toBeInTheDocument();
  });

  it("renders i18n translations properly", () => {
    const TestComponent = () => {
      const { t } = useI18n();
      return <div>{t("common.appName")}</div>;
    };

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByText("PashuPoshan")).toBeInTheDocument();
  });
});
