import * as Haptics from "expo-haptics";
import { startTransition, useEffect, useState } from "react";
import { createSnapshot, handleWizardInput } from "../core/engine";
import { WizardSnapshot } from "../core/types";
import { loadMobileState, resetMobileState, saveMobileState } from "../persistence/mobile-storage";

export function useWizardController() {
  const [snapshot, setSnapshot] = useState<WizardSnapshot | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const state = await loadMobileState();
      setSnapshot(createSnapshot(state));
      setLoading(false);
    }

    void bootstrap();
  }, []);

  async function processInput(input: string) {
    if (!snapshot || !input.trim()) {
      return;
    }

    setSubmitting(true);
    const response = handleWizardInput(snapshot.state, input);
    await saveMobileState(response.snapshot.state);

    startTransition(() => {
      setSnapshot(response.snapshot);
      setDraft("");
    });

    setSubmitting(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function restart() {
    const state = await resetMobileState();
    setSnapshot(createSnapshot(state));
    setDraft("");
  }

  return {
    snapshot,
    draft,
    setDraft,
    loading,
    submitting,
    processInput,
    restart,
  };
}
