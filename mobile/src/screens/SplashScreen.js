import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import PrimaryButton from "../components/PrimaryButton";
import { fonts, radius } from "../theme/typography";

export default function SplashScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { t } = useI18n();
  const { role, selectRole, demoLogin } = useApp();

  const goToLogin = () => {
    navigation.navigate(role === "admin" ? "AdminLogin" : "Login");
  };

  const onDemo = () => {
    demoLogin();
    navigation.navigate(role === "admin" ? "AdminPanel" : "MainTabs");
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <View pointerEvents="none" style={[styles.blobA, { backgroundColor: colors.bgBlobA }]} />
      <View pointerEvents="none" style={[styles.blobB, { backgroundColor: colors.bgBlobB }]} />

      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.themeBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
      >
        <Ionicons name={isDark ? "sunny" : "moon"} size={17} color={isDark ? "#ffd34d" : colors.text} />
      </TouchableOpacity>

      <SafeAreaView style={styles.center}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.logo}>
          <Ionicons name="flash" size={42} color="#fff" />
        </LinearGradient>

        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>Navbat</Text>
        <Text style={[styles.sub, { color: colors.text2, fontFamily: fonts.medium }]}>{t("splashSub")}</Text>

        <Text style={[styles.roleLabel, { color: colors.text3, fontFamily: fonts.bold }]}>{t("roleLabel")}</Text>

        <View style={[styles.roleToggle, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <TouchableOpacity
            style={[styles.roleBtn, role === "customer" && { backgroundColor: colors.accent }]}
            onPress={() => selectRole("customer")}
          >
            <Ionicons name="person" size={15} color={role === "customer" ? "#fff" : colors.text2} />
            <Text
              style={[
                styles.roleBtnText,
                { color: role === "customer" ? "#fff" : colors.text2, fontFamily: fonts.bold },
              ]}
            >
              {t("splashBtnCustomer")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === "admin" && { backgroundColor: colors.accent }]}
            onPress={() => selectRole("admin")}
          >
            <Ionicons name="business" size={15} color={role === "admin" ? "#fff" : colors.text2} />
            <Text
              style={[styles.roleBtnText, { color: role === "admin" ? "#fff" : colors.text2, fontFamily: fonts.bold }]}
            >
              {t("splashBtnAdmin")}
            </Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton label={t("btnLogin")} onPress={goToLogin} style={styles.fullBtn} />

        <TouchableOpacity
          onPress={onDemo}
          style={[styles.demoBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        >
          <Ionicons name="flash" size={15} color={colors.accent} />
          <Text style={[styles.demoText, { color: colors.accent, fontFamily: fonts.bold }]}>{t("btnDemoText")}</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.text3 }]}>Navbat v2.5 · {t("appFooter")}</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blobA: { position: "absolute", width: 280, height: 280, borderRadius: 140, top: -40, right: -70, opacity: 0.55 },
  blobB: { position: "absolute", width: 240, height: 240, borderRadius: 120, bottom: 60, left: -70, opacity: 0.45 },
  themeBtn: {
    position: "absolute",
    top: 56,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: { fontSize: 38, letterSpacing: -1 },
  sub: { fontSize: 15, textAlign: "center", marginTop: 8, marginBottom: 38, lineHeight: 21 },
  roleLabel: { fontSize: 11.5, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 },
  roleToggle: {
    flexDirection: "row",
    gap: 6,
    padding: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 26,
    width: "100%",
  },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 11,
  },
  roleBtnText: { fontSize: 14 },
  fullBtn: { width: "100%", marginBottom: 11 },
  demoBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  demoText: { fontSize: 14 },
  footer: { fontSize: 12, marginTop: 30 },
});
