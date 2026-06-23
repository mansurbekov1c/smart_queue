import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { radius } from "../theme/typography";

export default function BottomSheetModal({ visible, onClose, children }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

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
  handle: { width: 42, height: 5, borderRadius: 999, alignSelf: "center", marginBottom: 16 },
});
