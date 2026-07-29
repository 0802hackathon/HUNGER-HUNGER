"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProjectForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setMessage(
        "Supabase未接続のため投稿は保存されません。.env.localを設定してください。",
      );
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setMessage("投稿するにはログインしてください。");
      return;
    }

    setPending(true);
    setMessage("");
    const payload = {
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      motivation: String(formData.get("motivation") ?? ""),
      abandonmentReason: String(formData.get("abandonmentReason") ?? ""),
      currentState: String(formData.get("currentState") ?? ""),
      knownLimitations: String(formData.get("knownLimitations") ?? ""),
      repositoryUrl: String(formData.get("repositoryUrl") ?? ""),
      difficulty: String(formData.get("difficulty") ?? ""),
      recommendedSkillLevel: String(
        formData.get("recommendedSkillLevel") ?? "",
      ),
      licenseIdentifier: String(formData.get("licenseIdentifier") ?? ""),
      usageTerms: String(formData.get("usageTerms") ?? ""),
      technologies: lines(formData.get("technologies")),
      learnableTechnologies: lines(formData.get("learnableTechnologies")),
      implementedFeatures: lines(formData.get("implementedFeatures")),
      plannedFeatures: lines(formData.get("plannedFeatures")),
      rightsConfirmed: formData.get("rightsConfirmed") === "on",
      secretsConfirmed: formData.get("secretsConfirmed") === "on",
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as {
      id?: string;
      message?: string;
    };
    setPending(false);
    if (!response.ok || !result.id) {
      setMessage(result.message ?? "投稿を保存できませんでした。");
      return;
    }
    router.push(`/projects/${result.id}`);
    router.refresh();
  }

  return (
    <form action={submit} className="editor-layout">
      <div className="editor-main">
        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">1</span>
            <div>
              <h2>プロジェクトの概要</h2>
              <p>まず、何を作ろうとしていたのかを伝えます。</p>
            </div>
          </div>
          <label>
            <span>タイトル</span>
            <input maxLength={80} minLength={3} name="title" required />
          </label>
          <label>
            <span>一行説明</span>
            <textarea
              maxLength={240}
              minLength={20}
              name="summary"
              required
              rows={3}
            />
          </label>
          <label>
            <span>なぜ開発を始めたのか</span>
            <textarea minLength={20} name="motivation" required rows={5} />
          </label>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">2</span>
            <div>
              <h2>現在地と断念理由</h2>
              <p>成功談に整えず、次の人が判断できる事実を残します。</p>
            </div>
          </div>
          <label>
            <span>現在の実装状況</span>
            <textarea minLength={20} name="currentState" required rows={5} />
          </label>
          <label>
            <span>開発を断念した理由</span>
            <textarea
              minLength={20}
              name="abandonmentReason"
              required
              rows={5}
            />
          </label>
          <label>
            <span>既知の制約・不具合</span>
            <textarea
              minLength={10}
              name="knownLimitations"
              required
              rows={5}
            />
          </label>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">3</span>
            <div>
              <h2>機能と技術</h2>
              <p>各項目を1行ずつ入力してください。</p>
            </div>
          </div>
          <div className="two-column-fields">
            <label>
              <span>実装済み機能</span>
              <textarea
                name="implementedFeatures"
                placeholder={"メール認証\n学習記録の追加"}
                rows={6}
              />
            </label>
            <label>
              <span>実装予定だった機能</span>
              <textarea
                name="plannedFeatures"
                placeholder={"タイムゾーン対応\n月次レポート"}
                required
                rows={6}
              />
            </label>
            <label>
              <span>使用技術</span>
              <textarea
                name="technologies"
                placeholder={"Next.js\nTypeScript\nSupabase"}
                required
                rows={5}
              />
            </label>
            <label>
              <span>学べる技術</span>
              <textarea
                name="learnableTechnologies"
                placeholder={"認証\nRLS\nE2Eテスト"}
                required
                rows={5}
              />
            </label>
          </div>
          <div className="two-column-fields">
            <label>
              <span>難易度</span>
              <select defaultValue="beginner" name="difficulty">
                <option value="beginner">危険度 D・入門</option>
                <option value="intermediate">危険度 C・中級</option>
                <option value="advanced">危険度 B・上級</option>
                <option value="expert">危険度 A・熟練</option>
              </select>
            </label>
            <label>
              <span>推奨スキルレベル</span>
              <select defaultValue="beginner" name="recommendedSkillLevel">
                <option value="beginner">入門</option>
                <option value="intermediate">中級</option>
                <option value="advanced">上級</option>
              </select>
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">4</span>
            <div>
              <h2>Repositoryと利用条件</h2>
              <p>自由に開発できる範囲を誤解なく伝えます。</p>
            </div>
          </div>
          <label>
            <span>公開GitHub Repository URL</span>
            <input
              name="repositoryUrl"
              placeholder="https://github.com/owner/repository"
              required
              type="url"
            />
          </label>
          <div className="two-column-fields">
            <label>
              <span>ライセンス</span>
              <input
                defaultValue="MIT"
                name="licenseIdentifier"
                required
              />
            </label>
          </div>
          <label>
            <span>学習・改変・成果公開の利用条件</span>
            <textarea minLength={20} name="usageTerms" required rows={5} />
          </label>
          <label className="check-row">
            <input name="rightsConfirmed" required type="checkbox" />
            <span>
              このRepositoryを掲載し、学習目的のFork・改変を許可できる権利を確認しました。
            </span>
          </label>
          <label className="check-row">
            <input name="secretsConfirmed" required type="checkbox" />
            <span>
              シークレット、個人情報、公開できないデータが履歴に残っていないことを確認しました。
            </span>
          </label>
        </section>
      </div>

      <aside className="editor-sidebar">
        <div className="sticky-card">
          <div className="status-row">
            <span className="status-dot" />
            公開前の最終確認
          </div>
          <ul className="check-list">
            <li>Repositoryは公開されていますか</li>
            <li>ライセンスを確認しましたか</li>
            <li>秘密情報を削除しましたか</li>
            <li>所有権は移転しないと理解していますか</li>
          </ul>
          <button
            className="button button-primary button-block"
            disabled={pending}
            type="submit"
          >
            {pending ? "公開中…" : "プロジェクトを公開"}
          </button>
          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
