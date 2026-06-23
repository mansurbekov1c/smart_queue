import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";

export default function ScreenBackground({ children }) {
  const { colors } = useAppTheme();
  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <View pointerEvents="none" style={[styles.blobA, { backgroundColor: colors.bgBlobA }]} />
      <View pointerEvents="none" style={[styles.blobB, { backgroundColor: colors.bgBlobB }]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blobA: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -60,
    right: -60,
    opacity: 0.5,
  },
  blobB: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 120,
    left: -70,
    opacity: 0.4,
  },
});
