import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import GlassCard from "../components/GlassCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import BottomSheetModal, { BottomSheetScrollContext } from "../components/BottomSheetModal";
import ManageableCategoryPicker from "../components/ManageableCategoryPicker";
import BranchMapPreview from "../components/BranchMapPreview";
import PickerOverlay from "../components/PickerOverlay";
import { CAT_ICONS } from "../data/categoryIcons";
import { fetchBranches } from "../api/branches";
import { fetchAllAdmins, createBranch, createAdmin } from "../api/superadmin";
import { isLatinName } from "../utils/validation";
import useExitConfirmOnBack from "../hooks/useExitConfirmOnBack";
import { fonts, radius } from "../theme/typography";

export default function SuperAdminHomeScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  useExitConfirmOnBack();

  const [page, setPage] = useState(0);
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchSearch, setBranchSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);

  const scrollRef = useRef(null);

  const loadAll = useCallback(async () => {
    try {
      const [branchList, adminList] = await Promise.all([fetchBranches(), fetchAllAdmins()]);
      setBranches(branchList);
      setAdmins(adminList);
    } catch (e) {
      console.error("Super admin ma'lumotlarini yuklash xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  const filteredBranches = useMemo(() => {
    const q = branchSearch.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) => b.name.toLowerCase().includes(q) || (b.location?.city || "").toLowerCase().includes(q),
    );
  }, [branches, branchSearch]);

  const filteredAdmins = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  }, [admins, adminSearch]);

  const goToPage = (p) => {
    scrollRef.current?.scrollTo({ x: p * 1000, animated: true });
    setPage(p);
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <View style={{ paddingTop: insets.top }}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
            {page === 0 ? t("saBranchesTitle", "Filiallar") : t("saAdminsTitle", "Adminlar")}
          </Text>
          <View style={styles.dots}>
            <TouchableOpacity onPress={() => goToPage(0)}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: page === 0 ? colors.accent : colors.accentSoft },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goToPage(1)}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: page === 1 ? colors.accent : colors.accentSoft },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const w = e.nativeEvent.layoutMeasurement.width;
          if (!w) return;
          setPage(Math.round(e.nativeEvent.contentOffset.x / w));
        }}
        style={styles.pager}
      >
        <View style={styles.pageWrap}>
          <View style={styles.addWrap}>
            <PrimaryButton
              label={t("saAddBranch", "Qo'shish")}
              icon="add"
              onPress={() => setAddBranchOpen(true)}
            />
          </View>
          <SearchBar value={branchSearch} onChangeText={setBranchSearch} colors={colors} />
          <FlatList
            data={filteredBranches}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadAll}
            ListEmptyComponent={
              !loading ? (
                <Text style={[styles.empty, { color: colors.text3 }]}>
                  {t("saNoResults", "Hech narsa topilmadi")}
                </Text>
              ) : null
            }
            renderItem={({ item }) => {
              const admin = admins.find((a) => a.branchId === item.id);
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("SuperAdminBranchDetail", { branch: item })}
                >
                  <GlassCard style={styles.branchRow} padded={false}>
                    <View style={styles.branchLeft}>
                      <View style={[styles.iconChip, { backgroundColor: colors.iconChipBgStart }]}>
                        <Ionicons name={CAT_ICONS[item.cat] || "business"} size={20} color={colors.accent} />
                      </View>
                      <View style={styles.textWrap}>
                        <Text style={[styles.name, { color: colors.text, fontFamily: fonts.bold }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.sub, { color: colors.text3, fontFamily: fonts.medium }]} numberOfLines={1}>
                          {item.location?.city}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.branchRight}>
                      <Text
                        style={{
                          fontSize: admin ? 12.5 : 12,
                          fontWeight: "700",
                          fontStyle: admin ? "normal" : "italic",
                          color: admin ? colors.text : colors.text3,
                          textAlign: "center",
                        }}
                        numberOfLines={2}
                      >
                        {admin ? admin.name : t("saUnassigned", "Biriktirilmagan")}
                      </Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.pageWrap}>
          <View style={styles.addWrap}>
            <PrimaryButton
              label={t("saAddAdmin", "Admin qo'shish")}
              icon="person-add"
              onPress={() => setAddAdminOpen(true)}
            />
          </View>
          <SearchBar value={adminSearch} onChangeText={setAdminSearch} colors={colors} />
          <FlatList
            data={filteredAdmins}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadAll}
            ListEmptyComponent={
              !loading ? (
                <Text style={[styles.empty, { color: colors.text3 }]}>
                  {t("saNoResults", "Hech narsa topilmadi")}
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate("SuperAdminAdminDetail", { admin: item })}
              >
                <GlassCard style={styles.adminRow} padded={false}>
                  <View style={styles.adminLeft}>
                    <Text
                      style={{
                        fontSize: item.branchName ? 12 : 11,
                        fontWeight: "600",
                        fontStyle: item.branchName ? "normal" : "italic",
                        color: item.branchName ? colors.text3 : colors.text3,
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {item.branchName || t("saUnassigned", "Biriktirilmagan")}
                    </Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={styles.textWrap2}>
                    <Text style={[styles.name, { color: colors.text, fontFamily: fonts.bold }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.sub, { color: colors.text3, fontFamily: fonts.medium }]} numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      <AddBranchModal
        visible={addBranchOpen}
        onClose={() => setAddBranchOpen(false)}
        onCreated={loadAll}
      />

      <AddAdminModal
        visible={addAdminOpen}
        branches={branches}
        onClose={() => setAddAdminOpen(false)}
        onCreated={loadAll}
      />
    </LinearGradient>
  );
}

function SearchBar({ value, onChangeText, colors }) {
  const { t } = useI18n();
  return (
    <View style={[styles.searchWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
      <Ionicons name="search" size={16} color={colors.text3} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t("genericSearchPlaceholder")}
        placeholderTextColor={colors.placeholder}
        style={[styles.searchInput, { color: colors.text, fontFamily: fonts.medium }]}
      />
    </View>
  );
}

/* Fokuslanganда formani pastga scroll qiladigan input — klaviatura ostidagi
   maydonlar (masalan lat/lng) ko'rinib turishi uchun. BottomSheetModal ichida
   (scrollable) ishlaydi. */
function ScrollAwareField({ onFocus, ...props }) {
  const scroll = useContext(BottomSheetScrollContext);
  return (
    <InputField
      {...props}
      onFocus={(e) => {
        onFocus?.(e);
        scroll?.scrollToEnd?.();
      }}
    />
  );
}

function AddBranchModal({ visible, onClose, onCreated }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const { categories, refreshCategories } = useApp();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [latText, setLatText] = useState("");
  const [lngText, setLngText] = useState("");
  const [category, setCategory] = useState(categories[0]?.key || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!category && categories.length > 0) setCategory(categories[0].key);
  }, [categories, category]);

  const reset = () => {
    setName("");
    setCity("");
    setDistrict("");
    setAddress("");
    setLatText("");
    setLngText("");
    setCategory(categories[0]?.key || "");
  };

  // Formada kamida bitta maydon to'ldirilganmi? (kategoriya default bo'lgani
  // uchun hisobga olinmaydi)
  const isDirty = !!(
    name.trim() ||
    city.trim() ||
    district.trim() ||
    address.trim() ||
    latText.trim() ||
    lngText.trim()
  );

  // #3 — chiqishда tasdiqlash (ma'lumot o'chirilmaydi, faqat ogohlantirish)
  const handleClose = () => {
    if (saving) return;
    if (isDirty) {
      Alert.alert(t("confirmLeaveFormTitle"), t("confirmLeaveFormMsg"), [
        { text: t("btnStayForm"), style: "cancel" },
        { text: t("btnLeaveForm"), style: "destructive", onPress: onClose },
      ]);
    } else {
      onClose();
    }
  };

  // #4 — barcha maydonlarni tozalash (forma yopilmaydi)
  const onClearAll = () => {
    if (!isDirty) {
      reset();
      return;
    }
    Alert.alert(t("confirmClearFormTitle"), t("confirmClearFormMsg"), [
      { text: t("btnCancel"), style: "cancel" },
      { text: t("btnConfirm"), style: "destructive", onPress: reset },
    ]);
  };

  const onSubmit = async () => {
    // #2 — shahar VA tuman emas, kamida BITTASI to'ldirilgan bo'lsa yetarli
    if (!name.trim() || !address.trim() || !category) {
      showToast(t("saFillAllFields", "Barcha maydonlarni to'ldiring"));
      return;
    }
    if (!city.trim() && !district.trim()) {
      showToast(t("saCityOrDistrictRequired", "Shahar yoki tumandan birini kiriting"));
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
      await createBranch({ name, category, city, district, address, lat, lng });
      showToast(t("toastCredSaved"));
      reset();
      onClose();
      onCreated?.();
    } catch (e) {
      console.error("Filial qo'shish xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} scrollable>
      <Text style={[styles.modalTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
        {t("saAddBranchTitle", "Yangi filial")}
      </Text>
      <InputField label={t("saBranchName", "Filial nomi")} value={name} onChangeText={setName} style={styles.field} />
      <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatinOnly")}</Text>
      <InputField label={t("saCity", "Shahar")} value={city} onChangeText={setCity} style={styles.field} />
      <InputField label={t("saDistrict", "Tuman")} value={district} onChangeText={setDistrict} style={styles.field} />
      <InputField label={t("saAddress", "Manzil")} value={address} onChangeText={setAddress} style={styles.field} />

      <Text style={[styles.hint, { color: colors.text3, marginTop: -4 }]}>{t("hintLatLngOptional")}</Text>
      <View style={styles.locRow}>
        <ScrollAwareField label={t("labelLat")} value={latText} onChangeText={setLatText} keyboardType="numbers-and-punctuation" style={styles.locInput} />
        <ScrollAwareField label={t("labelLng")} value={lngText} onChangeText={setLngText} keyboardType="numbers-and-punctuation" style={styles.locInput} />
      </View>
      <BranchMapPreview
        lat={latText.trim() ? parseFloat(latText) : null}
        lng={lngText.trim() ? parseFloat(lngText) : null}
        style={styles.mapPreview}
      />

      <Text style={[styles.catLabel, { color: colors.text2 }]}>{t("saCategory", "Kategoriya")}</Text>
      <ManageableCategoryPicker
        categories={categories}
        value={category}
        onSelect={setCategory}
        onChanged={refreshCategories}
      />

      <PrimaryButton
        label={t("save", "Saqlash")}
        onPress={onSubmit}
        loading={saving}
        disabled={saving}
        style={styles.submitBtn}
      />
      <SecondaryButton
        label={t("btnClearAll")}
        icon="trash-outline"
        onPress={onClearAll}
        disabled={saving}
        style={styles.clearBtn}
      />
    </BottomSheetModal>
  );
}

function AddAdminModal({ visible, branches, onClose, onCreated }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [branchId, setBranchId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPass("");
    setBranchId(null);
  };

  const selectedBranch = branches.find((b) => b.id === branchId);

  const isDirty = !!(firstName.trim() || lastName.trim() || email.trim() || pass.trim() || branchId);

  const handleClose = () => {
    if (saving) return;
    if (isDirty) {
      Alert.alert(t("confirmLeaveFormTitle"), t("confirmLeaveFormMsg"), [
        { text: t("btnStayForm"), style: "cancel" },
        { text: t("btnLeaveForm"), style: "destructive", onPress: onClose },
      ]);
    } else {
      onClose();
    }
  };

  const onClearAll = () => {
    if (!isDirty) {
      reset();
      return;
    }
    Alert.alert(t("confirmClearFormTitle"), t("confirmClearFormMsg"), [
      { text: t("btnCancel"), style: "cancel" },
      { text: t("btnConfirm"), style: "destructive", onPress: reset },
    ]);
  };

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !pass.trim()) {
      showToast(t("saFillAllFields", "Barcha maydonlarni to'ldiring"));
      return;
    }
    if (!isLatinName(firstName) || !isLatinName(lastName)) {
      showToast(t("toastLatinOnly"));
      return;
    }
    if (pass.length < 6) {
      showToast(t("toastPassTooShort"));
      return;
    }
    setSaving(true);
    try {
      await createAdmin({ firstName, lastName, email, password: pass, branchId });
      showToast(t("toastCredSaved"));
      reset();
      onClose();
      onCreated?.();
    } catch (e) {
      console.error("Admin qo'shish xatosi:", e);
      // Edge Function aniq (o'zbekcha) xabar qaytaradi — uni ko'rsatamiz;
      // aks holda umumiy xabar
      const msg = e?.message || "";
      if (msg.includes("band") || msg.includes("registered")) {
        showToast(t("toastEmailTaken", "Bu email band"));
      } else if (msg && !msg.toLowerCase().includes("failed") && !msg.toLowerCase().includes("network")) {
        showToast(msg);
      } else {
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
      }
    } finally {
      setSaving(false);
    }
  };

  const pickerItems = [
    // "Biriktirmaslik" — tanlovni bekor qilib, hech qaysi filialga biriktirmaslik
    { id: "__none__", label: t("saUnassigned", "Biriktirilmagan"), sublabel: t("saNoAssignHint", "Filialga biriktirmaslik"), icon: "close-circle-outline" },
    ...branches
      .filter((b) => b.name.toLowerCase().includes(pickerSearch.trim().toLowerCase()))
      .map((b) => ({ id: b.id, label: b.name, sublabel: b.location?.city, icon: CAT_ICONS[b.cat] || "business" })),
  ];

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} scrollable>
      <Text style={[styles.modalTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
        {t("saAddAdminTitle", "Yangi admin")}
      </Text>
      <InputField label={t("labelFirstname")} value={firstName} onChangeText={setFirstName} placeholder={t("firstNamePlaceholder")} style={styles.field} />
      <InputField label={t("labelLastname")} value={lastName} onChangeText={setLastName} placeholder={t("lastNamePlaceholder")} style={styles.field} />
      <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatinOnly")}</Text>
      <ScrollAwareField
        label={t("labelEmail")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.field}
      />
      <ScrollAwareField
        label={t("labelPass")}
        value={pass}
        onChangeText={setPass}
        secureTextEntry
        style={styles.field}
      />

      <Text style={[styles.catLabel, { color: colors.text2 }]}>{t("saAssignBranch", "Filialga biriktirish")}</Text>
      <View style={styles.branchPickRow}>
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={[styles.branchPickBtn, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        >
          <Ionicons name="business-outline" size={16} color={colors.accent} />
          <Text style={{ color: selectedBranch ? colors.text : colors.placeholder, fontSize: 13, fontFamily: fonts.medium, flex: 1, marginLeft: 8 }} numberOfLines={1}>
            {selectedBranch ? selectedBranch.name : t("saUnassigned", "Biriktirilmagan")}
          </Text>
          <Ionicons name="chevron-forward" size={15} color={colors.text3} />
        </TouchableOpacity>
        {branchId ? (
          <TouchableOpacity
            onPress={() => setBranchId(null)}
            style={[styles.branchClearBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="close" size={16} color={colors.danger} />
          </TouchableOpacity>
        ) : null}
      </View>

      <PrimaryButton
        label={t("save", "Saqlash")}
        onPress={onSubmit}
        loading={saving}
        disabled={saving}
        style={styles.submitBtn}
      />
      <SecondaryButton
        label={t("btnClearAll")}
        icon="trash-outline"
        onPress={onClearAll}
        disabled={saving}
        style={styles.clearBtn}
      />

      <PickerOverlay
        visible={pickerOpen}
        title={t("saPickBranch", "Filial tanlash")}
        items={pickerItems}
        selectedId={branchId}
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        onSelect={(item) => {
          setBranchId(item.id === "__none__" ? null : item.id);
          setPickerOpen(false);
          setPickerSearch("");
        }}
        onClose={() => {
          setPickerOpen(false);
          setPickerSearch("");
        }}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: { fontSize: 22 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pager: { flex: 1 },
  pageWrap: { width: 390, maxWidth: "100%", flex: 1 },
  addWrap: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 13.5, padding: 0 },
  list: { paddingHorizontal: 16, paddingBottom: 110, gap: 10 },
  empty: { textAlign: "center", fontSize: 12.5, fontWeight: "600", paddingVertical: 20 },
  branchRow: { flexDirection: "row", alignItems: "stretch", overflow: "hidden" },
  branchLeft: { flex: 7, flexDirection: "row", alignItems: "center", gap: 12, padding: 13, minWidth: 0 },
  branchRight: { flex: 3, alignItems: "center", justifyContent: "center", padding: 8 },
  adminRow: { flexDirection: "row", alignItems: "stretch", overflow: "hidden" },
  adminLeft: { flex: 3, alignItems: "center", justifyContent: "center", padding: 8 },
  textWrap2: { flex: 7, justifyContent: "center", padding: 13, minWidth: 0 },
  iconChip: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  textWrap: { minWidth: 0, flex: 1 },
  name: { fontSize: 14.5 },
  sub: { fontSize: 12, marginTop: 3 },
  divider: { width: 1 },
  modalTitle: { fontSize: 17, marginBottom: 14 },
  field: { marginBottom: 12 },
  hint: { fontSize: 11, marginTop: -6, marginBottom: 12 },
  locRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  locInput: { flex: 1 },
  catLabel: { fontSize: 12.5, fontWeight: "700", marginBottom: 8 },
  submitBtn: { marginBottom: 4, marginTop: 18 },
  clearBtn: { marginTop: 10, opacity: 0.9 },
  mapPreview: { marginTop: 4, marginBottom: 4 },
  branchPickBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  branchPickRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  branchClearBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
