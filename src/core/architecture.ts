import {
  ArchitectureDecision,
  WizardArchitecture,
  WizardFieldValue,
  WizardState,
} from "./types";

const LOCAL_KEYWORDS = [
  "alarm",
  "planner",
  "notes",
  "checklist",
  "habit",
  "calculator",
  "journal",
  "timer",
  "offline",
  "personal",
  "single user",
  "utility",
];

const CLOUD_KEYWORDS = [
  "portal",
  "booking",
  "admin",
  "e-commerce",
  "commerce",
  "team",
  "crm",
  "dashboard",
  "school",
  "clinic",
  "marketplace",
  "shared",
  "customer",
  "staff",
  "multi-user",
];

function asText(value: WizardFieldValue | undefined) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value.join(" ") : value;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function keywordScore(text: string, keywords: string[]) {
  return keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
}

function readChoice(state: WizardState, key: keyof WizardState["answers"]) {
  return normalize(asText(state.answers[key]));
}

export function interpretBooleanish(input: string): "yes" | "no" | "unclear" {
  const text = normalize(input);

  if (!text) {
    return "unclear";
  }

  if (
    /(yes|yep|yeah|need|required|definitely|sure|both|login|sync|shared|team|admin|upload|api|payment|stripe|subscription|push)/.test(
      text,
    )
  ) {
    return "yes";
  }

  if (/(no|none|not needed|nope|offline only|single device|local only|skip)/.test(text)) {
    return "no";
  }

  return "unclear";
}

export function decideArchitecture(state: WizardState): ArchitectureDecision {
  const ideaText = normalize(
    [
      asText(state.answers.appType),
      asText(state.answers.oneLineSummary),
      asText(state.answers.coreFeatures),
      asText(state.answers.targetUsers),
    ].join(" "),
  );

  const offlineExpectation = readChoice(state, "offlineSyncExpectation");
  const accessModel = readChoice(state, "userAccessModel");
  const loginNeed = interpretBooleanish(readChoice(state, "loginNeed"));
  const adminNeed = interpretBooleanish(readChoice(state, "adminNeed"));
  const fileUploadNeed = interpretBooleanish(readChoice(state, "fileUploadNeed"));
  const externalApiNeed = interpretBooleanish(readChoice(state, "externalApiNeed"));
  const notificationsNeed = interpretBooleanish(readChoice(state, "notificationsNeed"));
  const paymentsNeed = interpretBooleanish(readChoice(state, "paymentsNeed"));

  const localScore = keywordScore(ideaText, LOCAL_KEYWORDS);
  const cloudScore = keywordScore(ideaText, CLOUD_KEYWORDS);
  const wantsOfflineOnly =
    offlineExpectation.includes("offline") &&
    !offlineExpectation.includes("sync") &&
    !offlineExpectation.includes("cloud");
  const wantsSync =
    offlineExpectation.includes("sync") ||
    offlineExpectation.includes("cloud") ||
    offlineExpectation.includes("across devices");
  const multiUser =
    accessModel.includes("multi") ||
    accessModel.includes("shared") ||
    accessModel.includes("team") ||
    accessModel.includes("many") ||
    accessModel.includes("clients");

  let recommendation: WizardArchitecture = "local-only";
  const reasoning: string[] = [];

  if (
    multiUser ||
    loginNeed === "yes" ||
    adminNeed === "yes" ||
    paymentsNeed === "yes" ||
    cloudScore > localScore + 1
  ) {
    recommendation = "cloud-backend";
    reasoning.push(
      "The idea points to shared accounts, remote data, or business workflows that work best with a backend.",
    );
  } else if (wantsSync || fileUploadNeed === "yes" || externalApiNeed === "yes") {
    recommendation = "local-first-with-optional-sync";
    reasoning.push(
      "The app can stay simple on-device first, but sync or outside services may need optional cloud support.",
    );
  } else if (wantsOfflineOnly || localScore >= cloudScore) {
    recommendation = "local-only";
    reasoning.push(
      "The idea looks like a personal utility app, so a backend would add unnecessary setup right now.",
    );
  }

  if (recommendation === "local-only" && reasoning.length === 0) {
    reasoning.push("No strong backend signals were detected, so local-first is the safest default.");
  }

  const needsBackend = recommendation === "cloud-backend";
  const needsDatabase = recommendation !== "local-only" || multiUser;
  const needsAuth = recommendation === "cloud-backend" || loginNeed === "yes";
  const needsApiKeys =
    externalApiNeed === "yes" || paymentsNeed === "yes" || recommendation === "cloud-backend";
  const needsFileStorage = fileUploadNeed === "yes";
  const storageMode =
    recommendation === "cloud-backend"
      ? "cloud-sync"
      : recommendation === "local-first-with-optional-sync"
        ? "device-storage"
        : "offline-only";

  if (wantsSync && recommendation !== "local-only") {
    reasoning.push("Cross-device sync was requested, so a cloud-ready path should stay available.");
  }

  if (recommendation === "local-only") {
    reasoning.push("Credentials and cloud setup can be skipped unless the idea changes later.");
  }

  return {
    recommendation,
    storageMode,
    needsBackend,
    needsDatabase,
    needsAuth,
    needsApiKeys,
    needsFileStorage,
    needsNotifications: notificationsNeed === "yes",
    needsPayments: paymentsNeed === "yes",
    reasoning,
  };
}
