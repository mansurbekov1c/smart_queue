import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";
import BottomSheetModal from "../components/BottomSheetModal";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { isLatinName } from "../utils/validation";
import { fonts } from "../theme/typography";

export default function AddWalkInModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const { addWalkIn } = useApp();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (submitting) return;
    if (!isLatinName(name)) {
      showToast(t("toastLatinOnly"));
      return;
    }
    setSubmitting(true);
    const ok = await addWalkIn(name);
    setSubmitting(false);
    if (ok) {
      setName("");
      setPhone("");
      onClose();
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("modalAddTitle")}</Text>
      <Text style={[styles.sub, { color: colors.text2 }]}>{t("modalAddSub")}</Text>

      <InputField
        label={t("labelName")}
        placeholder={t("walkinNamePlaceholder")}
        value={name}
        onChangeText={setName}
        style={styles.field}
      />
      <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatinOnly")}</Text>
      <InputField
        label={t("labelPhoneOpt")}
        placeholder={t("walkinPhonePlaceholder")}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.field}
      />

      <PrimaryButton
        label={t("btnAddToQueue")}
        onPress={onSubmit}
        loading={submitting}
        disabled={submitting}
        style={styles.confirmBtn}
      />
      <SecondaryButton label={t("btnCancel")} onPress={onClose} disabled={submitting} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 19 },
  sub: { fontSize: 13.5, marginTop: 4, marginBottom: 18 },
  field: { marginBottom: 14 },
  hint: { fontSize: 11, marginTop: -8, marginBottom: 14 },
  confirmBtn: { marginBottom: 10 },
});
