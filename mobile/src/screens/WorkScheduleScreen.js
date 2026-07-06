import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeaderBar from "../components/HeaderBar";
import GlassCard from "../components/GlassCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import BranchMapPreview from "../components/BranchMapPreview";
import NoBranchNotice from "../components/NoBranchNotice";
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

/* Bu ekran filial admini uchun ham (o'z filiali, branchId parametrsiz —
   adminPlaceId'ga tushadi), super admin uchun ham (istalgan filial,
   route.params.branchId orqali, SuperAdminBranchDetailScreen'dan) ishlaydi. */
export default function WorkScheduleScreen({ route, navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const {
    places,
    adminPlaceId,
    updateBranchSchedule,
    updateAvgServiceMinutes,
    setBranchEmergencyClosed,
    updateBranchLocation,
  } = useApp();

  const branchId = route?.params?.branchId || adminPlaceId;
  const place = places.find((p) => p.id === branchId) || null;

  const [schedule, setSchedule] = useState(() => buildDefaultSchedule(place?.weeklySchedule));
  const [saving, setSaving] = useState(false);
  const [avgMinutesText, setAvgMinutesText] = useState(String(place?.avgServiceMinutes ?? 15));
  const [savingAvg, setSavingAvg] = useState(false);
  const [latText, setLatText] = useState(place?.location?.coords?.lat != null ? String(place.location.coords.lat) : "");
  const [lngText, setLngText] = useState(place?.location?.coords?.lng != null ? String(place.location.coords.lng) : "");
  const [savingLocation, setSavingLocation] = useState(false);

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
    await updateBranchSchedule(branchId, schedule);
    setSaving(false);
  };

  const onSaveAvgMinutes = async () => {
    const minutes = parseInt(avgMinutesText, 10);
    if (!Number.isFinite(minutes) || minutes < 1) {
      showToast(t("toastInvalidTimeFormat"));
      return;
    }
    setSavingAvg(true);
    await updateAvgServiceMinutes(branchId, minutes);
    setSavingAvg(false);
  };

  const onToggleEmergencyClose = () => {
    if (place?.isOpen) {
      Alert.alert(t("confirmEmergencyCloseTitle"), t("confirmEmergencyCloseMsg"), [
        { text: t("btnCancel"), style: "cancel" },
        {
          text: t("btnConfirm"),
          style: "destructive",
          onPress: () => setBranchEmergencyClosed(branchId, true),
        },
      ]);
    } else {
      setBranchEmergencyClosed(branchId, false);
    }
  };

  const onSaveLocation = async () => {
    const lat = latText.trim() ? parseFloat(latText) : null;
    const lng = lngText.trim() ? parseFloat(lngText) : null;
    if ((latText.trim() && !Number.isFinite(lat)) || (lngText.trim() && !Number.isFinite(lng))) {
      showToast(t("toastInvalidTimeFormat"));
      return;
    }
    setSavingLocation(true);
    await updateBranchLocation(branchId, lat, lng);
    setSavingLocation(false);
  };

  if (!place) {
    return (
      <View style={styles.fill}>
        <HeaderBar title={route?.params?.branchName || t("workScheduleTitle")} onBack={() => navigation.goBack()} showThemeToggle={false} />
        <NoBranchNotice />
      </View>
    );
  }

  const previewLat = latText.trim() ? parseFloat(latText) : null;
  const previewLng = lngText.trim() ? parseFloat(lngText) : null;

  return (
    <View style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
      <HeaderBar title={route?.params?.branchName || t("workScheduleTitle")} onBack={() => navigation.goBack()} showThemeToggle={false} />
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

        <GlassCard style={styles.card}>
          <TouchableOpacity onPress={onToggleEmergencyClose} style={styles.emergencyRow}>
            <Ionicons
              name={place.isOpen ? "close-circle-outline" : "checkmark-circle-outline"}
              size={19}
              color={place.isOpen ? colors.danger : colors.success}
            />
            <Text
              style={[
                styles.emergencyLabel,
                { color: place.isOpen ? colors.danger : colors.success, fontFamily: fonts.semibold },
              ]}
            >
              {place.isOpen ? t("btnEmergencyClose") : t("btnReopenBranch")}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t("sectionLocation")}
          </Text>
          <Text style={[styles.hint, { color: colors.text3 }]}>{t("hintLatLngOptional")}</Text>
          <View style={styles.locRow}>
            <InputField
              label={t("labelLat")}
              value={latText}
              onChangeText={setLatText}
              keyboardType="numbers-and-punctuation"
              style={styles.locInput}
            />
            <InputField
              label={t("labelLng")}
              value={lngText}
              onChangeText={setLngText}
              keyboardType="numbers-and-punctuation"
              style={styles.locInput}
            />
          </View>
          <BranchMapPreview lat={previewLat} lng={previewLng} style={styles.mapPreview} />
          <PrimaryButton
            label={t("btnSave")}
            onPress={onSaveLocation}
            loading={savingLocation}
            disabled={savingLocation}
          />
        </GlassCard>
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
  saveBtn: { marginTop: -8, marginBottom: 4 },
  emergencyRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  emergencyLabel: { fontSize: 14.5 },
  sectionTitle: { fontSize: 14, marginTop: 8, marginBottom: 4 },
  hint: { fontSize: 11, marginBottom: 12 },
  locRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  locInput: { flex: 1 },
  mapPreview: { marginBottom: 12 },
});
