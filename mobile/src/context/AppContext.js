import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PLACES } from "../data/places";
import { ADMINS } from "../data/admins";
import { USERS } from "../data/users";
import { useI18n } from "./I18nContext";
import { useToast } from "./ToastContext";

const TEST_ADMIN_QUEUE = {
  1: [
    { num: 1, name: "Alisher Hasanov", type: "online", done: false, current: true },
    { num: 2, name: "Barno Toshmatova", type: "offline", done: false, current: false },
    { num: 3, name: "Dilshod Qodirov", type: "online", done: false, current: false },
    { num: 4, name: "Gulnora Nazarova", type: "online", done: false, current: false },
    { num: 5, name: "Hamza Yusupov", type: "offline", done: false, current: false },
  ],
  2: [
    { num: 1, name: "Iroda Rahimova", type: "online", done: false, current: true },
    { num: 2, name: "Jasur Fattoyev", type: "offline", done: false, current: false },
    { num: 3, name: "Komiljon Sobirov", type: "online", done: false, current: false },
    { num: 4, name: "Laylo Azimova", type: "online", done: false, current: false },
    { num: 5, name: "Mirzo Tursunov", type: "offline", done: false, current: false },
  ],
};

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [places, setPlaces] = useState(PLACES);
  const [role, setRole] = useState("customer");
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(USERS);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [myQueue, setMyQueue] = useState(null);
  const [delaysUsed, setDelaysUsed] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [homeFilter, setHomeFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [selectedAdminPlaceId, setSelectedAdminPlaceId] = useState(null);
  const [adminPlaceId, setAdminPlaceId] = useState(null);
  const [adminQueue, setAdminQueue] = useState([]);
  const [adminNextNum, setAdminNextNum] = useState(1);
  const [likedPlaceIds, setLikedPlaceIds] = useState([]);
  const [joinedPlaceIds, setJoinedPlaceIds] = useState([]);

  const currentPlace = useMemo(() => places.find((p) => p.id === currentPlaceId) || null, [places, currentPlaceId]);
  const adminPlace = useMemo(() => places.find((p) => p.id === adminPlaceId) || null, [places, adminPlaceId]);
  const selectedAdminPlace = useMemo(
    () => places.find((p) => p.id === selectedAdminPlaceId) || null,
    [places, selectedAdminPlaceId],
  );

  const likedPlaces = useMemo(() => places.filter((p) => likedPlaceIds.includes(p.id)), [places, likedPlaceIds]);

  const dailyServedCount = useMemo(() => adminQueue.filter((q) => q.done && !q.rejected).length, [adminQueue]);
  const rejectedCount = useMemo(() => adminQueue.filter((q) => q.rejected).length, [adminQueue]);

  const weeklyServed = useMemo(() => dailyServedCount + 38, [dailyServedCount]);
  const monthlyServed = useMemo(() => dailyServedCount + 162, [dailyServedCount]);
  const yearlyServed = useMemo(() => dailyServedCount + 1986, [dailyServedCount]);

  /* ---------- Auth ---------- */
  const selectRole = useCallback((r) => setRole(r), []);

  const doLogin = useCallback(
    (phone, pass) => {
      const normalized = phone.replace(/\D/g, "");
      const found = registeredUsers.find((u) => u.phone.replace(/\D/g, "") === normalized);
      if (!found) {
        showToast(t("toastLoginNotFound"));
        return false;
      }
      if (found.pass !== pass) {
        showToast(t("toastLoginWrongPass"));
        return false;
      }
      setUser({ first: found.first, last: found.last, phone: phone, isAdmin: false });
      showToast(t("toastLoginWelcome"));
      return true;
    },
    [registeredUsers, showToast, t],
  );

  const doRegister = useCallback(
    (first, last, phone, pass) => {
      if (!first?.trim() || !last?.trim()) {
        showToast(t("toastRegisterNameRequired"));
        return false;
      }
      if (!phone?.trim()) {
        showToast(t("toastPhoneEmpty"));
        return false;
      }
      if (!pass || pass.length < 4) {
        showToast(t("toastPassTooShort"));
        return false;
      }
      const normalized = phone.replace(/\D/g, "");
      const exists = registeredUsers.find((u) => u.phone.replace(/\D/g, "") === normalized);
      if (exists) {
        showToast(t("toastPhoneExists"));
        return false;
      }
      const newUser = { id: Date.now(), phone: normalized, pass, first: first.trim(), last: last.trim() };
      setRegisteredUsers((prev) => [...prev, newUser]);
      setUser({ first: first.trim(), last: last.trim(), phone: phone.trim(), isAdmin: false });
      showToast(t("toastRegisterSuccess"));
      return true;
    },
    [registeredUsers, showToast, t],
  );

  const logoutUser = useCallback(() => {
    setUser(null);
    setMyQueue(null);
    setJoinedPlaceIds([]);
  }, []);

  const editUserName = useCallback(
    (first, last) => {
      if (!first?.trim() || !last?.trim()) {
        showToast(t("toastRegisterNameRequired"));
        return false;
      }
      setUser((u) => ({ ...u, first: first.trim(), last: last.trim() }));
      showToast(t("toastCredSaved"));
      return true;
    },
    [showToast, t],
  );

  /* ---------- Admin auth ---------- */
  const selectAdminPlace = useCallback((placeId) => setSelectedAdminPlaceId(placeId), []);

  const loginAsAdmin = useCallback(
    (placeId) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return;

      const initialQueue = TEST_ADMIN_QUEUE[placeId] || [];
      setAdminPlaceId(placeId);
      setAdminQueue(initialQueue);
      setAdminNextNum(initialQueue.length + 1);
      setPlaces((prev) => prev.map((p) => (p.id === placeId ? { ...p, currentNum: 0, queue: [] } : p)));

      showToast(`${place.name} — ${t("toastAdminLoginSuccess")}`);
    },
    [places, showToast, t],
  );

  const demoLogin = useCallback(() => {
    if (role === "admin") {
      loginAsAdmin(1);
      return;
    }
    const demoUser = USERS[0];
    setUser({ first: demoUser.first, last: demoUser.last, phone: demoUser.phone, isAdmin: false });
    setMyQueue(null);
    showToast(t("toastDemoLogin"));
  }, [role, showToast, t, loginAsAdmin]);

  const doAdminLogin = useCallback(
    (loginVal, passVal) => {
      if (!selectedAdminPlaceId) {
        showToast(t("toastAdminSelectPlace"));
        return false;
      }
      const cred = ADMINS.find(
        (a) => a.placeId === selectedAdminPlaceId && a.login === loginVal.trim() && a.parol === passVal.trim(),
      );
      if (!cred) {
        showToast(t("toastAdminCredInvalid"));
        return false;
      }
      loginAsAdmin(selectedAdminPlaceId);
      return true;
    },
    [selectedAdminPlaceId, showToast, t, loginAsAdmin],
  );

  const adminLogout = useCallback(() => {
    setAdminPlaceId(null);
    setAdminQueue([]);
    setAdminNextNum(1);
    showToast(t("toastAdminLogout"));
  }, [showToast, t]);

  /* ---------- Like ---------- */
  const toggleLike = useCallback((placeId) => {
    setLikedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId],
    );
  }, []);

  /* ---------- Joylar / qidiruv ---------- */
  const openPlace = useCallback((placeId) => {
    setCurrentPlaceId(placeId);
    setSelectedRating(0);
  }, []);

  /* ---------- Navbatga qo'shilish ---------- */
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
    if (!currentPlace) return null;
    const maxNum = currentPlace.queue.length > 0 ? Math.max(...currentPlace.queue.map((q) => q.num)) : 0;
    const num = maxNum + 1;
    return { num, waitMin: currentPlace.queueCount * 2 };
  }, [currentPlace]);

  const confirmJoin = useCallback(() => {
    if (!currentPlace || !user) return;
    const place = currentPlace;
    const maxNum = place.queue.length > 0 ? Math.max(...place.queue.map((q) => q.num)) : 0;
    const num = maxNum + 1;

    setJoinedPlaceIds((prev) => (prev.includes(place.id) ? prev : [...prev, place.id]));
    setMyQueue({
      placeId: place.id,
      placeName: place.name,
      num,
      position: num - place.currentNum,
      waitMin: (num - place.currentNum) * 2,
    });

    setPlaces((prev) =>
      prev.map((p) =>
        p.id === place.id
          ? {
              ...p,
              queueCount: p.queueCount + 1,
              queue: [...p.queue, { num, name: `${user.first} ${user.last}`, type: "online", done: false, current: false }],
            }
          : p,
      ),
    );

    showToast(`${t("toastJoinQueueSuccess")}: #${num}`);
  }, [currentPlace, user, showToast, t]);

  const leaveQueue = useCallback(() => {
    setMyQueue(null);
    setDelaysUsed(0);
    showToast(t("toastLeaveQueue"));
  }, [showToast, t]);

  const doDelay = useCallback(
    (positions) => {
      if (!myQueue) return;
      const isFree = delaysUsed === 0;
      setMyQueue((q) => ({
        ...q,
        num: q.num + positions,
        position: q.position + positions,
        waitMin: q.waitMin + positions * 2,
      }));
      setDelaysUsed((d) => d + 1);
      showToast(isFree ? `${t("toastDelayFree")} (+${positions} ${t("slot")})` : `${t("toastDelayPaid")} (+${positions} ${t("slot")})`);
    },
    [myQueue, delaysUsed, showToast, t],
  );

  /* ---------- Sharhlar ---------- */
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
                reviews: [{ name: `${user.first} ${user.last[0]}.`, date: t("dateNow"), rating: selectedRating, text: text.trim() }, ...p.reviews],
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

  /* ---------- Admin panel ---------- */
  const adminNext = useCallback(() => {
    setAdminQueue((prev) => {
      const cleared = prev.map((q) => (q.current ? { ...q, done: true, current: false } : q));
      const nextIdx = cleared.findIndex((q) => !q.done && !q.current);

      let updated = cleared;
      if (nextIdx >= 0) {
        updated = cleared.map((q, i) => (i === nextIdx ? { ...q, current: true } : q));
        const nextNum = updated[nextIdx].num;
        const nextName = updated[nextIdx].name;
        setPlaces((pp) => pp.map((p) => (p.id === adminPlaceId ? { ...p, currentNum: nextNum } : p)));
        showToast(`${t("toastAdminNext")}: ${nextName}`);
      } else {
        showToast(t("toastAllServed"));
      }

      setPlaces((pp) => pp.map((p) => (p.id === adminPlaceId ? { ...p, queue: updated.map((q) => ({ ...q })) } : p)));
      return updated;
    });
  }, [adminPlaceId, showToast, t]);

  const adminReject = useCallback(() => {
    setAdminQueue((prev) => {
      const cleared = prev.map((q) => (q.current ? { ...q, rejected: true, done: false, current: false } : q));
      const nextIdx = cleared.findIndex((q) => !q.done && !q.rejected && !q.current);

      let updated = cleared;
      if (nextIdx >= 0) {
        updated = cleared.map((q, i) => (i === nextIdx ? { ...q, current: true } : q));
        const nextNum = updated[nextIdx].num;
        const nextName = updated[nextIdx].name;
        setPlaces((pp) => pp.map((p) => (p.id === adminPlaceId ? { ...p, currentNum: nextNum } : p)));
        showToast(`${t("toastAdminNext")}: ${nextName}`);
      } else {
        showToast(t("toastAllServed"));
      }

      setPlaces((pp) => pp.map((p) => (p.id === adminPlaceId ? { ...p, queue: updated.map((q) => ({ ...q })) } : p)));
      return updated;
    });
  }, [adminPlaceId, showToast, t]);

  const addWalkIn = useCallback(
    (name) => {
      const trimmed = name?.trim();
      if (!trimmed) {
        showToast(t("toastNameRequired"));
        return false;
      }
      setAdminQueue((prev) => {
        const hasCurrent = prev.some((q) => q.current && !q.done);
        return [...prev, { num: adminNextNum, name: trimmed, type: "offline", done: false, current: !hasCurrent }];
      });
      setAdminNextNum((n) => n + 1);
      showToast(`${trimmed} ${t("toastCustomerAdded")} (#${adminNextNum})`);
      return true;
    },
    [adminNextNum, showToast, t],
  );

  const confirmResetQueue = useCallback(() => {
    setAdminQueue([]);
    setAdminNextNum(1);
    showToast(t("toastQueueCleared"));
  }, [showToast, t]);

  const adminRejectItem = useCallback(
    (num) => {
      setAdminQueue((prev) => prev.map((q) => (q.num === num ? { ...q, rejected: true, current: false } : q)));
      showToast(`#${num} ${t("toastAdminReject")}`);
    },
    [showToast, t],
  );

  const adminDelayItem = useCallback(
    (num, positions) => {
      setAdminQueue((prev) => {
        const waiting = prev.filter((q) => !q.done && !q.rejected && !q.current);
        const idx = waiting.findIndex((q) => q.num === num);
        if (idx === -1) return prev;
        const item = waiting[idx];
        const rest = [...waiting.slice(0, idx), ...waiting.slice(idx + 1)];
        const insertAt = Math.min(idx + positions, rest.length);
        rest.splice(insertAt, 0, item);
        const others = prev.filter((q) => q.done || q.rejected || q.current);
        return [...others, ...rest];
      });
      showToast(`#${num} +${positions} ${t("slot")} kechiktirildi`);
    },
    [showToast, t],
  );

  const verifyAdminPass = useCallback(
    (pass) => {
      const cred = ADMINS.find((a) => a.placeId === adminPlaceId);
      return cred?.parol === pass;
    },
    [adminPlaceId],
  );

  const verifyUserPass = useCallback(
    (pass) => {
      if (!user) return false;
      const normalized = user.phone.replace(/\D/g, "");
      const found = registeredUsers.find((u) => u.phone.replace(/\D/g, "") === normalized);
      return found?.pass === pass;
    },
    [user, registeredUsers],
  );

  const value = useMemo(
    () => ({
      places,
      role,
      user,
      registeredUsers,
      currentPlace,
      myQueue,
      delaysUsed,
      selectedRating,
      homeFilter,
      marketFilter,
      selectedAdminPlaceId,
      selectedAdminPlace,
      adminPlace,
      adminQueue,
      adminNextNum,
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
      demoLogin,
      logoutUser,
      editUserName,
      selectAdminPlace,
      doAdminLogin,
      adminLogout,
      openPlace,
      canJoinQueue,
      confirmJoin,
      leaveQueue,
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
    }),
    [
      places,
      role,
      user,
      registeredUsers,
      currentPlace,
      myQueue,
      delaysUsed,
      selectedRating,
      homeFilter,
      marketFilter,
      selectedAdminPlaceId,
      selectedAdminPlace,
      adminPlace,
      adminQueue,
      adminNextNum,
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
      demoLogin,
      logoutUser,
      editUserName,
      selectAdminPlace,
      doAdminLogin,
      adminLogout,
      openPlace,
      canJoinQueue,
      confirmJoin,
      leaveQueue,
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
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp AppProvider ichida ishlatilishi kerak");
  return ctx;
}
