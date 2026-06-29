import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions } from "@react-navigation/native";
import GlassCard from "../components/GlassCard";
import Avatar from "../components/Avatar";
import FadeInView from "../components/FadeInView";
import LanguagePickerModal from "../modals/LanguagePickerModal";
import PaymentCardModal from "../modals/PaymentCardModal";
import ChangeCredentialsModal from "../modals/ChangeCredentialsModal";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { t, lang, langName } = useI18n();
  const { user, logoutUser } = useApp();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [credOpen, setCredOpen] = useState(false);

  const fullName = user ? `${user.first} ${user.last}` : "—";
  const initials = user ? `${(user.first[0] || "").toUpperCase()}${(user.last[0] || "").toUpperCase()}` : "—";

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

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <FadeInView>
        <ScrollView contentContainerStyle={styles.content}>
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

          {/* Asosiy sozlamalar */}
          <GlassCard style={styles.settingsCard}>
            {/* Bildirishnomalar — switch */}
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

            {/* Tun/kun rejimi */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("darkMode")}</Text>
              <Text style={[styles.settingValue, { color: colors.text3 }]}>
                {isDark ? t("themeNightMode") : t("themeDayMode")} ›
              </Text>
            </TouchableOpacity>

            {/* Til */}
            <TouchableOpacity
              onPress={() => setLangOpen(true)}
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name="globe" size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("language")}</Text>
              <Text style={[styles.settingValue, { color: colors.text3 }]}>{langName(lang)} ›</Text>
            </TouchableOpacity>

            {/* To'lov usuli */}
            <TouchableOpacity
              onPress={() => setPayOpen(true)}
              style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Ionicons name="card" size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>{t("paymentMethod")}</Text>
              <Text style={[styles.settingValue, { color: colors.text3 }]}>{t("configure")} ›</Text>
            </TouchableOpacity>

            {/* Login/Parol o'zgartirish */}
            <TouchableOpacity onPress={() => setCredOpen(true)} style={styles.settingRow}>
              <Ionicons name="lock-closed" size={19} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
                {t("changeCredentials")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text3} />
            </TouchableOpacity>
          </GlassCard>

          {/* Chiqish */}
          <GlassCard style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow} onPress={onLogout}>
              <Ionicons name="log-out" size={19} color={colors.danger} />
              <Text style={[styles.settingLabel, { color: colors.danger, fontFamily: fonts.bold }]}>{t("logout")}</Text>
            </TouchableOpacity>
          </GlassCard>

          <Text style={[styles.footer, { color: colors.text3 }]}>Navbat v2.5 · {t("appFooter")}</Text>
        </ScrollView>
      </FadeInView>

      <LanguagePickerModal visible={langOpen} onClose={() => setLangOpen(false)} />
      <PaymentCardModal visible={payOpen} onClose={() => setPayOpen(false)} />
      <ChangeCredentialsModal visible={credOpen} onClose={() => setCredOpen(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 120 },
  avatarWrap: { alignItems: "center", paddingVertical: 16, marginBottom: 6 },
  name: { fontSize: 21, marginTop: 12 },
  phone: { fontSize: 14, marginTop: 3 },
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
