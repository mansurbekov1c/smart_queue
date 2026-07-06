/* Phosphor (veb) ikonalarining @expo/vector-icons (Ionicons) ga moslashuvi */
export const CAT_ICONS = {
  barber: "cut",
  clinic: "medkit",
  bank: "business",
  carwash: "car-sport",
  gov: "business",
};

/* Supabase "categories" jadvalidagi "name" (masalan "barber") ni
   tarjima kaliti "catBarber" ga aylantiradi. Yangi (tarjimasi yo'q)
   kategoriyalar uchun t() ikkinchi argumenti sifatida asl nom ko'rsatiladi. */
export function categoryLabelKey(name) {
  const n = (name || "").trim();
  if (!n) return "";
  return "cat" + n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}

export const NAV_ICONS = {
  home: "home",
  homeOutline: "home-outline",
  search: "search",
  searchOutline: "search-outline",
  queue: "clipboard",
  queueOutline: "clipboard-outline",
  profile: "person",
  profileOutline: "person-outline",
};
