import { createDefaultState, handleWizardInput } from "../src/core/engine";

describe("resume and interruption test cases", () => {
  it("preserves current step through interruption", () => {
    let state = createDefaultState();
    state = handleWizardInput(state, "/start").snapshot.state;
    state = handleWizardInput(state, "Pocket Notes").snapshot.state;

    const interruption = handleWizardInput(state, "Why are we asking this?");
    expect(interruption.snapshot.state.awaitingStepId).toBe("one-line-summary");
  });

  it("/continue returns to the first incomplete step", () => {
    let state = createDefaultState();
    state = handleWizardInput(state, "/start").snapshot.state;
    state = handleWizardInput(state, "Pocket Notes").snapshot.state;
    state = handleWizardInput(state, "/continue").snapshot.state;

    expect(state.awaitingStepId).toBe("one-line-summary");
  });
});
