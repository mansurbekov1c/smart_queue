import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import PlaceCard from "../components/PlaceCard";
import CategoryChip from "../components/CategoryChip";
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

export default function SearchScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { places, marketFilter, setMarketFilter, likedPlaces } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = places;
    if (marketFilter !== "all") list = list.filter((p) => p.cat === marketFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.district.toLowerCase().includes(q) ||
          p.location.address.toLowerCase().includes(q),
      );
    }
    return list;
  }, [places, marketFilter, query]);

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("services")}</Text>

        {/* Men yoqtirganlar */}
        <View style={styles.favSection}>
          <View style={styles.favHeader}>
            <Ionicons name="heart" size={16} color={colors.danger} />
            <Text style={[styles.favTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>
              {t("myFavorites")}
            </Text>
          </View>

          {likedPlaces.length === 0 ? (
            <View style={[styles.favEmpty, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
              <Ionicons name="heart-outline" size={26} color={colors.text3} />
              <Text style={[styles.favEmptyTitle, { color: colors.text2, fontFamily: fonts.bold }]}>
                {t("noFavorites")}
              </Text>
              <Text style={[styles.favEmptySub, { color: colors.text3 }]}>{t("noFavoritesSub")}</Text>
            </View>
          ) : (
            <View style={styles.favList}>
              {likedPlaces.map((p) => (
                <PlaceCard key={p.id} place={p} onPress={() => navigation.navigate("PlaceDetail", { placeId: p.id })} />
              ))}
            </View>
          )}
        </View>

        {/* Qidiruv */}
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search" size={17} color={colors.text3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.text, fontFamily: fonts.medium }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {CATS.map((c) => (
            <CategoryChip
              key={c.key}
              label={t(c.labelKey)}
              icon={c.icon}
              active={marketFilter === c.key}
              onPress={() => setMarketFilter(c.key)}
            />
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search" size={28} color={colors.text3} />
              <Text style={[styles.emptyTitle, { color: colors.text2, fontFamily: fonts.bold }]}>{t("emptyNoResults")}</Text>
              <Text style={[styles.emptySub, { color: colors.text3 }]}>{t("emptySearchOther")}</Text>
            </View>
          ) : (
            filtered.map((p) => (
              <PlaceCard key={p.id} place={p} onPress={() => navigation.navigate("PlaceDetail", { placeId: p.id })} />
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  title: { fontSize: 21, paddingHorizontal: 16, marginBottom: 14 },
  favSection: { paddingHorizontal: 16, marginBottom: 18 },
  favHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  favTitle: { fontSize: 16 },
  favEmpty: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 6,
  },
  favEmptyTitle: { fontSize: 14, marginTop: 4 },
  favEmptySub: { fontSize: 12, textAlign: "center" },
  favList: {},
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14.5 },
  chipsRow: { marginBottom: 14 },
  list: { paddingHorizontal: 16 },
  empty: { alignItems: "center", paddingVertical: 50, gap: 8 },
  emptyTitle: { fontSize: 15, marginTop: 6 },
  emptySub: { fontSize: 13 },
});
