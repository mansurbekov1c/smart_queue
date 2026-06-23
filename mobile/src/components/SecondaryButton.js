import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { fonts, radius } from "../theme/typography";

export default function SecondaryButton({ label, onPress, icon, danger, style, textColor }) {
  const { colors } = useAppTheme();
  const fg = danger ? colors.danger : textColor || colors.accent;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.btn,
        {
          backgroundColor: danger ? colors.dangerSoft : colors.inputBg,
          borderColor: danger ? colors.dangerBorder : colors.inputBorder,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Ionicons name={icon} size={16} color={fg} style={styles.icon} /> : null}
        <Text style={[styles.label, { color: fg, fontFamily: fonts.bold }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 7 },
  label: { fontSize: 14 },
});
