import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { fonts, radius } from "../theme/typography";

export default function ChangeCredentialsModal({ visible, onClose, isAdmin = false }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newLogin, setNewLogin] = useState("");

  const onSave = () => {
    if (!oldPass.trim()) {
      showToast("❌ " + t("oldPass") + " kiriting");
      return;
    }
    if (newPass.length < 4) {
      showToast("❌ " + t("newPass") + " kamida 4 ta belgi");
      return;
    }
    if (newPass !== confirmPass) {
      showToast(t("toastPassMismatch"));
      return;
    }
    showToast(t("toastCredSaved"));
    setOldPass(""); setNewPass(""); setConfirmPass(""); setNewLogin("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={22} color={colors.accent} />
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
              {t("changeCredentials")}
            </Text>
          </View>

          {isAdmin && (
            <InputField
              label={t("newLogin")}
              placeholder={t("loginInputPlaceholder")}
              value={newLogin}
              onChangeText={setNewLogin}
              autoCapitalize="none"
              style={styles.field}
            />
          )}

          <InputField
            label={t("oldPass")}
            placeholder={t("passPlaceholder")}
            value={oldPass}
            onChangeText={setOldPass}
            secureTextEntry
            style={styles.field}
          />
          <InputField
            label={t("newPass")}
            placeholder={t("minCharsPlaceholder")}
            value={newPass}
            onChangeText={setNewPass}
            secureTextEntry
            style={styles.field}
          />
          <InputField
            label={t("confirmPass")}
            placeholder={t("passPlaceholder")}
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry
            style={styles.field}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
            >
              <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
            </TouchableOpacity>
            <PrimaryButton label={t("btnSave")} onPress={onSave} style={styles.saveBtn} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  title: { fontSize: 18 },
  field: { marginBottom: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  cancelText: { fontSize: 14 },
  saveBtn: { flex: 2 },
});
