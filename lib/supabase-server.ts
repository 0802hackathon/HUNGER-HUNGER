import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./supabase-config";

export async function getServerSupabase() {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // Pages only read the current session. Token refreshes continue to be
      // handled by the browser client and the OAuth callback.
      setAll() {},
    },
  });
}
