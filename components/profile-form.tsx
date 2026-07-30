"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getBrowserSupabase,
  isBrowserSupabaseConfigured,
} from "@/lib/supabase-browser";

type ProfileValues = {
  displayName: string;
  bio: string;
  githubUrl: string;
  experienceSummary: string;
  learningSkills: string;
  experiencedSkills: string;
};

const emptyValues: ProfileValues = {
  displayName: "",
  bio: "",
  githubUrl: "",
  experienceSummary: "",
  learningSkills: "",
  experiencedSkills: "",
};

function splitLines(value: FormDataEntryValue | null) {
  return Array.from(
    new Set(
      String(value ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function ProfileForm() {
  const [values, setValues] = useState<ProfileValues>(emptyValues);
  const [loading, setLoading] = useState(isBrowserSupabaseConfigured());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = await getBrowserSupabase();
      if (!supabase) return;
      const userResult = await supabase!.auth.getUser();
      const user = userResult.data.user;
      if (!user) {
        setLoading(false);
        return;
      }
      setAuthenticated(true);

      const { data: profileId } = await supabase!.rpc("current_profile_id");
      if (!profileId) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase!
        .from("profiles")
        .select(
          "id, display_name, bio, github_url, experience_summary, user_skills(name, kind)",
        )
        .eq("id", profileId)
        .maybeSingle();

      const skills =
        (profile?.user_skills as Array<{ name: string; kind: string }> | null) ??
        [];
      setValues({
        displayName:
          String(profile?.display_name ?? "") ||
          String(user.user_metadata?.display_name ?? ""),
        bio: String(profile?.bio ?? ""),
        githubUrl: String(profile?.github_url ?? ""),
        experienceSummary: String(profile?.experience_summary ?? ""),
        learningSkills: skills
          .filter((skill) => skill.kind === "learning")
          .map((skill) => skill.name)
          .join("\n"),
        experiencedSkills: skills
          .filter((skill) => skill.kind === "experienced")
          .map((skill) => skill.name)
          .join("\n"),
      });
      setLoading(false);
    }

    void load();
  }, []);

  async function submit(formData: FormData) {
    const supabase = await getBrowserSupabase();
    const session = supabase ? await supabase.auth.getSession() : null;
    const token = session?.data.session?.access_token;
    if (!token) {
      setMessage("プロフィールを保存するにはログインしてください。");
      return;
    }

    setPending(true);
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: String(formData.get("displayName") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        githubUrl: String(formData.get("githubUrl") ?? ""),
        experienceSummary: String(formData.get("experienceSummary") ?? ""),
        learningSkills: splitLines(formData.get("learningSkills")),
        experiencedSkills: splitLines(formData.get("experiencedSkills")),
      }),
    });
    const result = (await response.json()) as { message?: string };
    setPending(false);
    setMessage(
      response.ok
        ? "プロフィールを保存しました。"
        : result.message ?? "プロフィールを保存できませんでした。",
    );
  }

  if (loading) {
    return <div className="form-page-card">プロフィールを読み込んでいます…</div>;
  }

  if (!authenticated) {
    return (
      <div className="form-page-card empty-panel">
        <h2>ログインが必要です</h2>
        <p>
          Supabaseを設定してログインすると、スキルやGitHubプロフィールを登録できます。
        </p>
        <Link className="button button-primary" href="/login">
          ログインへ
        </Link>
      </div>
    );
  }

  return (
    <form action={submit} className="form-page-card stack-form profile-editor">
      <label>
        <span>表示名</span>
        <input
          defaultValue={values.displayName}
          maxLength={50}
          minLength={2}
          name="displayName"
          required
        />
      </label>
      <label>
        <span>自己紹介</span>
        <textarea defaultValue={values.bio} maxLength={500} name="bio" rows={4} />
      </label>
      <label>
        <span>GitHubプロフィールURL</span>
        <input
          defaultValue={values.githubUrl}
          name="githubUrl"
          placeholder="https://github.com/your-name"
          type="url"
        />
      </label>
      <label>
        <span>実務・学習経験</span>
        <textarea
          defaultValue={values.experienceSummary}
          maxLength={1000}
          name="experienceSummary"
          rows={5}
        />
      </label>
      <div className="two-column-fields">
        <label>
          <span>学習中の技術（1行に1つ）</span>
          <textarea
            defaultValue={values.learningSkills}
            name="learningSkills"
            placeholder={"Next.js\nSupabase"}
            rows={6}
          />
        </label>
        <label>
          <span>経験のある技術（1行に1つ）</span>
          <textarea
            defaultValue={values.experiencedSkills}
            name="experiencedSkills"
            placeholder={"HTML\nCSS\nJavaScript"}
            rows={6}
          />
        </label>
      </div>
      <div className="form-actions">
        <button className="button button-primary" disabled={pending} type="submit">
          {pending ? "保存中…" : "プロフィールを保存"}
        </button>
        <Link className="button button-secondary" href="/dashboard">
          ダッシュボードへ戻る
        </Link>
      </div>
      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
