import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import QueueRow from "../components/QueueRow";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import FadeInView from "../components/FadeInView";
import AddWalkInModal from "../modals/AddWalkInModal";
import ServedTodayModal from "../modals/ServedTodayModal";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminPanelScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { adminPlace, adminQueue, adminNext, confirmResetQueue } = useApp();
  const insets = useSafeAreaInsets();

  const [addOpen, setAddOpen] = useState(false);
  const [servedOpen, setServedOpen] = useState(false);

  const current = useMemo(() => adminQueue.find((q) => q.current && !q.done), [adminQueue]);
  const waiting = useMemo(() => adminQueue.filter((q) => !q.done && !q.current), [adminQueue]);
  const served = useMemo(() => adminQueue.filter((q) => q.done), [adminQueue]);
  const next = waiting[0];

  const hourly = adminPlace?.hourlyData || [0, 2, 4, 6, 8, 7, 6, 9];
  const maxHourly = Math.max(...hourly, 1);
  const hours = ["9", "10", "11", "12", "13", "14", "15", "16"];

  if (!adminPlace) return null;

  const onReset = () => {
    Alert.alert(t("queue"), t("confirmClearQueue"), [
      { text: t("btnCancel"), style: "cancel" },
      { text: t("btnConfirm"), style: "destructive", onPress: confirmResetQueue },
    ]);
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
      <LinearGradient colors={colors.bgGradient} style={styles.fill}>
        <FadeInView>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate("AdminProfile")}
              style={[styles.headerBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            >
              <Ionicons name="person-circle" size={20} color={colors.accent} />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              {adminPlace.name.split(" ")[0]} · Admin
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Display")}
              style={[styles.headerBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, flexDirection: "row", paddingHorizontal: 10, width: "auto", gap: 4 }]}
            >
              <Ionicons name="tv" size={14} color={colors.accent} />
              <Text style={[styles.headerBtnText, { color: colors.accent, fontFamily: fonts.bold }]}>{t("adminDisplayBtn")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
            {/* Hozirda xizmatda */}
            <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.currentCard}>
              <Text style={styles.currentLabel}>{t("adminCurLabel")}</Text>
              <Text style={[styles.currentNum, { fontFamily: fonts.mono }]}>{current ? `#${current.num}` : "#—"}</Text>
              <Text style={[styles.currentName, { fontFamily: fonts.semibold }]}>{current ? current.name : t("adminNoOne")}</Text>

              <View style={styles.nextRow}>
                {next ? (
                  <>
                    <Text style={styles.nextLabel}>{t("adminNextLabel")}</Text>
                    <Text style={[styles.nextNum, { fontFamily: fonts.mono }]}>#{next.num}</Text>
                    <Text style={[styles.nextName, { fontFamily: fonts.semibold }]}>{next.name}</Text>
                  </>
                ) : (
                  <Text style={styles.nextLabel}>{t("adminQueueEnded")}</Text>
                )}
              </View>
            </LinearGradient>

            {/* Amallar */}
            <View style={styles.actionsRow}>
              <PrimaryButton label={t("btnNext")} icon="play" onPress={adminNext} color={colors.success} style={styles.flex2} />
              <SecondaryButton label={t("btnAdd")} onPress={() => setAddOpen(true)} style={styles.flex1} />
            </View>

            {/* Statistika */}
            <View style={styles.statsRow}>
              <GlassCard style={styles.statBox}>
                <TouchableOpacity onPress={() => setServedOpen(true)} style={styles.statInner}>
                  <Text style={[styles.statVal, { color: colors.accent, fontFamily: fonts.mono }]}>{served.length}</Text>
                  <Text style={[styles.statLbl, { color: colors.text3 }]}>{t("statToday")}</Text>
                </TouchableOpacity>
              </GlassCard>
              <GlassCard style={styles.statBox}>
                <View style={styles.statInner}>
                  <Text style={[styles.statVal, { color: colors.accent, fontFamily: fonts.mono }]}>{waiting.length}</Text>
                  <Text style={[styles.statLbl, { color: colors.text3 }]}>{t("statWaiting")}</Text>
                </View>
              </GlassCard>
            </View>

            {/* Navbat ro'yxati */}
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
                {t("queue")} ({waiting.length})
              </Text>
              <TouchableOpacity onPress={onReset}>
                <Text style={[styles.clearLink, { color: colors.danger, fontFamily: fonts.bold }]}>{t("btnClear")}</Text>
              </TouchableOpacity>
            </View>

            <GlassCard style={styles.queueCard}>
              {waiting.length === 0 ? (
                <Text style={{ color: colors.text3, textAlign: "center", padding: 16 }}>{t("emptyQueue")}</Text>
              ) : (
                waiting.map((q, i) => (
                  <QueueRow key={q.num} num={q.num} name={q.name} type={q.type} last={i === waiting.length - 1} />
                ))
              )}
            </GlassCard>

            {/* Soatlik tahlil */}
            <Text style={[styles.chartTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("hourlyAnalysis")}</Text>
            <GlassCard style={styles.chartCard}>
              <View style={styles.chartBars}>
                {hourly.map((v, i) => (
                  <View key={i} style={styles.chartCol}>
                    <View
                      style={[
                        styles.chartBar,
                        { height: Math.max(6, Math.round((v / maxHourly) * 80)), backgroundColor: colors.accent },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.chartLabels}>
                {hours.slice(0, hourly.length).map((h, i) => (
                  <Text key={i} style={[styles.chartLabel, { color: colors.text3, fontFamily: fonts.mono }]}>
                    {h}
                  </Text>
                ))}
              </View>
            </GlassCard>
          </ScrollView>
        </FadeInView>
      </LinearGradient>

      <AddWalkInModal visible={addOpen} onClose={() => setAddOpen(false)} />
      <ServedTodayModal visible={servedOpen} onClose={() => setServedOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerBtn: {
    height: 38,
    width: 38,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: { fontSize: 12.5 },
  headerTitle: { fontSize: 15 },
  currentCard: { borderRadius: radius.xl, padding: 20, alignItems: "center", marginBottom: 14 },
  currentLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11.5, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  currentNum: { color: "#fff", fontSize: 50, lineHeight: 54, marginTop: 4 },
  currentName: { color: "#fff", fontSize: 15, marginTop: 2 },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
  },
  nextLabel: { color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  nextNum: { color: "#fff", fontSize: 17 },
  nextName: { color: "#fff", fontSize: 14 },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statBox: { flex: 1, padding: 0 },
  statInner: { padding: 15, alignItems: "center" },
  statVal: { fontSize: 24 },
  statLbl: { fontSize: 11.5, marginTop: 2, textAlign: "center" },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 15 },
  clearLink: { fontSize: 13 },
  queueCard: { marginBottom: 18, paddingVertical: 4 },
  chartTitle: { fontSize: 13.5, marginBottom: 10 },
  chartCard: {},
  chartBars: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 90 },
  chartCol: { flex: 1, alignItems: "center" },
  chartBar: { width: "100%", borderRadius: 6 },
  chartLabels: { flexDirection: "row", gap: 8, marginTop: 8 },
  chartLabel: { flex: 1, textAlign: "center", fontSize: 10 },
});
