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
import { CAT_ICONS, categoryLabelKey } from "../data/categoryIcons";
import { fonts, radius } from "../theme/typography";

export default function SearchScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { places, marketFilter, setMarketFilter, likedPlaces, categories } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [showFavOnly, setShowFavOnly] = useState(false);

  const cats = useMemo(
    () => [
      { key: "all", labelKey: "catAll", icon: null },
      ...categories.map((c) => ({
        key: c.key,
        labelKey: categoryLabelKey(c.key),
        fallback: c.key,
        icon: CAT_ICONS[c.key] || "business",
      })),
    ],
    [categories],
  );

  const filtered = useMemo(() => {
    let list = showFavOnly ? likedPlaces : places;
    if (marketFilter !== "all") list = list.filter((p) => p.cat === marketFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.location?.city || "").toLowerCase().includes(q) ||
          (p.location?.district || "").toLowerCase().includes(q) ||
          (p.location?.address || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [places, likedPlaces, showFavOnly, marketFilter, query]);

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.fill}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("services")}</Text>
          <TouchableOpacity
            onPress={() => setShowFavOnly((v) => !v)}
            style={[
              styles.favToggle,
              {
                backgroundColor: showFavOnly ? colors.danger : colors.inputBg,
                borderColor: showFavOnly ? colors.danger : colors.inputBorder,
              },
            ]}
          >
            <Ionicons name={showFavOnly ? "heart" : "heart-outline"} size={16} color={showFavOnly ? "#fff" : colors.danger} />
            <Text
              style={[
                styles.favToggleText,
                { color: showFavOnly ? "#fff" : colors.text2, fontFamily: fonts.bold },
              ]}
            >
              {t("myFavorites")}
            </Text>
          </TouchableOpacity>
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
          {cats.map((c) => (
            <CategoryChip
              key={c.key}
              label={t(c.labelKey, c.fallback)}
              icon={c.icon}
              active={marketFilter === c.key}
              onPress={() => setMarketFilter(c.key)}
            />
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name={showFavOnly ? "heart-outline" : "search"} size={28} color={colors.text3} />
              <Text style={[styles.emptyTitle, { color: colors.text2, fontFamily: fonts.bold }]}>
                {showFavOnly ? t("noFavorites") : t("emptyNoResults")}
              </Text>
              <Text style={[styles.emptySub, { color: colors.text3 }]}>
                {showFavOnly ? t("noFavoritesSub") : t("emptySearchOther")}
              </Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: { fontSize: 21 },
  favToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  favToggleText: { fontSize: 12.5 },
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
