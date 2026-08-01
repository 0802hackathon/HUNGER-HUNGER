"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase-browser";

function getHttpsUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function SiteHeader() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let unsubscribeAuth: (() => void) | undefined;

    async function loadUser() {
      const supabase = await getBrowserSupabase();
      if (!supabase || cancelled) return;

      const syncUser = (user: User | null) => {
        if (cancelled) return;
        setIsAuthenticated(Boolean(user));
        setAvatarUrl(
          [
            user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture,
            ...(user?.identities?.flatMap((identity) => [
              identity.identity_data?.avatar_url,
              identity.identity_data?.picture,
            ]) ?? []),
          ]
            .map(getHttpsUrl)
            .find((value): value is string => Boolean(value)) ?? null,
        );
      };

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => syncUser(session?.user ?? null),
      );
      unsubscribeAuth = () => authListener.subscription.unsubscribe();

      const { data } = await supabase.auth.getUser();
      syncUser(data.user);
    }
    void loadUser();
    return () => {
      cancelled = true;
      unsubscribeAuth?.();
    };
  }, []);

  async function logout() {
    const supabase = await getBrowserSupabase();
    if (!supabase) return;

    setLogoutPending(true);
    setLogoutFailed(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLogoutPending(false);
      setLogoutFailed(true);
      return;
    }

    setIsAuthenticated(false);
    setAvatarUrl(null);
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="HUNGER HUNGER ホーム">
          <span className="brand-mark" aria-hidden="true">
            H×H
          </span>
          <span className="brand-copy">
            <strong>HUNGER×HUNGER</strong>
          </span>
        </Link>

        <nav className="global-nav" aria-label="メインナビゲーション">
          <Link href="/projects">Projectを探す</Link>
          <Link href="/about">仕組みを知る</Link>
        </nav>

        <div className="header-actions">
          <Link className="button button-ghost-dark" href="/projects/new">
            投稿する
          </Link>
          <Link
            aria-label={isAuthenticated ? "プロフィールを開く" : "ログイン"}
            className={isAuthenticated ? "avatar-link avatar-link-icon" : "avatar-link"}
            href={isAuthenticated ? "/dashboard" : "/login"}
          >
            {isAuthenticated ? (
              <span
                className={
                  avatarUrl
                    ? "header-avatar header-avatar-image"
                    : "header-avatar"
                }
                style={
                  avatarUrl
                    ? {
                        backgroundImage:
                          "url(" + JSON.stringify(avatarUrl) + ")",
                      }
                    : undefined
                }
              >
                {!avatarUrl && (
                  <span className="header-avatar-placeholder" aria-hidden="true" />
                )}
              </span>
            ) : (
              <span>ログイン</span>
            )}
          </Link>
          {isAuthenticated && (
            <button
              className="button button-ghost-dark header-logout-button"
              disabled={logoutPending}
              onClick={logout}
              type="button"
            >
              {logoutPending
                ? "ログアウト中…"
                : logoutFailed
                  ? "ログアウトを再試行"
                  : "ログアウト"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
