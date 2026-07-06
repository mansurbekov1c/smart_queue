import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { fonts, radius } from "../theme/typography";

const OPTIONS = [
  { key: "system", icon: "phone-portrait-outline", labelKey: "themeModeSystem" },
  { key: "light", icon: "sunny-outline", labelKey: "themeModeLight" },
  { key: "dark", icon: "moon-outline", labelKey: "themeModeDark" },
];

export default function ThemePickerModal({ visible, onClose }) {
  const { colors, themeMode, setThemeMode } = useAppTheme();
  const { t } = useI18n();

  const onSelect = (mode) => {
    setThemeMode(mode);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("themePickerTitle")}</Text>

          {OPTIONS.map((opt, i) => {
            const active = themeMode === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => onSelect(opt.key)}
                style={[
                  styles.row,
                  { borderBottomColor: colors.border },
                  i < OPTIONS.length - 1 && { borderBottomWidth: 1 },
                ]}
              >
                <View style={[styles.iconChip, { backgroundColor: colors.iconChipBgStart }]}>
                  <Ionicons name={opt.icon} size={18} color={colors.accent} />
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: active ? colors.accent : colors.text, fontFamily: active ? fonts.bold : fonts.medium },
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={21}
                  color={active ? colors.accent : colors.text3}
                />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={onClose}
            style={[styles.cancelBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          >
            <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15 },
  iconChip: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  optionText: { flex: 1, fontSize: 15.5 },
  cancelBtn: { marginTop: 16, borderRadius: radius.md, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  cancelText: { fontSize: 15 },
});
