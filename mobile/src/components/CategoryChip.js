import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { fonts, radius } from "../theme/typography";

export default function CategoryChip({ label, icon, active, onPress }) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: colors.accent }
          : { backgroundColor: colors.pillBg, borderWidth: 1, borderColor: colors.pillBorder },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? "#fff" : colors.text2} style={styles.icon} />
      ) : null}
      <Text style={[styles.label, { color: active ? "#fff" : colors.text2, fontFamily: fonts.semibold }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    marginRight: 8,
  },
  icon: { marginRight: 6 },
  label: { fontSize: 13 },
});
