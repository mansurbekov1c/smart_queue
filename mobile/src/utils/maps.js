import { Linking, Platform } from "react-native";

/* VAQTINCHALIK YECHIM: API kalitsiz, bepul OpenStreetMap static rasm xizmati.
   Kelajakda joy tanlash imkoniyati bo'lgan to'liq interaktiv xaritaga
   almashtiriladi. */
export function staticMapUrl(lat, lng) {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=400x200&markers=${lat},${lng},red`;
}

export function openInDeviceMaps(lat, lng) {
  const url = Platform.OS === "ios" ? `maps://?q=${lat},${lng}` : `geo:${lat},${lng}?q=${lat},${lng}`;
  Linking.openURL(url).catch(() => {});
}
