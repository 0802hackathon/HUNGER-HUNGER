"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type Props = {
  projectId: string;
  repositoryUrl: string;
  disabled?: boolean;
};

export function BeyondButton({
  projectId,
  repositoryUrl,
  disabled = false,
}: Props) {
  const [message, setMessage] = useState("");

  async function beyond() {
    if (disabled) return;
    window.open(repositoryUrl, "_blank", "noopener,noreferrer");

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMessage("Repositoryを開きました。Supabase接続後は学習履歴も記録できます。");
      return;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setMessage("Repositoryを開きました。ログインするとビヨンド履歴を残せます。");
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/explorations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessage(
      response.ok
        ? "ビヨンドを記録しました。自分のForkで自由に開発してください。"
        : "Repositoryを開きました。学習記録はあとからDashboardで追加できます。",
    );
  }

  return (
    <div className="beyond-action">
      <button
        className="button button-primary button-large"
        disabled={disabled}
        onClick={beyond}
        type="button"
      >
        <span aria-hidden="true">↗</span> ビヨンドする
      </button>
      <span className="action-caption">
        応募や承認はありません。自分の環境で開発を始めます。
      </span>
      {message && (
        <p className="inline-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
