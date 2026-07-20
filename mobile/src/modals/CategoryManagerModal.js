import React, { useEffect, useRef, useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Sortable from "react-native-sortables";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { CAT_ICONS } from "../data/categoryIcons";
import { createCategory, deleteCategory, reorderCategories, updateCategoryLabel } from "../api/categories";
import { isLatinName } from "../utils/validation";
import { fonts, radius } from "../theme/typography";

/* To'liq ekranli kategoriya boshqaruvi. Bu yerda ScrollView bilan gesture
   konflikti yo'q, shuning uchun react-native-sortables (Sortable.Flex)
   qatorlararo erkin drag'i to'g'ri ishlaydi:
   - uzoq bosib surish -> istalgan o'ringa ko'chirish (faqat aktiv karta
     kattalashadi; boshqalari silliq joy beradi)
   - X -> o'chirish
   - qalam -> label (ko'rinadigan matn) ni tahrirlash (name/key tegilmaydi)
   - "Tayyor" -> yangi tartib categories.sort_order'ga saqlanadi */
export default function CategoryManagerModal({ visible, categories, onClose, onChanged }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [order, setOrder] = useState([]);
  const [orderDirty, setOrderDirty] = useState(false);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(false);

  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  // Faqat modal ochilganда mahalliy tartibni tashqi ma'lumotdan olamiz
  useEffect(() => {
    if (visible) {
      setOrder(categories.map((c) => ({ id: c.id, key: c.key, label: c.label })));
      setOrderDirty(false);
      setAddingOpen(false);
      setNewName("");
      setEditingId(null);
      setEditText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onDragEnd = (params) => {
    const ids = params?.indexToKey || orderRef.current.map((c) => c.id);
    const newOrder = ids.map((id) => orderRef.current.find((c) => c.id === id)).filter(Boolean);
    setOrder(newOrder);
    setOrderDirty(true);
  };

  const saveAndClose = async () => {
    if (busy) return;
    if (orderDirty) {
      setBusy(true);
      try {
        const res = await reorderCategories(order.map((c) => c.id));
        if (res && res.affected < res.total) {
          showToast(t("toastActionFailed", "Amal bajarilmadi"));
        } else {
          onChanged?.();
        }
      } catch (e) {
        console.error("[CAT REORDER] saqlash xatosi:", e?.message, e);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
      } finally {
        setBusy(false);
      }
    }
    onClose();
  };

  const doDelete = (id) => {
    Alert.alert(t("confirmDeleteCategoryTitle"), t("confirmDeleteCategoryMsg"), [
      { text: t("btnCancel"), style: "cancel" },
      {
        text: t("delete", "O'chirish"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(id);
            setOrder((prev) => prev.filter((c) => c.id !== id));
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

  const doAdd = async () => {
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
    setBusy(true);
    try {
      const row = await createCategory(name);
      setOrder((prev) => [...prev, { id: row.id, key: row.key, label: row.label }]);
      setNewName("");
      setAddingOpen(false);
      showToast(t("toastCategoryAdded"));
      onChanged?.();
    } catch (e) {
      console.error("Kategoriya qo'shish xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item) => {
    setAddingOpen(false);
    setEditingId(item.id);
    setEditText(item.label);
  };

  const doSaveLabel = async () => {
    const label = editText.trim();
    if (!label || !editingId) {
      setEditingId(null);
      return;
    }
    setBusy(true);
    try {
      await updateCategoryLabel(editingId, label);
      setOrder((prev) => prev.map((c) => (c.id === editingId ? { ...c, label } : c)));
      showToast(t("toastCredSaved"));
      setEditingId(null);
      setEditText("");
      onChanged?.();
    } catch (e) {
      console.error("Label yangilash xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    } finally {
      setBusy(false);
    }
  };

  const renderChip = (item) => (
    <View
      key={item.id}
      style={[styles.chip, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
    >
      <Ionicons name={CAT_ICONS[item.key] || "business"} size={15} color={colors.accent} style={styles.chipIcon} />
      <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 13 }} numberOfLines={1}>
        {item.label}
      </Text>
      <TouchableOpacity
        onPress={() => startEdit(item)}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        style={styles.chipBtn}
      >
        <Ionicons name="pencil" size={14} color={colors.text2} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => doDelete(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        style={styles.chipBtn}
      >
        <Ionicons name="close-circle" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={saveAndClose}>
      <GestureHandlerRootView style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={saveAndClose} style={styles.headerBtn} disabled={busy}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t("catManagerTitle")}
          </Text>
          <TouchableOpacity onPress={saveAndClose} style={styles.doneBtn} disabled={busy}>
            <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 14 }}>{t("btnDone")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.hint, { color: colors.text3 }]}>{t("catDragHint")}</Text>

        <View style={styles.listWrap}>
          <Sortable.Flex
            flexWrap="wrap"
            gap={10}
            activeItemScale={1.12}
            activeItemShadowOpacity={0.2}
            inactiveItemOpacity={1}
            dragActivationDelay={200}
            hapticsEnabled={false}
            overDrag="both"
            onDragEnd={onDragEnd}
          >
            {order.map((item) => renderChip(item))}
          </Sortable.Flex>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14), borderTopColor: colors.border }]}>
          {editingId ? (
            <View style={[styles.editRow, { backgroundColor: colors.inputBg, borderColor: colors.accentBorder }]}>
              <TextInput
                value={editText}
                onChangeText={setEditText}
                placeholder={t("catEditPlaceholder")}
                placeholderTextColor={colors.placeholder}
                style={[styles.editInput, { color: colors.text, fontFamily: fonts.medium }]}
                autoFocus
                onSubmitEditing={doSaveLabel}
              />
              <TouchableOpacity onPress={doSaveLabel} disabled={busy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="checkmark-circle" size={26} color={colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditingId(null);
                  setEditText("");
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={26} color={colors.text3} />
              </TouchableOpacity>
            </View>
          ) : addingOpen ? (
            <View style={[styles.editRow, { backgroundColor: colors.inputBg, borderColor: colors.accentBorder }]}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder={t("catAddPlaceholder")}
                placeholderTextColor={colors.placeholder}
                style={[styles.editInput, { color: colors.text, fontFamily: fonts.medium }]}
                autoFocus
                onSubmitEditing={doAdd}
              />
              <TouchableOpacity onPress={doAdd} disabled={busy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="checkmark-circle" size={26} color={colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setAddingOpen(false);
                  setNewName("");
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={26} color={colors.text3} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addBtn, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
              onPress={() => setAddingOpen(true)}
            >
              <Ionicons name="add" size={18} color={colors.accent} />
              <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 13.5, marginLeft: 6 }}>
                {t("catAddNew")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 60, paddingVertical: 4 },
  headerTitle: { fontSize: 16, flex: 1, textAlign: "center" },
  doneBtn: { width: 60, alignItems: "flex-end", paddingVertical: 4 },
  hint: { fontSize: 11.5, textAlign: "center", marginTop: 12, marginHorizontal: 20 },
  listWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  chipIcon: { marginRight: 2 },
  chipBtn: { paddingHorizontal: 1 },
  bottomBar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  editInput: { flex: 1, fontSize: 14, padding: 0 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
