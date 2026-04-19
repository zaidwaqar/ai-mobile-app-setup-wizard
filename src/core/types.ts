export type WizardCommand =
  | "/start"
  | "/continue"
  | "/product"
  | "/ui"
  | "/features"
  | "/integrations"
  | "/credentials"
  | "/review"
  | "/build";

export type WizardMode =
  | "product"
  | "ui"
  | "features"
  | "integrations"
  | "credentials"
  | "review"
  | "build";

export type WizardScope = WizardMode | "all";

export type WizardArchitecture =
  | "local-only"
  | "local-first-with-optional-sync"
  | "cloud-backend";

export type WizardFieldValue = string | string[];

export type WizardFieldKey =
  | "appName"
  | "oneLineSummary"
  | "targetUsers"
  | "problem"
  | "solution"
  | "appType"
  | "coreFeatures"
  | "offlineSyncExpectation"
  | "userAccessModel"
  | "roles"
  | "requiredScreens"
  | "billingModel"
  | "designPreference"
  | "themeMode"
  | "preferredColors"
  | "iconStyle"
  | "layoutStyle"
  | "navigationStyle"
  | "animationPreference"
  | "interactionStyle"
  | "accessibilityPreferences"
  | "notificationsNeed"
  | "paymentsNeed"
  | "loginNeed"
  | "adminNeed"
  | "fileUploadNeed"
  | "externalApiNeed"
  | "backendPreference"
  | "apiExamples"
  | "mvpScope"
  | "futureScope"
  | "specialInstructions"
  | "credentialsOwner"
  | "credentialsStatus"
  | "thirdPartyKeys"
  | "uiRefreshNotes"
  | "architectureRecommendation"
  | "architectureReasoning"
  | "storageMode";

export type WizardStepId =
  | "app-name"
  | "one-line-summary"
  | "target-users"
  | "problem"
  | "solution"
  | "app-type"
  | "core-features"
  | "offline-sync-expectation"
  | "user-access-model"
  | "roles"
  | "required-screens"
  | "notifications-need"
  | "payments-need"
  | "login-need"
  | "admin-need"
  | "file-upload-need"
  | "external-api-need"
  | "backend-preference"
  | "api-examples"
  | "billing-model"
  | "mvp-scope"
  | "future-scope"
  | "special-instructions"
  | "theme-mode"
  | "design-preference"
  | "preferred-colors"
  | "icon-style"
  | "layout-style"
  | "navigation-style"
  | "animation-preference"
  | "interaction-style"
  | "accessibility-preferences"
  | "credentials-owner"
  | "credentials-status"
  | "third-party-keys"
  | "ui-refresh-notes";

export type WizardMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
};

export type WizardState = {
  version: number;
  createdAt: string;
  updatedAt: string;
  currentMode: WizardMode;
  activeScope: WizardScope;
  lastCommand: WizardCommand | null;
  awaitingStepId: WizardStepId | null;
  lastQuestion: string | null;
  completedStepIds: WizardStepId[];
  answers: Partial<Record<WizardFieldKey, WizardFieldValue>>;
  interruptions: number;
  buildBriefReady: boolean;
  transcript: WizardMessage[];
};

export type WizardStep = {
  id: WizardStepId;
  mode: Exclude<WizardMode, "review" | "build">;
  label: string;
  field: WizardFieldKey;
  prompt: string;
  help: string;
  required: boolean;
  list?: boolean;
  allowsMultipleRuns?: boolean;
  shouldAsk?: (state: WizardState) => boolean;
};

export type ArchitectureDecision = {
  recommendation: WizardArchitecture;
  storageMode: "offline-only" | "device-storage" | "cloud-sync";
  needsBackend: boolean;
  needsDatabase: boolean;
  needsAuth: boolean;
  needsApiKeys: boolean;
  needsFileStorage: boolean;
  needsNotifications: boolean;
  needsPayments: boolean;
  reasoning: string[];
};

export type WizardSnapshot = {
  state: WizardState;
  messages: WizardMessage[];
  completedCount: number;
  totalSteps: number;
  awaitingStepLabel: string | null;
  completionSummary: string[];
  missingSummary: string[];
  architecture: ArchitectureDecision;
};

export type WizardResponse = {
  reply: string;
  snapshot: WizardSnapshot;
};
