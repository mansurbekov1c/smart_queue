import React, { useState } from "react";
import { Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import GlassCard from "../components/GlassCard";
import FadeInView from "../components/FadeInView";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PERIODS = ["daily", "weekly", "monthly", "yearly"];

function BarChart({ data, labels, color }) {
  const maxVal = Math.max(...data, 1);
  return (
    <View>
      <View style={styles.chartBars}>
        {data.map((v, i) => (
          <View key={i} style={styles.chartCol}>
            <View
              style={[
                styles.chartBar,
                { height: Math.max(6, Math.round((v / maxVal) * 80)), backgroundColor: color },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.chartLabels}>
        {labels.slice(0, data.length).map((lbl, i) => (
          <Text key={i} style={[styles.chartLabel, { color: "#888" }]}>
            {lbl}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function AdminStatsScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const {
    adminPlace,
    adminQueue,
    dailyServedCount,
    adminLogout,
    rejectedCount,
    weeklyServed,
    monthlyServed,
    yearlyServed,
  } = useApp();
  const insets = useSafeAreaInsets();

  const [period, setPeriod] = useState("daily");

  const onLogout = () => {
    Alert.alert(t("confirmLogout"), t("confirmLogoutMsg"), [
      { text: t("btnCancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: () => {
          adminLogout();
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Splash" }] }));
        },
      },
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        onLogout();
        return true;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
      return () => sub.remove();
    }, [adminPlace]),
  );

  if (!adminPlace) return null;

  // Chart data
  const hourlyData = adminPlace?.hourlyData || [0, 2, 4, 6, 8, 7, 6, 9];
  const hourLabels = ["9", "10", "11", "12", "13", "14", "15", "16"];

  const weeklyDayData = [8, 12, 15, dailyServedCount + 4, 14, 22, 10];
  const weekDayLabels = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const monthlyWeekData = [42, 68, weeklyServed - 20, 71];
  const weekLabels = ["1-h", "2-h", "3-h", "4-h"];

  const yearlyMonthData = [120, 145, 132, 160, 175, 190, 168, 182, 155, 200, 178, monthlyServed];
  const monthLabels = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

  // Period-specific data
  const periodConfig = {
    daily: {
      labelKey: "periodDaily",
      served: dailyServedCount,
      rejected: rejectedCount,
      total: dailyServedCount + rejectedCount,
      subKey: "statsSubHourly",
      chartData: hourlyData,
      chartLabels: hourLabels,
      avg: dailyServedCount,
      avgSuffix: t("dayUnit"),
    },
    weekly: {
      labelKey: "periodWeekly",
      served: weeklyServed,
      rejected: rejectedCount + 12,
      total: weeklyServed + rejectedCount + 12,
      subKey: "statsSubDaily",
      chartData: weeklyDayData,
      chartLabels: weekDayLabels,
      avg: weeklyServed,
      avgSuffix: t("weekUnit"),
    },
    monthly: {
      labelKey: "periodMonthly",
      served: monthlyServed,
      rejected: rejectedCount + 54,
      total: monthlyServed + rejectedCount + 54,
      subKey: "statsSubWeekly",
      chartData: monthlyWeekData,
      chartLabels: weekLabels,
      avg: monthlyServed,
      avgSuffix: t("monthUnit"),
    },
    yearly: {
      labelKey: "periodYearly",
      served: yearlyServed,
      rejected: rejectedCount + 312,
      total: yearlyServed + rejectedCount + 312,
      subKey: "statsSubMonthly",
      chartData: yearlyMonthData,
      chartLabels: monthLabels,
      avg: yearlyServed,
      avgSuffix: t("yearUnit"),
    },
  };

  const cfg = periodConfig[period];

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <FadeInView>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
            {t("statsTitle")}
          </Text>
        </View>

        {/* Period tabs */}
        <View style={[styles.tabsWrap, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.tabBtn, active && { backgroundColor: colors.accent }]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: active ? "#fff" : colors.text2, fontFamily: active ? fonts.bold : fonts.medium },
                  ]}
                >
                  {t(periodConfig[p].labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <GlassCard style={styles.summaryBox}>
              <Text style={[styles.summaryVal, { color: colors.success, fontFamily: fonts.mono }]}>
                {cfg.served}
              </Text>
              <Text style={[styles.summaryLbl, { color: colors.text3 }]}>{t("servedTabServed")}</Text>
            </GlassCard>
            <GlassCard style={styles.summaryBox}>
              <Text style={[styles.summaryVal, { color: colors.danger, fontFamily: fonts.mono }]}>
                {cfg.rejected}
              </Text>
              <Text style={[styles.summaryLbl, { color: colors.text3 }]}>{t("servedTabRejected")}</Text>
            </GlassCard>
            <GlassCard style={styles.summaryBox}>
              <Text style={[styles.summaryVal, { color: colors.accent, fontFamily: fonts.mono }]}>
                {cfg.total}
              </Text>
              <Text style={[styles.summaryLbl, { color: colors.text3 }]}>{t("statsDaily")}</Text>
            </GlassCard>
          </View>

          {/* Average customers card */}
          <GlassCard style={styles.avgCard}>
            <View style={styles.avgRow}>
              <View style={[styles.avgIcon, { backgroundColor: colors.accentSoft }]}>
                <Text style={{ fontSize: 18 }}>📊</Text>
              </View>
              <View style={styles.avgInfo}>
                <Text style={[styles.avgLabel, { color: colors.text3 }]}>{t("statsAvgCustomers")}</Text>
                <Text style={[styles.avgVal, { color: colors.accent, fontFamily: fonts.mono }]}>
                  {cfg.avg}{" "}
                  <Text style={[styles.avgSuffix, { color: colors.text3 }]}>/ {cfg.avgSuffix}</Text>
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Sub-analysis chart */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
            {t(cfg.subKey)}
          </Text>
          <GlassCard style={styles.chartCard}>
            <BarChart data={cfg.chartData} labels={cfg.chartLabels} color={colors.accent} />
          </GlassCard>
        </ScrollView>
      </FadeInView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 20 },
  tabsWrap: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  tabBtnText: { fontSize: 12 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryBox: { flex: 1, alignItems: "center", padding: 12 },
  summaryVal: { fontSize: 22 },
  summaryLbl: { fontSize: 10, marginTop: 3, textAlign: "center" },
  avgCard: { marginBottom: 16 },
  avgRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avgIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avgInfo: { flex: 1 },
  avgLabel: { fontSize: 12, marginBottom: 2 },
  avgVal: { fontSize: 20 },
  avgSuffix: { fontSize: 13 },
  sectionTitle: { fontSize: 13.5, marginBottom: 10 },
  chartCard: { marginBottom: 18 },
  chartBars: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 90 },
  chartCol: { flex: 1, alignItems: "center" },
  chartBar: { width: "100%", borderRadius: 6 },
  chartLabels: { flexDirection: "row", gap: 6, marginTop: 8 },
  chartLabel: { flex: 1, textAlign: "center", fontSize: 9 },
});
