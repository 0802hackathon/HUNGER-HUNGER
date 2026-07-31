"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function SiteHeader() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const supabase = await getBrowserSupabase();
      if (!supabase || cancelled) return;
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setDisplayName(
          data.user?.user_metadata?.display_name ??
            data.user?.email?.split("@")[0] ??
            null,
        );
      }
    }
    void loadUser();

    const openProjectSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key === "/" && !isTyping && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        router.push("/projects");
      }
    };

    window.addEventListener("keydown", openProjectSearch);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", openProjectSearch);
    };
  }, [router]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="HUNGER HUNGER ホーム">
          <span className="brand-mark" aria-hidden="true">
            H×H
          </span>
          <span className="brand-copy">
            <strong>HUNGER×HUNGER</strong>
            <small>OPEN PROJECTS</small>
          </span>
        </Link>

        <nav className="global-nav" aria-label="メインナビゲーション">
          <Link href="/projects">Projectを探す</Link>
          <Link href="/about">仕組みを知る</Link>
        </nav>

        <div className="header-actions">
          <Link
            aria-label="Projectを検索する。スラッシュキーでも開けます"
            className="header-search"
            href="/projects"
          >
            <span aria-hidden="true">⌕</span>
            <span>プロジェクトを探す</span>
            <kbd>/</kbd>
          </Link>
          <Link className="button button-ghost-dark" href="/projects/new">
            投稿する
          </Link>
          <Link
            aria-label={displayName ? `${displayName}のダッシュボード` : "ログイン"}
            className="avatar-link"
            href={displayName ? "/dashboard" : "/login"}
          >
            <span className="desktop-only">{displayName ?? "ログイン"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
