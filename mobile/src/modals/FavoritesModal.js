import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { fonts, radius } from "../theme/typography";

export default function FavoritesModal({ visible, onClose, onSelectPlace }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { likedPlaces } = useApp();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.modalOverlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.modalSheetBg }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.inputBorder }]} />

          <View style={styles.header}>
            <Ionicons name="heart" size={22} color="#ef4444" />
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extrabold }]}>
              {t("myFavorites")}
            </Text>
          </View>

          {likedPlaces.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={52} color={colors.text3} />
              <Text style={[styles.emptyTitle, { color: colors.text2, fontFamily: fonts.bold }]}>
                {t("noFavorites")}
              </Text>
              <Text style={[styles.emptySub, { color: colors.text3 }]}>{t("noFavoritesSub")}</Text>
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {likedPlaces.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.placeRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                  onPress={() => {
                    onSelectPlace(p.id);
                    onClose();
                  }}
                >
                  <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name="business" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={[styles.placeName, { color: colors.text, fontFamily: fonts.bold }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={[styles.placeCity, { color: colors.text3 }]}>{p.location.city}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: p.isOpen ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: p.isOpen ? colors.success : "#ef4444", fontFamily: fonts.bold },
                      ]}
                    >
                      {p.isOpen ? t("statusOpen") : t("statusClosed")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
          >
            <Text style={[styles.closeBtnText, { color: colors.text2, fontFamily: fonts.bold }]}>
              {t("btnCancel")}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: "80%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  title: { fontSize: 18 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 15, marginTop: 4 },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  list: { marginBottom: 12 },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 14.5 },
  placeCity: { fontSize: 12, marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { fontSize: 11 },
  closeBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  closeBtnText: { fontSize: 14 },
});
