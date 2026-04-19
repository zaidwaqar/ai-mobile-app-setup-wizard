import { createDefaultState, handleWizardInput } from "../src/core/engine";

describe("positive and negative validation tests", () => {
  it("valid answers progress correctly", () => {
    let state = createDefaultState();
    state = handleWizardInput(state, "/start").snapshot.state;

    const response = handleWizardInput(state, "Pulse Notes");
    expect(response.snapshot.state.answers.appName).toBe("Pulse Notes");
  });

  it("empty answers do not corrupt state", () => {
    let state = createDefaultState();
    state = handleWizardInput(state, "/start").snapshot.state;

    const response = handleWizardInput(state, "   ");
    expect(response.reply).toMatch(/still need an answer/i);
    expect(response.snapshot.state.answers.appName).toBeUndefined();
  });

  it("inconsistent answers trigger clarification", () => {
    let state = createDefaultState();
    state = handleWizardInput(state, "/features").snapshot.state;
    state.awaitingStepId = "offline-sync-expectation";
    state.lastQuestion = "Should this work offline?";

    const response = handleWizardInput(state, "offline but also sync across devices");
    expect(response.reply).toMatch(/two different directions/i);
  });

  it("unrelated conversation does not break flow", () => {
    let state = createDefaultState();
    state = handleWizardInput(state, "/start").snapshot.state;

    const response = handleWizardInput(state, "Can you explain the pricing model?");
    expect(response.reply).toMatch(/kept your place/i);
  });
});
