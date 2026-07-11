import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomSheetModal from "../components/BottomSheetModal";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

export default function JoinQueueModal({ visible, onClose, navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { currentPlace, joinPreview, confirmJoin } = useApp();
  const [submitting, setSubmitting] = useState(false);

  if (!currentPlace || !joinPreview) return null;

  const onConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    await confirmJoin();
    setSubmitting(false);
    onClose();
    setTimeout(() => navigation.navigate("MainTabs", { screen: "MyQueue" }), 400);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("modalJoinTitle")}</Text>
      <Text style={[styles.sub, { color: colors.text2 }]}>
        {currentPlace.name} {t("modalJoinSub")}
      </Text>

      <View style={[styles.box, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
        <View style={styles.boxTop}>
          <Text style={[styles.boxLabel, { color: colors.text2 }]}>{t("yourNumber")}</Text>
          <View style={[styles.freePill, { backgroundColor: colors.successSoft }]}>
            <Text style={[styles.freeText, { color: colors.success, fontFamily: fonts.bold }]}>{t("free")}</Text>
          </View>
        </View>
        <Text style={[styles.bigNum, { color: colors.accent, fontFamily: fonts.mono }]}>#{joinPreview.num}</Text>
        <Text style={[styles.estWait, { color: colors.text2 }]}>
          {t("estWait")} ~{joinPreview.waitMin} {t("minutesFull")}
        </Text>
      </View>

      <PrimaryButton
        label={t("btnConfirm")}
        icon="checkmark"
        onPress={onConfirm}
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
  box: { borderRadius: radius.lg, borderWidth: 1, padding: 18, marginBottom: 16 },
  boxTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  boxLabel: { fontSize: 13 },
  freePill: { paddingVertical: 4, paddingHorizontal: 11, borderRadius: 999 },
  freeText: { fontSize: 11.5 },
  bigNum: { fontSize: 52, lineHeight: 56 },
  estWait: { fontSize: 13, marginTop: 6 },
  confirmBtn: { marginBottom: 10 },
});
