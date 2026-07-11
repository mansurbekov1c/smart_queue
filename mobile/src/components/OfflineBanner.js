import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../context/I18nContext";
import { fonts } from "../theme/typography";

/* Butun ilova darajasidagi internet holati banneri. Aloqa yo'qolganда
   ekran tepasida doimiy (yopib bo'lmaydigan) banner chiqadi, aloqa
   qaytganда avtomatik yo'qoladi. Barcha rollar (mijoz/admin/super admin)
   uchun ishlaydi — App darajasida joylashtirilgan. */
export default function OfflineBanner() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable boshida null bo'lishi mumkin — faqat aniq uzilishni
      // offline deb hisoblaymiz (noto'g'ri banner chiqmasligi uchun)
      const disconnected = state.isConnected === false || state.isInternetReachable === false;
      setOffline(disconnected);
    });
    return unsubscribe;
  }, []);

  if (!offline) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 8 }]} pointerEvents="none">
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" style={styles.icon} />
      <Text style={styles.text} numberOfLines={2}>
        {t("offlineBanner")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "#d92d20",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  icon: { marginRight: 8 },
  text: { color: "#fff", fontSize: 13, fontFamily: fonts.bold, flexShrink: 1, textAlign: "center" },
});
