import { supabase } from "../lib/supabase";

/* Supabase "tickets" qatorini ilova ichidagi navbat elementi shakliga o'giradi.
   UI QueueRow/AppContext num/name/type/done/current/rejected maydonlarini kutadi. */
export function mapTicket(row) {
  if (!row) return null;
  return {
    id: row.id,
    branchId: row.branch_id,
    num: row.number,
    name: row.customer_name,
    type: row.type,
    status: row.status,
    sortOrder: row.sort_order,
    userId: row.user_id,
    delayCount: row.delay_count ?? 0,
    done: row.status === "done",
    current: row.status === "current",
    rejected: row.status === "rejected",
  };
}

/* Foydalanuvchining barcha filiallar bo'yicha faol (waiting/current)
   chiptalari — ko'p-filialli navbatni tiklash uchun. */
export async function fetchMyActiveTickets(userId) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["waiting", "current"]);
  if (error) throw error;
  return (data || []).map(mapTicket);
}

/* Bitta filialning to'liq navbat holati: barcha ticketlar + queues meta. */
export async function fetchBranchQueue(branchId) {
  const [ticketsRes, queueRes] = await Promise.all([
    supabase.from("tickets").select("*").eq("branch_id", branchId).order("sort_order", { ascending: true }),
    supabase.from("queues").select("*").eq("branch_id", branchId).maybeSingle(),
  ]);
  if (ticketsRes.error) throw ticketsRes.error;
  if (queueRes.error) throw queueRes.error;
  return {
    tickets: (ticketsRes.data || []).map(mapTicket),
    currentNum: queueRes.data?.current_num ?? 0,
    nextNum: queueRes.data?.next_num ?? 1,
    isOpen: queueRes.data?.is_open ?? true,
  };
}

/* ---------- RPC chaqiruvlari (02_queue_functions.sql) ---------- */
export async function rpcJoinQueue(branchId, customerName, type = "online") {
  const { data, error } = await supabase.rpc("join_queue", {
    p_branch_id: branchId,
    p_customer_name: customerName,
    p_type: type,
  });
  if (error) throw error;
  return mapTicket(data);
}

export async function rpcAdvanceQueue(branchId) {
  const { data, error } = await supabase.rpc("advance_queue", { p_branch_id: branchId });
  if (error) throw error;
  return mapTicket(data);
}

export async function rpcRejectCurrent(branchId) {
  const { data, error } = await supabase.rpc("reject_current", { p_branch_id: branchId });
  if (error) throw error;
  return mapTicket(data);
}

export async function rpcRejectTicket(ticketId) {
  const { data, error } = await supabase.rpc("reject_ticket", { p_ticket_id: ticketId });
  if (error) throw error;
  return mapTicket(data);
}

export async function rpcDelayTicket(ticketId, positions) {
  const { data, error } = await supabase.rpc("delay_ticket", { p_ticket_id: ticketId, p_positions: positions });
  if (error) throw error;
  return mapTicket(data);
}

export async function rpcLeaveQueue(ticketId) {
  const { data, error } = await supabase.rpc("leave_queue", { p_ticket_id: ticketId });
  if (error) throw error;
  return mapTicket(data);
}

/* Admin navbatni tozalash: kutayotgan/joriy ticketlarni rad etib, current_num=0. */
export async function resetBranchQueue(branchId) {
  const { error: tErr } = await supabase
    .from("tickets")
    .update({ status: "rejected" })
    .eq("branch_id", branchId)
    .in("status", ["waiting", "current"]);
  if (tErr) throw tErr;
  const { error: qErr } = await supabase.from("queues").update({ current_num: 0 }).eq("branch_id", branchId);
  if (qErr) throw qErr;
}

/* Filialning tickets va queues jadvallaridagi o'zgarishlariga realtime obuna.
   onChange har qanday o'zgarishda chaqiriladi. Tozalash uchun qaytgan funksiyani chaqiring. */
export function subscribeBranchQueue(branchId, onChange, keyPrefix = "queue") {
  const channel = supabase
    .channel(`${keyPrefix}:${branchId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tickets", filter: `branch_id=eq.${branchId}` },
      onChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "queues", filter: `branch_id=eq.${branchId}` },
      onChange,
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
