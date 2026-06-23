import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { fonts, radius } from "../theme/typography";

export default function PrimaryButton({ label, onPress, icon, disabled, loading, style, color }) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled || loading} style={style}>
      <LinearGradient
        colors={color ? [color, color] : [colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.row}>
            {icon ? <Ionicons name={icon} size={17} color="#fff" style={styles.icon} /> : null}
            <Text style={[styles.label, { fontFamily: fonts.bold }]}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 8 },
  label: { color: "#fff", fontSize: 15 },
  disabled: { opacity: 0.5 },
});
