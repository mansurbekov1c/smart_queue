import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase sozlanmagan: EXPO_PUBLIC_SUPABASE_URL va EXPO_PUBLIC_SUPABASE_ANON_KEY ni .env faylga qo'shing (.env.example ga qarang).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/* Supabase'ning React Native uchun MAJBURIY talabi: ilova old planда (active)
   bo'lганda access tokenni avtomatik yangilab turish, fon rejimida to'xtatish.
   Busiz standalone build'da sessiya ishonchli tiklanmaydi — token muddati
   o'tgach yangilanmay qoladi va ilova qayta ochilganда qayta login so'raydi.
   https://supabase.com/docs/guides/auth/quickstarts/react-native */
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
