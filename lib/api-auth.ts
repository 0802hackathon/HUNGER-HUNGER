import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./supabase-config";

export function getAuthenticatedClient(request: Request) {
  const config = getSupabasePublicConfig();
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!config || !token) return null;
  return {
    client: createClient(config.url, config.publishableKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    token,
  };
}
