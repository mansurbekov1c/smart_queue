import { supabase } from "../lib/supabase";

/* profiles jadvalidagi admin qatorini ilova ichida ishlatiladigan shaklga o'giradi */
function mapAdminRow(row) {
  return {
    id: row.id,
    name: `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.email || "—",
    email: row.email || "—",
    branchId: row.branch_id,
    branchName: row.branches?.name || null,
  };
}

export async function fetchAllAdmins() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, branch_id, branches(name)")
    .eq("role", "admin")
    .order("first_name");
  if (error) throw error;
  return (data || []).map(mapAdminRow);
}

export async function createBranch({ name, category, city, district, address }) {
  const { data, error } = await supabase
    .from("branches")
    .insert({
      name: name.trim(),
      category,
      city: city.trim(),
      district: district.trim(),
      address: address.trim(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBranch(branchId, fields) {
  const { error } = await supabase.from("branches").update(fields).eq("id", branchId);
  if (error) throw error;
}

export async function deleteBranch(branchId) {
  const { error } = await supabase.from("branches").delete().eq("id", branchId);
  if (error) throw error;
}

/* Filialga admin biriktirish — avval shu filialda turgan boshqa adminni
   bo'shatadi (bitta filialda bir vaqtda bitta admin bo'lishi kutiladi),
   so'ng tanlangan adminning branch_id'sini yangilaydi. */
export async function assignAdminToBranch(adminId, branchId) {
  const { error: clearError } = await supabase
    .from("profiles")
    .update({ branch_id: null })
    .eq("branch_id", branchId)
    .neq("id", adminId);
  if (clearError) throw clearError;

  const { error } = await supabase.from("profiles").update({ branch_id: branchId }).eq("id", adminId);
  if (error) throw error;
}

export async function unassignAdmin(adminId) {
  const { error } = await supabase.from("profiles").update({ branch_id: null }).eq("id", adminId);
  if (error) throw error;
}
