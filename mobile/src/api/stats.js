import { supabase } from "../lib/supabase";

const PERIODS = ["day", "week", "month", "year"];

function periodStartDate(period, now = new Date()) {
  const d = new Date(now);
  if (period === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const mondayOffset = (d.getDay() + 6) % 7; // dushanba = 0
    d.setDate(d.getDate() - mondayOffset);
    d.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  } else if (period === "year") {
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function periodStart(period, now = new Date()) {
  return periodStartDate(period, now).toISOString();
}

/* branchId=null -> barcha filiallar bo'yicha yig'indi (super_admin uchun) */
async function countTickets(branchId, status, sinceIso) {
  let query = supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("status", status)
    .gte("created_at", sinceIso);
  if (branchId) query = query.eq("branch_id", branchId);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

/* { day: {served, rejected}, week: {...}, month: {...}, year: {...} } */
export async function fetchQueueStats(branchId) {
  const entries = await Promise.all(
    PERIODS.map(async (period) => {
      const since = periodStart(period);
      const [served, rejected] = await Promise.all([
        countTickets(branchId, "done", since),
        countTickets(branchId, "rejected", since),
      ]);
      return [period, { served, rejected }];
    }),
  );
  return Object.fromEntries(entries);
}

/* status='done' ticketlarning created_at vaqtlari (bitta filial, davr bo'yicha) */
async function fetchDoneTimestamps(branchId, sinceIso) {
  let query = supabase.from("tickets").select("created_at").eq("status", "done").gte("created_at", sinceIso);
  if (branchId) query = query.eq("branch_id", branchId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) => new Date(row.created_at));
}

/* Bugungi kun, soat bo'yicha (faqat 9–16 oralig'i — grafik yorliqlariga mos, 8 ta qiymat) */
const HOUR_BUCKETS = [9, 10, 11, 12, 13, 14, 15, 16];

export async function fetchHourlySeries(branchId) {
  const since = periodStart("day");
  const dates = await fetchDoneTimestamps(branchId, since);
  const counts = HOUR_BUCKETS.map(() => 0);
  dates.forEach((d) => {
    const idx = HOUR_BUCKETS.indexOf(d.getHours());
    if (idx >= 0) counts[idx] += 1;
  });
  return counts;
}

/* Shu hafta, kun bo'yicha (Dushanba..Yakshanba — 7 ta qiymat) */
export async function fetchWeeklySeries(branchId) {
  const since = periodStart("week");
  const dates = await fetchDoneTimestamps(branchId, since);
  const counts = [0, 0, 0, 0, 0, 0, 0];
  dates.forEach((d) => {
    const idx = (d.getDay() + 6) % 7; // dushanba = 0
    counts[idx] += 1;
  });
  return counts;
}

/* Shu oy, hafta bo'yicha (1–7, 8–14, 15–21, 22–oxiri — 4 ta qiymat) */
export async function fetchMonthlySeries(branchId) {
  const since = periodStart("month");
  const dates = await fetchDoneTimestamps(branchId, since);
  const counts = [0, 0, 0, 0];
  dates.forEach((d) => {
    const idx = Math.min(3, Math.floor((d.getDate() - 1) / 7));
    counts[idx] += 1;
  });
  return counts;
}

/* Shu yil, oy bo'yicha (Yanvar..Dekabr — 12 ta qiymat) */
export async function fetchYearlySeries(branchId) {
  const since = periodStart("year");
  const dates = await fetchDoneTimestamps(branchId, since);
  const counts = new Array(12).fill(0);
  dates.forEach((d) => {
    counts[d.getMonth()] += 1;
  });
  return counts;
}
