import React from "react";
import { render } from "@testing-library/react-native";
import { createDefaultState, createSnapshot } from "../src/core/engine";
import { WizardScreen } from "../src/components/wizard-screen";

describe("UI quality test cases", () => {
  it("renders a polished mobile wizard layout with key actions", () => {
    const state = createDefaultState();
    const snapshot = createSnapshot(state);

    const screen = render(
      <WizardScreen
        snapshot={snapshot}
        draft=""
        loading={false}
        submitting={false}
        onDraftChange={() => undefined}
        onSubmit={() => undefined}
        onCommandPress={() => undefined}
        onRestart={() => undefined}
      />,
    );

    expect(screen.getByText(/AI Mobile App Setup Wizard/i)).toBeTruthy();
    expect(screen.getByText("/start")).toBeTruthy();
    expect(screen.getByText(/Turn a beginner-friendly mobile app idea/i)).toBeTruthy();
    expect(screen.getByLabelText("Wizard input")).toBeTruthy();
    expect(screen.getAllByText(/Send/i).length).toBeGreaterThan(0);
  });
});
