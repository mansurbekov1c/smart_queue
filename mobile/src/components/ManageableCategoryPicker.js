import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { CAT_ICONS, categoryLabelKey } from "../data/categoryIcons";
import { createCategory, deleteCategory, reorderCategories } from "../api/categories";
import { isLatinName } from "../utils/validation";
import { fonts, radius } from "../theme/typography";

/* Super admin kategoriya boshqargichi — flex-wrap chip grid.
   - qisqa bosish        -> tanlash (filial kategoriyasi)
   - uzoq bosish         -> tahrirlash rejimi (chiplarda ‹ › o'qlar va X chiqadi)
   - ‹ / ›               -> kategoriyani chapga/o'ngga ko'chirish (tartib)
   - X                   -> o'chirish (tasdiq bilan)
   - "Tayyor"            -> tartibni categories jadvaliga MUSTAQIL saqlaydi
                            (filial saqlanishidan butunlay mustaqil)
   Drag/gesture kutubxonalariga bog'liq emas — 100% ishonchli. */
export default function ManageableCategoryPicker({ categories, value, onSelect, onChanged }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [order, setOrder] = useState(categories.map((c) => ({ id: c.id, key: c.key })));
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Tashqi (realtime) yangilanish — lekin tahrirlash/saqlanmagan o'zgarish
  // bo'lsa ustiga yozmaymiz
  useEffect(() => {
    if (editMode || dirty) return;
    setOrder(categories.map((c) => ({ id: c.id, key: c.key })));
  }, [categories, editMode, dirty]);

  const move = (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    setOrder(next);
    setDirty(true);
  };

  const saveOrder = async (finalOrder) => {
    setSavingOrder(true);
    try {
      const ids = finalOrder.map((c) => c.id);
      console.log("[CAT REORDER] saqlanmoqda:", ids);
      const res = await reorderCategories(ids);
      console.log("[CAT REORDER] natija:", res?.affected, "/", res?.total);
      if (res && res.affected < res.total) {
        console.warn("[CAT REORDER] DIQQAT: RLS ruxsat bermayapti (affected < total)");
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        onChanged?.();
      } else {
        setDirty(false);
        onChanged?.(); // mijoz Bosh sahifasi ham yangilansin
      }
    } catch (e) {
      console.error("[CAT REORDER] Supabase xatosi:", e?.message, JSON.stringify(e));
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
      onChanged?.();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDone = () => {
    setEditMode(false);
    if (dirty) saveOrder(order);
  };

  const onDelete = (id) => {
    Alert.alert(t("confirmDeleteCategoryTitle"), t("confirmDeleteCategoryMsg"), [
      { text: t("btnCancel"), style: "cancel" },
      {
        text: t("delete", "O'chirish"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(id);
            showToast(t("toastCategoryDeleted"));
            onChanged?.();
          } catch (e) {
            console.error("Kategoriya o'chirish xatosi:", e);
            showToast(t("toastActionFailed", "Amal bajarilmadi"));
          }
        },
      },
    ]);
  };

  const onSubmitNew = async () => {
    const name = newName.trim();
    if (!name) return;
    if (!isLatinName(name)) {
      showToast(t("toastLatinOnly"));
      return;
    }
    if (order.some((c) => c.key.toLowerCase() === name.toLowerCase())) {
      showToast(t("toastCategoryExists"));
      return;
    }
    setSavingNew(true);
    try {
      await createCategory(name);
      showToast(t("toastCategoryAdded"));
      setNewName("");
      setAddingOpen(false);
      onChanged?.();
    } catch (e) {
      console.error("Kategoriya qo'shish xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <View>
      <View style={styles.catRow}>
        {order.map((item, index) => {
          const active = item.key === value;
          return (
            <View key={item.id} style={styles.chipWrap}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (!editMode) onSelect(item.key);
                }}
                onLongPress={() => setEditMode(true)}
                delayLongPress={300}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.accentSoft : colors.inputBg,
                    borderColor: active ? colors.accentBorder : colors.inputBorder,
                  },
                ]}
              >
                {editMode ? (
                  <TouchableOpacity
                    onPress={() => move(index, -1)}
                    disabled={index === 0}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    style={styles.arrow}
                  >
                    <Ionicons name="chevron-back" size={15} color={index === 0 ? colors.text3 : colors.accent} />
                  </TouchableOpacity>
                ) : (
                  <Ionicons
                    name={CAT_ICONS[item.key] || "business"}
                    size={13}
                    color={active ? colors.accent : colors.text2}
                    style={styles.chipIcon}
                  />
                )}
                <Text style={{ color: active ? colors.accent : colors.text2, fontFamily: fonts.bold, fontSize: 12 }}>
                  {t(categoryLabelKey(item.key), item.key)}
                </Text>
                {editMode ? (
                  <TouchableOpacity
                    onPress={() => move(index, 1)}
                    disabled={index === order.length - 1}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    style={styles.arrow}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color={index === order.length - 1 ? colors.text3 : colors.accent}
                    />
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>

              {editMode ? (
                <TouchableOpacity
                  style={[styles.deleteBadge, { backgroundColor: colors.danger, borderColor: colors.modalSheetBg }]}
                  onPress={() => onDelete(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={11} color="#fff" />
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </View>

      {editMode ? (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}
          onPress={handleDone}
          disabled={savingOrder}
        >
          <Ionicons name="checkmark" size={16} color={colors.accent} />
          <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12.5, marginLeft: 5 }}>
            {t("btnDone")}
          </Text>
        </TouchableOpacity>
      ) : addingOpen ? (
        <View style={[styles.addRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder={t("catAddPlaceholder")}
            placeholderTextColor={colors.placeholder}
            style={[styles.addInput, { color: colors.text, fontFamily: fonts.medium }]}
            autoFocus
            onSubmitEditing={onSubmitNew}
          />
          <TouchableOpacity onPress={onSubmitNew} disabled={savingNew} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setAddingOpen(false);
              setNewName("");
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={24} color={colors.text3} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
          onPress={() => setAddingOpen(true)}
        >
          <Ionicons name="add" size={17} color={colors.accent} />
          <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12.5, marginLeft: 5 }}>
            {t("catAddNew")}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.hint, { color: colors.text3 }]}>
        {editMode ? t("catReorderHint") : t("catManageHint")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipWrap: { position: "relative" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipIcon: { marginRight: 5 },
  arrow: { paddingHorizontal: 3 },
  deleteBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
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
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  addInput: { flex: 1, fontSize: 13.5, padding: 0 },
  hint: { fontSize: 10.5, marginTop: 8 },
});
