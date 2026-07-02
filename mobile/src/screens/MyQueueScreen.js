import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderBar from "../components/HeaderBar";
import GlassCard from "../components/GlassCard";
import SecondaryButton from "../components/SecondaryButton";
import LiveDot from "../components/LiveDot";
import DelayModal from "../modals/DelayModal";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { CAT_ICONS } from "../data/categoryIcons";
import { fonts, radius } from "../theme/typography";

export default function MyQueueScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { myQueue, places, leaveQueue } = useApp();
  const insets = useSafeAreaInsets();
  const [delayOpen, setDelayOpen] = useState(false);

  if (!myQueue) {
    return (
      <LinearGradient colors={colors.bgGradient} style={styles.fill}>
        <HeaderBar title={t("myQueue")} showThemeToggle={false} />
        <View style={styles.emptyWrap}>
          <Ionicons name="clipboard-outline" size={46} color={colors.text3} />
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold }]}>{t("myQueueNoActive")}</Text>
          <Text style={[styles.emptySub, { color: colors.text3 }]}>{t("myQueueFind")}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            style={[styles.findBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.findBtnText, { fontFamily: fonts.bold }]}>{t("myQueueSearchBtn")}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const place = places.find((p) => p.id === myQueue.placeId);
  const ahead = Math.max(0, myQueue.position);
  const progress = Math.min(1, Math.max(0.06, 1 - ahead / Math.max(1, myQueue.num)));

  return (
    <View style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
      <LinearGradient colors={colors.bgGradient} style={styles.fill}>
        <HeaderBar title={t("myQueue")} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 110 }}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.hero}>
            <View style={styles.heroTop}>
              <Text style={styles.heroPlace} numberOfLines={1}>
                {myQueue.placeName.toUpperCase()}
              </Text>
              <View style={styles.liveWrap}>
                <LiveDot size={7} />
                <Text style={styles.liveText}>{t("live")}</Text>
              </View>
            </View>
            <View style={styles.numRow}>
              <Text style={[styles.bigNum, { fontFamily: fonts.mono }]}>#{myQueue.num}</Text>
              <Text style={styles.yourPos}>{t("yourPlace")}</Text>
            </View>
            <View style={styles.aheadRow}>
              <Text style={styles.aheadText}>
                {t("peopleAhead")} {ahead} {t("peopleAheadSuffix")}
              </Text>
              <Text style={styles.aheadText}>
                {t("nowNum")}: #{myQueue.currentNum ?? "—"}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { fontFamily: fonts.mono }]}>~{myQueue.waitMin}</Text>
                <Text style={styles.statLbl}>{t("minutesWaitWord")}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { fontFamily: fonts.mono }]}>{place?.hours?.split("–")[0]?.trim() || "—"}</Text>
                <Text style={styles.statLbl}>{t("approxTime")}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.actionsRow}>
            <SecondaryButton label={t("myQueueDelay")} icon="time-outline" onPress={() => setDelayOpen(true)} style={styles.flex1} />
            <SecondaryButton label={t("myQueueLeave")} icon="close" danger onPress={leaveQueue} style={styles.flex1} />
          </View>

          {place ? (
            <GlassCard style={styles.placeCard}>
              <TouchableOpacity
                style={styles.placeRow}
                onPress={() => navigation.navigate("PlaceDetail", { placeId: place.id })}
              >
                <View style={[styles.placeIcon, { backgroundColor: colors.iconChipBgStart }]}>
                  <Ionicons name={CAT_ICONS[place.cat] || "business"} size={22} color={colors.accent} />
                </View>
                <View style={styles.flex1}>
                  <Text style={[styles.placeName, { color: colors.text, fontFamily: fonts.bold }]}>{place.name}</Text>
                  <Text style={[styles.placeMeta, { color: colors.text2 }]}>{place.location.district}</Text>
                  <Text style={[styles.placeMeta, { color: colors.text2 }]}>{place.hours}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text3} />
              </TouchableOpacity>
            </GlassCard>
          ) : null}

          <View style={[styles.notice, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <View style={[styles.noticeIcon, { backgroundColor: colors.iconChipBgStart }]}>
              <Ionicons name="notifications" size={17} color={colors.accent} />
            </View>
            <Text style={[styles.noticeText, { color: colors.text2 }]}>{t("notifyBody")}</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <DelayModal visible={delayOpen} onClose={() => setDelayOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 6 },
  emptyTitle: { fontSize: 16, marginTop: 10 },
  emptySub: { fontSize: 13, textAlign: "center", marginBottom: 18 },
  findBtn: { paddingVertical: 12, paddingHorizontal: 26, borderRadius: radius.md },
  findBtnText: { color: "#fff", fontSize: 14 },
  hero: { borderRadius: radius.xxl, padding: 22, marginBottom: 14 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  heroPlace: { color: "rgba(255,255,255,0.85)", fontSize: 11.5, fontWeight: "700", letterSpacing: 0.4, flex: 1 },
  liveWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveText: { color: "#fff", fontSize: 11.5, fontWeight: "700" },
  numRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 14 },
  bigNum: { color: "#fff", fontSize: 56, lineHeight: 56 },
  yourPos: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 6 },
  aheadRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  aheadText: { color: "rgba(255,255,255,0.85)", fontSize: 11.5 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden", marginBottom: 16 },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#fff" },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.26)" },
  statVal: { color: "#fff", fontSize: 20 },
  statLbl: { color: "rgba(255,255,255,0.8)", fontSize: 10.5, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  flex1: { flex: 1 },
  placeCard: { marginBottom: 14 },
  placeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  placeIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  placeName: { fontSize: 15 },
  placeMeta: { fontSize: 12, marginTop: 1 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 11, padding: 14, borderRadius: radius.md, borderWidth: 1 },
  noticeIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  noticeText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
});
