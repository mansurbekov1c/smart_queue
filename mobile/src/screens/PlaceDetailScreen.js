import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderBar from "../components/HeaderBar";
import GlassCard from "../components/GlassCard";
import QueueRow from "../components/QueueRow";
import StarRating from "../components/StarRating";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import LiveDot from "../components/LiveDot";
import JoinQueueModal from "../modals/JoinQueueModal";
import { useAppTheme } from "../context/ThemeContext";
import { useI18n } from "../context/I18nContext";
import { useApp } from "../context/AppContext";
import { CAT_ICONS } from "../data/categoryIcons";
import { fonts, radius } from "../theme/typography";

export default function PlaceDetailScreen({ route, navigation }) {
  const { placeId } = route.params;
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const { openPlace, currentPlace, myQueue, user, selectedRating, setRating, submitReview, canJoinQueue } = useApp();
  const insets = useSafeAreaInsets();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  useEffect(() => {
    openPlace(placeId);
    setShowReviewForm(false);
    setReviewText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  if (!currentPlace) return null;
  const place = currentPlace;

  const onSubmitReview = () => {
    if (submitReview(reviewText)) {
      setReviewText("");
      setShowReviewForm(false);
    }
  };

  const onPressJoin = () => {
    const res = canJoinQueue();
    if (!res.ok) {
      if (res.reason === "login") navigation.navigate("Login");
      return;
    }
    setJoinModalOpen(true);
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.bgGradient[0] }]}>
      <LinearGradient colors={colors.bgGradient} style={styles.fill}>
        <HeaderBar onBack={() => navigation.goBack()} showThemeToggle={false} right={<View style={{ width: 38 }} />} />

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}>
          <GlassCard padded={false} style={styles.card}>
            <LinearGradient colors={[colors.gradientMid, colors.gradientStart]} style={styles.banner}>
              <Ionicons name={CAT_ICONS[place.cat] || "business"} size={50} color="rgba(255,255,255,0.92)" />
              <View style={[styles.openBadge, { backgroundColor: place.isOpen ? colors.success : colors.danger }]}>
                <Text style={styles.openBadgeText}>{place.isOpen ? t("statusOpen") : t("statusClosed")}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={colors.amber} />
                <Text style={[styles.ratingText, { fontFamily: fonts.bold }]}> {place.rating}</Text>
              </View>
            </LinearGradient>
            <View style={styles.cardBody}>
              <Text style={[styles.placeName, { color: colors.text, fontFamily: fonts.extrabold }]}>{place.name}</Text>
              <Text style={[styles.placeCat, { color: colors.text3 }]}>{t("category" + place.cat.charAt(0).toUpperCase() + place.cat.slice(1))}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={13} color={colors.amber} />
                  <Text style={[styles.metaText, { color: colors.text2 }]}>
                    {" "}
                    {place.rating} <Text style={{ color: colors.text3 }}>({place.reviewCount})</Text>
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={13} color={colors.text2} />
                  <Text style={[styles.metaText, { color: colors.text2 }]}> {place.hours}</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={[styles.liveBox, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
            <View style={styles.liveHeadRow}>
              <LiveDot size={8} />
              <Text style={[styles.liveTitle, { color: colors.accent, fontFamily: fonts.bold }]}> {t("activeQueue")} {t("live")}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: colors.accent }]}>{t("queueLabel")}</Text>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: fonts.mono }]}>{place.queueCount}</Text>
              </View>
              <View style={[styles.statCol, styles.statColBorder, { borderColor: colors.accentBorder }]}>
                <Text style={[styles.statLabel, { color: colors.accent }]}>{t("waitLabel")}</Text>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: fonts.mono }]}>{place.waitMin}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: colors.accent }]}>{t("currentLabel")}</Text>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: fonts.mono }]}>#{place.currentNum}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.locRow, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
            <View style={[styles.locIcon, { backgroundColor: colors.iconChipBgStart }]}>
              <Ionicons name="location" size={19} color={colors.accent} />
            </View>
            <View style={styles.locInfo}>
              <Text style={[styles.locTitle, { color: colors.text, fontFamily: fonts.bold }]}>{place.location.district}</Text>
              <Text style={[styles.locSub, { color: colors.text3 }]}>{place.location.address}</Text>
            </View>
            <Text style={[styles.mapLink, { color: colors.accent, fontFamily: fonts.bold }]}>{t("viewMap")}</Text>
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("queueList")}</Text>
            <Text style={[styles.sectionCount, { color: colors.text3 }]}>
              {place.queue.length} {t("peopleWord")}
            </Text>
          </View>

          <GlassCard style={styles.queueCard}>
            {place.queue.length === 0 ? (
              <Text style={{ color: colors.text3, textAlign: "center", padding: 12 }}>{t("emptyQueue")}</Text>
            ) : (
              place.queue.slice(0, 8).map((q, i) => {
                const isMe = myQueue && myQueue.placeId === place.id && myQueue.num === q.num;
                return (
                  <QueueRow
                    key={q.num}
                    num={q.num}
                    name={isMe ? t("detailYou") : q.name}
                    current={q.current}
                    done={q.done}
                    mine={isMe}
                    type={q.type}
                    last={i === Math.min(place.queue.length, 8) - 1}
                  />
                );
              })
            )}
          </GlassCard>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.extrabold }]}>{t("reviews")}</Text>
          </View>

          <GlassCard>
            {place.reviews.length === 0 ? (
              <Text style={{ color: colors.text3, textAlign: "center", padding: 8 }}>{t("detailEmptyReviews")}</Text>
            ) : (
              place.reviews.map((r, i) => (
                <View key={i} style={[styles.reviewRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View style={styles.reviewHead}>
                    <View style={[styles.reviewAvatar, { backgroundColor: colors.accentSoft }]}>
                      <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12 }}>{r.name[0]}</Text>
                    </View>
                    <View>
                      <Text style={[styles.reviewName, { color: colors.text, fontFamily: fonts.bold }]}>{r.name}</Text>
                      <Text style={[styles.reviewMeta, { color: colors.text3 }]}>
                        {r.date} · {"★".repeat(r.rating)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.reviewText, { color: colors.text2 }]}>{r.text}</Text>
                </View>
              ))
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {!showReviewForm ? (
              <SecondaryButton label={t("btnWriteReview")} icon="create-outline" onPress={() => setShowReviewForm(true)} />
            ) : (
              <View>
                <Text style={[styles.leaveReviewLabel, { color: colors.text, fontFamily: fonts.bold }]}>{t("leaveReview")}</Text>
                <StarRating value={selectedRating} onChange={setRating} />
                <TextInput
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder={t("reviewPlaceholder")}
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.reviewInput,
                    { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontFamily: fonts.medium },
                  ]}
                />
                <View style={styles.reviewBtnRow}>
                  <SecondaryButton label={t("btnCancel")} onPress={() => setShowReviewForm(false)} style={styles.flex1} />
                  <PrimaryButton label={t("btnSubmitReview")} onPress={onSubmitReview} style={styles.flex1} />
                </View>
              </View>
            )}
          </GlassCard>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <PrimaryButton label={t("btnGetQueue")} onPress={onPressJoin} disabled={!place.isOpen} />
        </View>
      </LinearGradient>

      <JoinQueueModal visible={joinModalOpen} onClose={() => setJoinModalOpen(false)} navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  card: { marginBottom: 14, overflow: "hidden" },
  banner: { height: 110, alignItems: "center", justifyContent: "center" },
  openBadge: { position: "absolute", top: 12, right: 12, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999 },
  openBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  ratingBadge: {
    position: "absolute",
    bottom: -13,
    left: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  ratingText: { fontSize: 12, color: "#16243c" },
  cardBody: { padding: 16, paddingTop: 18 },
  placeName: { fontSize: 18 },
  placeCat: { fontSize: 12.5, marginTop: 2 },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 10 },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 13 },
  liveBox: { borderRadius: radius.lg, borderWidth: 1, padding: 15, marginBottom: 12 },
  liveHeadRow: { flexDirection: "row", alignItems: "center", marginBottom: 11, gap: 7 },
  liveTitle: { fontSize: 12.5 },
  statsRow: { flexDirection: "row" },
  statCol: { flex: 1, alignItems: "center" },
  statColBorder: { borderLeftWidth: 1, borderRightWidth: 1 },
  statLabel: { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.4 },
  statValue: { fontSize: 24, marginTop: 4 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: radius.lg, borderWidth: 1, marginBottom: 18 },
  locIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  locInfo: { flex: 1 },
  locTitle: { fontSize: 13.5 },
  locSub: { fontSize: 12, marginTop: 1 },
  mapLink: { fontSize: 12.5 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 14.5 },
  sectionCount: { fontSize: 12 },
  queueCard: { marginBottom: 18, paddingVertical: 4 },
  reviewRow: { paddingVertical: 12 },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  reviewName: { fontSize: 14 },
  reviewMeta: { fontSize: 11 },
  reviewText: { fontSize: 14, lineHeight: 19 },
  divider: { height: 1, marginVertical: 10 },
  leaveReviewLabel: { fontSize: 13.5, marginBottom: 10 },
  reviewInput: { borderWidth: 1, borderRadius: radius.md, padding: 12, minHeight: 80, marginTop: 12, marginBottom: 12, fontSize: 14, textAlignVertical: "top" },
  reviewBtnRow: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12 },
});
