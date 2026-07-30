"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./supabase-config";

let client: SupabaseClient | null = null;

export function isBrowserSupabaseConfigured() {
  return Boolean(getSupabasePublicConfig());
}

export function getBrowserSupabase() {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  if (!client) {
    client = createBrowserClient(
      config.url,
      config.publishableKey,
    ) as SupabaseClient;
  }
  return client;
}
