import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchBranches, subscribeBranchCalibration } from "../api/branches";
import { fetchCategories, subscribeCategories } from "../api/categories";
import { fetchProfile, fetchUserCoins, fetchUserServedCount } from "../api/profile";
import { fetchLikedBranchIds, addLike, removeLike } from "../api/likes";
import { fetchQueueStats, fetchHourlySeries, fetchWeeklySeries, fetchMonthlySeries, fetchYearlySeries } from "../api/stats";
import {
  fetchBranchQueue,
  subscribeBranchQueue,
  rpcJoinQueue,
  rpcAdvanceQueue,
  rpcRejectCurrent,
  rpcRejectTicket,
  rpcDelayTicket,
  rpcLeaveQueue,
  resetBranchQueue,
} from "../api/queue";
import { supabase } from "../lib/supabase";
import { useI18n } from "./I18nContext";
import { useToast } from "./ToastContext";

const AppCtx = createContext(null);

const EMPTY_META = { currentNum: 0, nextNum: 1, isOpen: true };
const EMPTY_STATS = {
  day: { served: 0, rejected: 0 },
  week: { served: 0, rejected: 0 },
  month: { served: 0, rejected: 0 },
  year: { served: 0, rejected: 0 },
};
const EMPTY_SERIES = {
  hourly: [0, 0, 0, 0, 0, 0, 0, 0],
  weekly: [0, 0, 0, 0, 0, 0, 0],
  monthly: [0, 0, 0, 0],
  yearly: new Array(12).fill(0),
};

