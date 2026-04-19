import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { WizardSnapshot } from "../core/types";
import { colors } from "../theme/colors";
import { CommandChip } from "./command-chip";
import { InfoCard } from "./info-card";
import { MessageBubble } from "./message-bubble";

const COMMANDS = [
  "/start",
  "/continue",
  "/product",
  "/ui",
  "/features",
  "/integrations",
  "/credentials",
  "/review",
  "/build",
] as const;

type WizardScreenProps = {
  snapshot: WizardSnapshot;
  draft: string;
  loading: boolean;
  submitting: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onCommandPress: (command: string) => void;
  onRestart: () => void;
};

export function WizardScreen({
  snapshot,
  draft,
  loading,
  submitting,
  onDraftChange,
  onSubmit,
  onCommandPress,
  onRestart,
}: WizardScreenProps) {
  return (
    <LinearGradient colors={["#0f172a", "#162033", "#1d4d57"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>AI Mobile App Setup Wizard</Text>
            <Text style={styles.title}>
              Turn a beginner-friendly mobile app idea into an Expo-ready build brief.
            </Text>
            <Text style={styles.subtitle}>
              The wizard asks one question at a time, chooses the simplest correct architecture,
              and keeps product, UI, integrations, and credentials cleanly separated.
            </Text>
          </View>

          <View style={styles.cardRow}>
            <InfoCard
              eyebrow="Architecture"
              title={snapshot.architecture.recommendation}
              body={snapshot.architecture.reasoning.join(" ")}
            />
            <InfoCard
              eyebrow="Progress"
              title={`${snapshot.completedCount}/${snapshot.totalSteps} complete`}
              body={`Waiting on: ${snapshot.awaitingStepLabel ?? "Nothing right now"}`}
              subtle
            />
          </View>

          <View style={styles.summaryPanel}>
            <View style={styles.summaryHeader}>
              <Text style={styles.sectionTitle}>Quick commands</Text>
              <Pressable onPress={onRestart}>
                <Text style={styles.restart}>Reset local session</Text>
              </Pressable>
            </View>
            <View style={styles.commandWrap}>
              {COMMANDS.map((command) => (
                <CommandChip key={command} label={command} onPress={() => onCommandPress(command)} />
              ))}
            </View>
            <Text style={styles.summaryText}>
              Current scope:{" "}
              <Text style={styles.summaryStrong}>
                {snapshot.state.activeScope === "all"
                  ? "full guided flow"
                  : snapshot.state.activeScope}
              </Text>
            </Text>
            <Text style={styles.summaryText}>
              Storage mode:{" "}
              <Text style={styles.summaryStrong}>{snapshot.architecture.storageMode}</Text>
            </Text>
          </View>

          <View style={styles.chatPanel}>
            <View style={styles.summaryHeader}>
              <Text style={styles.sectionTitle}>Conversation</Text>
              <Text style={styles.sectionCaption}>
                {loading ? "Loading..." : "Answers save immediately on this device"}
              </Text>
            </View>

            <View style={styles.messageList}>
              {snapshot.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </View>
          </View>

          <View style={styles.composerPanel}>
            <Text style={styles.sectionTitle}>Reply or send a command</Text>
            <TextInput
              accessibilityLabel="Wizard input"
              multiline
              value={draft}
              onChangeText={onDraftChange}
              placeholder="Type /start or answer the current question..."
              placeholderTextColor="rgba(226,232,240,0.56)"
              style={styles.input}
            />
            <View style={styles.composerFooter}>
              <Text style={styles.helpText}>
                Use plain language. The wizard will infer whether your app can stay local-first or needs cloud support.
              </Text>
              <Pressable onPress={onSubmit} style={styles.sendButton} disabled={submitting}>
                <Text style={styles.sendText}>{submitting ? "Saving..." : "Send"}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: 18,
    gap: 18,
  },
  hero: {
    gap: 12,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    color: colors.inkStrong,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 23,
  },
  cardRow: {
    gap: 12,
  },
  summaryPanel: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.inkStrong,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionCaption: {
    color: colors.ink,
    fontSize: 12,
  },
  restart: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  commandWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 20,
  },
  summaryStrong: {
    color: colors.inkStrong,
    fontWeight: "700",
  },
  chatPanel: {
    borderRadius: 28,
    backgroundColor: "rgba(9,14,24,0.48)",
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageList: {
    gap: 12,
  },
  composerPanel: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    minHeight: 112,
    borderRadius: 22,
    backgroundColor: "rgba(15,23,42,0.72)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.inkStrong,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  composerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  helpText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 18,
  },
  sendButton: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sendText: {
    color: colors.slate,
    fontSize: 14,
    fontWeight: "800",
  },
});
