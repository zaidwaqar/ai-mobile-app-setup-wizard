import { decideArchitecture } from "./architecture";
import { createSnapshot } from "./engine";
import { WizardFieldValue, WizardState } from "./types";

function asText(value: WizardFieldValue | undefined) {
  if (!value) {
    return "_Not provided yet._";
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => `- ${item}`).join("\n") : "_Not provided yet._";
  }

  return value;
}

function singleLine(value: WizardFieldValue | undefined) {
  if (!value) {
    return "Not provided yet";
  }

  return Array.isArray(value) ? value.join(", ") : value;
}

function renderChecklist(state: WizardState) {
  const snapshot = createSnapshot(state);
  const lines = [
    "# Mobile App Setup Checklist",
    "",
    `Updated: ${state.updatedAt}`,
    "",
  ];

  for (const label of snapshot.completionSummary) {
    lines.push(`- [x] ${label}`);
  }

  for (const label of snapshot.missingSummary) {
    lines.push(`- [ ] ${label}`);
  }

  lines.push("");
  return lines.join("\n");
}

function renderProductIdea(state: WizardState) {
  const architecture = decideArchitecture(state);

  return [
    "# Mobile App Product Idea",
    "",
    `Updated: ${state.updatedAt}`,
    "",
    "## Core Idea",
    "",
    `- App name: ${singleLine(state.answers.appName)}`,
    `- One-line summary: ${singleLine(state.answers.oneLineSummary)}`,
    `- Target users: ${singleLine(state.answers.targetUsers)}`,
    `- App type: ${singleLine(state.answers.appType)}`,
    "",
    "## Problem",
    "",
    asText(state.answers.problem),
    "",
    "## Solution",
    "",
    asText(state.answers.solution),
    "",
    "## Architecture Direction",
    "",
    `- Recommendation: ${architecture.recommendation}`,
    `- Storage mode: ${architecture.storageMode}`,
    ...architecture.reasoning.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function renderFeatures(state: WizardState) {
  return [
    "# Mobile App Features",
    "",
    `Updated: ${state.updatedAt}`,
    "",
    "## Core Features",
    "",
    asText(state.answers.coreFeatures),
    "",
    "## Usage and Data Expectations",
    "",
    `- Offline or sync expectation: ${singleLine(state.answers.offlineSyncExpectation)}`,
    `- Single-user or shared usage: ${singleLine(state.answers.userAccessModel)}`,
    `- Roles: ${singleLine(state.answers.roles)}`,
    `- Required screens: ${singleLine(state.answers.requiredScreens)}`,
    `- Notifications: ${singleLine(state.answers.notificationsNeed)}`,
    `- Payments: ${singleLine(state.answers.paymentsNeed)}`,
    "",
    "## Scope",
    "",
    `- Billing model: ${singleLine(state.answers.billingModel)}`,
    `- MVP scope: ${singleLine(state.answers.mvpScope)}`,
    `- Future scope: ${singleLine(state.answers.futureScope)}`,
    "",
    "## Special Instructions",
    "",
    asText(state.answers.specialInstructions),
    "",
  ].join("\n");
}

function renderUi(state: WizardState) {
  return [
    "# Mobile UI Preferences",
    "",
    `Updated: ${state.updatedAt}`,
    "",
    "## Theme",
    "",
    `- Theme mode: ${singleLine(state.answers.themeMode)}`,
    `- Design preference: ${singleLine(state.answers.designPreference)}`,
    `- Preferred colors: ${singleLine(state.answers.preferredColors)}`,
    `- Icon style: ${singleLine(state.answers.iconStyle)}`,
    "",
    "## Mobile Experience",
    "",
    `- Layout style: ${singleLine(state.answers.layoutStyle)}`,
    `- Navigation style: ${singleLine(state.answers.navigationStyle)}`,
    `- Animation preference: ${singleLine(state.answers.animationPreference)}`,
    `- Interaction style: ${singleLine(state.answers.interactionStyle)}`,
    `- Accessibility preferences: ${singleLine(state.answers.accessibilityPreferences)}`,
    "",
    "## UI Refresh Notes",
    "",
    asText(state.answers.uiRefreshNotes),
    "",
    "## Default UI Guidance",
    "",
    "- Keep the interface polished, mobile-first, and beginner-friendly.",
    "- Prioritize clear actions, strong spacing, and readable typography.",
    "- Use consistent iconography, motion, and theme choices across screens.",
    "- Avoid random colors or dashboard clutter unless the product truly needs it.",
    "",
  ].join("\n");
}

function renderIntegrations(state: WizardState) {
  const architecture = decideArchitecture(state);

  return [
    "# Integrations and Architecture",
    "",
    `Updated: ${state.updatedAt}`,
    "",
    "## Decision Summary",
    "",
    `- Architecture recommendation: ${architecture.recommendation}`,
    `- Storage mode: ${architecture.storageMode}`,
    `- Backend required: ${architecture.needsBackend ? "Yes" : "No"}`,
    `- Authentication required: ${architecture.needsAuth ? "Yes" : "No"}`,
    `- Database required: ${architecture.needsDatabase ? "Yes" : "No"}`,
    `- API keys likely needed: ${architecture.needsApiKeys ? "Yes" : "No"}`,
    "",
    "## Why",
    "",
    ...architecture.reasoning.map((item) => `- ${item}`),
    "",
    "## Requested Integrations",
    "",
    `- Login need: ${singleLine(state.answers.loginNeed)}`,
    `- Admin need: ${singleLine(state.answers.adminNeed)}`,
    `- File uploads: ${singleLine(state.answers.fileUploadNeed)}`,
    `- External APIs: ${singleLine(state.answers.externalApiNeed)}`,
    `- Backend preference: ${singleLine(state.answers.backendPreference)}`,
    "",
    "## API Examples",
    "",
    asText(state.answers.apiExamples),
    "",
  ].join("\n");
}

function buildCredentialItems(state: WizardState) {
  const architecture = decideArchitecture(state);
  const items = [
    "Expo project owner access",
    "Apple Developer account access when iOS publishing starts",
    "Google Play Console access when Android publishing starts",
  ];

  if (architecture.needsBackend) {
    items.push("Supabase project URL");
    items.push("Supabase anon key");
    items.push("Supabase service role key");
  }

  if (architecture.needsAuth) {
    items.push("Login provider configuration");
  }

  if (architecture.needsPayments) {
    items.push("Stripe publishable key");
    items.push("Stripe secret key");
  }

  if (architecture.needsFileStorage) {
    items.push("Cloud file storage bucket access");
  }

  if (architecture.needsApiKeys) {
    items.push("Third-party API keys or service accounts");
  }

  return Array.from(new Set(items));
}

function renderCredentials(state: WizardState) {
  const architecture = decideArchitecture(state);

  return [
    "# Mobile App Credentials Checklist",
    "",
    `Updated: ${state.updatedAt}`,
    "",
    `Architecture recommendation: ${architecture.recommendation}`,
    "",
    architecture.needsApiKeys || architecture.needsBackend || architecture.needsPayments
      ? "## Ownership"
      : "## Credentials Status",
    "",
    architecture.needsApiKeys || architecture.needsBackend || architecture.needsPayments
      ? asText(state.answers.credentialsOwner)
      : "No cloud or secret credentials are currently required for this local-first app setup.",
    "",
    "## Current Status",
    "",
    asText(state.answers.credentialsStatus),
    "",
    "## Likely Credentials Needed",
    "",
    ...buildCredentialItems(state).map((item) => `- [ ] ${item}`),
    "",
    "## Third-Party Keys",
    "",
    asText(state.answers.thirdPartyKeys),
    "",
    "## Safety Note",
    "",
    "Do not store real secrets in this repository. Only track what is needed and who owns access.",
    "",
  ].join("\n");
}

function renderBuildBrief(state: WizardState) {
  const architecture = decideArchitecture(state);

  return [
    "# Expo Mobile Build Brief",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Product",
    "",
    `- App name: ${singleLine(state.answers.appName)}`,
    `- Summary: ${singleLine(state.answers.oneLineSummary)}`,
    `- Users: ${singleLine(state.answers.targetUsers)}`,
    `- Problem: ${singleLine(state.answers.problem)}`,
    `- Solution: ${singleLine(state.answers.solution)}`,
    `- App type: ${singleLine(state.answers.appType)}`,
    "",
    "## Features",
    "",
    asText(state.answers.coreFeatures),
    "",
    "## Mobile Experience",
    "",
    `- Required screens: ${singleLine(state.answers.requiredScreens)}`,
    `- Navigation style: ${singleLine(state.answers.navigationStyle)}`,
    `- Interaction style: ${singleLine(state.answers.interactionStyle)}`,
    `- Theme mode: ${singleLine(state.answers.themeMode)}`,
    `- Design preference: ${singleLine(state.answers.designPreference)}`,
    "",
    "## Architecture",
    "",
    `- Recommendation: ${architecture.recommendation}`,
    `- Storage mode: ${architecture.storageMode}`,
    `- Backend required: ${architecture.needsBackend ? "Yes" : "No"}`,
    `- Authentication required: ${architecture.needsAuth ? "Yes" : "No"}`,
    `- Database required: ${architecture.needsDatabase ? "Yes" : "No"}`,
    `- Notifications needed: ${architecture.needsNotifications ? "Yes" : "No"}`,
    `- Payments needed: ${architecture.needsPayments ? "Yes" : "No"}`,
    "",
    ...architecture.reasoning.map((item) => `- ${item}`),
    "",
    "## Scope",
    "",
    `- MVP scope: ${singleLine(state.answers.mvpScope)}`,
    `- Future scope: ${singleLine(state.answers.futureScope)}`,
    `- Special instructions: ${singleLine(state.answers.specialInstructions)}`,
    "",
    "## Expo Delivery Notes",
    "",
    "- Must run in Expo Go on both iOS and Android.",
    "- Keep navigation simple and reliable.",
    "- Prefer local-first patterns unless the brief clearly requires cloud support.",
    "",
  ].join("\n");
}

export function renderRepositoryFiles(state: WizardState) {
  return {
    "project/session/checklist.md": renderChecklist(state),
    "project/product-idea.md": renderProductIdea(state),
    "project/features.md": renderFeatures(state),
    "project/ui.md": renderUi(state),
    "project/integrations.md": renderIntegrations(state),
    "project/credentials-checklist.md": renderCredentials(state),
    "project/build-brief.md": state.buildBriefReady ? renderBuildBrief(state) : "",
  };
}
