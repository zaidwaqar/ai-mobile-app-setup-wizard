import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type CommandChipProps = {
  label: string;
  onPress: () => void;
};

export function CommandChip({ label, onPress }: CommandChipProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    color: colors.inkStrong,
    fontSize: 13,
    fontWeight: "600",
  },
});
