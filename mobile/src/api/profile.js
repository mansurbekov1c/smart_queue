import { supabase } from "../lib/supabase";

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, branch_id, phone, first_name, last_name, coins")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchUserCoins(userId) {
  const { data, error } = await supabase.from("profiles").select("coins").eq("id", userId).single();
  if (error) throw error;
  return data.coins;
}

export async function fetchUserServedCount(userId) {
  const { count, error } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "done");
  if (error) throw error;
  return count || 0;
}
