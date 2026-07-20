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

/* Yangi admin yaratish — "create-admin" Edge Function orqali (service_role
   kaliti bilan serverda ishlaydi). Mobil ilova sessiyasiga umuman tegmaydi,
   avvalgi mo'rt "sessiyani saqlab-tiklash" hiylasi endi kerak emas.
   Funksiya hisobni yaratadi, role='admin' va (berilsa) branch_id belgilaydi. */
export async function createAdmin({ firstName, lastName, email, password, branchId }) {
  const { data, error } = await supabase.functions.invoke("create-admin", {
    body: { firstName, lastName, email, password, branchId: branchId || null },
  });

  if (error) {
    // Edge Function 4xx/5xx qaytarsa — javob tanasidan aniq xabarni chiqaramiz
    let message = error?.message || "Amal bajarilmadi";
    const ctx = error?.context;
    if (ctx && typeof ctx.text === "function") {
      try {
        const raw = await ctx.text();
        try {
          const body = JSON.parse(raw);
          if (body?.error) message = body.error;
        } catch (_) {
          if (raw) message = raw; // JSON emas — xom matnni ko'rsatamiz
        }
      } catch (_) {
        // javob tanasini o'qib bo'lmadi
      }
    }
    console.error("createAdmin Edge Function xatosi:", message, error);
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);

  return data?.userId;
}

export async function updateBranch(branchId, fields) {
  const { error } = await supabase.from("branches").update(fields).eq("id", branchId);
  if (error) throw error;
}

export async function deleteBranch(branchId) {
  const { error } = await supabase.from("branches").delete().eq("id", branchId);
  if (error) throw error;
}

/* Filialga admin biriktirish — server tomonda (13_security_hardening.sql)
   bitta tranzaksiyada: shu filialdagi eski adminni bo'shatadi va tanlangan
   adminning branch_id'sini o'rnatadi. branch_id ustuni endi to'g'ridan-to'g'ri
   yangilanmaydi, faqat is_super_admin() tekshiruvli RPC orqali. */
export async function assignAdminToBranch(adminId, branchId) {
  const { error } = await supabase.rpc("assign_admin_branch", {
    p_admin_id: adminId,
    p_branch_id: branchId,
  });
  if (error) throw error;
}

export async function unassignAdmin(adminId) {
  const { error } = await supabase.rpc("unassign_admin_branch", { p_admin_id: adminId });
  if (error) throw error;
}
