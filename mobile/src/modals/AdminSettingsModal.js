import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { fonts, radius } from "../theme/typography";

export default function AdminSettingsModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const { verifyAdminPass } = useApp();

  const [step, setStep] = useState("menu"); // "menu" | "login" | "password"
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep("menu");
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setNewLogin("");
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSaveLogin = () => {
    if (!newLogin.trim()) {
      showToast(t("toastNewLoginRequired"));
      return;
    }
    showToast(t("toastCredSaved"));
    handleClose();
  };

  const onSavePassword = async () => {
    if (submitting) return;
    if (!oldPass.trim()) {
      showToast(t("toastOldPassRequired"));
      return;
    }
    setSubmitting(true);
    try {
      if (!(await verifyAdminPass(oldPass.trim()))) {
        showToast(t("toastOldPassWrong"));
        return;
      }
      if (newPass.length < 6) {
        showToast(t("toastPassTooShort"));
        return;
      }
      if (newPass !== confirmPass) {
        showToast(t("toastPassMismatch"));
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) {
        showToast(t("toastOldPassWrong"));
        return;
      }
      showToast(t("toastCredSaved"));
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={handleClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kav}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.inputBorder }]} />

          {step === "menu" && (
            <>
              <View style={styles.header}>
                <Ionicons name="settings-outline" size={22} color={colors.accent} />
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
                  {t("settingsBtnLabel")}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.menuBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={() => setStep("login")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="person" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                  {t("credChangeLogin")}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.text3} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={() => setStep("password")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="key" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                  {t("credChangePass")}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.text3} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                style={[styles.cancelBtn, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
              >
                <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>
                  {t("btnCancel")}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === "login" && (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep("menu")} style={styles.backBtn}>
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
                keyboardType="email-address"
                style={styles.field}
              />
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => setStep("menu")}
                  style={[styles.cancelHalf, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>
                    {t("btnCancel")}
                  </Text>
                </TouchableOpacity>
                <PrimaryButton label={t("btnSave")} onPress={onSaveLogin} style={styles.saveBtn} />
              </View>
            </>
          )}

          {step === "password" && (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep("menu")} style={styles.backBtn}>
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
                  onPress={() => setStep("menu")}
                  style={[styles.cancelHalf, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>
                    {t("btnCancel")}
                  </Text>
                </TouchableOpacity>
                <PrimaryButton label={t("btnSave")} onPress={onSavePassword} loading={submitting} disabled={submitting} style={styles.saveBtn} />
              </View>
            </>
          )}
        </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  kav: { width: "100%" },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  backBtn: { padding: 2 },
  title: { fontSize: 18 },
  menuBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 10,
  },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15 },
  field: { marginBottom: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 6,
  },
  cancelHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  cancelText: { fontSize: 14 },
  saveBtn: { flex: 2 },
});
