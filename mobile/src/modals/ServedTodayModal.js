import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetModal from "../components/BottomSheetModal";
import SecondaryButton from "../components/SecondaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts } from "../theme/typography";

export default function ServedTodayModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { adminQueue } = useApp();

  const served = adminQueue.filter((q) => q.done);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
        {t("servedTitle")} <Text style={{ color: colors.text3 }}>({served.length})</Text>
      </Text>
      <Text style={[styles.sub, { color: colors.text2 }]}>{t("servedSub")}</Text>

      <ScrollView style={styles.list}>
        {served.length === 0 ? (
          <Text style={{ color: colors.text3, textAlign: "center", padding: 20 }}>{t("servedEmpty")}</Text>
        ) : (
          served.map((q, i) => (
            <View key={q.num} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.num, { color: colors.text3, fontFamily: fonts.mono }]}>#{q.num}</Text>
              <Text style={[styles.name, { color: colors.text, fontFamily: fonts.semibold }]}>{q.name}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
          ))
        )}
      </ScrollView>

      <SecondaryButton label={t("btnCloseServed")} onPress={onClose} style={styles.closeBtn} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 19 },
  sub: { fontSize: 13, marginTop: 4, marginBottom: 14 },
  list: { maxHeight: 320, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 11 },
  num: { fontSize: 14, width: 36 },
  name: { flex: 1, fontSize: 14 },
  closeBtn: { marginBottom: 6 },
});
