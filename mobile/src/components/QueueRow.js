import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { fonts } from "../theme/typography";

export default function QueueRow({ num, name, current, done, mine, type, last }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  let numColor = colors.text3;
  if (current) numColor = colors.success;
  else if (mine) numColor = colors.accent;

  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.num, { color: numColor, fontFamily: fonts.mono }]}>#{num}</Text>
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { color: mine ? colors.accent : current ? colors.text : colors.text2, fontFamily: mine || current ? fonts.bold : fonts.medium },
        ]}
      >
        {name}
      </Text>
      {current ? (
        <Text style={[styles.badge, { color: colors.success, fontFamily: fonts.bold }]}>⏵ {t("active")}</Text>
      ) : mine ? (
        <View style={[styles.pill, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.pillText, { color: colors.accent, fontFamily: fonts.bold }]}>{t("sizYourself")}</Text>
        </View>
      ) : done ? (
        <Text style={{ color: colors.text3, fontSize: 13 }}>✓</Text>
      ) : type ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: type === "online" ? colors.accentSoft : colors.border },
          ]}
        >
          <Text style={[styles.pillText, { color: type === "online" ? colors.accent : colors.text3, fontFamily: fonts.bold }]}>
            {type === "online" ? t("statusOnline") : t("statusOffline")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 11,
  },
  num: { fontSize: 14, fontWeight: "700", width: 34 },
  name: { flex: 1, fontSize: 14 },
  badge: { fontSize: 11 },
  pill: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999 },
  pillText: { fontSize: 10.5 },
});
