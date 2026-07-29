"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function SiteHeader() {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setDisplayName(
        data.user?.user_metadata?.display_name ??
          data.user?.email?.split("@")[0] ??
          null,
      );
    });
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="HUNGER HUNGER ホーム">
          <span className="brand-mark" aria-hidden="true">
            H×H
          </span>
          <span>HUNGER×HUNGER</span>
        </Link>

        <nav className="global-nav" aria-label="メインナビゲーション">
          <Link href="/projects">プロジェクト</Link>
          <Link href="/about">このサービスについて</Link>
        </nav>

        <div className="header-actions">
          <Link className="header-search" href="/projects">
            <span aria-hidden="true">⌕</span>
            <span>プロジェクトを探す</span>
            <kbd>/</kbd>
          </Link>
          <Link className="button button-ghost-dark" href="/projects/new">
            投稿する
          </Link>
          <Link className="avatar-link" href={displayName ? "/dashboard" : "/login"}>
            <span className="avatar" aria-hidden="true">
              {(displayName ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="desktop-only">{displayName ?? "ログイン"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
