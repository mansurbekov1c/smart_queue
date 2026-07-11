import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { fonts, radius } from "../theme/typography";

export default function SecondaryButton({ label, onPress, icon, danger, loading, disabled, style, textColor }) {
  const { colors } = useAppTheme();
  const fg = danger ? colors.danger : textColor || colors.accent;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: danger ? colors.dangerSoft : colors.inputBg,
          borderColor: danger ? colors.dangerBorder : colors.inputBorder,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={16} color={fg} style={styles.icon} /> : null}
          <Text style={[styles.label, { color: fg, fontFamily: fonts.bold }]}>{label}</Text>
        </View>
      )}
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
  disabled: { opacity: 0.5 },
});
