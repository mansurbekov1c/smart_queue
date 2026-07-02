import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LiveDot from "../components/LiveDot";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts } from "../theme/typography";

export default function DisplayScreen({ navigation }) {
  const { t } = useI18n();
  const { adminPlace, adminQueue } = useApp();
  const insets = useSafeAreaInsets();

  const current = useMemo(() => adminQueue.find((q) => q.current), [adminQueue]);
  const next = useMemo(() => adminQueue.filter((q) => q.status === "waiting")[0], [adminQueue]);

  return (
    <LinearGradient colors={["#1543bd", "#2f73e8", "#1E5BD6"]} style={styles.fill}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backBtn, { top: insets.top + 14 }]}
      >
        <Text style={styles.backText}>← {t("btnBack")}</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={styles.liveRow}>
          <LiveDot size={10} />
          <Text style={styles.liveLabel}>{t("dispLabel")}</Text>
        </View>

        <Text style={[styles.bigNum, { fontFamily: fonts.mono }]}>{current ? `#${current.num}` : "#—"}</Text>
        <Text style={[styles.name, { fontFamily: fonts.extrabold }]}>{current ? current.name : t("dispName")}</Text>
        <Text style={styles.place}>{adminPlace?.name || t("dispPlace")}</Text>

        <View style={styles.nextBox}>
          <Text style={styles.nextLabel}>{t("dispNext")} </Text>
          <Text style={[styles.nextNum, { fontFamily: fonts.mono }]}>{next ? `#${next.num}` : "—"}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backBtn: {
    position: "absolute",
    left: 16,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: 5,
  },
  backText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  liveLabel: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  bigNum: { color: "#fff", fontSize: 110, lineHeight: 112 },
  name: { color: "#fff", fontSize: 24, marginTop: 12 },
  place: { color: "rgba(255,255,255,0.78)", fontSize: 15, marginTop: 8 },
  nextBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 38,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },
  nextLabel: { color: "rgba(255,255,255,0.8)", fontSize: 15 },
  nextNum: { color: "#fff", fontSize: 19 },
});
