import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions } from "@react-navigation/native";
import GlassCard from "../components/GlassCard";
import FadeInView from "../components/FadeInView";
import LanguagePickerModal from "../modals/LanguagePickerModal";
import ChangeCredentialsModal from "../modals/ChangeCredentialsModal";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

export default function AdminProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { t, lang, langName } = useI18n();
  const { adminPlace, adminLogout } = useApp();

  const [langOpen, setLangOpen] = useState(false);
  const [credOpen, setCredOpen] = useState(false);

  const onLogout = () => {
    adminLogout();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Splash" }] }));
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <FadeInView>
        <View style={[styles.header, { paddingTop: 56 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          >
            <Ionicons name="chevron-back" size={19} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>{t("adminProfile")}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.adminCard, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.adminAvatar}>
              <Ionicons name="business" size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.adminInfo}>
              <Text style={[styles.adminName, { color: colors.text, fontFamily: fonts.extrabold }]}>
                {adminPlace?.name || "—"}
              </Text>
              <Text style={[styles.adminRole, { color: colors.accent, fontFamily: fonts.bold }]}>Administrator</Text>
            </View>
          </View>

          <GlassCard style={styles.settingsCard}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={19} color={colors.accent} />
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("darkMode")}</Text>
              <Text style={[styles.rowValue, { color: colors.text3 }]}>
                {isDark ? t("themeNightMode") : t("themeDayMode")} ›
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLangOpen(true)}
              style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name="globe" size={19} color={colors.accent} />
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("language")}</Text>
              <Text style={[styles.rowValue, { color: colors.text3 }]}>{langName(lang)} ›</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCredOpen(true)} style={styles.row}>
              <Ionicons name="lock-closed" size={19} color={colors.accent} />
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
                {t("changeCredentials")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text3} />
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.settingsCard}>
            <TouchableOpacity style={styles.row} onPress={onLogout}>
              <Ionicons name="log-out" size={19} color={colors.danger} />
              <Text style={[styles.rowLabel, { color: colors.danger, fontFamily: fonts.bold }]}>{t("logout")}</Text>
            </TouchableOpacity>
          </GlassCard>

          <Text style={[styles.footer, { color: colors.text3 }]}>Navbat v2.5 · {t("appFooter")}</Text>
        </ScrollView>
      </FadeInView>

      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
      <ChangeCredentialsModal visible={credOpen} onClose={() => setCredOpen(false)} isAdmin />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16 },
  content: { paddingHorizontal: 16, paddingBottom: 120 },
  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 4,
  },
  adminAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  adminInfo: { flex: 1 },
  adminName: { fontSize: 16 },
  adminRole: { fontSize: 13, marginTop: 2 },
  settingsCard: { marginBottom: 12, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowLabel: { flex: 1, fontSize: 14.5 },
  rowValue: { fontSize: 12.5 },
  footer: { textAlign: "center", fontSize: 11, marginTop: 16 },
});
