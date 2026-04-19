import { StyleSheet, Text, View } from "react-native";
import { WizardMessage } from "../core/types";
import { colors } from "../theme/colors";

type MessageBubbleProps = {
  message: WizardMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <View style={[styles.wrapper, !isAssistant && styles.userWrapper]}>
      <View style={[styles.bubble, isAssistant ? styles.assistantBubble : styles.userBubble]}>
        <Text style={[styles.role, !isAssistant && styles.userRole]}>{message.role}</Text>
        <Text style={[styles.content, !isAssistant && styles.userContent]}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "92%",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  assistantBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  userBubble: {
    backgroundColor: colors.accent,
  },
  role: {
    color: colors.sky,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userRole: {
    color: colors.slate,
  },
  content: {
    color: colors.inkStrong,
    fontSize: 14,
    lineHeight: 21,
  },
  userContent: {
    color: colors.slate,
  },
});
