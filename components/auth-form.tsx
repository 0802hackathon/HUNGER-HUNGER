"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMessage(
        "Supabaseの環境変数が未設定です。.env.localを設定すると認証を利用できます。",
      );
      return;
    }

    setPending(true);
    setMessage("");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const displayName = String(formData.get("displayName") ?? "");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { display_name: displayName },
              emailRedirectTo: `${window.location.origin}/dashboard`,
            },
          });

    setPending(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("確認メールを送信しました。メール内のリンクを開いてください。");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="auth-card">
      <div className="segmented-control" aria-label="認証方法">
        <button
          aria-pressed={mode === "login"}
          onClick={() => setMode("login")}
          type="button"
        >
          ログイン
        </button>
        <button
          aria-pressed={mode === "signup"}
          onClick={() => setMode("signup")}
          type="button"
        >
          新規登録
        </button>
      </div>

      <form action={submit} className="stack-form">
        {mode === "signup" && (
          <label>
            <span>表示名</span>
            <input
              autoComplete="nickname"
              minLength={2}
              name="displayName"
              placeholder="hunter_name"
              required
            />
          </label>
        )}
        <label>
          <span>メールアドレス</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
        <label>
          <span>パスワード</span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "処理中…" : mode === "login" ? "ログイン" : "アカウントを作成"}
        </button>
      </form>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
