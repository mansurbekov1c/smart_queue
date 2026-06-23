import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";

export default function StarRating({ value, onChange, size = 30 }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} style={styles.star}>
          <Ionicons name={n <= value ? "star" : "star-outline"} size={size} color={n <= value ? colors.amber : colors.text3} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  star: { padding: 2 },
});
