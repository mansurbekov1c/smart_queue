import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import HeaderBar from "../components/HeaderBar";
import GlassCard from "../components/GlassCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { fonts, radius } from "../theme/typography";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL_KEYS = {
  mon: "dayMon",
  tue: "dayTue",
  wed: "dayWed",
  thu: "dayThu",
  fri: "dayFri",
  sat: "daySat",
  sun: "daySun",
};
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function buildDefaultSchedule(existing) {
  const schedule = {};
  for (const key of DAY_KEYS) {
    schedule[key] = existing?.[key]
      ? { ...existing[key] }
      : { open: "09:00", close: "21:00", closed: false };
  }
  return schedule;
}

export default function WorkScheduleScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const { adminPlace, updateBranchSchedule, updateAvgServiceMinutes } = useApp();

  const [schedule, setSchedule] = useState(() => buildDefaultSchedule(adminPlace?.weeklySchedule));
  const [saving, setSaving] = useState(false);
  const [avgMinutesText, setAvgMinutesText] = useState(String(adminPlace?.avgServiceMinutes ?? 15));
  const [savingAvg, setSavingAvg] = useState(false);

  const setDay = (key, patch) => {
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const onSave = async () => {
    for (const key of DAY_KEYS) {
      const day = schedule[key];
      if (!day.closed && (!TIME_RE.test(day.open) || !TIME_RE.test(day.close))) {
        showToast(t("toastInvalidTimeFormat"));
        return;
      }
    }
    setSaving(true);
    await updateBranchSchedule(schedule);
    setSaving(false);
  };

  const onSaveAvgMinutes = async () => {
    const minutes = parseInt(avgMinutesText, 10);
    if (!Number.isFinite(minutes) || minutes < 1) {
      showToast(t("toastInvalidTimeFormat"));
      return;
    }
    setSavingAvg(true);
    await updateAvgServiceMinutes(minutes);
    setSavingAvg(false);
  };

  if (!adminPlace) return null;

  return (
    <View style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
      <HeaderBar title={t("workScheduleTitle")} onBack={() => navigation.goBack()} showThemeToggle={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sub, { color: colors.text2 }]}>{t("workScheduleSub")}</Text>

        <GlassCard style={styles.card}>
          <View style={styles.avgRow}>
            <InputField
              label={t("labelAvgServiceMinutes")}
              value={avgMinutesText}
              onChangeText={setAvgMinutesText}
              keyboardType="number-pad"
              style={styles.avgInput}
            />
            <PrimaryButton
              label={t("btnSave")}
              onPress={onSaveAvgMinutes}
              disabled={savingAvg}
              loading={savingAvg}
              style={styles.avgSaveBtn}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          {DAY_KEYS.map((key, i) => {
            const day = schedule[key];
            return (
              <View
                key={key}
                style={[styles.dayRow, i < DAY_KEYS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={styles.dayHeadRow}>
                  <Text style={[styles.dayLabel, { color: colors.text, fontFamily: fonts.semibold }]}>
                    {t(DAY_LABEL_KEYS[key])}
                  </Text>
                  <Switch
                    value={!day.closed}
                    onValueChange={(v) => setDay(key, { closed: !v })}
                    trackColor={{ false: colors.border, true: colors.accentBorder }}
                    thumbColor={!day.closed ? colors.accent : colors.text3}
                  />
                </View>
                {!day.closed ? (
                  <View style={styles.timeRow}>
                    <TextInput
                      value={day.open}
                      onChangeText={(v) => setDay(key, { open: v })}
                      placeholder="09:00"
                      placeholderTextColor={colors.placeholder}
                      style={[styles.timeInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontFamily: fonts.mono }]}
                      maxLength={5}
                    />
                    <Text style={[styles.timeDash, { color: colors.text3 }]}>—</Text>
                    <TextInput
                      value={day.close}
                      onChangeText={(v) => setDay(key, { close: v })}
                      placeholder="21:00"
                      placeholderTextColor={colors.placeholder}
                      style={[styles.timeInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontFamily: fonts.mono }]}
                      maxLength={5}
                    />
                  </View>
                ) : (
                  <Text style={[styles.closedLabel, { color: colors.text3 }]}>{t("dayClosedLabel")}</Text>
                )}
              </View>
            );
          })}
        </GlassCard>

        <PrimaryButton label={t("btnSave")} onPress={onSave} loading={saving} disabled={saving} style={styles.saveBtn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 60 },
  sub: { fontSize: 13, marginBottom: 14, lineHeight: 18 },
  card: { paddingVertical: 4, marginBottom: 18 },
  avgRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingVertical: 10 },
  avgInput: { flex: 1 },
  avgSaveBtn: { width: 90, marginBottom: 0 },
  dayRow: { paddingVertical: 12 },
  dayHeadRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dayLabel: { fontSize: 14.5 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  timeInput: { flex: 1, borderWidth: 1, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 10, fontSize: 14, textAlign: "center" },
  timeDash: { fontSize: 14 },
  closedLabel: { fontSize: 12.5, marginTop: 4 },
  saveBtn: { marginTop: 4 },
});
