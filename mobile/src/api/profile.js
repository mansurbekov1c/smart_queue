import { supabase } from "../lib/supabase";

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, branch_id, phone, first_name, last_name")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
