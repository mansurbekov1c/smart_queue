import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import useExitConfirmOnBack from "../hooks/useExitConfirmOnBack";
import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import FadeInView from "../components/FadeInView";
import LanguagePickerModal from "../modals/LanguagePickerModal";
import ThemePickerModal from "../modals/ThemePickerModal";
import SettingsModal from "../modals/SettingsModal";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { appVersion } from "../utils/appVersion";
import { fonts, radius } from "../theme/typography";

const THEME_LABEL_KEYS = { system: "themeModeSystem", light: "themeModeLight", dark: "themeModeDark" };

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, themeMode } = useAppTheme();
  const { t, lang, langName } = useI18n();
  const { user, logoutUser, refreshUserStats } = useApp();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fullName = user ? `${user.first} ${user.last}` : "—";
  const initials = user ? `${(user.first[0] || "").toUpperCase()}${(user.last[0] || "").toUpperCase()}` : "—";
  const displayPhone = user?.phone
    ? user.phone.startsWith("+") ? user.phone : "+" + user.phone
    : "—";

  const onLogout = () => {
    Alert.alert(t("confirmLogout"), t("confirmLogoutMsg"), [
      { text: t("btnCancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: () => {
          logoutUser();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Splash" }] }));
        },
      },
    ]);
  };

  useExitConfirmOnBack();

  useFocusEffect(
    React.useCallback(() => {
      refreshUserStats();
    }, [refreshUserStats]),
  );

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <FadeInView>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.avatarWrap} onPress={() => setSettingsOpen(true)} activeOpacity={0.7}>
            <Avatar initials={initials} />
            <Text style={[styles.name, { color: colors.text, fontFamily: fonts.extrabold }]}>{fullName}</Text>
            <Text style={[styles.phone, { color: colors.text2 }]}>{displayPhone}</Text>
          </TouchableOpacity>

          <View style={[styles.coinCard, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
            <View style={[styles.coinIcon, { backgroundColor: colors.accent }]}>
              <Ionicons name="star" size={18} color="#fff" />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.coinLabel, { color: colors.text2 }]}>{t("myCoinsLabel")}</Text>
              <Text style={[styles.coinValue, { color: colors.accent, fontFamily: fonts.mono }]}>
                {user?.coins ?? 0} <Text style={[styles.coinUnit, { color: colors.accent }]}>{t("coinWord")}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <GlassCard style={styles.statBox}>
              <Text style={[styles.statVal, { color: colors.accent, fontFamily: fonts.mono }]}>
                {user?.totalServed ?? 0}
              </Text>
              <Text style={[styles.statLbl, { color: colors.text3 }]}>{t("statTotal")}</Text>
            </GlassCard>
          </View>

          <GlassCard style={styles.settingsCard}>
            <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Ionicons name="notifications" size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
                {t("notifications")}
              </Text>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: colors.border, true: colors.accentBorder }}
                thumbColor={notifEnabled ? colors.accent : colors.text3}
              />
            </View>

            <TouchableOpacity
              onPress={() => setThemeOpen(true)}
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("darkMode")}</Text>
              <Text style={[styles.settingValue, { color: colors.text3 }]}>
                {t(THEME_LABEL_KEYS[themeMode])} ›
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLangOpen(true)}
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name="globe" size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("language")}</Text>
              <Text style={[styles.settingValue, { color: colors.text3 }]}>{langName(lang)} ›</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.settingRow}>
              <Ionicons name="settings-outline" size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
                {t("settingsBtnLabel")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text3} />
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow} onPress={onLogout}>
              <Ionicons name="log-out" size={19} color={colors.danger} />
              <Text style={[styles.settingLabel, { color: colors.danger, fontFamily: fonts.bold }]}>{t("logout")}</Text>
            </TouchableOpacity>
          </GlassCard>

          <Text style={[styles.footer, { color: colors.text3 }]}>Navbat v{appVersion} · {t("appFooter")}</Text>
        </ScrollView>
      </FadeInView>

      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
      <ThemePickerModal visible={themeOpen} onClose={() => setThemeOpen(false)} />
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 120 },
  avatarWrap: { alignItems: "center", paddingVertical: 16, marginBottom: 6 },
  name: { fontSize: 21, marginTop: 12 },
  phone: { fontSize: 14, marginTop: 6 },
  coinCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 14,
  },
  coinIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  flex1: { flex: 1 },
  coinLabel: { fontSize: 12.5, marginBottom: 2 },
  coinValue: { fontSize: 20 },
  coinUnit: { fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  statBox: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 26 },
  statLbl: { fontSize: 12, marginTop: 2 },
  settingsCard: { marginBottom: 12, paddingVertical: 4 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 14 },
  settingLabel: { flex: 1, fontSize: 14.5 },
  settingValue: { fontSize: 12.5 },
  footer: { textAlign: "center", fontSize: 11, marginBottom: 10, marginTop: 6 },
});
