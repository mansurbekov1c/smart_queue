// =====================================================
// Smart Queue — "create-admin" Edge Function
// Super admin yangi admin hisobini XAVFSIZ yaratadi (service_role kaliti bilan).
//
// Deploy (o'zgartirgach QAYTA deploy qiling):
//   supabase functions deploy create-admin
//
// Loglar: Supabase Dashboard → Edge Functions → create-admin → Logs
// =====================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

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
  try {
    if (req.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    console.log("[create-admin] env mavjud:", {
      url: !!SUPABASE_URL,
      service: !!SERVICE_ROLE,
      anon: !!ANON_KEY,
    });
    if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
      return json({ error: "Server sozlanmagan (env yetishmayapti)" }, 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Chaqiruvchi kim?
    const authHeader = req.headers.get("Authorization") || "";
    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: callerData, error: callerErr } = await caller.auth.getUser();
    if (callerErr || !callerData?.user) {
      console.log("[create-admin] getUser xatosi:", callerErr?.message);
      return json({ error: "Sessiya yaroqsiz — qayta kiring" }, 401);
    }
    const callerUser = callerData.user;

    // 2) Chaqiruvchi super_admin bo'lishi shart
    const { data: callerProfile, error: profErr } = await admin
      .from("profiles")
      .select("role")
      .eq("id", callerUser.id)
      .single();
    if (profErr) {
      console.log("[create-admin] caller profil o'qish xatosi:", profErr.message);
      return json({ error: "Profil topilmadi" }, 403);
    }
    console.log("[create-admin] caller role:", callerProfile?.role);
    if (callerProfile?.role !== "super_admin") {
      return json({ error: "Ruxsat yo'q (faqat super admin)" }, 403);
    }

    // 3) Kirish ma'lumotlari
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
      return json({ error: "Noto'g'ri so'rov" }, 400);
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

    // 4) Hisobni yaratish
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });
    if (createErr || !created?.user) {
      const msg = createErr?.message || "";
      console.log("[create-admin] createUser xatosi:", msg);
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        return json({ error: "Bu email band" }, 409);
      }
      return json({ error: msg || "Foydalanuvchi yaratilmadi" }, 400);
    }
    const newUserId = created.user.id;
    console.log("[create-admin] user yaratildi:", newUserId);

    // 5) Filialga biriktirish + role='admin'
    if (branchId) {
      const { error: clearErr } = await admin
        .from("profiles")
        .update({ branch_id: null })
        .eq("branch_id", branchId)
        .neq("id", newUserId);
      if (clearErr) console.log("[create-admin] eski adminni bo'shatish xatosi:", clearErr.message);
    }
    const { error: profileErr } = await admin.from("profiles").upsert({
      id: newUserId,
      role: "admin",
      branch_id: branchId,
      first_name: firstName,
      last_name: lastName,
      email,
    });
    if (profileErr) {
      console.log("[create-admin] profil upsert xatosi:", profileErr.message);
      await admin.auth.admin.deleteUser(newUserId);
      return json({ error: profileErr.message || "Profilni sozlashda xato" }, 400);
    }

    console.log("[create-admin] muvaffaqiyat:", newUserId);
    return json({ userId: newUserId });
  } catch (e) {
    console.error("[create-admin] kutilmagan xato:", e?.message, e);
    return json({ error: e?.message || "Ichki server xatosi" }, 500);
  }
});
