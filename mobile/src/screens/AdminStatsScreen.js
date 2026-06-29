import React from "react";
import { Alert, BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import GlassCard from "../components/GlassCard";
import FadeInView from "../components/FadeInView";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminStatsScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { adminPlace, adminQueue, dailyServedCount, adminLogout, rejectedCount, weeklyServed, monthlyServed, yearlyServed } = useApp();
  const insets = useSafeAreaInsets();

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

  const hourly = adminPlace?.hourlyData || [0, 2, 4, 6, 8, 7, 6, 9];
  const maxHourly = Math.max(...hourly, 1);
  const hours = ["9", "10", "11", "12", "13", "14", "15", "16"];

  if (!adminPlace) return null;

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <FadeInView>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("statsTitle")}</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          {/* Bugungi ko'rsatkichlar */}
          <View style={styles.todayRow}>
            <GlassCard style={styles.todayBox}>
              <Text style={[styles.todayVal, { color: colors.success, fontFamily: fonts.mono }]}>{dailyServedCount}</Text>
              <Text style={[styles.todayLbl, { color: colors.text3 }]}>{t("servedTabServed")}</Text>
            </GlassCard>
            <GlassCard style={styles.todayBox}>
              <Text style={[styles.todayVal, { color: colors.danger, fontFamily: fonts.mono }]}>{rejectedCount}</Text>
              <Text style={[styles.todayLbl, { color: colors.text3 }]}>{t("servedTabRejected")}</Text>
            </GlassCard>
            <GlassCard style={styles.todayBox}>
              <Text style={[styles.todayVal, { color: colors.accent, fontFamily: fonts.mono }]}>{dailyServedCount + rejectedCount}</Text>
              <Text style={[styles.todayLbl, { color: colors.text3 }]}>{t("statsDaily")}</Text>
            </GlassCard>
          </View>

          {/* Umumiy statistika */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("statsTitle")}</Text>
          <GlassCard style={styles.statsDetailCard}>
            <View style={styles.statsDetailRow}>
              <View style={styles.statsDetailItem}>
                <Text style={[styles.statsDetailVal, { color: colors.accent, fontFamily: fonts.mono }]}>{dailyServedCount}</Text>
                <Text style={[styles.statsDetailLbl, { color: colors.text3 }]}>{t("statsDaily")}</Text>
              </View>
              <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statsDetailItem}>
                <Text style={[styles.statsDetailVal, { color: colors.accent, fontFamily: fonts.mono }]}>{weeklyServed}</Text>
                <Text style={[styles.statsDetailLbl, { color: colors.text3 }]}>{t("statsWeekly")}</Text>
              </View>
              <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statsDetailItem}>
                <Text style={[styles.statsDetailVal, { color: colors.accent, fontFamily: fonts.mono }]}>{monthlyServed}</Text>
                <Text style={[styles.statsDetailLbl, { color: colors.text3 }]}>{t("statsMonthly")}</Text>
              </View>
              <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statsDetailItem}>
                <Text style={[styles.statsDetailVal, { color: colors.accent, fontFamily: fonts.mono }]}>{yearlyServed}</Text>
                <Text style={[styles.statsDetailLbl, { color: colors.text3 }]}>{t("statsYearly")}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Soatlik tahlil */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("hourlyAnalysis")}</Text>
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
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 20 },
  todayRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  todayBox: { flex: 1, alignItems: "center", padding: 14 },
  todayVal: { fontSize: 26 },
  todayLbl: { fontSize: 10.5, marginTop: 3, textAlign: "center" },
  sectionTitle: { fontSize: 13.5, marginBottom: 10 },
  statsDetailCard: { marginBottom: 18 },
  statsDetailRow: { flexDirection: "row", alignItems: "center" },
  statsDetailItem: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statsDetailVal: { fontSize: 20 },
  statsDetailLbl: { fontSize: 10.5, marginTop: 3, textAlign: "center" },
  statsDivider: { width: 1, height: 40 },
  chartCard: { marginBottom: 18 },
  chartBars: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 90 },
  chartCol: { flex: 1, alignItems: "center" },
  chartBar: { width: "100%", borderRadius: 6 },
  chartLabels: { flexDirection: "row", gap: 8, marginTop: 8 },
  chartLabel: { flex: 1, textAlign: "center", fontSize: 10 },
});
