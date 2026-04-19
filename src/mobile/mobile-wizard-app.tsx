import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WizardScreen } from "../components/wizard-screen";
import { useWizardController } from "../hooks/use-wizard-controller";
import { colors } from "../theme/colors";

export function MobileWizardApp() {
  const { snapshot, draft, setDraft, loading, submitting, processInput, restart } =
    useWizardController();

  if (!snapshot) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Preparing the mobile app wizard...</Text>
      </View>
    );
  }

  return (
    <WizardScreen
      snapshot={snapshot}
      draft={draft}
      loading={loading}
      submitting={submitting}
      onDraftChange={setDraft}
      onSubmit={() => void processInput(draft)}
      onCommandPress={(command) => void processInput(command)}
      onRestart={() => void restart()}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.slate,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.inkStrong,
    fontSize: 15,
  },
});
