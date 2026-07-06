import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, PanResponder, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { CAT_ICONS, categoryLabelKey } from "../data/categoryIcons";
import { createCategory, deleteCategory, reorderCategories } from "../api/categories";
import { isLatinName } from "../utils/validation";
import { fonts, radius } from "../theme/typography";

const LONG_PRESS_MS = 380;
const MOVE_CANCEL_PX = 10;
const TAP_MAX_PX = 6;

/* Super admin filial qo'shish oynasidagi kategoriya tanlagichi:
   - bosish -> tanlash
   - ushlab turish -> tahrirlash rejimi (har bir chipda o'chirish belgisi chiqadi)
   - ushlab turib surish -> boshqa kategoriyalar bilan joy almashtirish (tartib)
   - "+" -> yangi kategoriya qo'shish */
export default function ManageableCategoryPicker({ categories, value, onSelect, onChanged }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [order, setOrder] = useState(categories.map((c) => ({ id: c.id, key: c.key })));
  const [editMode, setEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  const orderRef = useRef(order);
  const layouts = useRef({});
  const dragStartLayout = useRef(null);
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    if (draggingId) return;
    setOrder(categories.map((c) => ({ id: c.id, key: c.key })));
  }, [categories, draggingId]);

  const persistOrder = (finalOrder) => {
    reorderCategories(finalOrder.map((c) => c.id)).catch((e) => {
      console.error("Kategoriya tartibini saqlash xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    });
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

  const makeResponder = (item) => {
    const armedRef = { current: false };
    let timer = null;

    const startDrag = () => {
      const layout = layouts.current[item.id];
      if (!layout) return;
      dragStartLayout.current = layout;
      pan.setValue({ x: 0, y: 0 });
      setDraggingId(item.id);
    };

    const hitTest = (dx, dy) => {
      const startLayout = dragStartLayout.current;
      if (!startLayout) return;
      const cx = startLayout.x + startLayout.width / 2 + dx;
      const cy = startLayout.y + startLayout.height / 2 + dy;
      const current = orderRef.current;
      const fromIndex = current.findIndex((c) => c.id === item.id);
      for (let i = 0; i < current.length; i++) {
        if (current[i].id === item.id) continue;
        const l = layouts.current[current[i].id];
        if (!l) continue;
        if (cx >= l.x && cx <= l.x + l.width && cy >= l.y && cy <= l.y + l.height) {
          if (i !== fromIndex) {
            const next = [...current];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(i, 0, moved);
            orderRef.current = next;
            setOrder(next);
          }
          break;
        }
      }
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        armedRef.current = false;
        timer = setTimeout(() => {
          armedRef.current = true;
          setEditMode(true);
        }, LONG_PRESS_MS);
      },
      onPanResponderMove: (evt, g) => {
        if (armedRef.current) {
          if (draggingId !== item.id) startDrag();
          pan.setValue({ x: g.dx, y: g.dy });
          hitTest(g.dx, g.dy);
        } else if (Math.abs(g.dx) + Math.abs(g.dy) > MOVE_CANCEL_PX) {
          clearTimeout(timer);
        }
      },
      onPanResponderRelease: (evt, g) => {
        clearTimeout(timer);
        if (draggingId === item.id) {
          setDraggingId(null);
          pan.setValue({ x: 0, y: 0 });
          persistOrder(orderRef.current);
        } else if (!armedRef.current && Math.abs(g.dx) + Math.abs(g.dy) < TAP_MAX_PX) {
          onSelect(item.key);
        }
      },
      onPanResponderTerminate: () => {
        clearTimeout(timer);
        if (draggingId === item.id) {
          setDraggingId(null);
          pan.setValue({ x: 0, y: 0 });
        }
      },
    });
  };

  const renderChipContent = (item, active) => (
    <>
      <Ionicons name={CAT_ICONS[item.key] || "business"} size={13} color={active ? colors.accent : colors.text2} style={styles.chipIcon} />
      <Text style={{ color: active ? colors.accent : colors.text2, fontFamily: fonts.bold, fontSize: 12 }}>
        {t(categoryLabelKey(item.key), item.key)}
      </Text>
    </>
  );

  const draggingItem = draggingId ? order.find((c) => c.id === draggingId) : null;

  return (
    <View>
      <View style={styles.catRow}>
        {order.map((item) => {
          const active = item.key === value;
          const isDragging = draggingId === item.id;
          const responder = makeResponder(item);
          return (
            <View
              key={item.id}
              onLayout={(e) => {
                layouts.current[item.id] = e.nativeEvent.layout;
              }}
              style={[styles.chipWrap, isDragging && styles.chipWrapHidden]}
            >
              <View
                {...responder.panHandlers}
                style={[
                  styles.catChip,
                  { backgroundColor: active ? colors.accentSoft : colors.inputBg, borderColor: active ? colors.accentBorder : colors.inputBorder },
                ]}
              >
                {renderChipContent(item, active)}
              </View>
              {editMode && !isDragging ? (
                <TouchableOpacity
                  style={[styles.deleteBadge, { backgroundColor: colors.danger }]}
                  onPress={() => onDelete(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={11} color="#fff" />
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}

        {!editMode ? (
          addingOpen ? null : (
            <TouchableOpacity
              style={[styles.catChip, styles.addChip, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
              onPress={() => setAddingOpen(true)}
            >
              <Ionicons name="add" size={15} color={colors.accent} />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={[styles.catChip, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            onPress={() => setEditMode(false)}
          >
            <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12 }}>{t("btnDone")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {draggingItem ? (
        <Animated.View
          style={[
            styles.catChip,
            styles.draggingChip,
            {
              backgroundColor: draggingItem.key === value ? colors.accentSoft : colors.inputBg,
              borderColor: draggingItem.key === value ? colors.accentBorder : colors.inputBorder,
              left: dragStartLayout.current?.x || 0,
              top: dragStartLayout.current?.y || 0,
              transform: pan.getTranslateTransform(),
              pointerEvents: "none",
            },
          ]}
        >
          {renderChipContent(draggingItem, draggingItem.key === value)}
        </Animated.View>
      ) : null}

      {addingOpen ? (
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
            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setAddingOpen(false);
              setNewName("");
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={22} color={colors.text3} />
          </TouchableOpacity>
        </View>
      ) : null}

      {editMode ? <Text style={[styles.hint, { color: colors.text3 }]}>{t("catManageHint")}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, position: "relative" },
  chipWrap: { position: "relative" },
  chipWrapHidden: { opacity: 0 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  addChip: { paddingHorizontal: 10 },
  chipIcon: { marginRight: 5 },
  deleteBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  draggingChip: { position: "absolute", zIndex: 20, elevation: 8 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  addInput: { flex: 1, fontSize: 13, padding: 0 },
  hint: { fontSize: 10.5, marginTop: 8 },
});
