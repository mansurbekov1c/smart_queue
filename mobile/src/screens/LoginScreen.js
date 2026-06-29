import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import HeaderBar from "../components/HeaderBar";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

const COUNTRY_CODES = [
  { code: "998", flag: "🇺🇿", name: "O'zbekiston" },
  { code: "7", flag: "🇷🇺", name: "Rossiya / Qozog'iston" },
  { code: "994", flag: "🇦🇿", name: "Ozarbayjon" },
  { code: "374", flag: "🇦🇲", name: "Armaniston" },
  { code: "996", flag: "🇰🇬", name: "Qirg'iziston" },
  { code: "992", flag: "🇹🇯", name: "Tojikiston" },
  { code: "993", flag: "🇹🇲", name: "Turkmaniston" },
  { code: "90", flag: "🇹🇷", name: "Turkiya" },
  { code: "1", flag: "🇺🇸", name: "AQSh" },
  { code: "44", flag: "🇬🇧", name: "Britaniya" },
  { code: "49", flag: "🇩🇪", name: "Germaniya" },
  { code: "33", flag: "🇫🇷", name: "Fransiya" },
  { code: "86", flag: "🇨🇳", name: "Xitoy" },
  { code: "82", flag: "🇰🇷", name: "Janubiy Koreya" },
  { code: "91", flag: "🇮🇳", name: "Hindiston" },
];

function detectCountry(phone) {
  const digits = phone.replace(/\D/g, "");
  for (const len of [3, 2, 1]) {
    const prefix = digits.slice(0, len);
    const match = COUNTRY_CODES.find((c) => c.code === prefix);
    if (match) return match;
  }
  return null;
}

function PhoneField({ label, value, onChangeText, colors }) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);

  const detectedCountry = useMemo(() => detectCountry(value), [value]);
  const displayCountry = detectedCountry || selectedCountry;

  const filteredCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q),
    );
  }, [search]);

  return (
    <View>
      {label ? (
        <Text style={[styles.phoneLabel, { color: colors.text2, fontFamily: fonts.bold }]}>{label}</Text>
      ) : null}
      <View style={[styles.phoneRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <TouchableOpacity style={styles.codeBtn} onPress={() => setPickerVisible(true)}>
          <Text style={styles.codeFlag}>{displayCountry.flag}</Text>
          <Text style={[styles.codeText, { color: colors.accent, fontFamily: fonts.bold }]}>
            +{displayCountry.code}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.text3} />
        </TouchableOpacity>
        <View style={[styles.codeDivider, { backgroundColor: colors.inputBorder }]} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder="90 123 45 67"
          placeholderTextColor={colors.placeholder}
          style={[styles.phoneInput, { color: colors.text, fontFamily: fonts.medium }]}
          autoCapitalize="none"
        />
      </View>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]} onPress={() => setPickerVisible(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.inputBorder }]} />
            <View style={[styles.modalSearch, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="search" size={16} color={colors.text3} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Qidirish..."
                placeholderTextColor={colors.placeholder}
                style={[styles.modalSearchInput, { color: colors.text, fontFamily: fonts.medium }]}
              />
            </View>
            <ScrollView style={styles.modalList}>
              {filteredCodes.map((c) => (
                <TouchableOpacity
                  key={c.code + c.name}
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedCountry(c);
                    setPickerVisible(false);
                    setSearch("");
                  }}
                >
                  <Text style={styles.modalFlag}>{c.flag}</Text>
                  <Text style={[styles.modalName, { color: colors.text, fontFamily: fonts.medium }]}>{c.name}</Text>
                  <Text style={[styles.modalCode, { color: colors.accent, fontFamily: fonts.bold }]}>+{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { doLogin, doRegister } = useApp();

  const [tab, setTab] = useState("login");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");

  const onLogin = () => {
    if (doLogin(phone, pass)) {
      navigation.replace("MainTabs");
    }
  };

  const onRegister = () => {
    if (doRegister(first, last, regPhone, regPass)) {
      navigation.replace("MainTabs");
    }
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
              <PhoneField
                label={t("labelPhone")}
                value={phone}
                onChangeText={setPhone}
                colors={colors}
              />
              <View style={styles.field} />
              <InputField
                label={t("labelPass")}
                placeholder={t("passPlaceholder")}
                value={pass}
                onChangeText={setPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <PrimaryButton label={t("btnLoginSubmit")} onPress={onLogin} style={styles.submitBtn} />
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
              <PhoneField
                label={t("labelPhone")}
                value={regPhone}
                onChangeText={setRegPhone}
                colors={colors}
              />
              <View style={styles.field} />
              <InputField
                label={t("labelPass")}
                placeholder={t("minCharsPlaceholder")}
                value={regPass}
                onChangeText={setRegPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <PrimaryButton label={t("btnRegisterSubmit")} onPress={onRegister} style={styles.submitBtn} />
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
  row2: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  submitBtn: { marginTop: 6 },
  phoneLabel: { fontSize: 12.5, marginBottom: 7 },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  codeBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 14 },
  codeFlag: { fontSize: 20 },
  codeText: { fontSize: 14 },
  codeDivider: { width: 1, height: 24 },
  phoneInput: { flex: 1, fontSize: 15, paddingHorizontal: 12, paddingVertical: 14 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 12, paddingBottom: 40, maxHeight: "80%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  modalSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  modalSearchInput: { flex: 1, fontSize: 14 },
  modalList: { paddingHorizontal: 16 },
  modalItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  modalFlag: { fontSize: 22 },
  modalName: { flex: 1, fontSize: 14.5 },
  modalCode: { fontSize: 14 },
});
