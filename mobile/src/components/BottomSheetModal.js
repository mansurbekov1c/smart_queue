import React, { createContext, useCallback, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { radius } from "../theme/typography";

/* scrollable=true bo'lganda ichki ScrollView bilan ishlash uchun kontekst:
   - setScrollLocked: drag paytida scroll'ni vaqtincha o'chirish (kategoriya
     qatorlararo drag uchun)
   - scrollToEnd: input fokuslanganда klaviatura ostida qolmasligi uchun
     formani pastga scroll qilish */
export const BottomSheetScrollContext = createContext(null);

/* scrollable=true bo'lsa — uzun formalar (masalan filial/admin qo'shish)
   uchun tarkib ScrollView + KeyboardAvoidingView ichida bo'ladi:
   pastdagi maydonlarga yetish mumkin, klaviatura ochilganда faol input
   ko'rinadigan joyga scroll bo'ladi. */
export default function BottomSheetModal({ visible, onClose, children, scrollable = false }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [scrollLocked, setScrollLocked] = useState(false);

  const scrollToEnd = useCallback(() => {
    // klaviatura ochilishini kutib, formani oxiriga suramiz
    setTimeout(() => {
      try {
        scrollRef.current?.scrollToEnd?.({ animated: true });
      } catch (_) {
        // e'tiborsiz
      }
    }, 250);
  }, []);

  const ctxValue = useMemo(() => ({ setScrollLocked, scrollToEnd }), [scrollToEnd]);

  if (scrollable) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={onClose} />
        <KeyboardAvoidingView
          style={styles.kav}
          pointerEvents="box-none"
          behavior="padding"
        >
          <View style={[styles.sheet, styles.sheetScrollable, { backgroundColor: colors.modalSheetBg }]}>
            <View style={[styles.handle, { backgroundColor: colors.inputBorder }]} />
            <BottomSheetScrollContext.Provider value={ctxValue}>
              <ScrollView
                ref={scrollRef}
                scrollEnabled={!scrollLocked}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                automaticallyAdjustKeyboardInsets
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 18) + 140 }}
              >
                {children}
              </ScrollView>
            </BottomSheetScrollContext.Provider>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.modalSheetBg, paddingBottom: Math.max(insets.bottom, 18) },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.inputBorder }]} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  kav: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xxl + 6,
    borderTopRightRadius: radius.xxl + 6,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetScrollable: {
    position: "relative",
    maxHeight: "88%",
    paddingBottom: 6,
  },
  handle: { width: 42, height: 5, borderRadius: 999, alignSelf: "center", marginBottom: 16 },
});
