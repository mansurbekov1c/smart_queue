import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetModal from "../components/BottomSheetModal";
import SecondaryButton from "../components/SecondaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

export default function ServedTodayModal({ visible, onClose }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { adminQueue } = useApp();
  const [activeTab, setActiveTab] = useState("served");

  const served = adminQueue.filter((q) => q.done && !q.rejected);
  const rejected = adminQueue.filter((q) => q.rejected);
  const list = activeTab === "served" ? served : rejected;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
        {t("statToday")} <Text style={{ color: colors.text3 }}>({served.length + rejected.length})</Text>
      </Text>

      {/* Tablar */}
      <View style={[styles.tabs, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "served" && { backgroundColor: colors.success }]}
          onPress={() => setActiveTab("served")}
        >
          <Text style={[styles.tabText, { color: activeTab === "served" ? "#fff" : colors.text2, fontFamily: fonts.bold }]}>
            {t("servedTabServed")} ({served.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "rejected" && { backgroundColor: colors.danger }]}
          onPress={() => setActiveTab("rejected")}
        >
          <Text style={[styles.tabText, { color: activeTab === "rejected" ? "#fff" : colors.text2, fontFamily: fonts.bold }]}>
            {t("servedTabRejected")} ({rejected.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {list.length === 0 ? (
          <Text style={{ color: colors.text3, textAlign: "center", padding: 20 }}>{t("servedEmpty")}</Text>
        ) : (
          list.map((q, i) => (
            <View key={q.num} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.num, { color: colors.text3, fontFamily: fonts.mono }]}>#{q.num}</Text>
              <Text style={[styles.name, { color: colors.text, fontFamily: fonts.semibold }]}>{q.name}</Text>
              <Ionicons
                name={activeTab === "served" ? "checkmark-circle" : "close-circle"}
                size={18}
                color={activeTab === "served" ? colors.success : colors.danger}
              />
            </View>
          ))
        )}
      </ScrollView>

      <SecondaryButton label={t("btnCloseServed")} onPress={onClose} style={styles.closeBtn} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 19, marginBottom: 12 },
  tabs: { flexDirection: "row", gap: 5, padding: 4, borderRadius: radius.md, borderWidth: 1, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  tabText: { fontSize: 12.5 },
  list: { maxHeight: 300, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 11 },
  num: { fontSize: 14, width: 36 },
  name: { flex: 1, fontSize: 14 },
  closeBtn: { marginBottom: 6 },
});
