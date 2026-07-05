import { supabase } from "../lib/supabase";

/* Supabase "branches" jadvalidagi qatorni ilova ichida ishlatiladigan
   PLACE shakliga o'giradi. Navbat sonlari (queueCount) alohida qo'shiladi. */
function mapBranchRow(row, waitingCount = 0) {
  return {
    id: row.id,
    name: row.name,
    cat: row.category,
    location: {
      city: row.city,
      district: row.district,
      address: row.address,
      coords: { lat: row.lat, lng: row.lng },
    },
    rating: row.rating,
    reviewCount: row.review_count,
    hours: row.hours,
    queueCount: waitingCount,
    avgServiceMinutes: row.avg_service_minutes,
    waitMin: waitingCount * row.avg_service_minutes,
    currentNum: 0,
    isOpen: row.is_open,
    isFeatured: row.is_featured,
    weeklySchedule: row.weekly_schedule,
    serviceSampleCount: row.service_sample_count,
    scheduleCalibratedAt: row.schedule_calibrated_at,
    distanceKm: null,
    queue: [],
    reviews: [],
    hourlyData: [0, 0, 0, 0, 0, 0, 0, 0],
  };
}

/* Bitta filialning "branches" qatoridagi o'zgarishlariga (masalan
   avg_service_minutes avtomatik kalibrovka qilinganda) real-time obuna. */
export function subscribeBranchCalibration(branchId, onChange) {
  const channel = supabase
    .channel(`branch-calibration:${branchId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "branches", filter: `id=eq.${branchId}` },
      (payload) => onChange(payload.new),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function fetchBranches() {
  const [branchesRes, countsRes] = await Promise.all([
    supabase.from("branches").select("*").order("name"),
    supabase.from("tickets").select("branch_id").in("status", ["waiting", "current"]),
  ]);
  if (branchesRes.error) throw branchesRes.error;
  if (countsRes.error) throw countsRes.error;

  const counts = {};
  for (const row of countsRes.data || []) {
    counts[row.branch_id] = (counts[row.branch_id] || 0) + 1;
  }

  return (branchesRes.data || []).map((b) => mapBranchRow(b, counts[b.id] || 0));
}
