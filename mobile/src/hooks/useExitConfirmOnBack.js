import { useCallback } from "react";
import { Alert, BackHandler } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useI18n } from "../context/I18nContext";

/* Android "orqaga qaytish" tugmasi uchun izchil xatti-harakat — barcha tab
   ekranlarida (mijoz / admin / super admin) bir xil:
   - Tab tarixida ortga qaytish mumkin bo'lsa (Tab.Navigator backBehavior="history")
     — React Navigation o'zi oldingi tabga qaytaradi (masalan Profil → Statistika
     → Bosh sahifa), bu yerda aralashmaymiz.
   - Bosh tabda va tab-tarix tugaganda — "Ilovadan chiqasizmi?" so'raladi;
     tasdiqlansa ilova TO'LIQ yopiladi (BackHandler.exitApp). Login/Splash'ga
     navigatsiya QILINMAYDI (aks holda "hisobdan chiqib ketdim" degan noto'g'ri
     taassurot bo'lardi).
   Muhim: hisobdan chiqish (logout) FAQAT Profil ekranidagi "Chiqish" tugmasi
   orqali — hech qachon orqaga tugmasi orqali emas. */
export default function useExitConfirmOnBack() {
  const navigation = useNavigation();
  const { t } = useI18n();

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        const state = navigation.getState();
        // Tab navigatorda ortga qaytadigan tarix bormi?
        const canGoBackInTabs = state?.history
          ? state.history.length > 1
          : (state?.index ?? 0) > 0;

        if (canGoBackInTabs) {
          return false; // React Navigation tab tarixi bo'yicha o'zi qaytaradi
        }

        // Bosh tab, tarix tugagan — ilovadan chiqishni so'raymiz
        Alert.alert(t("confirmExitTitle"), t("confirmExitMsg"), [
          { text: t("btnCancel"), style: "cancel" },
          { text: t("btnExit"), style: "destructive", onPress: () => BackHandler.exitApp() },
        ]);
        return true; // biz hal qildik — root Stack'ga (Login'ga) o'tmaydi
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
      return () => sub.remove();
    }, [navigation, t]),
  );
}
