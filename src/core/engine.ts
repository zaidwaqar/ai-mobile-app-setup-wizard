import { decideArchitecture, interpretBooleanish } from "./architecture";
import { FLOW_ORDER, WIZARD_STEPS } from "./steps";
import {
  ArchitectureDecision,
  WizardCommand,
  WizardFieldValue,
  WizardMode,
  WizardResponse,
  WizardScope,
  WizardSnapshot,
  WizardState,
  WizardStep,
} from "./types";

const COMMANDS = new Set<WizardCommand>([
  "/start",
  "/continue",
  "/product",
  "/ui",
  "/features",
  "/integrations",
  "/credentials",
  "/review",
  "/build",
]);

const STEP_MAP = new Map(WIZARD_STEPS.map((step) => [step.id, step]));

function now() {
  return new Date().toISOString();
}

export function createDefaultState(): WizardState {
  const createdAt = now();

  return {
    version: 1,
    createdAt,
    updatedAt: createdAt,
    currentMode: "product",
    activeScope: "all",
    lastCommand: null,
    awaitingStepId: null,
    lastQuestion: null,
    completedStepIds: [],
    answers: {},
    interruptions: 0,
    buildBriefReady: false,
    transcript: [
      {
        id: "assistant-welcome",
        role: "assistant",
        content:
          "Use /start to begin the mobile app setup wizard, or /continue to resume saved progress.",
        createdAt,
      },
    ],
  };
}

export function hydrateState(input: Partial<WizardState> | null | undefined): WizardState {
  const fallback = createDefaultState();

  if (!input) {
    return fallback;
  }

  return {
    ...fallback,
    ...input,
    answers: input.answers ?? fallback.answers,
    completedStepIds: input.completedStepIds ?? fallback.completedStepIds,
    transcript:
      input.transcript && input.transcript.length > 0
        ? input.transcript
        : fallback.transcript,
  };
}

function addMessage(state: WizardState, role: "assistant" | "user", content: string) {
  state.transcript = [
    ...state.transcript,
    {
      id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      content,
      createdAt: now(),
    },
  ].slice(-50);
}

