"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { SearchCombobox } from "@/components/search-combobox";
import {
  PACKAGE_MANAGER_OPTIONS,
  RUNTIME_OPTIONS,
  TESTED_ENVIRONMENT_OPTIONS,
} from "@/lib/environment-options";
import {
  LEARNING_TOPIC_OPTIONS,
  TECHNOLOGY_OPTIONS,
} from "@/lib/technology-options";

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function selectedOptions(
  formData: FormData,
  name: string,
  customName: string,
) {
  return Array.from(
    new Set([
      ...formData.getAll(name).map(String),
      ...lines(formData.get(customName)),
    ]),
  );
}

export function ProjectForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const supabase = await getBrowserSupabase();
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
      runtimeRequirements: String(
        formData.get("runtimeRequirements") ?? "",
      ),
      packageManager: String(formData.get("packageManager") ?? ""),
      installCommand: String(formData.get("installCommand") ?? ""),
      lockfileStatus: String(formData.get("lockfileStatus") ?? ""),
      setupInstructions: String(formData.get("setupInstructions") ?? ""),
      dependencyNotes: String(formData.get("dependencyNotes") ?? ""),
      testedEnvironment: String(formData.get("testedEnvironment") ?? ""),
      defaultBranch: String(formData.get("defaultBranch") ?? ""),
      lastTestedCommit: String(formData.get("lastTestedCommit") ?? ""),
      difficulty: String(formData.get("difficulty") ?? ""),
      recommendedSkillLevel: String(
        formData.get("recommendedSkillLevel") ?? "",
      ),
      licenseIdentifier: String(formData.get("licenseIdentifier") ?? ""),
      usageTerms: String(formData.get("usageTerms") ?? ""),
      technologies: selectedOptions(
        formData,
        "technologies",
        "customTechnologies",
      ),
      learnableTechnologies: selectedOptions(
        formData,
        "learnableTechnologies",
        "customLearningTopics",
      ),
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
          </div>
          <fieldset className="option-fieldset">
            <legend>使用技術</legend>
            <p>Repositoryで実際に使用している言語・Framework・基盤を選択します。</p>
            <div className="option-grid">
              {TECHNOLOGY_OPTIONS.map((technology) => (
                <label className="option-chip" key={technology}>
                  <input
                    name="technologies"
                    type="checkbox"
                    value={technology}
                  />
                  <span>{technology}</span>
                </label>
              ))}
            </div>
            <label className="custom-option-field">
              <span>その他（1行に1つ）</span>
              <textarea
                name="customTechnologies"
                placeholder={"OpenGL\nROS 2"}
                rows={3}
              />
            </label>
          </fieldset>
          <fieldset className="option-fieldset">
            <legend>学びたい技術・このProjectで学べる分野</legend>
            <p>学習者が検索するときの手掛かりになる分野を選択します。</p>
            <div className="option-grid">
              {LEARNING_TOPIC_OPTIONS.map((topic) => (
                <label className="option-chip" key={topic}>
                  <input
                    name="learnableTechnologies"
                    type="checkbox"
                    value={topic}
                  />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
            <label className="custom-option-field">
              <span>その他（1行に1つ）</span>
              <textarea
                name="customLearningTopics"
                placeholder={"コンパイラ\nロボティクス"}
                rows={3}
              />
            </label>
          </fieldset>
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
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">4</span>
            <div>
              <h2>開発環境と依存関係</h2>
              <p>別の環境でも同じ依存関係を再現できる情報を残します。</p>
            </div>
          </div>
          <div className="dependency-guidance">
            RuntimeとLockfileを揃え、既存のPackage
            Manager以外で依存関係を更新しないことが、衝突を避ける第一歩です。
          </div>
          <div className="two-column-fields">
            <label>
              <span>Runtime・Version</span>
              <SearchCombobox
                name="runtimeRequirements"
                options={RUNTIME_OPTIONS}
                placeholder="候補を検索"
                required
              />
            </label>
            <label>
              <span>Package Manager・Version</span>
              <SearchCombobox
                name="packageManager"
                options={PACKAGE_MANAGER_OPTIONS}
                placeholder="候補を検索"
                required
              />
            </label>
            <label>
              <span>Install Command</span>
              <input
                name="installCommand"
                placeholder="pnpm install --frozen-lockfile"
                required
              />
            </label>
            <label>
              <span>Lockfileの状態</span>
              <select defaultValue="committed" name="lockfileStatus">
                <option value="committed">RepositoryにCommit済み</option>
                <option value="missing">Lockfileなし</option>
                <option value="not_applicable">対象外</option>
                <option value="unknown">不明</option>
              </select>
            </label>
            <label>
              <span>動作確認環境</span>
              <SearchCombobox
                name="testedEnvironment"
                options={TESTED_ENVIRONMENT_OPTIONS}
                placeholder="候補を検索"
                required
              />
            </label>
            <label>
              <span>Default Branch</span>
              <input defaultValue="main" name="defaultBranch" required />
            </label>
          </div>
          <label>
            <span>最後に動作確認したCommit SHA（任意）</span>
            <input
              maxLength={64}
              minLength={7}
              name="lastTestedCommit"
              placeholder="a1b2c3d"
            />
          </label>
          <label>
            <span>Setup手順</span>
            <textarea
              minLength={20}
              name="setupInstructions"
              placeholder="環境変数の作成、Migration、起動までを順番に記載してください。"
              required
              rows={6}
            />
          </label>
          <label>
            <span>依存関係・互換性の注意</span>
            <textarea
              minLength={10}
              name="dependencyNotes"
              placeholder="Version固定の理由、衝突しやすいModule、OS固有の制約を記載してください。"
              required
              rows={5}
            />
          </label>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="step-number">5</span>
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
            <li>RuntimeとLockfileを明記しましたか</li>
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
