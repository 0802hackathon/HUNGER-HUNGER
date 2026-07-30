"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./supabase-config";

let clientPromise: Promise<SupabaseClient> | null = null;

export function isBrowserSupabaseConfigured() {
  return Boolean(getSupabasePublicConfig());
}

export async function getBrowserSupabase() {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/ssr").then(
      ({ createBrowserClient }) =>
        createBrowserClient(
          config.url,
          config.publishableKey,
        ) as SupabaseClient,
    );
  }
  return clientPromise;
}
