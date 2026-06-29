import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import HeaderBar from "../components/HeaderBar";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { CAT_ICONS } from "../data/categoryIcons";
import { fonts, radius } from "../theme/typography";

export default function AdminLoginScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { places, selectedAdminPlaceId, selectAdminPlace, doAdminLogin } = useApp();

  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const scrollRef = useRef(null);

  const selectedPlace = places.find((p) => p.id === selectedAdminPlaceId);

  const onSelectPlace = (id) => {
    selectAdminPlace(id);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const onSubmit = () => {
    if (doAdminLogin(login, pass)) {
      navigation.replace("AdminTabs");
    }
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <HeaderBar title={t("adminLoginTitle")} onBack={() => navigation.goBack()} showThemeToggle={false} />
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.fill}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.logo}>
            <Ionicons name="business" size={26} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("adminLoginTitle")}</Text>
          <Text style={[styles.sub, { color: colors.text2 }]}>{t("adminLoginSub")}</Text>

          <Text style={[styles.section, { color: colors.text3, fontFamily: fonts.bold }]}>{t("sectionPlace")}</Text>

          {places.map((p) => {
            const active = p.id === selectedAdminPlaceId;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => onSelectPlace(p.id)}
                style={[
                  styles.placeRow,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: active ? colors.accent : colors.inputBorder,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
              >
                <View style={[styles.placeIcon, { backgroundColor: colors.iconChipBgStart }]}>
                  <Ionicons name={CAT_ICONS[p.cat] || "business"} size={20} color={colors.accent} />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={[styles.placeName, { color: colors.text, fontFamily: fonts.bold }]}>{p.name}</Text>
                  <Text style={[styles.placeCity, { color: colors.text3 }]}>{p.location.city}</Text>
                </View>
                <Ionicons
                  name={active ? "checkmark-circle" : "chevron-forward"}
                  size={active ? 22 : 18}
                  color={active ? colors.accent : colors.text3}
                />
              </TouchableOpacity>
            );
          })}

          {selectedPlace ? (
            <>
              <View style={[styles.selectedBox, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
                <Text style={[styles.selectedLabel, { color: colors.accent, fontFamily: fonts.bold }]}>
                  {t("selectedPlace").toUpperCase()}
                </Text>
                <Text style={[styles.selectedName, { color: colors.accent, fontFamily: fonts.extrabold }]}>
                  {selectedPlace.name}
                </Text>
              </View>

              <InputField
                label={t("labelLogin")}
                placeholder={t("loginInputPlaceholder")}
                value={login}
                onChangeText={setLogin}
                autoCapitalize="none"
                onFocus={scrollToBottom}
                style={styles.field}
              />
              <InputField
                label={t("labelPass")}
                placeholder={t("passInputPlaceholder")}
                value={pass}
                onChangeText={setPass}
                secureTextEntry
                autoCapitalize="none"
                onFocus={scrollToBottom}
                style={styles.field}
              />

              <PrimaryButton label={t("btnAdminLogin")} onPress={onSubmit} style={styles.submitBtn} />
            </>
          ) : null}
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
  sub: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  section: { fontSize: 11.5, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 },
  placeRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: radius.md, marginBottom: 10 },
  placeIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 14.5 },
  placeCity: { fontSize: 12, marginTop: 1 },
  selectedBox: { borderRadius: radius.md, borderWidth: 1, padding: 12, alignItems: "center", marginBottom: 16, marginTop: 6 },
  selectedLabel: { fontSize: 10.5, letterSpacing: 0.5 },
  selectedName: { fontSize: 18, marginTop: 4 },
  field: { marginBottom: 14 },
  submitBtn: { marginTop: 6 },
});
