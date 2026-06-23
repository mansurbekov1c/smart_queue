import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import PlaceCard from "../components/PlaceCard";
import CategoryChip from "../components/CategoryChip";
import LiveDot from "../components/LiveDot";
import { CAT_ICONS } from "../data/categoryIcons";
import { fonts, radius } from "../theme/typography";

const CATS = [
  { key: "all", labelKey: "catAll", icon: null },
  { key: "barber", labelKey: "catBarber", icon: CAT_ICONS.barber },
  { key: "clinic", labelKey: "catClinic", icon: CAT_ICONS.clinic },
  { key: "bank", labelKey: "catBank", icon: CAT_ICONS.bank },
  { key: "carwash", labelKey: "catCarwash", icon: CAT_ICONS.carwash },
  { key: "gov", labelKey: "catGov", icon: CAT_ICONS.gov },
];

export default function HomeScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { t } = useI18n();
  const { places, homeFilter, setHomeFilter, user, myQueue } = useApp();
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const list = homeFilter === "all" ? places : places.filter((p) => p.cat === homeFilter);
    return list.slice(0, 4);
  }, [places, homeFilter]);

  const fullName = user ? `${user.first} ${user.last}` : "";
  const initials = user ? `${user.first[0] || ""}${user.last[0] || ""}` : "";

  return (
    <View style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
      <LinearGradient colors={colors.bgGradient} style={styles.fill}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 120 }}>
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <Ionicons name="flash" size={19} color={colors.accent} />
              <Text style={[styles.brandText, { color: colors.text, fontFamily: fonts.extrabold }]}>Navbat</Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={17} color={isDark ? "#ffd34d" : colors.text} />
            </TouchableOpacity>
          </View>

          <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.hero}>
            <Text style={styles.heroGreeting}>{t("heroGreeting")}</Text>
            <Text style={[styles.heroName, { fontFamily: fonts.extrabold }]} numberOfLines={1}>
              {fullName || initials} 👋
            </Text>

            {myQueue ? (
              <View style={styles.heroCard}>
                <View style={styles.heroCardTop}>
                  <Text style={styles.heroCardLabel}>
                    <Ionicons name="clipboard" size={11} color="rgba(255,255,255,0.9)" /> {t("activeQueue")}
                  </Text>
                </View>
                <Text style={styles.heroPlaceName} numberOfLines={1}>
                  {myQueue.placeName}
                </Text>
                <View style={styles.heroNumRow}>
                  <Text style={[styles.heroNum, { fontFamily: fonts.mono }]}>#{myQueue.num}</Text>
                  <Text style={styles.heroDot}>·</Text>
                  <Text style={styles.heroWait}>
                    ~{myQueue.waitMin} {t("minutesFull")}
                  </Text>
                  <View style={styles.liveWrap}>
                    <LiveDot size={7} />
                    <Text style={styles.liveText}>{t("live")}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.heroEmpty}>{t("heroNoQueue")}</Text>
            )}
          </LinearGradient>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {CATS.map((c) => (
              <CategoryChip
                key={c.key}
                label={t(c.labelKey)}
                icon={c.icon}
                active={homeFilter === c.key}
                onPress={() => setHomeFilter(c.key)}
              />
            ))}
          </ScrollView>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
              {t("sectionNearby")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Search")}>
              <Text style={[styles.sectionLink, { color: colors.accent, fontFamily: fonts.bold }]}>{t("btnAll")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {filtered.length === 0 ? (
              <Text style={{ color: colors.text3, textAlign: "center", padding: 20 }}>{t("emptyCategory")}</Text>
            ) : (
              filtered.map((p) => (
                <PlaceCard key={p.id} place={p} onPress={() => navigation.navigate("PlaceDetail", { placeId: p.id })} />
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 },
  brand: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandText: { fontSize: 16 },
  themeBtn: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hero: { marginHorizontal: 16, borderRadius: radius.xl, padding: 18, marginBottom: 14 },
  heroGreeting: { color: "rgba(255,255,255,0.85)", fontSize: 13.5 },
  heroName: { color: "#fff", fontSize: 21, marginTop: 2, marginBottom: 14 },
  heroEmpty: { color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 19 },
  heroCard: { backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 16, padding: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  heroCardTop: { marginBottom: 6 },
  heroCardLabel: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  heroPlaceName: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 9 },
  heroNumRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  heroNum: { color: "#fff", fontSize: 26 },
  heroDot: { color: "rgba(255,255,255,0.6)" },
  heroWait: { color: "#fff", fontSize: 14, fontWeight: "600" },
  liveWrap: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: "auto" },
  liveText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  chipsRow: { marginBottom: 14 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16 },
  sectionLink: { fontSize: 13 },
  list: { paddingHorizontal: 16 },
});
