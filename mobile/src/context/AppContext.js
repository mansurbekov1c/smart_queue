import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PLACES } from "../data/places";
import { ADMINS } from "../data/admins";
import { USERS } from "../data/users";
import { useI18n } from "./I18nContext";
import { useToast } from "./ToastContext";

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

  const currentPlace = useMemo(() => places.find((p) => p.id === currentPlaceId) || null, [places, currentPlaceId]);
  const adminPlace = useMemo(() => places.find((p) => p.id === adminPlaceId) || null, [places, adminPlaceId]);
  const selectedAdminPlace = useMemo(
    () => places.find((p) => p.id === selectedAdminPlaceId) || null,
    [places, selectedAdminPlaceId],
  );

  const likedPlaces = useMemo(() => places.filter((p) => likedPlaceIds.includes(p.id)), [places, likedPlaceIds]);

  const dailyServedCount = useMemo(() => {
    const servedToday = adminQueue.filter((q) => q.done).length;
    return servedToday;
  }, [adminQueue]);

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
  }, []);

  /* ---------- Admin auth ---------- */
  const selectAdminPlace = useCallback((placeId) => setSelectedAdminPlaceId(placeId), []);

  const loginAsAdmin = useCallback(
    (placeId) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return;

      const queueCopy = place.queue.map((q) => ({ ...q, current: false }));
      let currentPerson = queueCopy.find((q) => q.num === place.currentNum && !q.done);
      if (!currentPerson) currentPerson = queueCopy.find((q) => !q.done);

      let newCurrentNum = place.currentNum;
      if (currentPerson) {
        currentPerson.current = true;
        newCurrentNum = currentPerson.num;
      }

      setAdminPlaceId(placeId);
      setAdminQueue(queueCopy);
      setPlaces((prev) => prev.map((p) => (p.id === placeId ? { ...p, currentNum: newCurrentNum } : p)));

      const qNums = place.queue.map((q) => q.num);
      setAdminNextNum((qNums.length > 0 ? Math.max(...qNums) : 0) + 1);

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
      dailyServedCount,
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
      addWalkIn,
      confirmResetQueue,
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
      dailyServedCount,
      weeklyServed,
      monthlyServed,
      yearlyServed,
      selectRole,
      doLogin,
      doRegister,
      demoLogin,
      logoutUser,
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
      addWalkIn,
      confirmResetQueue,
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
