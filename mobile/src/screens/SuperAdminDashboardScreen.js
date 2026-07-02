import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions } from "@react-navigation/native";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

export default function SuperAdminDashboardScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { adminLogout } = useApp();

  const onLogout = async () => {
    await adminLogout();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Splash" }] }));
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <SafeAreaView style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
          <Ionicons name="shield-checkmark" size={34} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
          {t("superAdminDashboardTitle", "Super Admin")}
        </Text>
        <Text style={[styles.sub, { color: colors.text2 }]}>
          {t("superAdminDashboardSub", "Bu panel hali tayyorlanmoqda")}
        </Text>

        <TouchableOpacity
          onPress={onLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        >
          <Ionicons name="log-out" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger, fontFamily: fonts.bold }]}>{t("logout")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 20, marginBottom: 8 },
  sub: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  logoutText: { fontSize: 14 },
});
