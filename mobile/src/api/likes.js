import { supabase } from "../lib/supabase";

export async function fetchLikedBranchIds(userId) {
  const { data, error } = await supabase.from("likes").select("branch_id").eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => row.branch_id);
}

export async function addLike(userId, branchId) {
  const { error } = await supabase.from("likes").insert({ user_id: userId, branch_id: branchId });
  if (error) throw error;
}

export async function removeLike(userId, branchId) {
  const { error } = await supabase.from("likes").delete().eq("user_id", userId).eq("branch_id", branchId);
  if (error) throw error;
}
