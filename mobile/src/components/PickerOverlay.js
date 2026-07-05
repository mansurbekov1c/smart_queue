import React from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { fonts, radius } from "../theme/typography";

/* To'liq ekranli qidiruv + ro'yxat + tanlash overlay (filial <-> admin
   biriktirish uchun ishlatiladi, ikkalasida ham bir xil ko'rinish). */
export default function PickerOverlay({
  visible,
  title,
  items,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onClose,
}) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <LinearGradient colors={colors.bgGradient} style={[styles.fill, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.backBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      <View
        style={[
          styles.searchWrap,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <Ionicons name="search" size={16} color={colors.text3} />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder={t("genericSearchPlaceholder")}
          placeholderTextColor={colors.placeholder}
          style={[styles.searchInput, { color: colors.text, fontFamily: fonts.medium }]}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.text3 }]}>{t("emptySearchResults")}</Text>
        }
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelect(item)}
              style={[styles.row, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
            >
              <View style={[styles.iconChip, { backgroundColor: colors.iconChipBgStart }]}>
                <Ionicons name={item.icon || "ellipse"} size={17} color={colors.accent} />
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.name, { color: colors.text, fontFamily: fonts.bold }]} numberOfLines={1}>
                  {item.label}
                </Text>
                {item.sublabel ? (
                  <Text style={[styles.sub, { color: colors.text3, fontFamily: fonts.medium }]} numberOfLines={1}>
                    {item.sublabel}
                  </Text>
                ) : null}
              </View>
              {selected ? <Ionicons name="checkmark-circle" size={19} color={colors.accent} /> : null}
            </TouchableOpacity>
          );
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, zIndex: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 13.5, padding: 0 },
  list: { paddingHorizontal: 16, paddingTop: 9, paddingBottom: 24, gap: 9 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 11,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  iconChip: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  textWrap: { flex: 1, minWidth: 0 },
  name: { fontSize: 13 },
  sub: { fontSize: 11, marginTop: 2 },
  empty: { textAlign: "center", fontSize: 12.5, fontWeight: "600", paddingVertical: 20 },
});
