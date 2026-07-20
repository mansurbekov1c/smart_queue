import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import useExitConfirmOnBack from "../hooks/useExitConfirmOnBack";
import { fonts } from "../theme/typography";

export default function SuperAdminStatsScreen() {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  useExitConfirmOnBack();

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <SafeAreaView style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
          <Ionicons name="bar-chart" size={30} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
          {t("saStatsTitle", "Statistika")}
        </Text>
        <Text style={[styles.sub, { color: colors.text2 }]}>{t("saComingSoon", "Tez orada")}</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, marginBottom: 8 },
  sub: { fontSize: 13.5 },
});
