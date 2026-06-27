import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { fonts, radius } from "../theme/typography";

export default function LanguagePickerModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t, lang, setLang, langCodes, langName } = useI18n();

  const onSelect = (code) => {
    setLang(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("langTitle")}</Text>

          {langCodes.map((code, i) => (
            <TouchableOpacity
              key={code}
              onPress={() => onSelect(code)}
              style={[
                styles.row,
                { borderBottomColor: colors.border },
                i < langCodes.length - 1 && { borderBottomWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.langText,
                  {
                    color: lang === code ? colors.accent : colors.text,
                    fontFamily: lang === code ? fonts.bold : fonts.medium,
                  },
                ]}
              >
                {langName(code)}
              </Text>
              {lang === code && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={onClose}
            style={[styles.cancelBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          >
            <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>
              {t("langCancel")}
            </Text>
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
  title: { fontSize: 18, marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16 },
  langText: { fontSize: 16 },
  cancelBtn: { marginTop: 16, borderRadius: radius.md, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  cancelText: { fontSize: 15 },
});
