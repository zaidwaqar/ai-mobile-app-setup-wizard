import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type InfoCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  subtle?: boolean;
};

export function InfoCard({ eyebrow, title, body, subtle }: InfoCardProps) {
  return (
    <View style={[styles.card, subtle && styles.subtleCard]}>
      <Text style={[styles.eyebrow, subtle && styles.subtleEyebrow]}>{eyebrow}</Text>
      <Text style={[styles.title, subtle && styles.subtleTitle]}>{title}</Text>
      <Text style={[styles.body, subtle && styles.subtleBody]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    borderRadius: 24,
    backgroundColor: colors.slate,
    padding: 18,
    gap: 8,
  },
  subtleCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtleEyebrow: {
    color: "#334155",
  },
  title: {
    color: colors.inkStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  subtleTitle: {
    color: "#0F172A",
  },
  body: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 20,
  },
  subtleBody: {
    color: "#475569",
  },
});