function normalizeList(input: string) {
  return input
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createPrompt(step: WizardStep) {
  return `${step.prompt}\n\n${step.help}`;
}

function setAwaitingStep(state: WizardState, step: WizardStep | null) {
  state.awaitingStepId = step?.id ?? null;
  state.lastQuestion = step ? createPrompt(step) : null;

  if (step) {
    state.currentMode = step.mode;
  }
}

function syncDerivedAnswers(state: WizardState) {
  const architecture = decideArchitecture(state);
  state.answers.architectureRecommendation = architecture.recommendation;
  state.answers.architectureReasoning = architecture.reasoning;
  state.answers.storageMode = architecture.storageMode;
  state.buildBriefReady = false;
  return architecture;
}

function getRequiredSteps(state: WizardState, scope: WizardScope = "all") {
  return WIZARD_STEPS.filter(
    (step) =>
      step.required &&
      (scope === "all" ? true : step.mode === scope) &&
      (step.shouldAsk ? step.shouldAsk(state) : true),
  );
}

function getFirstIncompleteStep(state: WizardState, scope: WizardScope) {
  if (scope === "all") {
    for (const mode of FLOW_ORDER) {
      const next = getRequiredSteps(state, mode).find(
        (step) => !state.completedStepIds.includes(step.id),
      );

      if (next) {
        return next;
      }
    }

    return null;
  }

  return (
    getRequiredSteps(state, scope).find((step) => !state.completedStepIds.includes(step.id)) ?? null
  );
}

function getOpenStepLabel(state: WizardState) {
  if (!state.awaitingStepId) {
    return null;
  }

  return STEP_MAP.get(state.awaitingStepId)?.label ?? null;
}

function completedLabels(state: WizardState) {
  return getRequiredSteps(state, "all")
    .filter((step) => state.completedStepIds.includes(step.id))
    .map((step) => step.label);
}

function missingLabels(state: WizardState, scope: WizardScope = "all") {
  return getRequiredSteps(state, scope)
    .filter((step) => !state.completedStepIds.includes(step.id))
    .map((step) => step.label);
}

export function createSnapshot(state: WizardState): WizardSnapshot {
  const architecture = syncDerivedAnswers(state);

  return {
    state,
    messages: state.transcript,
    completedCount: completedLabels(state).length,
    totalSteps: getRequiredSteps(state, "all").length,
    awaitingStepLabel: getOpenStepLabel(state),
    completionSummary: completedLabels(state),
    missingSummary: missingLabels(state),
    architecture,
  };
}

function maybeInterruption(input: string) {
  const text = input.trim().toLowerCase();
  return (
    text.endsWith("?") ||
    /^(hi|hello|thanks|thank you|how|why|what|can you|could you|would you|help|explain)\b/.test(
      text,
    )
  );
}

function contradictionMessage(state: WizardState, step: WizardStep, input: string) {
  const answer = input.trim().toLowerCase();
  const offlineExpectation = String(state.answers.offlineSyncExpectation ?? "").toLowerCase();
  const accessModel = String(state.answers.userAccessModel ?? "").toLowerCase();

  if (
    step.id === "offline-sync-expectation" &&
    answer.includes("offline") &&
    answer.includes("sync")
  ) {
    return "That sounds like two different directions. Do you want this app to stay offline on one device, or sync across devices?";
  }

  if (
    step.id === "user-access-model" &&
    offlineExpectation.includes("offline") &&
    !offlineExpectation.includes("sync") &&
    /(multi|shared|team|many|clients)/.test(answer)
  ) {
    return "If multiple people need shared data, the app usually needs sync. Should people share live data across devices, or is this still meant for one device only?";
  }

  if (
    step.id === "login-need" &&
    interpretBooleanish(answer) === "no" &&
    /(multi|shared|team|clients|staff)/.test(accessModel)
  ) {
    return "Shared multi-user apps usually need some kind of sign-in. Should each person have their own account, or is this really just one shared device?";
  }

  return null;
}

function saveAnswer(state: WizardState, step: WizardStep, input: string) {
  if (step.id === "ui-refresh-notes") {
    const existing = state.answers.uiRefreshNotes;
    const nextValue = Array.isArray(existing)
      ? [...existing, input.trim()]
      : existing
        ? [existing, input.trim()]
        : [input.trim()];
    state.answers.uiRefreshNotes = nextValue;
    return;
  }

  const value: WizardFieldValue = step.list ? normalizeList(input) : input.trim();
  state.answers[step.field] = value;

  if (step.required && !state.completedStepIds.includes(step.id)) {
    state.completedStepIds.push(step.id);
  }
}

function reviewReply(state: WizardState, architecture: ArchitectureDecision) {
  const completed = completedLabels(state);
  const missing = missingLabels(state);

  return [
    "Mobile wizard review",
    "",
    `Completed: ${completed.length}/${getRequiredSteps(state, "all").length}`,
    completed.length ? `Done: ${completed.join(", ")}` : "Done: nothing saved yet.",
    missing.length ? `Missing: ${missing.join(", ")}` : "Missing: nothing. The setup is complete.",
    "",
    `Architecture: ${architecture.recommendation}`,
    `Why: ${architecture.reasoning.join(" ")}`,
    "",
    `Current open question: ${getOpenStepLabel(state) ?? "none"}`,
    "Use /continue to resume the next missing step.",
  ].join("\n");
}

function buildReply(state: WizardState) {
  const missing = missingLabels(state);

  if (missing.length > 0) {
    state.buildBriefReady = false;
    return `The mobile build brief is not ready yet. Please finish these items first: ${missing.join(", ")}.`;
  }

  state.buildBriefReady = true;
  setAwaitingStep(state, null);
  return [
    "Build brief generated.",
    "",
    "The mobile app setup is now ready for Expo-focused AI building.",
    "Use the generated project files and `INSTRUCTION.md` as the source of truth.",
  ].join("\n");
}

function modeFromCommand(command: WizardCommand): WizardMode | null {
  switch (command) {
    case "/product":
      return "product";
    case "/ui":
      return "ui";
    case "/features":
      return "features";
    case "/integrations":
      return "integrations";
    case "/credentials":
      return "credentials";
    case "/review":
      return "review";
    case "/build":
      return "build";
    default:
      return null;
  }
}

function resumeMessage(state: WizardState, verb: string, nextStep: WizardStep) {
  return [
    verb,
    "",
    `Completed so far: ${completedLabels(state).length ? completedLabels(state).join(", ") : "nothing yet"}.`,
    `Next up: ${nextStep.label}.`,
    "",
    createPrompt(nextStep),
  ].join("\n");
}

function advanceFlow(state: WizardState) {
  const next = getFirstIncompleteStep(state, state.activeScope);

  if (!next) {
    setAwaitingStep(state, null);
    return state.activeScope === "all"
      ? "The full mobile app discovery flow is complete. Use /review to inspect the plan or /build to generate the build brief."
      : `${titleCase(state.activeScope)} discovery is complete. You can switch to another command flow or use /review.`;
  }

  setAwaitingStep(state, next);
  return createPrompt(next);
}

function handleCommand(state: WizardState, input: WizardCommand) {
  state.lastCommand = input;
  const architecture = syncDerivedAnswers(state);

  if (input === "/review") {
    state.currentMode = "review";
    setAwaitingStep(state, null);
    return reviewReply(state, architecture);
  }

  if (input === "/build") {
    state.currentMode = "build";
    return buildReply(state);
  }

  if (input === "/start" || input === "/continue") {
    state.activeScope = "all";
    const next = getFirstIncompleteStep(state, "all");

    if (!next) {
      setAwaitingStep(state, null);
      return "Everything is already captured. Use /review for the summary or /build to generate the brief.";
    }

    setAwaitingStep(state, next);
    return resumeMessage(
      state,
      input === "/start"
        ? "Starting the guided mobile app discovery flow."
        : "Resuming from your saved progress.",
      next,
    );
  }

  const mode = modeFromCommand(input);
  if (!mode || mode === "review" || mode === "build") {
    return "That command does not open a question flow.";
  }

  if (mode === "credentials" && missingLabels(state, "credentials").length === 0) {
    if (architecture.recommendation === "local-only" && !architecture.needsApiKeys) {
      setAwaitingStep(state, null);
      return "This app currently looks local-first with no cloud credentials required, so credentials mode is intentionally empty for now.";
    }
  }

  if (mode === "ui" && missingLabels(state, "ui").length === 0) {
    const refreshStep = STEP_MAP.get("ui-refresh-notes")!;
    state.activeScope = "ui";
    setAwaitingStep(state, refreshStep);
    return [
      "UI discovery is already complete, so we're switching into UI update mode.",
      "",
      createPrompt(refreshStep),
    ].join("\n");
  }

  state.activeScope = mode;
  state.currentMode = mode;
  const next = getFirstIncompleteStep(state, mode);

  if (!next) {
    setAwaitingStep(state, null);
    return `${titleCase(mode)} discovery is already complete. Use /review for the summary or choose another command flow.`;
  }

  setAwaitingStep(state, next);
  return [`Switched to ${mode} discovery mode.`, "", createPrompt(next)].join("\n");
}

function handleAnswer(state: WizardState, input: string) {
  const step = state.awaitingStepId ? STEP_MAP.get(state.awaitingStepId) : null;

  if (!step) {
    return "There is no open wizard question right now. Use /start to begin or /continue to resume.";
  }

  if (!input.trim()) {
    return `I still need an answer for "${step.label}". ${step.help}`;
  }

  if (maybeInterruption(input)) {
    state.interruptions += 1;
    return `I kept your place at "${step.label}". When you're ready, use /continue to resume from the same step.`;
  }

  const contradiction = contradictionMessage(state, step, input);
  if (contradiction) {
    return contradiction;
  }

  saveAnswer(state, step, input);
  syncDerivedAnswers(state);

  if (step.id === "ui-refresh-notes") {
    setAwaitingStep(state, null);
    return "Your UI update notes were saved separately from the product details. Use /ui again anytime to refine the design direction.";
  }

  return advanceFlow(state);
}

export function handleWizardInput(currentState: WizardState, input: string): WizardResponse {
  const state = hydrateState(currentState);
  const trimmed = input.trim();

  addMessage(state, "user", trimmed);

  const command = COMMANDS.has(trimmed as WizardCommand) ? (trimmed as WizardCommand) : null;
  const reply = command ? handleCommand(state, command) : handleAnswer(state, trimmed);

  state.updatedAt = now();
  addMessage(state, "assistant", reply);
  const snapshot = createSnapshot(state);

  return {
    reply,
    snapshot,
  };
}