export function AppProvider({ children }) {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [role, setRole] = useState("customer");
  const [user, setUser] = useState(null);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [myQueue, setMyQueue] = useState(null);
  const [queueCancelledInfo, setQueueCancelledInfo] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [homeFilter, setHomeFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [adminPlaceId, setAdminPlaceId] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [adminEmail, setAdminEmail] = useState(null);
  const [adminQueue, setAdminQueue] = useState([]);
  const [queueStats, setQueueStats] = useState(EMPTY_STATS);
  const [queueSeries, setQueueSeries] = useState(EMPTY_SERIES);
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentMeta, setCurrentMeta] = useState(EMPTY_META);
  const [likedPlaceIds, setLikedPlaceIds] = useState([]);
  const [joinedPlaceIds, setJoinedPlaceIds] = useState([]);

  // myQueue'ning eng so'nggi qiymatini effektlar/callbacklardan o'qish uchun (loopsiz)
  const myQueueRef = useRef(null);
  useEffect(() => {
    myQueueRef.current = myQueue;
  }, [myQueue]);

  /* ---------- Mavjud Supabase sessiyasini tiklash (ilova qayta ochilganda) ----------
     Supabase klienti sessiyani AsyncStorage'da saqlaydi (lib/supabase.js).
     Bu yerda faqat o'sha sessiyaga mos profilni o'qib, local holatni tiklaymiz.
     Eslatma: mijoz va admin bitta Supabase Auth sessiyasini ishlatadi (bir vaqtda
     faqat bittasi faol bo'lishi mumkin) — bu ilovaning "customer" / "admin"
     rejim tanlash oqimiga mos keladi. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;
      try {
        const profile = await fetchProfile(session.user.id);
        if (cancelled || !profile) return;
        if (profile.role === "admin" || profile.role === "super_admin") {
          setAdminEmail(session.user.email);
          setAdminRole(profile.role);
          setAdminPlaceId(profile.branch_id || null);
        } else {
          setUser({
            id: profile.id,
            first: profile.first_name || "",
            last: profile.last_name || "",
            phone: profile.phone || "",
            email: session.user.email,
            coins: profile.coins || 0,
            totalServed: 0,
            isAdmin: false,
          });
        }
      } catch (e) {
        console.error("Sessiyani tiklashda xatolik:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Mijozning like'larini yuklash (login/sessiya tiklanganda, logout'da tozalash) ---------- */
  useEffect(() => {
    if (!user?.id) {
      setLikedPlaceIds([]);
      return;
    }
    let cancelled = false;
    fetchLikedBranchIds(user.id)
      .then((ids) => {
        if (!cancelled) setLikedPlaceIds(ids);
      })
      .catch((e) => console.error("Like'larni yuklash xatosi:", e));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /* ---------- Filiallarni yuklash ---------- */
  useEffect(() => {
    let cancelled = false;
    setPlacesLoading(true);
    fetchBranches()
      .then((branches) => {
        if (!cancelled) setPlaces(branches);
      })
      .catch((err) => {
        console.error("Filiallarni yuklashda xatolik:", err);
        if (!cancelled) showToast(t("toastBranchesLoadError", "Filiallarni yuklab bo'lmadi"));
      })
      .finally(() => {
        if (!cancelled) setPlacesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Kategoriyalar: yuklash + realtime (super admin o'zgartirsa
     mijoz Bosh sahifasi va qidiruvda ham jonli yangilanadi) ---------- */
  const refreshCategories = useCallback(() => {
    fetchCategories()
      .then((rows) => setCategories(rows))
      .catch((e) => console.error("Kategoriyalarni yuklash xatosi:", e));
  }, []);

  useEffect(() => {
    refreshCategories();
    const unsub = subscribeCategories(() => refreshCategories());
    return unsub;
  }, [refreshCategories]);

  /* ---------- Admin navbati: yuklash + realtime ---------- */
  useEffect(() => {
    if (!adminPlaceId) {
      setAdminQueue([]);
      setQueueStats(EMPTY_STATS);
      setQueueSeries(EMPTY_SERIES);
      return;
    }
    let active = true;
    const load = () => {
      fetchBranchQueue(adminPlaceId)
        .then(({ tickets }) => {
          if (active) setAdminQueue(tickets);
        })
        .catch((e) => console.error("Admin navbatini yuklash xatosi:", e));
      fetchQueueStats(adminPlaceId)
        .then((stats) => {
          if (active) setQueueStats(stats);
        })
        .catch((e) => console.error("Statistikani yuklash xatosi:", e));
      Promise.all([
        fetchHourlySeries(adminPlaceId),
        fetchWeeklySeries(adminPlaceId),
        fetchMonthlySeries(adminPlaceId),
        fetchYearlySeries(adminPlaceId),
      ])
        .then(([hourly, weekly, monthly, yearly]) => {
          if (active) setQueueSeries({ hourly, weekly, monthly, yearly });
        })
        .catch((e) => console.error("Grafik ma'lumotlarini yuklash xatosi:", e));
    };
    load();
    const unsub = subscribeBranchQueue(adminPlaceId, load, "admin");
    return () => {
      active = false;
      unsub();
    };
  }, [adminPlaceId]);

  /* ---------- Admin: o'rtacha xizmat vaqti avtomatik kalibrovka bildirishnomasi ---------- */
  useEffect(() => {
    if (!adminPlaceId) return;
    const unsub = subscribeBranchCalibration(adminPlaceId, (row) => {
      setPlaces((prev) => {
        const current = prev.find((p) => p.id === adminPlaceId);
        const changed =
          row.schedule_calibrated_at &&
          row.schedule_calibrated_at !== current?.scheduleCalibratedAt;
        if (changed) {
          showToast(
            t("toastAvgServiceUpdated").replace("{n}", String(row.avg_service_minutes)),
          );
        }
        return prev.map((p) =>
          p.id === adminPlaceId
            ? {
                ...p,
                avgServiceMinutes: row.avg_service_minutes,
                serviceSampleCount: row.service_sample_count,
                scheduleCalibratedAt: row.schedule_calibrated_at,
              }
            : p,
        );
      });
    });
    return unsub;
  }, [adminPlaceId, showToast, t]);

  /* ---------- Mijoz ko'rayotgan filial navbati: yuklash + realtime ---------- */
  useEffect(() => {
    if (!currentPlaceId) {
      setCurrentQueue([]);
      setCurrentMeta(EMPTY_META);
      return;
    }
    let active = true;
    setCurrentQueue([]);
    setCurrentMeta(EMPTY_META);
    const load = () =>
      fetchBranchQueue(currentPlaceId)
        .then(({ tickets, currentNum, nextNum, isOpen }) => {
          if (!active) return;
          setCurrentQueue(tickets);
          setCurrentMeta({ currentNum, nextNum, isOpen });
        })
        .catch((e) => console.error("Filial navbatini yuklash xatosi:", e));
    load();
    const unsub = subscribeBranchQueue(currentPlaceId, load, "place");
    return () => {
      active = false;
      unsub();
    };
  }, [currentPlaceId]);

  /* ---------- myQueue'ni jonli yangilash (mijoz ko'rayotgan filial bo'yicha) ---------- */
  useEffect(() => {
    const mq = myQueueRef.current;
    if (!mq || mq.placeId !== currentPlaceId) return;

    const mine = currentQueue.find((q) => q.id === mq.ticketId);
    if (!mine || mine.status === "done" || mine.status === "rejected" || mine.status === "cancelled_by_branch") {
      if (mine?.status === "cancelled_by_branch") {
        setQueueCancelledInfo({ placeName: mq.placeName });
        showToast(t("toastQueueCancelledByBranch"));
      }
      if (mine?.status === "done") {
        refreshUserStats();
      }
      // Xizmat ko'rsatildi yoki rad etildi/chiqib ketildi → navbatdan chiqarildi
      setMyQueue(null);
      return;
    }
    const branch = places.find((p) => p.id === currentPlaceId);
    const avgMinutes = branch?.avgServiceMinutes || 15;
    const activeList = currentQueue.filter((q) => q.status === "waiting" || q.status === "current");
    const idx = activeList.findIndex((q) => q.id === mq.ticketId);
    const ahead = idx < 0 ? 0 : idx;
    const waitingAfter = currentQueue.filter(
      (q) => q.status === "waiting" && q.sortOrder > mine.sortOrder,
    ).length;
    setMyQueue((prev) =>
      prev
        ? {
            ...prev,
            position: ahead,
            waitMin: ahead * avgMinutes,
            currentNum: currentMeta.currentNum,
            delayCount: mine.delayCount,
            maxDelayPositions: waitingAfter,
          }
        : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueue, currentMeta, currentPlaceId, places]);

  /* ---------- Derived ---------- */
  const currentPlace = useMemo(() => {
    const branch = places.find((p) => p.id === currentPlaceId);
    if (!branch) return null;
    const activeList = currentQueue.filter((q) => q.status === "waiting" || q.status === "current");
    return {
      ...branch,
      queue: activeList,
      queueCount: activeList.length,
      currentNum: currentMeta.currentNum,
      waitMin: activeList.length * (branch.avgServiceMinutes || 15),
      isOpen: currentMeta.isOpen && branch.isOpen,
    };
  }, [places, currentPlaceId, currentQueue, currentMeta]);

  const adminPlace = useMemo(() => places.find((p) => p.id === adminPlaceId) || null, [places, adminPlaceId]);
  const likedPlaces = useMemo(() => places.filter((p) => likedPlaceIds.includes(p.id)), [places, likedPlaceIds]);

  const dailyServedCount = queueStats.day.served;
  const rejectedCount = queueStats.day.rejected;
  const weeklyServed = queueStats.week.served;
  const monthlyServed = queueStats.month.served;
  const yearlyServed = queueStats.year.served;

  /* ---------- Auth (mijoz — Supabase Auth, email + parol) ---------- */
  const selectRole = useCallback((r) => setRole(r), []);

  const doLogin = useCallback(
    async (email, pass) => {
      if (!email?.trim()) {
        showToast(t("toastEmailEmpty"));
        return false;
      }
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });
      if (authError || !authData?.user) {
        console.error("Login xatosi:", authError?.message, authError?.status);
        if (authError?.message?.toLowerCase().includes("not confirmed")) {
          showToast(t("toastEmailNotConfirmed"));
        } else {
          showToast(t("toastLoginNotFound"));
        }
        return false;
      }
      try {
        const profile = await fetchProfile(authData.user.id);
        setUser({
          id: profile.id,
          first: profile.first_name || "",
          last: profile.last_name || "",
          phone: profile.phone || "",
          email: authData.user.email,
          coins: profile.coins || 0,
          totalServed: 0,
          isAdmin: false,
        });
        showToast(t("toastLoginWelcome"));
        return true;
      } catch (e) {
        console.error("Profilni o'qishda xatolik:", e);
        await supabase.auth.signOut();
        showToast(t("toastLoginNotFound"));
        return false;
      }
    },
    [showToast, t],
  );

  const doRegister = useCallback(
    async (first, last, phone, email, pass) => {
      if (!first?.trim() || !last?.trim()) {
        showToast(t("toastRegisterNameRequired"));
        return false;
      }
      if (!phone?.trim()) {
        showToast(t("toastPhoneEmpty"));
        return false;
      }
      if (!email?.trim()) {
        showToast(t("toastEmailEmpty"));
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        showToast(t("toastEmailInvalid"));
        return false;
      }
      if (!pass || pass.length < 6) {
        showToast(t("toastPassTooShort"));
        return false;
      }
      const normalizedPhone = phone.replace(/\D/g, "");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: { first_name: first.trim(), last_name: last.trim(), phone: normalizedPhone },
        },
      });

      if (authError) {
        console.error("Ro'yxatdan o'tish xatosi:", authError.message, authError.status);
        if (authError.message?.toLowerCase().includes("already registered")) {
          showToast(t("toastEmailExists"));
        } else if (authError.message?.toLowerCase().includes("invalid")) {
          showToast(t("toastEmailInvalid"));
        } else {
          showToast(t("toastActionFailed", "Amal bajarilmadi"));
        }
        return false;
      }
      if (!authData?.user) {
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }

      setUser({
        id: authData.user.id,
        first: first.trim(),
        last: last.trim(),
        phone: normalizedPhone,
        email: email.trim(),
        coins: 0,
        totalServed: 0,
        isAdmin: false,
      });
      showToast(t("toastRegisterSuccess"));
      return true;
    },
    [showToast, t],
  );

  const logoutUser = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMyQueue(null);
    setJoinedPlaceIds([]);
  }, []);

  const editUserName = useCallback(
    async (first, last) => {
      if (!first?.trim() || !last?.trim()) {
        showToast(t("toastRegisterNameRequired"));
        return false;
      }
      if (!user?.id) return false;
      const { error } = await supabase
        .from("profiles")
        .update({ first_name: first.trim(), last_name: last.trim() })
        .eq("id", user.id);
      if (error) {
        console.error("Ismni yangilash xatosi:", error);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }
      setUser((u) => ({ ...u, first: first.trim(), last: last.trim() }));
      showToast(t("toastCredSaved"));
      return true;
    },
    [user, showToast, t],
  );

  const updateUserPhone = useCallback(
    async (phone) => {
      const normalized = phone?.replace(/\D/g, "");
      if (!normalized) {
        showToast(t("toastPhoneEmpty"));
        return false;
      }
      if (!user?.id) return false;
      const { error } = await supabase.from("profiles").update({ phone: normalized }).eq("id", user.id);
      if (error) {
        console.error("Telefonni yangilash xatosi:", error);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }
      setUser((u) => ({ ...u, phone: normalized }));
      showToast(t("toastCredSaved"));
      return true;
    },
    [user, showToast, t],
  );

  const refreshUserStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [coins, totalServed] = await Promise.all([
        fetchUserCoins(user.id),
        fetchUserServedCount(user.id),
      ]);
      setUser((u) => (u ? { ...u, coins, totalServed } : u));
    } catch (e) {
      console.error("Profil statistikasini yangilash xatosi:", e);
    }
  }, [user?.id]);

  /* ---------- Admin auth (Supabase Auth) ---------- */
  const doAdminLogin = useCallback(
    async (email, password) => {
      if (!email?.trim() || !password) {
        showToast(t("toastAdminCredInvalid"));
        return null;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError || !authData?.user) {
        showToast(t("toastAdminCredInvalid"));
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, branch_id, first_name, last_name")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
        await supabase.auth.signOut();
        showToast(t("toastAdminNoAccess"));
        return null;
      }

      setAdminEmail(email.trim());
      setAdminRole(profile.role);
      setAdminPlaceId(profile.branch_id || null);
      showToast(t("toastAdminLoginSuccess"));
      return profile;
    },
    [showToast, t],
  );

  const adminLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAdminPlaceId(null);
    setAdminRole(null);
    setAdminEmail(null);
    setAdminQueue([]);
    showToast(t("toastAdminLogout"));
  }, [showToast, t]);

  /* ---------- Like ---------- */
  const toggleLike = useCallback(
    async (placeId) => {
      if (!user?.id) {
        showToast(t("toastMustLogin"));
        return;
      }
      const isLiked = likedPlaceIds.includes(placeId);
      try {
        if (isLiked) {
          await removeLike(user.id, placeId);
          setLikedPlaceIds((prev) => prev.filter((id) => id !== placeId));
        } else {
          await addLike(user.id, placeId);
          setLikedPlaceIds((prev) => (prev.includes(placeId) ? prev : [...prev, placeId]));
        }
      } catch (e) {
        console.error("Like xatosi:", e);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
      }
    },
    [user, likedPlaceIds, showToast, t],
  );

  const updatePlaceName = useCallback(
    (name) => {
      if (!name?.trim() || !adminPlaceId) return false;
      setPlaces((prev) => prev.map((p) => (p.id === adminPlaceId ? { ...p, name: name.trim() } : p)));
      supabase
        .from("branches")
        .update({ name: name.trim() })
        .eq("id", adminPlaceId)
        .then(({ error }) => {
          if (error) console.error("Filial nomini yangilash xatosi:", error);
        });
      return true;
    },
    [adminPlaceId],
  );

  const updateBranchSchedule = useCallback(
    async (branchId, weeklySchedule) => {
      if (!branchId) return false;
      const { error } = await supabase
        .from("branches")
        .update({ weekly_schedule: weeklySchedule })
        .eq("id", branchId);
      if (error) {
        console.error("Ish jadvalini yangilash xatosi:", error);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }
      setPlaces((prev) => prev.map((p) => (p.id === branchId ? { ...p, weeklySchedule } : p)));
      showToast(t("toastCredSaved"));
      return true;
    },
    [showToast, t],
  );

  const updateAvgServiceMinutes = useCallback(
    async (branchId, minutes) => {
      if (!branchId || !minutes || minutes < 1) return false;
      const { error } = await supabase
        .from("branches")
        .update({ avg_service_minutes: minutes })
        .eq("id", branchId);
      if (error) {
        console.error("O'rtacha xizmat vaqtini yangilash xatosi:", error);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === branchId
            ? { ...p, avgServiceMinutes: minutes, serviceSampleCount: 0, scheduleCalibratedAt: null }
            : p,
        ),
      );
      showToast(t("toastCredSaved"));
      return true;
    },
    [showToast, t],
  );

  const setBranchEmergencyClosed = useCallback(
    async (branchId, isClosed) => {
      if (!branchId) return false;
      const { error } = await supabase
        .from("branches")
        .update({ is_open: !isClosed })
        .eq("id", branchId);
      if (error) {
        console.error("Filial holatini yangilash xatosi:", error);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }
      setPlaces((prev) => prev.map((p) => (p.id === branchId ? { ...p, isOpen: !isClosed } : p)));
      showToast(isClosed ? t("toastBranchClosedToday") : t("toastBranchReopened"));
      return true;
    },
    [showToast, t],
  );

  /* Filial koordinatalari — oddiy/vaqtinchalik xarita yechimi uchun
     (kelajakda joy tanlash imkoniyati bo'lgan interaktiv xaritaga
     almashtiriladi). Admin o'z filiali, super admin istalgan filial
     uchun o'zgartira oladi (branches_update_own_admin RLS siyosati). */
  const updateBranchLocation = useCallback(
    async (branchId, lat, lng) => {
      if (!branchId) return false;
      const { error } = await supabase
        .from("branches")
        .update({ lat, lng })
        .eq("id", branchId);
      if (error) {
        console.error("Filial joylashuvini yangilash xatosi:", error);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }
      setPlaces((prev) =>
        prev.map((p) => (p.id === branchId ? { ...p, location: { ...p.location, coords: { lat, lng } } } : p)),
      );
      showToast(t("toastCredSaved"));
      return true;
    },
    [showToast, t],
  );

  /* ---------- Joylar / qidiruv ---------- */
  const openPlace = useCallback((placeId) => {
    setCurrentPlaceId(placeId);
    setSelectedRating(0);
  }, []);

  /* ---------- Navbatga qo'shilish (mijoz) ---------- */
  const canJoinQueue = useCallback(() => {
    if (!user) return { ok: false, reason: "login" };
    if (!currentPlace) return { ok: false, reason: "noplace" };
    if (!currentPlace.isOpen) {
      showToast(t("toastPlaceClosed"));
      return { ok: false, reason: "closed" };
    }
    if (myQueue) {
      showToast(t("toastQueueAlreadyActive"));
      return { ok: false, reason: "active" };
    }
    return { ok: true };
  }, [user, currentPlace, myQueue, showToast, t]);

  const joinPreview = useMemo(() => {
    if (!currentPlaceId) return null;
    const branch = places.find((p) => p.id === currentPlaceId);
    const activeList = currentQueue.filter((q) => q.status === "waiting" || q.status === "current");
    return { num: currentMeta.nextNum, waitMin: activeList.length * (branch?.avgServiceMinutes || 15) };
  }, [currentPlaceId, currentQueue, currentMeta, places]);

  const confirmJoin = useCallback(async () => {
    if (!currentPlaceId || !user) return;
    const branch = places.find((p) => p.id === currentPlaceId);
    if (!branch) return;
    try {
      const ticket = await rpcJoinQueue(currentPlaceId, `${user.first} ${user.last}`, "online");
      if (!ticket) return;
      setJoinedPlaceIds((prev) => (prev.includes(currentPlaceId) ? prev : [...prev, currentPlaceId]));
      setQueueCancelledInfo(null);
      setMyQueue({
        placeId: currentPlaceId,
        placeName: branch.name,
        ticketId: ticket.id,
        num: ticket.num,
        position: 0,
        waitMin: 0,
        currentNum: currentMeta.currentNum,
        delayCount: ticket.delayCount,
        maxDelayPositions: 0,
      });
      showToast(`${t("toastJoinQueueSuccess")}: #${ticket.num}`);
    } catch (e) {
      console.error("Navbatga yozilish xatosi:", e);
      const closedMessages = [
        "Filial bugun texnik sabablarga ko'ra ishlamaydi",
        "Filial bugun ishlamaydi",
        "Bugun dam olish kuni",
      ];
      if (closedMessages.includes(e.message)) {
        showToast(e.message);
      } else {
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
      }
    }
  }, [currentPlaceId, user, places, currentMeta, showToast, t]);

  const clearQueueCancelledInfo = useCallback(() => setQueueCancelledInfo(null), []);

  const leaveQueue = useCallback(async () => {
    const mq = myQueueRef.current;
    if (mq?.ticketId) {
      try {
        await rpcLeaveQueue(mq.ticketId);
      } catch (e) {
        console.error("Navbatdan chiqish xatosi:", e);
      }
    }
    setMyQueue(null);
    showToast(t("toastLeaveQueue"));
  }, [showToast, t]);

  const doDelay = useCallback(
    async (positions) => {
      const mq = myQueueRef.current;
      if (!mq?.ticketId) return false;
      try {
        await rpcDelayTicket(mq.ticketId, positions);
        showToast(`${t("toastDelaySuccess")} (+${positions} ${t("slot")})`);
        refreshUserStats();
        return true;
      } catch (e) {
        console.error("Kechiktirish xatosi:", e);
        if (e.message?.includes("Yetarli coin yo'q")) {
          showToast(t("toastNotEnoughCoins"));
        } else if (e.message?.includes("kechiktirish limitiga yetdingiz")) {
          showToast(t("toastDelayLimitReached"));
        } else if (e.message?.includes("navbatda faqat")) {
          showToast(e.message);
        } else {
          showToast(t("toastActionFailed", "Amal bajarilmadi"));
        }
        return false;
      }
    },
    [showToast, t, refreshUserStats],
  );

  /* ---------- Sharhlar (hozircha local) ---------- */
  const setRating = useCallback((n) => setSelectedRating(n), []);

  const submitReview = useCallback(
    (text) => {
      if (!selectedRating) {
        showToast(t("toastReviewRatingRequired"));
        return false;
      }
      if (!text?.trim()) {
        showToast(t("toastReviewTextRequired"));
        return false;
      }
      if (!user) {
        showToast(t("toastMustLogin"));
        return false;
      }
      setPlaces((prev) =>
        prev.map((p) =>
          p.id === currentPlaceId
            ? {
                ...p,
                reviewCount: p.reviewCount + 1,
                reviews: [
                  { name: `${user.first} ${user.last[0]}.`, date: t("dateNow"), rating: selectedRating, text: text.trim() },
                  ...p.reviews,
                ],
              }
            : p,
        ),
      );
      setSelectedRating(0);
      showToast(t("toastReviewSubmitted"));
      return true;
    },
    [selectedRating, user, currentPlaceId, showToast, t],
  );

  /* ---------- Admin panel (Supabase RPC) ---------- */
  const adminNext = useCallback(async () => {
    if (!adminPlaceId) return;
    try {
      const next = await rpcAdvanceQueue(adminPlaceId);
      showToast(next ? `${t("toastAdminNext")}: ${next.name}` : t("toastAllServed"));
    } catch (e) {
      console.error("adminNext xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    }
  }, [adminPlaceId, showToast, t]);

  const adminReject = useCallback(async () => {
    if (!adminPlaceId) return;
    try {
      const next = await rpcRejectCurrent(adminPlaceId);
      showToast(next ? `${t("toastAdminNext")}: ${next.name}` : t("toastAllServed"));
    } catch (e) {
      console.error("adminReject xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    }
  }, [adminPlaceId, showToast, t]);

  const addWalkIn = useCallback(
    async (name) => {
      const trimmed = name?.trim();
      if (!trimmed) {
        showToast(t("toastNameRequired"));
        return false;
      }
      if (!adminPlaceId) return false;
      try {
        const ticket = await rpcJoinQueue(adminPlaceId, trimmed, "offline");
        showToast(`${trimmed} ${t("toastCustomerAdded")} (#${ticket.num})`);
        return true;
      } catch (e) {
        console.error("addWalkIn xatosi:", e);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
        return false;
      }
    },
    [adminPlaceId, showToast, t],
  );

  const confirmResetQueue = useCallback(async () => {
    if (!adminPlaceId) return;
    try {
      await resetBranchQueue(adminPlaceId);
      showToast(t("toastQueueCleared"));
    } catch (e) {
      console.error("Navbatni tozalash xatosi:", e);
      showToast(t("toastActionFailed", "Amal bajarilmadi"));
    }
  }, [adminPlaceId, showToast, t]);

  const adminRejectItem = useCallback(
    async (ticketId) => {
      try {
        const tk = await rpcRejectTicket(ticketId);
        showToast(`#${tk?.num ?? ""} ${t("toastAdminReject")}`);
      } catch (e) {
        console.error("adminRejectItem xatosi:", e);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
      }
    },
    [showToast, t],
  );

  const adminDelayItem = useCallback(
    async (ticketId, positions) => {
      try {
        const tk = await rpcDelayTicket(ticketId, positions);
        showToast(`#${tk?.num ?? ""} +${positions} ${t("slot")} kechiktirildi`);
      } catch (e) {
        console.error("adminDelayItem xatosi:", e);
        showToast(t("toastActionFailed", "Amal bajarilmadi"));
      }
    },
    [showToast, t],
  );

  const verifyAdminPass = useCallback(
    async (pass) => {
      if (!adminEmail) return false;
      const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: pass });
      return !error;
    },
    [adminEmail],
  );

  const verifyUserPass = useCallback(
    async (pass) => {
      if (!user?.email) return false;
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: pass,
      });
      return !error;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      places,
      placesLoading,
      categories,
      refreshCategories,
      role,
      user,
      currentPlace,
      myQueue,
      queueCancelledInfo,
      selectedRating,
      homeFilter,
      marketFilter,
      adminPlace,
      adminRole,
      adminEmail,
      adminQueue,
      queueStats,
      queueSeries,
      joinPreview,
      likedPlaceIds,
      likedPlaces,
      joinedPlaceIds,
      dailyServedCount,
      rejectedCount,
      weeklyServed,
      monthlyServed,
      yearlyServed,
      setHomeFilter,
      setMarketFilter,
      selectRole,
      doLogin,
      doRegister,
      logoutUser,
      editUserName,
      updateUserPhone,
      refreshUserStats,
      doAdminLogin,
      adminLogout,
      openPlace,
      canJoinQueue,
      confirmJoin,
      leaveQueue,
      clearQueueCancelledInfo,
      doDelay,
      setRating,
      submitReview,
      adminNext,
      adminReject,
      addWalkIn,
      confirmResetQueue,
      adminRejectItem,
      adminDelayItem,
      verifyAdminPass,
      verifyUserPass,
      toggleLike,
      updatePlaceName,
      updateBranchSchedule,
      updateAvgServiceMinutes,
      setBranchEmergencyClosed,
      updateBranchLocation,
    }),
    [
      places,
      placesLoading,
      categories,
      refreshCategories,
      role,
      user,
      currentPlace,
      myQueue,
      queueCancelledInfo,
      selectedRating,
      homeFilter,
      marketFilter,
      adminPlace,
      adminRole,
      adminEmail,
      adminQueue,
      queueStats,
      queueSeries,
      joinPreview,
      likedPlaceIds,
      likedPlaces,
      joinedPlaceIds,
      dailyServedCount,
      rejectedCount,
      weeklyServed,
      monthlyServed,
      yearlyServed,
      selectRole,
      doLogin,
      doRegister,
      logoutUser,
      editUserName,
      updateUserPhone,
      refreshUserStats,
      doAdminLogin,
      adminLogout,
      openPlace,
      canJoinQueue,
      confirmJoin,
      leaveQueue,
      clearQueueCancelledInfo,
      doDelay,
      setRating,
      submitReview,
      adminNext,
      adminReject,
      addWalkIn,
      confirmResetQueue,
      adminRejectItem,
      adminDelayItem,
      verifyAdminPass,
      verifyUserPass,
      toggleLike,
      updatePlaceName,
      updateBranchSchedule,
      updateAvgServiceMinutes,
      setBranchEmergencyClosed,
      updateBranchLocation,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp AppProvider ichida ishlatilishi kerak");
  return ctx;
}
