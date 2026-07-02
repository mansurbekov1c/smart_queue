import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import HeaderBar from "../components/HeaderBar";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts } from "../theme/typography";

export default function AdminLoginScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { doAdminLogin } = useApp();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const profile = await doAdminLogin(email, pass);
    setSubmitting(false);
    if (!profile) return;

    if (profile.role === "super_admin") {
      navigation.replace("SuperAdminDashboard");
    } else {
      navigation.replace("AdminTabs");
    }
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <HeaderBar title={t("adminLoginTitle")} onBack={() => navigation.goBack()} showThemeToggle={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.fill}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.logo}>
            <Ionicons name="business" size={26} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("adminLoginTitle")}</Text>
          <Text style={[styles.sub, { color: colors.text2 }]}>{t("adminLoginSub")}</Text>

          <InputField
            label={t("labelEmail")}
            placeholder={t("emailInputPlaceholder")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.field}
          />
          <InputField
            label={t("labelPass")}
            placeholder={t("passInputPlaceholder")}
            value={pass}
            onChangeText={setPass}
            secureTextEntry
            autoCapitalize="none"
            style={styles.field}
          />

          <PrimaryButton
            label={t("btnAdminLogin")}
            onPress={onSubmit}
            disabled={submitting}
            loading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 60 },
  logo: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { fontSize: 21, marginBottom: 3 },
  sub: { fontSize: 13, marginBottom: 24, lineHeight: 18 },
  field: { marginBottom: 14 },
  submitBtn: { marginTop: 6 },
});
