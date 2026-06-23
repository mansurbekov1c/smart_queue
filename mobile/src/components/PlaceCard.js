import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { CAT_ICONS } from "../data/categoryIcons";
import { fonts, radius } from "../theme/typography";

export default function PlaceCard({ place, onPress }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  const queueColor = place.queueCount > 10 ? colors.danger : place.queueCount > 5 ? colors.amber : colors.success;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.row, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.iconChipBgStart }]}>
        <Ionicons name={CAT_ICONS[place.cat] || "business"} size={22} color={colors.accent} />
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.text, fontFamily: fonts.bold }]}>
          {place.name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={12} color={colors.amber} />
          <Text style={[styles.metaText, { color: colors.amber, fontFamily: fonts.semibold }]}> {place.rating}</Text>
          <Text style={[styles.metaDot, { color: colors.text3 }]}> · </Text>
          <Text style={[styles.metaText, { color: colors.text3, fontFamily: fonts.medium }]}>
            {place.distanceKm} km
          </Text>
          {!place.isOpen ? (
            <Text style={[styles.metaText, { color: colors.danger, fontFamily: fonts.semibold }]}> · {t("statusClosed")}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.num, { color: place.isOpen ? queueColor : colors.text3, fontFamily: fonts.mono }]}>
          {place.isOpen ? place.queueCount : "—"}
        </Text>
        <Text style={[styles.numLabel, { color: colors.text3 }]}>{t("queue").toLowerCase()}da</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 3, flexWrap: "wrap" },
  metaText: { fontSize: 12.5 },
  metaDot: { fontSize: 12.5 },
  right: { alignItems: "flex-end" },
  num: { fontSize: 17 },
  numLabel: { fontSize: 10, marginTop: 1 },
});
