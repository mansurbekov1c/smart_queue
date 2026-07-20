import { supabase } from "../lib/supabase";

/* key (name) — ichki barqaror kalit (ikonka/tarjima/branches.category bilan
   bog'liq, o'zgarmaydi). label — foydalanuvchiga ko'rinadigan, super admin
   tahrirlaydigan matn. */
function mapCategoryRow(row) {
  return { id: row.id, key: row.name, label: row.label || row.name, sortOrder: row.sort_order };
}

export function subscribeCategories(onChange) {
  const channel = supabase
    .channel("categories-all")
    .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, onChange)
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return (data || []).map(mapCategoryRow);
}

export async function createCategory(name) {
  const { data: lastRow } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (lastRow?.sort_order ?? 0) + 1;
  const { data, error } = await supabase
    .from("categories")
    // key = kichik harfli barqaror kalit; label = ko'rinadigan matn (asl ko'rinishi)
    .insert({ name: name.trim().toLowerCase(), label: name.trim(), sort_order: nextOrder })
    .select()
    .single();
  if (error) throw error;
  return mapCategoryRow(data);
}

/* Faqat label (ko'rinadigan matn) yangilanadi — name/key tegilmaydi. */
export async function updateCategoryLabel(id, label) {
  const { data, error } = await supabase
    .from("categories")
    .update({ label: label.trim() })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return { affected: data?.length || 0 };
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

/* Har bir kategoriyaning sort_order'ini yangi tartibga ko'ra yozadi.
   .select() qo'shildi: agar RLS jimgina bloklasa (xatosiz 0 qator), buni
   affected orqali aniqlash mumkin — chaqiruvchi shuni tekshiradi. */
export async function reorderCategories(orderedIds) {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("categories").update({ sort_order: index + 1 }).eq("id", id).select("id"),
    ),
  );
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw firstError;
  const affected = results.reduce((n, r) => n + (r.data?.length || 0), 0);
  return { affected, total: orderedIds.length };
}
