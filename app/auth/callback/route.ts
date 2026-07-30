import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "@/lib/supabase-config";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const config = getSupabasePublicConfig();

  if (!code || !config) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_callback", requestUrl.origin),
    );
  }

  const cookieStore = await cookies();
  let response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
        response = NextResponse.redirect(new URL(next, requestUrl.origin));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_callback", requestUrl.origin),
    );
  }

  return response;
}
