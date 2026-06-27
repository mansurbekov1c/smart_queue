import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { fonts } from "../theme/typography";

export default function HeaderBar({ title, onBack, right, showThemeToggle = false }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        >
          <Ionicons name="chevron-back" size={19} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}

      {title ? <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>{title}</Text> : <View />}

      {right ? (
        right
      ) : showThemeToggle ? (
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.iconBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#ffd34d" : colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 16 },
});
