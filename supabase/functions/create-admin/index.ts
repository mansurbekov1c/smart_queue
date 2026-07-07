// =====================================================
// Smart Queue — "create-admin" Edge Function
// Super admin yangi admin hisobini XAVFSIZ yaratadi.
//
// Nega kerak: mobil ilovada supabase.auth.signUp() joriy (super admin)
// sessiyasini yangi hisobga almashtirib qo'yadi — bu mo'rt "sessiyani
// saqlab-tiklash" hiylasini talab qilardi. Bu funksiya esa service_role
// kaliti bilan alohida serverda ishlaydi: super adminning sessiyasiga
// umuman tegmaydi, hech qanday hiyla yo'q.
//
// Deploy:
//   supabase login
//   supabase link --project-ref <PROJECT_REF>
//   supabase functions deploy create-admin
// =====================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // service_role klienti — RLS'ni chetlab o'tadi, hisob yaratadi/rollarni belgilaydi
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Chaqiruvchi kim? — uning JWT'si orqali aniqlaymiz
  const authHeader = req.headers.get("Authorization") || "";
  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user: callerUser },
  } = await caller.auth.getUser();
  if (!callerUser) {
    return json({ error: "not authenticated" }, 401);
  }

  // 2) Chaqiruvchi super_admin bo'lishi shart
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", callerUser.id)
    .single();
  if (callerProfile?.role !== "super_admin") {
    return json({ error: "not authorized" }, 403);
  }

  // 3) Kirish ma'lumotlarini tekshirish
  let payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    branchId?: string | null;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid body" }, 400);
  }

  const firstName = (payload.firstName || "").trim();
  const lastName = (payload.lastName || "").trim();
  const email = (payload.email || "").trim().toLowerCase();
  const password = payload.password || "";
  const branchId = payload.branchId || null;

  if (!firstName || !lastName || !email || !password) {
    return json({ error: "Barcha maydonlarni to'ldiring" }, 400);
  }
  if (password.length < 6) {
    return json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak" }, 400);
  }

  // 4) Hisobni yaratish (email_confirm: true — admin darhol kira oladi)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (createErr || !created?.user) {
    const msg = createErr?.message || "";
    if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
      return json({ error: "Bu email band" }, 409);
    }
    return json({ error: msg || "Foydalanuvchi yaratilmadi" }, 400);
  }
  const newUserId = created.user.id;

  // 5) Filialga biriktirish (bitta filialda bitta admin) + rolni belgilash.
  //    service_role RLS'ni chetlab o'tadi, shuning uchun to'g'ridan-to'g'ri.
  if (branchId) {
    await admin.from("profiles").update({ branch_id: null }).eq("branch_id", branchId).neq("id", newUserId);
  }
  const { error: profileErr } = await admin
    .from("profiles")
    .upsert({
      id: newUserId,
      role: "admin",
      branch_id: branchId,
      first_name: firstName,
      last_name: lastName,
      email,
    });
  if (profileErr) {
    // Hisob yaratilgan-u, profil sozlanmagan bo'lsa — hisobni tozalab, xato qaytaramiz
    await admin.auth.admin.deleteUser(newUserId);
    return json({ error: profileErr.message || "Profilni sozlashda xato" }, 400);
  }

  return json({ userId: newUserId });
});
