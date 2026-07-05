import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import HeaderBar from "../components/HeaderBar";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import PhoneField from "../components/PhoneField";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { isLatinName } from "../utils/validation";
import { fonts, radius } from "../theme/typography";

export default function LoginScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { doLogin, doRegister } = useApp();
  const { showToast } = useToast();

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [regPhone, setRegPhone] = useState("998");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ok = await doLogin(email, pass);
    setSubmitting(false);
    if (ok) navigation.replace("MainTabs");
  };

  const onRegister = async () => {
    if (submitting) return;
    if (!isLatinName(first) || !isLatinName(last)) {
      showToast(t("toastLatinOnly"));
      return;
    }
    setSubmitting(true);
    const ok = await doRegister(first, last, regPhone, regEmail, regPass);
    setSubmitting(false);
    if (ok) navigation.replace("MainTabs");
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <HeaderBar title={t(tab === "login" ? "tabLogin" : "tabRegister")} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.logo}>
            <Ionicons name="flash" size={28} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
            {tab === "login" ? t("loginTitle") : t("registerTitle")}
          </Text>
          <Text style={[styles.sub, { color: colors.text2 }]}>{t("loginSub")}</Text>

          <View style={[styles.tabs, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === "login" && { backgroundColor: colors.accent }]}
              onPress={() => setTab("login")}
            >
              <Text style={[styles.tabText, { color: tab === "login" ? "#fff" : colors.text2, fontFamily: fonts.bold }]}>
                {t("tabLogin")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === "register" && { backgroundColor: colors.accent }]}
              onPress={() => setTab("register")}
            >
              <Text
                style={[styles.tabText, { color: tab === "register" ? "#fff" : colors.text2, fontFamily: fonts.bold }]}
              >
                {t("tabRegister")}
              </Text>
            </TouchableOpacity>
          </View>

          {tab === "login" ? (
            <>
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
                placeholder={t("passPlaceholder")}
                value={pass}
                onChangeText={setPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <PrimaryButton
                label={t("btnLoginSubmit")}
                onPress={onLogin}
                disabled={submitting}
                loading={submitting}
                style={styles.submitBtn}
              />
            </>
          ) : (
            <>
              <View style={styles.row2}>
                <InputField
                  label={t("labelFirstname")}
                  placeholder={t("firstNamePlaceholder")}
                  value={first}
                  onChangeText={setFirst}
                  style={[styles.field, styles.half]}
                />
                <InputField
                  label={t("labelLastname")}
                  placeholder={t("lastNamePlaceholder")}
                  value={last}
                  onChangeText={setLast}
                  style={[styles.field, styles.half]}
                />
              </View>
              <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatinOnly")}</Text>
              <PhoneField
                label={t("labelPhone")}
                onChangeText={setRegPhone}
                colors={colors}
              />
              <View style={styles.field} />
              <InputField
                label={t("labelEmail")}
                placeholder={t("emailInputPlaceholder")}
                value={regEmail}
                onChangeText={setRegEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.field}
              />
              <InputField
                label={t("labelPass")}
                placeholder={t("minCharsPlaceholder")}
                value={regPass}
                onChangeText={setRegPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <PrimaryButton
                label={t("btnRegisterSubmit")}
                onPress={onRegister}
                disabled={submitting}
                loading={submitting}
                style={styles.submitBtn}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
  logo: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  title: { fontSize: 24, marginBottom: 4 },
  sub: { fontSize: 14, marginBottom: 20 },
  tabs: { flexDirection: "row", gap: 6, padding: 5, borderRadius: radius.md, borderWidth: 1, marginBottom: 22 },
  tabBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center" },
  tabText: { fontSize: 13.5 },
  field: { marginBottom: 14 },
  hint: { fontSize: 11.5, marginTop: -6, marginBottom: 14 },
  row2: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  submitBtn: { marginTop: 6 },
});
