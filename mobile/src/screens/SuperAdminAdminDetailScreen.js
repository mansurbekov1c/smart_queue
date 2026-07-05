import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import HeaderBar from "../components/HeaderBar";
import GlassCard from "../components/GlassCard";
import PickerOverlay from "../components/PickerOverlay";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { CAT_ICONS } from "../data/categoryIcons";
import { fetchBranches } from "../api/branches";
import { assignAdminToBranch } from "../api/superadmin";
import { fonts, radius } from "../theme/typography";

export default function SuperAdminAdminDetailScreen({ route, navigation }) {
  const initialAdmin = route.params?.admin;
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [admin, setAdmin] = useState(initialAdmin);
  const [branches, setBranches] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await fetchBranches();
      setBranches(list);
    } catch (e) {
      console.error("Filiallarni yuklash xatosi:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!admin) {
    return (
      <LinearGradient colors={colors.bgGradient} style={styles.fill}>
        <HeaderBar title="" onBack={() => navigation.goBack()} />
      </LinearGradient>
    );
  }

  const onSelectBranch = async (item) => {
    try {
      await assignAdminToBranch(admin.id, item.id);
      setAdmin((a) => ({ ...a, branchId: item.id, branchName: item.name }));
      showToast(t("toastCredSaved"));
      setPickerOpen(false);
      setPickerSearch("");
    } catch (e) {
      console.error("Filialga biriktirish xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    }
  };

  const onDeleteAdmin = () => {
    Alert.alert(
      t("saDeleteAdminTitle", "Adminni o'chirish"),
      t("saComingSoon", "Tez orada"),
      [{ text: "OK" }],
    );
  };

  const pickerItems = branches
    .filter((b) => b.name.toLowerCase().includes(pickerSearch.trim().toLowerCase()))
    .map((b) => ({ id: b.id, label: b.name, sublabel: b.location?.city, icon: CAT_ICONS[b.cat] || "business" }));

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <HeaderBar title={admin.name} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.avatar}>
            <Text style={{ color: "#fff", fontFamily: fonts.extrabold, fontSize: 20 }}>{initials(admin.name)}</Text>
          </LinearGradient>
          <Text style={[styles.heroName, { color: colors.text, fontFamily: fonts.extrabold }]}>{admin.name}</Text>
          <Text style={{ color: colors.text3, fontSize: 11, fontWeight: "600", marginTop: 2 }}>
            {t("saBranchAdminRole", "Filial administratori")}
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={15} color={colors.accent} />
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "500" }}>{admin.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={15} color={colors.accent} />
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600", flex: 1 }} numberOfLines={1}>
              {admin.branchName || t("saUnassigned", "Biriktirilmagan")}
            </Text>
          </View>
        </GlassCard>

        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={[styles.assignBtn, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}
        >
          <Ionicons name="business" size={14} color={colors.accent} />
          <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12, marginLeft: 7 }}>
            {t("saAssignBranch", "Filialga biriktirish")}
          </Text>
        </TouchableOpacity>

        <GlassCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t("saChangeEmail", "Email o'zgartirish")}
          </Text>
          <View style={[styles.readonlyField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "500" }}>{admin.email}</Text>
          </View>
          <TouchableOpacity
            onPress={() => showToast(t("saComingSoon", "Tez orada"))}
            style={styles.savePillBtn}
          >
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.savePillInner}>
              <Text style={{ color: "#fff", fontFamily: fonts.bold, fontSize: 11.5 }}>{t("save", "Saqlash")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t("saChangePassword", "Parolni o'zgartirish")}
          </Text>
          <View style={[styles.readonlyField, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Text style={{ color: colors.placeholder, fontSize: 12, fontWeight: "500" }}>
              {t("saNewPasswordPlaceholder", "Yangi parol kiriting")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => showToast(t("saComingSoon", "Tez orada"))}
            style={[styles.resetBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          >
            <Ionicons name="key-outline" size={13} color={colors.accent} />
            <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 11.5, marginLeft: 6 }}>
              {t("saResetPassword", "Parolni tiklash")}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        <TouchableOpacity
          onPress={onDeleteAdmin}
          style={[styles.deleteBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder }]}
        >
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
          <Text style={{ color: colors.danger, fontFamily: fonts.bold, fontSize: 13, marginLeft: 8 }}>
            {t("saDeleteAdmin", "Adminni o'chirish")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <PickerOverlay
        visible={pickerOpen}
        title={t("saPickBranch", "Filial tanlash")}
        items={pickerItems}
        selectedId={admin.branchId}
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        onSelect={onSelectBranch}
        onClose={() => {
          setPickerOpen(false);
          setPickerSearch("");
        }}
      />
    </LinearGradient>
  );
}

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  hero: { alignItems: "center", paddingVertical: 6 },
  avatar: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  heroName: { fontSize: 17, marginTop: 9 },
  card: { gap: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 12.5 },
  assignBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  readonlyField: { borderRadius: radius.sm - 1, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 11 },
  savePillBtn: { marginTop: 2 },
  savePillInner: { alignItems: "center", justifyContent: "center", paddingVertical: 9, borderRadius: 11 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 4,
  },
});
