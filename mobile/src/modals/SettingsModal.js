import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import PhoneField from "../components/PhoneField";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { isLatinName } from "../utils/validation";
import { fonts, radius } from "../theme/typography";

export default function SettingsModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const { user, editUserName, updateUserPhone, verifyUserPass } = useApp();

  const [step, setStep] = useState("menu"); // "menu" | "name" | "password" | "phone"
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const reset = () => {
    setStep("menu");
    setFirstName("");
    setLastName("");
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setNewPhone("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const openNameEdit = () => {
    setFirstName(user?.first || "");
    setLastName(user?.last || "");
    setStep("name");
  };

  const onSaveName = async () => {
    if (!isLatinName(firstName) || !isLatinName(lastName)) {
      showToast(t("toastLatinOnly"));
      return;
    }
    if (await editUserName(firstName, lastName)) {
      reset();
    }
  };

  const onSavePassword = async () => {
    if (!oldPass.trim()) {
      showToast(t("toastOldPassRequired"));
      return;
    }
    if (!(await verifyUserPass(oldPass.trim()))) {
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
    reset();
  };

  const onSavePhone = async () => {
    if (!newPhone.trim()) {
      showToast(t("toastNewPhoneRequired"));
      return;
    }
    if (await updateUserPhone(newPhone)) {
      reset();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={handleClose}>
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
                onPress={openNameEdit}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="person" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text, fontFamily: fonts.bold }]}>{t("editName")}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.text3} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={() => setStep("password")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="key" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text, fontFamily: fonts.bold }]}>{t("credChangePass")}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.text3} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={() => setStep("phone")}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="phone-portrait" size={20} color={colors.accent} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text, fontFamily: fonts.bold }]}>{t("changePhone")}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.text3} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                style={[styles.cancelBtn, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
              >
                <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "name" && (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep("menu")} style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("editName")}</Text>
              </View>
              <InputField
                label={t("labelFirstname")}
                placeholder={t("firstNamePlaceholder")}
                value={firstName}
                onChangeText={setFirstName}
                style={styles.field}
              />
              <InputField
                label={t("labelLastname")}
                placeholder={t("lastNamePlaceholder")}
                value={lastName}
                onChangeText={setLastName}
                style={styles.field}
              />
              <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatinOnly")}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => setStep("menu")}
                  style={[styles.cancelHalf, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
                </TouchableOpacity>
                <PrimaryButton label={t("btnSave")} onPress={onSaveName} style={styles.saveBtn} />
              </View>
            </>
          )}

          {step === "password" && (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep("menu")} style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("credChangePass")}</Text>
              </View>
              <InputField label={t("oldPass")} placeholder={t("passPlaceholder")} value={oldPass} onChangeText={setOldPass} secureTextEntry autoCapitalize="none" style={styles.field} />
              <InputField label={t("newPass")} placeholder={t("minCharsPlaceholder")} value={newPass} onChangeText={setNewPass} secureTextEntry autoCapitalize="none" style={styles.field} />
              <InputField label={t("confirmPass")} placeholder={t("passPlaceholder")} value={confirmPass} onChangeText={setConfirmPass} secureTextEntry autoCapitalize="none" style={styles.field} />
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => setStep("menu")}
                  style={[styles.cancelHalf, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
                </TouchableOpacity>
                <PrimaryButton label={t("btnSave")} onPress={onSavePassword} style={styles.saveBtn} />
              </View>
            </>
          )}

          {step === "phone" && (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep("menu")} style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("changePhone")}</Text>
              </View>
              <PhoneField
                label={t("newPhone")}
                onChangeText={setNewPhone}
                colors={colors}
              />
              <View style={[styles.actions, { marginTop: 14 }]}>
                <TouchableOpacity
                  onPress={() => setStep("menu")}
                  style={[styles.cancelHalf, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.cancelText, { color: colors.text2, fontFamily: fonts.bold }]}>{t("btnCancel")}</Text>
                </TouchableOpacity>
                <PrimaryButton label={t("btnSave")} onPress={onSavePhone} style={styles.saveBtn} />
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
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  backBtn: { padding: 2 },
  title: { fontSize: 18 },
  menuBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1, marginBottom: 10 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15 },
  field: { marginBottom: 12 },
  hint: { fontSize: 11, marginTop: -4, marginBottom: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: { borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingVertical: 14, marginTop: 6 },
  cancelHalf: { flex: 1, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  cancelText: { fontSize: 14 },
  saveBtn: { flex: 2 },
});
