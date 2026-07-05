import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../context/I18nContext";
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

export { COUNTRY_CODES };

export default function PhoneField({ label, onChangeText, colors, placeholder = "901234567" }) {
  const { t } = useI18n();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [localNumber, setLocalNumber] = useState("");

  const filteredCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q),
    );
  }, [search]);

  const handleLocalChange = (text) => {
    setLocalNumber(text);
    const digits = text.replace(/\D/g, "");
    onChangeText(selectedCountry.code + digits);
  };

  const handleCountrySelect = (c) => {
    setSelectedCountry(c);
    setLocalNumber("");
    onChangeText(c.code);
    setPickerVisible(false);
    setSearch("");
  };

  return (
    <View>
      {label ? (
        <Text style={[styles.label, { color: colors.text2, fontFamily: fonts.bold }]}>{label}</Text>
      ) : null}
      <View style={[styles.phoneRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <TouchableOpacity style={styles.codeBtn} onPress={() => setPickerVisible(true)}>
          <Text style={styles.codeFlag}>{selectedCountry.flag}</Text>
          <Text style={[styles.codeText, { color: colors.accent, fontFamily: fonts.bold }]}>
            +{selectedCountry.code}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.text3} />
        </TouchableOpacity>
        <View style={[styles.codeDivider, { backgroundColor: colors.inputBorder }]} />
        <TextInput
          value={localNumber}
          onChangeText={handleLocalChange}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={[styles.phoneInput, { color: colors.text, fontFamily: fonts.medium }]}
          autoCapitalize="none"
        />
      </View>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          onPress={() => setPickerVisible(false)}
        >
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.inputBorder }]} />
            <View style={[styles.modalSearch, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="search" size={16} color={colors.text3} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t("genericSearchPlaceholder")}
                placeholderTextColor={colors.placeholder}
                style={[styles.modalSearchInput, { color: colors.text, fontFamily: fonts.medium }]}
              />
            </View>
            <ScrollView style={styles.modalList}>
              {filteredCodes.map((c) => (
                <TouchableOpacity
                  key={c.code + c.name}
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleCountrySelect(c)}
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

const styles = StyleSheet.create({
  label: { fontSize: 12.5, marginBottom: 7 },
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
  modalSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: "80%",
  },
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
