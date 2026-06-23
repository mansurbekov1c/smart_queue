import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions } from "@react-navigation/native";
import HeaderBar from "../components/HeaderBar";
import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts } from "../theme/typography";

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { t, lang, setLang, langCodes, langName } = useI18n();
  const { user, logoutUser } = useApp();

  const fullName = user ? `${user.first} ${user.last}` : "—";
  const initials = user ? `${(user.first[0] || "").toUpperCase()}${(user.last[0] || "").toUpperCase()}` : "—";

  const cycleLang = () => {
    const idx = langCodes.indexOf(lang);
    const next = langCodes[(idx + 1) % langCodes.length];
    setLang(next);
  };

  const onLogout = () => {
    logoutUser();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Splash" }] }));
  };

  const rows = [
    { icon: "notifications", label: t("notifications"), value: t("notifEnabled"), onPress: null },
    {
      icon: isDark ? "sunny" : "moon",
      label: t("darkMode"),
      value: isDark ? t("themeNightMode") : t("themeDayMode"),
      onPress: toggleTheme,
    },
    { icon: "globe", label: t("language"), value: langName(lang), onPress: cycleLang },
    { icon: "card", label: t("paymentMethod"), value: t("configure"), onPress: null },
  ];

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <HeaderBar title={t("profile")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <View style={styles.avatarWrap}>
          <Avatar initials={initials} />
          <Text style={[styles.name, { color: colors.text, fontFamily: fonts.extrabold }]}>{fullName}</Text>
          <Text style={[styles.phone, { color: colors.text2 }]}>{user?.phone || "—"}</Text>
        </View>

        <View style={styles.statsRow}>
          <GlassCard style={styles.statBox}>
            <Text style={[styles.statVal, { color: colors.accent, fontFamily: fonts.mono }]}>24</Text>
            <Text style={[styles.statLbl, { color: colors.text3 }]}>{t("statTotal")}</Text>
          </GlassCard>
          <GlassCard style={styles.statBox}>
            <Text style={[styles.statVal, { color: colors.accent, fontFamily: fonts.mono }]}>
              2.4<Text style={{ fontSize: 14 }}> {t("hourUnit")}</Text>
            </Text>
            <Text style={[styles.statLbl, { color: colors.text3 }]}>{t("statSaved")}</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.settingsCard}>
          {rows.map((r, i) => (
            <TouchableOpacity
              key={r.label}
              onPress={r.onPress || undefined}
              disabled={!r.onPress}
              style={[styles.settingRow, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name={r.icon} size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{r.label}</Text>
              <Text style={[styles.settingValue, { color: colors.text3 }]}>{r.value} ›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.settingRow} onPress={onLogout}>
            <Ionicons name="log-out" size={19} color={colors.danger} />
            <Text style={[styles.settingLabel, { color: colors.danger, fontFamily: fonts.bold }]}>{t("logout")}</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={[styles.footer, { color: colors.text3 }]}>Navbat v2.5 · {t("appFooter")}</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  avatarWrap: { alignItems: "center", paddingVertical: 16, marginBottom: 6 },
  name: { fontSize: 21, marginTop: 12 },
  phone: { fontSize: 14, marginTop: 3 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  statBox: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 26 },
  statLbl: { fontSize: 12, marginTop: 2 },
  settingsCard: { marginBottom: 16, paddingVertical: 4 },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 14 },
  settingLabel: { flex: 1, fontSize: 14.5 },
  settingValue: { fontSize: 12.5 },
  footer: { textAlign: "center", fontSize: 11, marginBottom: 10 },
});
