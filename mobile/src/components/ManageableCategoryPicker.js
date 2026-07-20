import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import CategoryManagerModal from "../modals/CategoryManagerModal";
import { CAT_ICONS, categoryLabelKey } from "../data/categoryIcons";
import { fonts, radius } from "../theme/typography";

/* Filial qo'shish formasidagi kategoriya TANLAGICHI (faqat tanlash):
   - chipni bosish -> tanlash
   - "Boshqarish" -> to'liq ekranli CategoryManagerModal (qo'shish/o'chirish/
     nomini tahrirlash/tartiblash) ochiladi.
   Ko'rsatiladigan matn: label (mavjud bo'lsa), aks holda eski tarjima. */
export default function ManageableCategoryPicker({ categories, value, onSelect, onChanged }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const [managerOpen, setManagerOpen] = useState(false);

  const displayLabel = (c) => c.label || t(categoryLabelKey(c.key), c.key);

  return (
    <View>
      <View style={styles.catRow}>
        {categories.map((item) => {
          const active = item.key === value;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onSelect(item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.accentSoft : colors.inputBg,
                  borderColor: active ? colors.accentBorder : colors.inputBorder,
                },
              ]}
            >
              <Ionicons
                name={CAT_ICONS[item.key] || "business"}
                size={13}
                color={active ? colors.accent : colors.text2}
                style={styles.chipIcon}
              />
              <Text style={{ color: active ? colors.accent : colors.text2, fontFamily: fonts.bold, fontSize: 12 }}>
                {displayLabel(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.manageBtn, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
        onPress={() => setManagerOpen(true)}
      >
        <Ionicons name="options-outline" size={16} color={colors.accent} />
        <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12.5, marginLeft: 6 }}>
          {t("catManagerTitle")}
        </Text>
      </TouchableOpacity>

      <CategoryManagerModal
        visible={managerOpen}
        categories={categories}
        onClose={() => setManagerOpen(false)}
        onChanged={onChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipIcon: { marginRight: 5 },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
