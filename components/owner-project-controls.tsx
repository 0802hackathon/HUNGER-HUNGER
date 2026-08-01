"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function OwnerProjectControls({
  projectId,
  projectTitle,
  archived,
  sample,
}: {
  projectId: string;
  projectTitle: string;
  archived: boolean;
  sample: boolean;
}) {
  const router = useRouter();
  const [canManage, setCanManage] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkOwner() {
      const supabase = await getBrowserSupabase();
      if (!supabase) return;
      const result = sample
        ? await supabase.rpc("current_profile_id")
        : await supabase.rpc("can_manage_project", {
            p_project_id: projectId,
          });
      if (!cancelled) {
        setCanManage(
          Boolean(result.data),
        );
      }
    }
    void checkOwner();

    return () => {
      cancelled = true;
    };
  }, [projectId, sample]);

  async function archive() {
    if (
      !window.confirm(
        "新しいビヨンドとシュートを停止し、参照専用にします。アーカイブしますか？",
      )
    ) {
      return;
    }
    const supabase = await getBrowserSupabase();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data.session?.access_token;
    if (!token) {
      setMessage("Projectを管理するにはログインしてください。");
      return;
    }

    setPending(true);
    setMessage("");
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

  async function deleteProject() {
    const enteredTitle = window.prompt(
      `${sample ? "この操作は取り消せません。" : "関連するビヨンド、進捗、学習成果、シュートも削除されます。"}\n削除するには「${projectTitle}」と入力してください。`,
    );
    if (enteredTitle === null) return;
    if (enteredTitle.trim() !== projectTitle) {
      setMessage("Project名が一致しないため、削除を中止しました。");
      return;
    }

    const supabase = await getBrowserSupabase();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data.session?.access_token;
    if (!token) {
      setMessage("Projectを管理するにはログインしてください。");
      return;
    }

    setPending(true);
    setMessage("");
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = (await response.json()) as { message?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(result.message ?? "Projectを削除できませんでした。");
      return;
    }
    router.push("/projects");
    router.refresh();
  }

  if (!canManage) return null;

  return (
    <section className="sidebar-section owner-controls">
      <h2>{sample ? "サンプルProject管理" : "投稿者向け管理"}</h2>
      <p>
        {sample
          ? "変更はあなたのサンプル表示にだけ反映されます。"
          : "作成者または管理権限を持つユーザーが操作できます。"}
      </p>
      {!archived && (
        <button
          className="button button-secondary button-block"
          disabled={pending}
          onClick={archive}
          type="button"
        >
          {pending ? "処理中…" : "Projectをアーカイブ"}
        </button>
      )}
      {archived && <span className="status-label">参照専用</span>}
      <button
        className="button button-danger button-block"
        disabled={pending}
        onClick={deleteProject}
        type="button"
      >
        {pending ? "処理中…" : "Projectを完全に削除"}
      </button>
      {!sample && <small>完全削除では関連する学習履歴も削除されます。</small>}
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
