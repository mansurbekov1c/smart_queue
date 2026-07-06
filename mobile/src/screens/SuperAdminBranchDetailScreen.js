import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import HeaderBar from "../components/HeaderBar";
import GlassCard from "../components/GlassCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import PickerOverlay from "../components/PickerOverlay";
import BranchMapPreview from "../components/BranchMapPreview";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { CAT_ICONS } from "../data/categoryIcons";
import { fetchAllAdmins, updateBranch, deleteBranch, assignAdminToBranch, unassignAdmin } from "../api/superadmin";
import { isLatinName } from "../utils/validation";
import { fonts, radius } from "../theme/typography";

const DAY_LABEL_KEYS = {
  mon: "dayMonShort",
  tue: "dayTueShort",
  wed: "dayWedShort",
  thu: "dayThuShort",
  fri: "dayFriShort",
  sat: "daySatShort",
  sun: "daySunShort",
};

export default function SuperAdminBranchDetailScreen({ route, navigation }) {
  const branch = route.params?.branch;
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [name, setName] = useState(branch?.name || "");
  const [address, setAddress] = useState(branch?.location?.address || "");
  const [latText, setLatText] = useState(branch?.location?.coords?.lat != null ? String(branch.location.coords.lat) : "");
  const [lngText, setLngText] = useState(branch?.location?.coords?.lng != null ? String(branch.location.coords.lng) : "");
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await fetchAllAdmins();
      setAdmins(list);
    } catch (e) {
      console.error("Adminlarni yuklash xatosi:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!branch) {
    return (
      <LinearGradient colors={colors.bgGradient} style={styles.fill}>
        <HeaderBar title="" onBack={() => navigation.goBack()} />
      </LinearGradient>
    );
  }

  const currentAdmin = admins.find((a) => a.branchId === branch.id) || null;

  const onSaveInfo = async () => {
    if (!name.trim() || !address.trim()) {
      showToast(t("saFillAllFields", "Barcha maydonlarni to'ldiring"));
      return;
    }
    if (!isLatinName(name)) {
      showToast(t("toastLatinOnly"));
      return;
    }
    const lat = latText.trim() ? parseFloat(latText) : null;
    const lng = lngText.trim() ? parseFloat(lngText) : null;
    if ((latText.trim() && !Number.isFinite(lat)) || (lngText.trim() && !Number.isFinite(lng))) {
      showToast(t("toastInvalidTimeFormat"));
      return;
    }
    setSaving(true);
    try {
      await updateBranch(branch.id, { name: name.trim(), address: address.trim(), lat, lng });
      showToast(t("toastCredSaved"));
    } catch (e) {
      console.error("Filialni yangilash xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    } finally {
      setSaving(false);
    }
  };

  const onUnassign = async () => {
    if (!currentAdmin) return;
    try {
      await unassignAdmin(currentAdmin.id);
      showToast(t("toastCredSaved"));
      load();
    } catch (e) {
      console.error("Adminni bo'shatish xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    }
  };

  const onSelectAdmin = async (item) => {
    try {
      await assignAdminToBranch(item.id, branch.id);
      showToast(t("toastCredSaved"));
      setPickerOpen(false);
      setPickerSearch("");
      load();
    } catch (e) {
      console.error("Admin biriktirish xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    }
  };

  const onDeleteBranch = () => {
    Alert.alert(
      t("saDeleteBranchTitle", "Filialni o'chirish"),
      t("saDeleteBranchConfirm", "Bu filialni o'chirishga aminmisiz? Bu amalni bekor qilib bo'lmaydi."),
      [
        { text: t("cancel", "Bekor qilish"), style: "cancel" },
        {
          text: t("delete", "O'chirish"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBranch(branch.id);
              showToast(t("toastCredSaved"));
              navigation.goBack();
            } catch (e) {
              console.error("Filialni o'chirish xatosi:", e);
              showToast(t("toastActionFailed", "Amal bajarilmadi"));
            }
          },
        },
      ],
    );
  };

  const pickerItems = admins
    .filter((a) => a.name.toLowerCase().includes(pickerSearch.trim().toLowerCase()))
    .map((a) => ({ id: a.id, label: a.name, sublabel: a.branchName || t("saUnassigned", "Biriktirilmagan"), icon: "person" }));

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <HeaderBar title={branch.name} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.heroIcon}>
            <Ionicons name={CAT_ICONS[branch.cat] || "business"} size={26} color="#fff" />
          </LinearGradient>
          <Text style={[styles.heroName, { color: colors.text, fontFamily: fonts.extrabold }]}>{branch.name}</Text>
          <View style={[styles.catPill, { backgroundColor: colors.accentSoft }]}>
            <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 10.5 }}>
              {t(`cat${branch.cat?.[0]?.toUpperCase()}${branch.cat?.slice(1)}`, branch.cat)}
            </Text>
          </View>
        </View>

        <GlassCard style={styles.card}>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={15} color={colors.accent} style={{ marginTop: 1 }} />
            <Text style={[styles.addressText, { color: colors.text2 }]}>
              {branch.location?.city}, {branch.location?.district}, {branch.location?.address}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: branch.isOpen ? colors.success : colors.danger }]} />
            <Text style={{ color: branch.isOpen ? colors.success : colors.danger, fontFamily: fonts.bold, fontSize: 12 }}>
              {branch.isOpen ? t("saOpen", "Ochiq") : t("saClosed", "Yopiq")}
            </Text>
          </View>
          <BranchMapPreview
            lat={latText.trim() ? parseFloat(latText) : null}
            lng={lngText.trim() ? parseFloat(lngText) : null}
            style={styles.mapPreview}
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t("saWorkHours", "Ish vaqti")}
          </Text>
          {branch.weeklySchedule ? (
            Object.keys(DAY_LABEL_KEYS).map((key) => {
              const d = branch.weeklySchedule[key];
              return (
                <View key={key} style={[styles.dayRow, { borderColor: colors.border }]}>
                  <Text style={{ color: colors.text2, fontFamily: fonts.semibold, fontSize: 11.5 }}>
                    {t(DAY_LABEL_KEYS[key])}
                  </Text>
                  <Text style={{ color: d?.closed ? colors.text3 : colors.text, fontFamily: fonts.bold, fontSize: 11.5 }}>
                    {d?.closed ? t("saDayOff", "Dam olish kuni") : `${d?.open || "--"}–${d?.close || "--"}`}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: colors.text3, fontSize: 12 }}>{t("saNotConfigured", "Sozlanmagan")}</Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate("WorkSchedule", { branchId: branch.id, branchName: branch.name })}
            style={[styles.scheduleBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          >
            <Ionicons name="calendar-outline" size={13} color={colors.accent} />
            <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 11.5, marginLeft: 6 }}>
              {t("saEditHours", "Ish vaqtini o'zgartirish")}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t("saEditBranch", "Tahrirlash")}
          </Text>
          <InputField label={t("saBranchName", "Filial nomi")} value={name} onChangeText={setName} style={styles.field} />
          <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatinOnly")}</Text>
          <InputField label={t("saAddress", "Manzil")} value={address} onChangeText={setAddress} style={styles.field} />
          <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatLngOptional")}</Text>
          <View style={styles.locRow}>
            <InputField label={t("labelLat")} value={latText} onChangeText={setLatText} keyboardType="numbers-and-punctuation" style={styles.locInput} />
            <InputField label={t("labelLng")} value={lngText} onChangeText={setLngText} keyboardType="numbers-and-punctuation" style={styles.locInput} />
          </View>
          <PrimaryButton label={t("save", "Saqlash")} onPress={onSaveInfo} loading={saving} />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t("saAssignedAdmin", "Biriktirilgan admin")}
          </Text>
          {currentAdmin ? (
            <>
              <View style={styles.adminInfoRow}>
                <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.adminAvatar}>
                  <Text style={{ color: "#fff", fontFamily: fonts.extrabold, fontSize: 12 }}>
                    {initials(currentAdmin.name)}
                  </Text>
                </LinearGradient>
                <View style={{ minWidth: 0 }}>
                  <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 12.5 }} numberOfLines={1}>
                    {currentAdmin.name}
                  </Text>
                  <Text style={{ color: colors.text3, fontSize: 10.5 }} numberOfLines={1}>
                    {currentAdmin.email}
                  </Text>
                </View>
              </View>
              <View style={styles.adminActionsRow}>
                <SecondaryButton label={t("saReplace", "Almashtirish")} onPress={() => setPickerOpen(true)} style={styles.flex1} />
                <SecondaryButton label={t("saUnassignBtn", "Olib tashlash")} danger onPress={onUnassign} style={styles.flex1} />
              </View>
            </>
          ) : (
            <>
              <Text style={{ color: colors.text3, fontSize: 12, marginBottom: 10 }}>
                {t("saUnassigned", "Biriktirilmagan")}
              </Text>
              <SecondaryButton label={t("saAssignAdmin", "Admin biriktirish")} onPress={() => setPickerOpen(true)} />
            </>
          )}
        </GlassCard>

        <TouchableOpacity
          onPress={onDeleteBranch}
          style={[styles.deleteBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder }]}
        >
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
          <Text style={{ color: colors.danger, fontFamily: fonts.bold, fontSize: 13, marginLeft: 8 }}>
            {t("saDeleteBranch", "Filialni o'chirish")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <PickerOverlay
        visible={pickerOpen}
        title={t("saPickAdmin", "Admin tanlash")}
        items={pickerItems}
        selectedId={currentAdmin?.id}
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        onSelect={onSelectAdmin}
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
  hero: { alignItems: "center", paddingVertical: 8 },
  heroIcon: { width: 62, height: 62, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  heroName: { fontSize: 17, marginTop: 8 },
  catPill: { paddingHorizontal: 11, paddingVertical: 3, borderRadius: 999, marginTop: 6 },
  card: { gap: 8 },
  addressRow: { flexDirection: "row", gap: 9 },
  addressText: { flex: 1, fontSize: 12, fontWeight: "500", lineHeight: 18 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  cardTitle: { fontSize: 12.5, marginBottom: 2 },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 4,
  },
  field: { marginBottom: 4 },
  hint: { fontSize: 11, marginBottom: 8 },
  locRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  locInput: { flex: 1 },
  mapPreview: { marginTop: 10 },
  adminInfoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  adminAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  adminActionsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  flex1: { flex: 1 },
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
