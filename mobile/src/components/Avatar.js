import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";
import { fonts } from "../theme/typography";

export default function Avatar({ initials, size = 78, fontSize = 26 }) {
  const { colors } = useAppTheme();
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={{ color: "#fff", fontSize, fontFamily: fonts.extrabold }}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
