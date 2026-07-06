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

export async function createBranch({ name, category, city, district, address, lat, lng }) {
  const { data, error } = await supabase
    .from("branches")
    .insert({
      name: name.trim(),
      category,
      city: city.trim(),
      district: district.trim(),
      address: address.trim(),
      lat: lat ?? null,
      lng: lng ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* Yangi admin yaratish. supabase.auth.signUp() joriy mijoz sessiyasini
   yangi foydalanuvchinikiga almashtirib qo'yadi — shu sababli avval super
   adminning sessiyasi saqlab olinadi, yangi hisob yaratilgach super admin
   sessiyasi tiklanadi, so'ng (endi yana super admin sifatida) profiles
   qatoridagi role='admin' va branch_id o'rnatiladi (profiles_update_super_admin
   RLS siyosati orqali ruxsat etiladi). */
export async function createAdmin({ firstName, lastName, email, password, branchId }) {
  const {
    data: { session: superSession },
  } = await supabase.auth.getSession();
  if (!superSession) throw new Error("Sessiya topilmadi");

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
    },
  });
  if (signUpError) throw signUpError;
  const newUserId = signUpData.user?.id;

  const { error: restoreError } = await supabase.auth.setSession({
    access_token: superSession.access_token,
    refresh_token: superSession.refresh_token,
  });
  if (restoreError) throw restoreError;

  if (!newUserId) throw new Error("Yangi foydalanuvchi yaratilmadi");

  const { error: promoteError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", newUserId);
  if (promoteError) throw promoteError;

  if (branchId) {
    await assignAdminToBranch(newUserId, branchId);
  }

  return newUserId;
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
