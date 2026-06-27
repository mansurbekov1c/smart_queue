import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { fonts, radius } from "../theme/typography";

function formatCardNum(val) {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function PaymentCardModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [cardNum, setCardNum] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");

  const onSave = () => {
    if (cardNum.replace(/\s/g, "").length < 16) {
      showToast("❌ " + t("cardNumber") + " to'liq kiriting");
      return;
    }
    if (!holder.trim()) {
      showToast("❌ " + t("cardHolder") + " kiriting");
      return;
    }
    showToast(t("toastCredSaved"));
    setCardNum(""); setHolder(""); setExpiry("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Ionicons name="card" size={22} color={colors.accent} />
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("addCard")}</Text>
          </View>

          <View style={[styles.cardPreview, { backgroundColor: colors.accent }]}>
            <Text style={styles.cardPreviewLabel}>KARTA</Text>
            <Text style={[styles.cardPreviewNum, { fontFamily: fonts.mono }]}>
              {cardNum || "•••• •••• •••• ••••"}
            </Text>
            <View style={styles.cardPreviewRow}>
              <Text style={styles.cardPreviewSub}>{holder || t("cardHolder")}</Text>
              <Text style={styles.cardPreviewSub}>{expiry || "MM/YY"}</Text>
            </View>
          </View>

          <InputField
            label={t("cardNumber")}
            placeholder="0000 0000 0000 0000"
            value={cardNum}
            onChangeText={(v) => setCardNum(formatCardNum(v))}
            keyboardType="number-pad"
            style={styles.field}
          />
          <InputField
            label={t("cardHolder")}
            placeholder="ALI VALIYEV"
            value={holder}
            onChangeText={(v) => setHolder(v.toUpperCase())}
            autoCapitalize="characters"
            style={styles.field}
          />
          <InputField
            label={t("cardExpiry")}
            placeholder="MM/YY"
            value={expiry}
            onChangeText={(v) => setExpiry(formatExpiry(v))}
            keyboardType="number-pad"
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
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  title: { fontSize: 18 },
  cardPreview: { borderRadius: 16, padding: 20, marginBottom: 20 },
  cardPreviewLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", letterSpacing: 2 },
  cardPreviewNum: { color: "#fff", fontSize: 20, marginTop: 14, marginBottom: 14, letterSpacing: 3 },
  cardPreviewRow: { flexDirection: "row", justifyContent: "space-between" },
  cardPreviewSub: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  field: { marginBottom: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  cancelText: { fontSize: 14 },
  saveBtn: { flex: 2 },
});
