import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { fonts, radius } from "../theme/typography";

export default function InputField({ label, style, ...rest }) {
  const { colors } = useAppTheme();
  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: colors.text2, fontFamily: fonts.bold }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
            color: colors.text,
            fontFamily: fonts.medium,
          },
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12.5, marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 15,
    fontSize: 15,
  },
});
