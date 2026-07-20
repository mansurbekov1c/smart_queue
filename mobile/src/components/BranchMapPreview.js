import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { openInDeviceMaps } from "../utils/maps";
import { radius } from "../theme/typography";

/* Filial manzili uchun oddiy/vaqtinchalik xarita ko'rinishi.
   To'g'ridan-to'g'ri OpenStreetMap tile'laridan yig'iladi (kalitsiz, ishonchli;
   avvalgi staticmap.openstreetmap.de xizmati ishonchsiz edi). Marker markazda.
   Bosilganda qurilmaning standart xaritalar ilovasi ochiladi.
   Kelajakda joy tanlash imkoniyatli interaktiv xaritaga almashtiriladi. */
const TILE = 256;
const ZOOM = 15;
const HEIGHT = 170;

function project(lat, lng, z) {
  const n = Math.pow(2, z);
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

export default function BranchMapPreview({ lat, lng, style }) {
  const [width, setWidth] = useState(0);

  const valid = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  if (!valid) return null;

  const maxTile = Math.pow(2, ZOOM) - 1;
  const { x, y } = project(lat, lng, ZOOM);
  const centerPx = { x: x * TILE, y: y * TILE };
  const originX = centerPx.x - width / 2;
  const originY = centerPx.y - HEIGHT / 2;

  const tiles = [];
  if (width > 0) {
    const firstTx = Math.floor(originX / TILE);
    const lastTx = Math.floor((originX + width) / TILE);
    const firstTy = Math.floor(originY / TILE);
    const lastTy = Math.floor((originY + HEIGHT) / TILE);
    for (let tx = firstTx; tx <= lastTx; tx++) {
      for (let ty = firstTy; ty <= lastTy; ty++) {
        if (tx < 0 || ty < 0 || tx > maxTile || ty > maxTile) continue;
        tiles.push({
          tx,
          ty,
          left: tx * TILE - originX,
          top: ty * TILE - originY,
        });
      }
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openInDeviceMaps(lat, lng)}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.wrap, style]}
    >
      {tiles.map((tl) => (
        <Image
          key={`${tl.tx}-${tl.ty}`}
          source={{ uri: `https://tile.openstreetmap.org/${ZOOM}/${tl.tx}/${tl.ty}.png` }}
          style={{ position: "absolute", left: tl.left, top: tl.top, width: TILE, height: TILE }}
        />
      ))}
      {width > 0 ? (
        <View style={styles.pin} pointerEvents="none">
          <Ionicons name="location" size={34} color="#d92d20" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: HEIGHT,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#dfe6ee",
  },
  pin: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    // pin uchini markazga to'g'rilash uchun biroz yuqoriga
    paddingBottom: 34,
  },
});
