import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { fonts } from "../theme/typography";

/* Admin hisobiga hali filial biriktirilmagan bo'lsa (super admin tomonidan)
   ko'rsatiladi — Panel/Statistika/Ish jadvali ekranlari bo'sh oqlik o'rniga
   buni ko'rsatadi. */
export default function NoBranchNotice() {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  return (
    <View style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
      <LinearGradient colors={colors.bgGradient} style={[styles.fill, styles.center]}>
        <Ionicons name="business-outline" size={40} color={colors.text3} />
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>
          {t("noBranchAssignedTitle")}
        </Text>
        <Text style={[styles.sub, { color: colors.text3 }]}>{t("noBranchAssignedMsg")}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 10 },
  title: { fontSize: 16, marginTop: 4, textAlign: "center" },
  sub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
