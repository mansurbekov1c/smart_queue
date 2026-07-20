import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions } from "@react-navigation/native";
import useExitConfirmOnBack from "../hooks/useExitConfirmOnBack";
import GlassCard from "../components/GlassCard";
import FadeInView from "../components/FadeInView";
import LanguagePickerModal from "../modals/LanguagePickerModal";
import ThemePickerModal from "../modals/ThemePickerModal";
import AdminSettingsModal from "../modals/AdminSettingsModal";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { appVersion } from "../utils/appVersion";
import { fonts, radius } from "../theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME_LABEL_KEYS = { system: "themeModeSystem", light: "themeModeLight", dark: "themeModeDark" };

export default function AdminProfileScreen({ navigation }) {
  const { colors, isDark, themeMode } = useAppTheme();
  const { t, lang, langName } = useI18n();
  const { adminPlace, adminLogout, updatePlaceName } = useApp();
  const insets = useSafeAreaInsets();

  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [credOpen, setCredOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const startEditName = () => {
    setNameValue(adminPlace?.name || "");
    setEditingName(true);
  };

  const saveName = () => {
    if (updatePlaceName(nameValue)) setEditingName(false);
  };

  const onLogout = () => {
    Alert.alert(t("confirmLogout"), t("confirmLogoutMsg"), [
      { text: t("btnCancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: () => {
          adminLogout();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Splash" }] }));
        },
      },
    ]);
  };

  useExitConfirmOnBack();

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <FadeInView>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("adminProfile")}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.adminCard, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.adminAvatar}>
              <Ionicons name="business" size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.adminInfo}>
              {editingName ? (
                <TextInput
                  value={nameValue}
                  onChangeText={setNameValue}
                  autoFocus
                  onSubmitEditing={saveName}
                  onBlur={saveName}
                  style={[
                    styles.adminName,
                    styles.adminNameInput,
                    { color: colors.text, fontFamily: fonts.extrabold, borderBottomColor: colors.accent },
                  ]}
                />
              ) : (
                <TouchableOpacity onPress={startEditName} activeOpacity={0.7}>
                  <Text style={[styles.adminName, { color: colors.text, fontFamily: fonts.extrabold }]}>
                    {adminPlace?.name || "—"}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.adminRole, { color: colors.accent, fontFamily: fonts.bold }]}>{t("adminRoleLabel")}</Text>
            </View>
          </View>

          <GlassCard style={styles.settingsCard}>
            <TouchableOpacity
              onPress={() => setThemeOpen(true)}
              style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={19} color={colors.accent} />
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("darkMode")}</Text>
              <Text style={[styles.rowValue, { color: colors.text3 }]}>
                {t(THEME_LABEL_KEYS[themeMode])} ›
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

            <TouchableOpacity
              onPress={() => navigation.navigate("WorkSchedule")}
              style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name="calendar-outline" size={19} color={colors.accent} />
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
                {t("workScheduleTitle")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text3} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCredOpen(true)} style={styles.row}>
              <Ionicons name="settings-outline" size={19} color={colors.accent} />
              <Text style={[styles.rowLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
                {t("settingsBtnLabel")}
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

          <Text style={[styles.footer, { color: colors.text3 }]}>Navbat v{appVersion} · {t("appFooter")}</Text>
        </ScrollView>
      </FadeInView>

      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
      <ThemePickerModal visible={themeOpen} onClose={() => setThemeOpen(false)} />
      <AdminSettingsModal visible={credOpen} onClose={() => setCredOpen(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 20 },
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
  adminNameInput: { paddingVertical: 2, borderBottomWidth: 1 },
  adminRole: { fontSize: 13, marginTop: 2 },
  settingsCard: { marginBottom: 12, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowLabel: { flex: 1, fontSize: 14.5 },
  rowValue: { fontSize: 12.5 },
  footer: { textAlign: "center", fontSize: 11, marginTop: 16 },
});
