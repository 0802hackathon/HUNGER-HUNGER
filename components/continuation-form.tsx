"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function ContinuationForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const supabase = await getBrowserSupabase();
    if (!supabase) {
      setMessage(
        "Supabase未接続のためシュートは保存されません。.env.localを設定してください。",
      );
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setMessage("シュートするにはログインしてください。");
      return;
    }

    setPending(true);
    const payload = {
      sourceProjectId: projectId,
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      changesMade: String(formData.get("changesMade") ?? ""),
      repositoryUrl: String(formData.get("repositoryUrl") ?? ""),
      demoUrl: String(formData.get("demoUrl") ?? ""),
      pullRequestUrl: String(formData.get("pullRequestUrl") ?? ""),
      learningOutcome: String(formData.get("learningOutcome") ?? ""),
      licenseIdentifier: String(formData.get("licenseIdentifier") ?? ""),
      rightsConfirmed: formData.get("rightsConfirmed") === "on",
      secretsConfirmed: formData.get("secretsConfirmed") === "on",
    };
    const response = await fetch(`/api/projects/${projectId}/continuations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { message?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(result.message ?? "シュートを保存できませんでした。");
      return;
    }
    router.push(`/projects/${projectId}#shoots`);
    router.refresh();
  }

  return (
    <form action={submit} className="shoot-form stack-form">
      <label>
        <span>成果のタイトル</span>
        <input
          name="title"
          placeholder="タイムゾーン対応とテストを追加"
          required
        />
      </label>
      <label>
        <span>概要</span>
        <textarea minLength={20} name="summary" required rows={3} />
      </label>
      <label>
        <span>追加・変更したこと</span>
        <textarea minLength={20} name="changesMade" required rows={7} />
      </label>
      <label>
        <span>Forkまたは成果Repository URL</span>
        <input
          name="repositoryUrl"
          placeholder="https://github.com/you/fork"
          required
          type="url"
        />
      </label>
      <div className="two-column-fields">
        <label>
          <span>Pull Request URL（任意）</span>
          <input name="pullRequestUrl" type="url" />
        </label>
        <label>
          <span>デモURL（任意）</span>
          <input name="demoUrl" type="url" />
        </label>
      </div>
      <label>
        <span>学んだこと（任意）</span>
        <textarea name="learningOutcome" rows={5} />
      </label>
      <label>
        <span>成果に適用するライセンス</span>
        <input defaultValue="MIT" name="licenseIdentifier" required />
      </label>
      <label className="check-row">
        <input name="rightsConfirmed" required type="checkbox" />
        <span>元Projectのライセンスと利用条件を確認しました。</span>
      </label>
      <label className="check-row">
        <input name="secretsConfirmed" required type="checkbox" />
        <span>シークレットや個人情報を含まないことを確認しました。</span>
      </label>
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "シュート中…" : "成果をシュートする"}
      </button>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
