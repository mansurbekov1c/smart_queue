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

  const [step, setStep] = useState("choice"); // "choice" | "login" | "password"
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newLogin, setNewLogin] = useState("");

  const reset = () => {
    setStep("choice");
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setNewLogin("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSaveLogin = () => {
    if (!newLogin.trim()) {
      showToast("❌ " + t("newLogin") + " kiriting");
      return;
    }
    if (!oldPass.trim()) {
      showToast("❌ " + t("oldPass") + " kiriting");
      return;
    }
    showToast(t("toastCredSaved"));
    handleClose();
  };

  const onSavePassword = () => {
    if (!oldPass.trim()) {
      showToast("❌ " + t("oldPass") + " kiriting");
      return;
    }
    if (newPass.length < 4) {
      showToast(t("toastPassTooShort"));
      return;
    }
    if (newPass !== confirmPass) {
      showToast(t("toastPassMismatch"));
      return;
    }
    showToast(t("toastCredSaved"));
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={handleClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
          <View style={styles.handle} />

          {/* Tanlov qadami */}
          {step === "choice" && (
            <>
              <View style={styles.header}>
                <Ionicons name="lock-closed" size={22} color={colors.accent} />
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
                  {t("changeCredentials")}
                </Text>
              </View>
              <Text style={[styles.choiceSub, { color: colors.text2 }]}>{t("credChooseType")}</Text>

              {isAdmin && (
                <TouchableOpacity
                  style={[styles.choiceBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                  onPress={() => setStep("login")}
                >
                  <View style={[styles.choiceIcon, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name="person" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.choiceInfo}>
                    <Text style={[styles.choiceLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                      {t("credChangeLogin")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text3} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.choiceBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={() => setStep("password")}
              >
                <View style={[styles.choiceIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="key" size={20} color={colors.accent} />
                </View>
                <View style={styles.choiceInfo}>
                  <Text style={[styles.choiceLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                    {t("credChangePass")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text3} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                style={[styles.cancelBtnFull, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
              >
                <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Login o'zgartirish qadami */}
          {step === "login" && (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep("choice")} style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
                  {t("credChangeLogin")}
                </Text>
              </View>
              <InputField
                label={t("newLogin")}
                placeholder={t("loginInputPlaceholder")}
                value={newLogin}
                onChangeText={setNewLogin}
                autoCapitalize="none"
                style={styles.field}
              />
              <InputField
                label={t("oldPass")}
                placeholder={t("passPlaceholder")}
                value={oldPass}
                onChangeText={setOldPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => setStep("choice")}
                  style={[styles.cancelBtn, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
                </TouchableOpacity>
                <PrimaryButton label={t("btnSave")} onPress={onSaveLogin} style={styles.saveBtn} />
              </View>
            </>
          )}

          {/* Parol o'zgartirish qadami */}
          {step === "password" && (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep("choice")} style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
                  {t("credChangePass")}
                </Text>
              </View>
              <InputField
                label={t("oldPass")}
                placeholder={t("passPlaceholder")}
                value={oldPass}
                onChangeText={setOldPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <InputField
                label={t("newPass")}
                placeholder={t("minCharsPlaceholder")}
                value={newPass}
                onChangeText={setNewPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <InputField
                label={t("confirmPass")}
                placeholder={t("passPlaceholder")}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry
                autoCapitalize="none"
                style={styles.field}
              />
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => setStep("choice")}
                  style={[styles.cancelBtn, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
                </TouchableOpacity>
                <PrimaryButton label={t("btnSave")} onPress={onSavePassword} style={styles.saveBtn} />
              </View>
            </>
          )}
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
  backBtn: { padding: 2 },
  title: { fontSize: 18 },
  choiceSub: { fontSize: 13.5, marginBottom: 14 },
  choiceBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, marginBottom: 10 },
  choiceIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  choiceInfo: { flex: 1 },
  choiceLabel: { fontSize: 15 },
  field: { marginBottom: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  cancelBtnFull: { borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingVertical: 14, marginTop: 6 },
  cancelText: { fontSize: 14 },
  saveBtn: { flex: 2 },
});
