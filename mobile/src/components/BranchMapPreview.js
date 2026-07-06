import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { staticMapUrl, openInDeviceMaps } from "../utils/maps";
import { radius } from "../theme/typography";

/* Filial manzili uchun oddiy/vaqtinchalik xarita ko'rinishi: statik OSM
   rasmi, bosilganda qurilmaning standart xaritalar ilovasi ochiladi.
   Kelajakda joy tanlash imkoniyati bo'lgan interaktiv xaritaga almashtiriladi. */
export default function BranchMapPreview({ lat, lng, style }) {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => openInDeviceMaps(lat, lng)} style={[styles.wrap, style]}>
      <Image source={{ uri: staticMapUrl(lat, lng) }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: "hidden" },
  image: { width: "100%", height: 160 },
});
