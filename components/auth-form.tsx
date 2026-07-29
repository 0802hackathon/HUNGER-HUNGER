"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type SocialProvider = {
  id: Extract<Provider, "github" | "google" | "apple">;
  label: string;
  mark: string;
};

const socialProviders: SocialProvider[] = [
  { id: "github", label: "GitHubアカウントでログイン", mark: "<>" },
  { id: "google", label: "Googleでログイン", mark: "G" },
  { id: "apple", label: "Appleアカウントでログイン", mark: "●" },
];

export function AuthForm({ initialMessage = "" }: { initialMessage?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [emailOpen, setEmailOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState(initialMessage);

  function callbackUrl() {
    return `${window.location.origin}/auth/callback?next=/dashboard`;
  }

  async function signInWithProvider(provider: SocialProvider) {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMessage(
        "Supabaseの環境変数が未設定です。接続後にソーシャルログインを利用できます。",
      );
      return;
    }

    setPending(provider.id);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider.id,
      options: {
        redirectTo: callbackUrl(),
        scopes: provider.id === "apple" ? "name email" : undefined,
      },
    });

    if (error) {
      setPending(null);
      setMessage(
        `${provider.label}を開始できませんでした。Provider設定を確認してください。`,
      );
    }
  }

  async function submitEmail(formData: FormData) {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMessage(
        "Supabaseの環境変数が未設定です。.env.localを設定すると認証を利用できます。",
      );
      return;
    }

    setPending("email");
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
              emailRedirectTo: callbackUrl(),
            },
          });

    setPending(null);
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
      <div className="auth-card-heading">
        <span className="eyebrow">SIGN IN</span>
        <h2>アカウントでログイン</h2>
        <p>利用するアカウントを選択してください。</p>
      </div>

      <div className="provider-list">
        {socialProviders.map((provider) => (
          <button
            className={`provider-button provider-${provider.id}`}
            disabled={pending !== null}
            key={provider.id}
            onClick={() => signInWithProvider(provider)}
            type="button"
          >
            <span className="provider-mark" aria-hidden="true">
              {provider.mark}
            </span>
            <span>
              {pending === provider.id ? "接続中…" : provider.label}
            </span>
            <span className="provider-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>

      <div className="auth-divider">
        <span>または</span>
      </div>

      <button
        aria-expanded={emailOpen}
        className="email-login-toggle"
        onClick={() => {
          setEmailOpen((value) => !value);
          setMessage("");
        }}
        type="button"
      >
        <span className="provider-mark email-mark" aria-hidden="true">
          @
        </span>
        <span>その他メールアドレスでログイン</span>
        <span aria-hidden="true">{emailOpen ? "−" : "+"}</span>
      </button>

      {emailOpen && (
        <div className="email-auth-panel">
          <div className="segmented-control" aria-label="メール認証方法">
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

          <form action={submitEmail} className="stack-form">
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
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="button button-primary"
              disabled={pending !== null}
              type="submit"
            >
              {pending === "email"
                ? "処理中…"
                : mode === "login"
                  ? "メールアドレスでログイン"
                  : "メールアドレスで登録"}
            </button>
          </form>
        </div>
      )}

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}

      <p className="auth-privacy-note">
        続行すると、各認証Providerから共有される基本プロフィール情報を
        HUNGER×HUNGERのアカウント作成に使用します。
      </p>
    </div>
  );
}
