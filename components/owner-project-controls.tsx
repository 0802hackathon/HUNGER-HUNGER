"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function OwnerProjectControls({
  projectId,
  ownerId,
  archived,
}: {
  projectId: string;
  ownerId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkOwner() {
      const supabase = await getBrowserSupabase();
      if (!supabase) return;
      const result = await supabase.rpc("current_profile_id");
      if (!cancelled) setIsOwner(result.data === ownerId);
    }
    void checkOwner();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  async function archive() {
    if (
      !window.confirm(
        "募集と新しい進捗登録を停止し、参照専用にします。アーカイブしますか？",
      )
    ) {
      return;
    }
    const supabase = await getBrowserSupabase();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data.session?.access_token;
    if (!token) return;

    setPending(true);
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "archive",
        reason: "投稿者によりアーカイブされました。",
      }),
    });
    const result = (await response.json()) as { message?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(result.message ?? "アーカイブできませんでした。");
      return;
    }
    router.refresh();
  }

  if (!isOwner) return null;

  return (
    <section className="sidebar-section owner-controls">
      <h2>投稿者向け管理</h2>
      <p>Projectの所有者はあなたのままです。</p>
      {!archived && (
        <button
          className="button button-danger button-block"
          disabled={pending}
          onClick={archive}
          type="button"
        >
          {pending ? "処理中…" : "Projectをアーカイブ"}
        </button>
      )}
      {archived && <span className="status-label">参照専用</span>}
      {message && <p className="form-message">{message}</p>}
    </section>
  );
}
