import { decideArchitecture } from "../src/core/architecture";
import { createDefaultState } from "../src/core/engine";

describe("architecture decision tests", () => {
  it("does not force backend for planner and notes style apps", () => {
    const state = createDefaultState();
    state.answers.appType = "offline planner and notes app";
    state.answers.oneLineSummary = "A personal planner for one person";
    state.answers.offlineSyncExpectation = "offline only on one device";
    state.answers.userAccessModel = "single user";
    state.answers.externalApiNeed = "no";
    state.answers.loginNeed = "no";
    state.answers.adminNeed = "no";
    state.answers.fileUploadNeed = "no";
    state.answers.paymentsNeed = "no";

    const result = decideArchitecture(state);

    expect(result.recommendation).toBe("local-only");
    expect(result.needsBackend).toBe(false);
    expect(result.needsApiKeys).toBe(false);
  });

  it("recommends backend for portal or shared-account apps", () => {
    const state = createDefaultState();
    state.answers.appType = "school portal";
    state.answers.oneLineSummary = "A portal for staff, parents, and admins";
    state.answers.offlineSyncExpectation = "sync across devices";
    state.answers.userAccessModel = "multiple people with shared data";
    state.answers.loginNeed = "yes";
    state.answers.adminNeed = "yes";

    const result = decideArchitecture(state);

    expect(result.recommendation).toBe("cloud-backend");
    expect(result.needsAuth).toBe(true);
    expect(result.needsDatabase).toBe(true);
  });

  it("treats sync-heavy single-user apps as local-first with optional sync", () => {
    const state = createDefaultState();
    state.answers.appType = "habit tracker";
    state.answers.oneLineSummary = "A personal habit tracker";
    state.answers.offlineSyncExpectation = "sync across devices too";
    state.answers.userAccessModel = "single user";
    state.answers.loginNeed = "maybe later";

    const result = decideArchitecture(state);

    expect(result.recommendation).toBe("local-first-with-optional-sync");
  });

  it("avoids cloud setup for explicitly offline-only apps", () => {
    const state = createDefaultState();
    state.answers.appType = "alarm app";
    state.answers.offlineSyncExpectation = "offline only";
    state.answers.userAccessModel = "single user";
    state.answers.externalApiNeed = "no";
    state.answers.loginNeed = "no";

    const result = decideArchitecture(state);

    expect(result.storageMode).toBe("offline-only");
  });
});
