import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Sortable, { useItemContext } from "react-native-sortables";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { BottomSheetScrollContext } from "./BottomSheetModal";
import { CAT_ICONS, categoryLabelKey } from "../data/categoryIcons";
import { createCategory, deleteCategory, reorderCategories } from "../api/categories";
import { isLatinName } from "../utils/validation";
import { fonts, radius } from "../theme/typography";

/* Super admin kategoriya boshqargichi — flex-wrap chip grid (iOS uslubi):
   - qisqa bosish       -> tanlash (filial kategoriyasi)
   - uzoq bosish        -> tahrirlash rejimi: aktiv chip kattalashadi va
                           BIR MARTA qisqa tebranadi (drag rejimi signali),
                           barcha chiplarda X paydo bo'ladi
   - uzoq bosib SURISH  -> chip barmoqqa ergashadi (istalgan yo'nalish,
                           qatorlararo ham), boshqalari silliq joy beradi;
                           qo'yilganда yangi tartib saqlanadi
   - X                  -> o'chirish (tasdiq bilan)
   - "Tayyor"           -> tahrirlash rejimidan chiqish */
export default function ManageableCategoryPicker({ categories, value, onSelect, onChanged }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const sheetScroll = useContext(BottomSheetScrollContext);

  const [order, setOrder] = useState(categories.map((c) => ({ id: c.id, key: c.key })));
  const [editMode, setEditMode] = useState(false);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  // Eng so'nggi tartibdagi id'lar (drag yoki drop natijasida yangilanadi).
  // "Tayyor" bosilганда aynan shu tartib mustaqil saqlanadi.
  const latestOrderIdsRef = useRef(order.map((c) => c.id));

  // Tartib saqlanayotganda tashqi (realtime) yangilanish ustiga yozmasin —
  // aks holda yozuv tugamasdan eski tartibga "qaytib" ketishi mumkin edi.
  const pendingReorderRef = useRef(false);

  useEffect(() => {
    if (pendingReorderRef.current) return;
    const next = categories.map((c) => ({ id: c.id, key: c.key }));
    setOrder(next);
    latestOrderIdsRef.current = next.map((c) => c.id);
  }, [categories]);

  const persistOrder = async (orderedIds) => {
    if (!orderedIds || orderedIds.length === 0) return;
    pendingReorderRef.current = true;
    try {
      console.log("[CAT REORDER] yozilyapti, id tartibi:", orderedIds);
      const res = await reorderCategories(orderedIds);
      console.log("[CAT REORDER] saqlandi. yangilangan qatorlar:", res?.affected, "/", res?.total);
      if (res && res.affected < res.total) {
        // xatosiz, lekin qatorlar yangilanmadi → deyarli aniq RLS (UPDATE ruxsati yo'q)
        console.warn(
          "[CAT REORDER] DIQQAT: xato yo'q, lekin faqat",
          res.affected, "/", res.total,
          "qator yangilandi — categories UPDATE uchun RLS ruxsat bermayapti (is_super_admin).",
        );
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        onChanged?.();
      }
    } catch (e) {
      console.error("[CAT REORDER] Supabase xatosi:", e?.message, JSON.stringify(e));
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
      onChanged?.(); // xatoда serverdagi haqiqiy tartibga qaytaramiz
    } finally {
      pendingReorderRef.current = false;
    }
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
    <GestureHandlerRootView>
      <Sortable.Flex
        flexWrap="wrap"
        gap={8}
        activeItemScale={1.14}
        activeItemShadowOpacity={0.25}
        inactiveItemOpacity={1}
        dragActivationDelay={200}
        hapticsEnabled={false}
        overDrag="both"
        onDragStart={() => {
          setEditMode(true);
          // drag paytida parent ScrollView'ni bloklaymiz — aks holda
          // vertikal (qatorlararo) harakat scroll bilan to'qnashadi
          sheetScroll?.setScrollLocked?.(true);
        }}
        onDragEnd={(params) => {
          sheetScroll?.setScrollLocked?.(false);
          // params.indexToKey — yangi tartibdagi kalitlar (bizda kategoriya id'lari).
          // Bu kutubxonaning eng ishonchli manbasi (params.order'ga tayanmaymiz).
          const orderedIds = params?.indexToKey || orderRef.current.map((c) => c.id);
          const newData = orderedIds
            .map((id) => orderRef.current.find((c) => c.id === id))
            .filter(Boolean);
          console.log(
            "[CAT REORDER] onDragEnd. eski:", orderRef.current.map((c) => c.key).join(","),
            "yangi:", newData.map((c) => c.key).join(","),
          );
          setOrder(newData);
          orderRef.current = newData;
          latestOrderIdsRef.current = orderedIds;
          persistOrder(orderedIds);
        }}
        onOrderChange={(params) => {
          // drag davomida tartib o'zgargan sari eng so'nggi holatni saqlaymiz —
          // "Tayyor" bosilganda aynan shu tartib yoziladi
          if (params?.indexToKey) latestOrderIdsRef.current = params.indexToKey;
        }}
      >
        {order.map((item) => (
          <CategoryChip
            key={item.id}
            item={item}
            selected={item.key === value}
            editMode={editMode}
            colors={colors}
            t={t}
            onPress={() => {
              if (!editMode) onSelect(item.key);
            }}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </Sortable.Flex>

      {editMode ? (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          onPress={() => {
            setEditMode(false);
            // Mustaqil, aniq saqlash — foydalanuvchi "Tayyor" bosганда tartib
            // categories jadvaliga yoziladi (filialdan butunlay mustaqil).
            console.log("[CAT REORDER] Tayyor bosildi, saqlanadi:", latestOrderIdsRef.current);
            persistOrder(latestOrderIdsRef.current);
          }}
        >
          <Ionicons name="checkmark" size={16} color={colors.accent} />
          <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12.5, marginLeft: 5 }}>
            {t("btnDone")}
          </Text>
        </TouchableOpacity>
      ) : addingOpen ? (
        <Animated.View style={[styles.addRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder={t("catAddPlaceholder")}
            placeholderTextColor={colors.placeholder}
            style={[styles.addInput, { color: colors.text, fontFamily: fonts.medium }]}
            autoFocus
            onFocus={() => sheetScroll?.scrollToEnd?.()}
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
        </Animated.View>
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

      <Text style={[styles.hint, { color: colors.text3 }]}>{t("catManageHint")}</Text>
    </GestureHandlerRootView>
  );
}

/* Bitta kategoriya chipi.
   Wiggle FAQAT shu chip aktiv (tortilayotgan) bo'lganda BIR MARTA qisqa
   o'ynaydi — useItemContext().isActive orqali aniqlanadi. Boshqa chiplar
   umuman tebranmaydi (ular faqat Sortable'ning silliq reflow'i bilan
   joylashadi). */
function CategoryChip({ item, selected, editMode, colors, t, onPress, onDelete }) {
  const { isActive } = useItemContext();
  const rotate = useSharedValue(0);

  useAnimatedReaction(
    () => isActive.value,
    (active, prev) => {
      if (active && !prev) {
        // faollashganda: ~1.2s qisqa tebranish, so'ng tinch (0) holatga
        rotate.value = withSequence(
          withTiming(-2, { duration: 70 }),
          withTiming(2, { duration: 110 }),
          withTiming(-2, { duration: 110 }),
          withTiming(2, { duration: 110 }),
          withTiming(-1.4, { duration: 110 }),
          withTiming(1.4, { duration: 110 }),
          withTiming(0, { duration: 90 }),
        );
      } else if (!active && prev) {
        rotate.value = withTiming(0, { duration: 80 });
      }
    },
  );

  const wiggleStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));

  return (
    <Animated.View style={wiggleStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.accentSoft : colors.inputBg,
            borderColor: selected ? colors.accentBorder : colors.inputBorder,
          },
        ]}
      >
        <Ionicons
          name={CAT_ICONS[item.key] || "business"}
          size={13}
          color={selected ? colors.accent : colors.text2}
          style={styles.chipIcon}
        />
        <Text style={{ color: selected ? colors.accent : colors.text2, fontFamily: fonts.bold, fontSize: 12 }}>
          {t(categoryLabelKey(item.key), item.key)}
        </Text>
      </TouchableOpacity>

      {editMode ? (
        <TouchableOpacity
          style={[styles.deleteBadge, { backgroundColor: colors.danger, borderColor: colors.modalSheetBg }]}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={11} color="#fff" />
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipIcon: { marginRight: 5 },
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
