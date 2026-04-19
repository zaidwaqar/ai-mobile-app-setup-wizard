import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDefaultState, hydrateState } from "../core/engine";
import { WizardState } from "../core/types";

const STORAGE_KEY = "ai-mobile-app-setup-wizard-state";

export async function loadMobileState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createDefaultState();
  }

  return hydrateState(JSON.parse(raw) as Partial<WizardState>);
}

export async function saveMobileState(state: WizardState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function resetMobileState() {
  const state = createDefaultState();
  await saveMobileState(state);
  return state;
}
