import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { radius } from "../theme/typography";

export default function GlassCard({ children, style, padded = true }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.glassBg,
          borderColor: colors.glassBorder,
          shadowColor: colors.glassShadow,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  padded: {
    padding: 14,
  },
});
