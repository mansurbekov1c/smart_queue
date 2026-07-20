import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useExitConfirmOnBack from "../hooks/useExitConfirmOnBack";
import GlassCard from "../components/GlassCard";
import QueueRow from "../components/QueueRow";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import FadeInView from "../components/FadeInView";
import AddWalkInModal from "../modals/AddWalkInModal";
import ServedTodayModal from "../modals/ServedTodayModal";
import NoBranchNotice from "../components/NoBranchNotice";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DELAY_OPTIONS = [1, 2, 3, 4, 5];

export default function AdminPanelScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { adminPlace, adminQueue, adminNext, adminReject, confirmResetQueue, dailyServedCount, adminRejectItem, adminDelayItem } = useApp();
  const insets = useSafeAreaInsets();

  const [addOpen, setAddOpen] = useState(false);
  const [servedOpen, setServedOpen] = useState(false);
  const [expandedNum, setExpandedNum] = useState(null);

  useExitConfirmOnBack();

  const current = useMemo(() => adminQueue.find((q) => q.status === "current"), [adminQueue]);
  const waiting = useMemo(() => adminQueue.filter((q) => q.status === "waiting"), [adminQueue]);
  const next = waiting[0];

  if (!adminPlace) return <NoBranchNotice />;

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

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
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
              <PrimaryButton label={t("btnReject")} icon="close-circle" onPress={adminReject} color={colors.danger} style={styles.flex1} />
              <SecondaryButton label={t("btnAdd")} onPress={() => setAddOpen(true)} style={styles.flex1} />
            </View>

            {/* Bugungi / kutayotganlar */}
            <View style={styles.statsRow}>
              <GlassCard style={styles.statBox}>
                <TouchableOpacity onPress={() => setServedOpen(true)} style={styles.statInner}>
                  <Text style={[styles.statVal, { color: colors.accent, fontFamily: fonts.mono }]}>{dailyServedCount}</Text>
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
                waiting.map((q, i) => {
                  const isExpanded = expandedNum === q.num;
                  const isLast = i === waiting.length - 1;
                  return (
                    <View key={q.num}>
                      <TouchableOpacity
                        onPress={() => setExpandedNum(isExpanded ? null : q.num)}
                        activeOpacity={0.7}
                      >
                        <QueueRow num={q.num} name={q.name} type={q.type} last={isLast && !isExpanded} />
                      </TouchableOpacity>
                      {isExpanded && (
                        <View
                          style={[
                            styles.itemActions,
                            { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border },
                          ]}
                        >
                          <TouchableOpacity
                            style={[styles.itemRejectBtn, { borderColor: colors.danger, backgroundColor: colors.inputBg }]}
                            onPress={() => {
                              adminRejectItem(q.id);
                              setExpandedNum(null);
                            }}
                          >
                            <Ionicons name="close-circle" size={15} color={colors.danger} />
                            <Text style={[styles.itemActionText, { color: colors.danger, fontFamily: fonts.bold }]}>
                              {t("btnReject")}
                            </Text>
                          </TouchableOpacity>
                          <View style={styles.delayBtns}>
                            {DELAY_OPTIONS.map((n) => (
                              <TouchableOpacity
                                key={n}
                                style={[
                                  styles.delayBtn,
                                  { borderColor: colors.inputBorder, backgroundColor: colors.inputBg },
                                ]}
                                onPress={() => {
                                  adminDelayItem(q.id, n);
                                  setExpandedNum(null);
                                }}
                              >
                                <Text style={[styles.delayBtnText, { color: colors.accent, fontFamily: fonts.bold }]}>
                                  +{n}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
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
  actionsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  itemActions: { paddingBottom: 10, paddingTop: 6, paddingHorizontal: 4, gap: 8 },
  itemRejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  itemActionText: { fontSize: 13 },
  delayBtns: { flexDirection: "row", gap: 6 },
  delayBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: radius.sm || 8,
    borderWidth: 1,
  },
  delayBtnText: { fontSize: 13 },
  statBox: { flex: 1, padding: 0 },
  statInner: { padding: 15, alignItems: "center" },
  statVal: { fontSize: 24 },
  statLbl: { fontSize: 11.5, marginTop: 2, textAlign: "center" },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 15 },
  clearLink: { fontSize: 13 },
  queueCard: { marginBottom: 18, paddingVertical: 4 },
});
