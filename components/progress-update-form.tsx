"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type Props = {
  explorationId: string;
  initialPercent?: number;
  onSaved?: () => void;
};

export function ProgressUpdateForm({
  explorationId,
  initialPercent = 0,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const supabase = getBrowserSupabase();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data.session?.access_token;
    if (!token) {
      setMessage("進捗を記録するにはログインしてください。");
      return;
    }

    setPending(true);
    setMessage("");
    const response = await fetch(
      `/api/explorations/${explorationId}/progress`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: String(formData.get("summary") ?? ""),
          blockers: String(formData.get("blockers") ?? ""),
          progressPercent: Number(formData.get("progressPercent") ?? 0),
          branchUrl: String(formData.get("branchUrl") ?? ""),
          commitUrl: String(formData.get("commitUrl") ?? ""),
          pullRequestUrl: String(formData.get("pullRequestUrl") ?? ""),
          learned: String(formData.get("learned") ?? ""),
          nextSteps: String(formData.get("nextSteps") ?? ""),
        }),
      },
    );
    const result = (await response.json()) as { message?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(result.message ?? "進捗を保存できませんでした。");
      return;
    }
    setMessage("進捗と学習内容を保存しました。");
    setOpen(false);
    onSaved?.();
  }

  if (!open) {
    return (
      <button
        className="button button-secondary button-small"
        onClick={() => setOpen(true)}
        type="button"
      >
        進捗を更新
      </button>
    );
  }

  return (
    <form action={submit} className="inline-editor stack-form">
      <div className="inline-editor-heading">
        <strong>進捗を記録</strong>
        <button onClick={() => setOpen(false)} type="button">
          閉じる
        </button>
      </div>
      <label>
        <span>現在の状況</span>
        <textarea minLength={3} name="summary" required rows={3} />
      </label>
      <label>
        <span>進捗率: おおよその自己評価</span>
        <input
          defaultValue={initialPercent}
          max={100}
          min={0}
          name="progressPercent"
          type="range"
        />
      </label>
      <label>
        <span>Branch URL（任意）</span>
        <input name="branchUrl" type="url" />
      </label>
      <label>
        <span>Commit URL（任意）</span>
        <input name="commitUrl" type="url" />
      </label>
      <label>
        <span>Pull Request URL（任意）</span>
        <input name="pullRequestUrl" type="url" />
      </label>
      <label>
        <span>困っていること（任意）</span>
        <textarea name="blockers" rows={2} />
      </label>
      <label>
        <span>学んだこと（任意・10文字以上）</span>
        <textarea name="learned" rows={3} />
      </label>
      <label>
        <span>次に試すこと（任意）</span>
        <textarea name="nextSteps" rows={2} />
      </label>
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "保存中…" : "進捗を保存"}
      </button>
      {message && <p className="form-message">{message}</p>}
    </form>
  );
}
