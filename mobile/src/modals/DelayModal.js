import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheetModal from "../components/BottomSheetModal";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

const OPTIONS = [1, 2, 3];

export default function DelayModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { delaysUsed, doDelay } = useApp();

  const [selected, setSelected] = React.useState(1);

  const isFreeDelay = delaysUsed === 0;

  const onConfirm = () => {
    doDelay(selected);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("modalDelayTitle")}</Text>
      <Text style={[styles.sub, { color: colors.text2 }]}>{t("modalDelaySub")}</Text>

      <View style={styles.optionsRow}>
        {OPTIONS.map((n) => {
          const active = selected === n;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => setSelected(n)}
              style={[
                styles.option,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: active ? colors.accent : colors.inputBorder,
                  borderWidth: active ? 1.5 : 1,
                },
              ]}
            >
              <Text style={[styles.optionNum, { color: colors.text, fontFamily: fonts.extrabold }]}>+{n}</Text>
              <Text style={[styles.optionSlot, { color: colors.text3 }]}>{t("slot")}</Text>
              <Text style={[styles.optionPrice, { color: isFreeDelay ? colors.success : colors.amber, fontFamily: fonts.bold }]}>
                {isFreeDelay ? t("free") : t("price")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!isFreeDelay && (
        <View style={[styles.paidBadge, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
          <Text style={[styles.paidText, { color: colors.accent, fontFamily: fonts.semibold }]}>
            {t("price")} so'm
          </Text>
        </View>
      )}

      <PrimaryButton label={t("btnDelayConfirm")} onPress={onConfirm} style={styles.confirmBtn} />
      <SecondaryButton label={t("btnCancel")} onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 19 },
  sub: { fontSize: 13, marginTop: 6, marginBottom: 18, lineHeight: 18 },
  optionsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  option: { flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: radius.md },
  optionNum: { fontSize: 22 },
  optionSlot: { fontSize: 11, marginTop: 2 },
  optionPrice: { fontSize: 11, marginTop: 5 },
  paidBadge: { borderRadius: radius.md, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 14, alignSelf: "center", marginBottom: 14 },
  paidText: { fontSize: 13 },
  confirmBtn: { marginBottom: 10 },
});
