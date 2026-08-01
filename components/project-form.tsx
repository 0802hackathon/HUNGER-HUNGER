"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { SearchCombobox } from "@/components/search-combobox";
import {
  CountedInput,
  CountedTextarea,
} from "@/components/character-count-field";
import { parseGitHubRepositoryUrl } from "@/lib/github-url";
import {
  PACKAGE_MANAGER_OPTIONS,
  RUNTIME_OPTIONS,
  TESTED_ENVIRONMENT_OPTIONS,
} from "@/lib/environment-options";
import {
  LEARNING_TOPIC_OPTIONS,
  TECHNOLOGY_OPTIONS,
} from "@/lib/technology-options";

const SUBMISSION_KEY_STORAGE = "hunger-hunger:project-submission-key";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURRENT_STATE_TEMPLATE = `【到達段階】

【一連で動作する範囲】
-

【仮実装・未接続の箇所】
-

【作業を中断した地点】

【次に確認する場所】
-`;

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

type RepositoryCheck = {
  detail: string;
  status: "idle" | "checking" | "valid" | "invalid" | "error";
};

type FormChecks = {
  license: boolean;
  rights: boolean;
  secrets: boolean;
};

type ChecklistItemProps = {
  complete: boolean;
  detail: string;
  label: string;
  pending?: boolean;
  type: "自動判定" | "手動確認";
};

function ChecklistItem({
  complete,
  detail,
  label,
  pending = false,
  type,
}: ChecklistItemProps) {
  return (
    <li
      className={`check-item${complete ? " is-complete" : ""}${pending ? " is-checking" : ""}`}
    >
      <span className="check-item-icon" aria-hidden="true">
        {complete ? "✓" : pending ? "…" : ""}
      </span>
      <span className="check-item-copy">
        <strong>{label}</strong>
        <small>
          <span className="check-kind">{type}</span>
          {detail}
        </small>
      </span>
      <span className="sr-only">
        {pending ? "確認中" : complete ? "完了" : "未完了"}
      </span>
    </li>
  );
}

export function ProjectForm() {
  const router = useRouter();
  const submittingRef = useRef(false);
  const submissionKeyRef = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [runtimeRequirements, setRuntimeRequirements] = useState("");
  const [lockfileStatus, setLockfileStatus] = useState("committed");
  const [repositoryCheck, setRepositoryCheck] = useState<RepositoryCheck>({
    detail: "Repository URLを入力してください。",
    status: "idle",
  });
  const [formChecks, setFormChecks] = useState<FormChecks>({
    license: false,
    rights: false,
    secrets: false,
  });
  const runtimeAndLockfileComplete =
    runtimeRequirements.trim().length >= 3 &&
    (lockfileStatus === "committed" || lockfileStatus === "not_applicable");
  const completedCount = [
    repositoryCheck.status === "valid",
    runtimeAndLockfileComplete,
    formChecks.license,
    formChecks.secrets,
    formChecks.rights,
  ].filter(Boolean).length;

  function getSubmissionKey() {
    if (submissionKeyRef.current) return submissionKeyRef.current;

    let storedKey: string | null = null;
    try {
      storedKey = window.sessionStorage.getItem(SUBMISSION_KEY_STORAGE);
    } catch {
      // The in-memory key still protects repeated submits in this page.
    }

    const submissionKey =
      storedKey && UUID_PATTERN.test(storedKey)
        ? storedKey
        : window.crypto.randomUUID();
    submissionKeyRef.current = submissionKey;
    try {
      window.sessionStorage.setItem(SUBMISSION_KEY_STORAGE, submissionKey);
    } catch {
      // Some browser privacy modes disable sessionStorage.
    }
    return submissionKey;
  }

  function clearSubmissionKey() {
    submissionKeyRef.current = null;
    try {
      window.sessionStorage.removeItem(SUBMISSION_KEY_STORAGE);
    } catch {
      // Nothing else is required when sessionStorage is unavailable.
    }
  }

  useEffect(() => {
    const value = repositoryUrl.trim();
    if (!parseGitHubRepositoryUrl(value)) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setRepositoryCheck({
        detail: "GitHubの公開設定を確認しています。",
        status: "checking",
      });

      try {
        const response = await fetch(
          `/api/github/repository?url=${encodeURIComponent(value)}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const result = (await response.json()) as {
          fullName?: string | null;
          isPublic?: boolean;
          licenseIdentifier?: string | null;
          message?: string;
        };

        if (!response.ok) {
          setRepositoryCheck({
            detail:
              result.message ?? "Repositoryの公開状態を確認できませんでした。",
            status: response.status === 400 ? "invalid" : "error",
          });
          return;
        }

        if (!result.isPublic) {
          setRepositoryCheck({
            detail:
              result.message ??
              "公開Repositoryとして確認できませんでした。",
            status: "invalid",
          });
          return;
        }

        const licenseDetail = result.licenseIdentifier
          ? ` License: ${result.licenseIdentifier}`
          : "";
        setRepositoryCheck({
          detail: `${result.fullName ?? "Repository"} を確認しました。${licenseDetail}`,
          status: "valid",
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setRepositoryCheck({
          detail: "Repositoryの公開状態を確認できませんでした。",
          status: "error",
        });
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [repositoryUrl]);

  function updateChecks(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const nextRepositoryUrl = String(formData.get("repositoryUrl") ?? "");

    if (nextRepositoryUrl !== repositoryUrl) {
      setRepositoryUrl(nextRepositoryUrl);
      if (!nextRepositoryUrl.trim()) {
        setRepositoryCheck({
          detail: "Repository URLを入力してください。",
          status: "idle",
        });
      } else if (!parseGitHubRepositoryUrl(nextRepositoryUrl.trim())) {
        setRepositoryCheck({
          detail: "owner/repository 形式のGitHub URLを入力してください。",
          status: "invalid",
        });
      } else {
        setRepositoryCheck({
          detail: "GitHubの公開設定を確認しています。",
          status: "checking",
        });
      }
    }

    setLockfileStatus(String(formData.get("lockfileStatus") ?? ""));
    setFormChecks({
      license: String(formData.get("licenseIdentifier") ?? "").trim().length >= 2,
      rights: formData.get("rightsConfirmed") === "on",
      secrets: formData.get("secretsConfirmed") === "on",
    });
  }

  function resetChecks() {
    clearSubmissionKey();
    setRepositoryUrl("");
    setCurrentState("");
    setRuntimeRequirements("");
    setLockfileStatus("committed");
    setRepositoryCheck({
      detail: "Repository URLを入力してください。",
      status: "idle",
    });
    setFormChecks({
      license: false,
      rights: false,
      secrets: false,
    });
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPending(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
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

      const payload = {
        submissionKey: getSubmissionKey(),
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
      if (!response.ok || !result.id) {
        setMessage(result.message ?? "投稿を保存できませんでした。");
        return;
      }
      clearSubmissionKey();
      router.push(`/projects/${result.id}`);
      router.refresh();
    } catch {
      setMessage("投稿を保存できませんでした。通信状態を確認してください。");
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form
      className="editor-layout"
      onChange={updateChecks}
      onReset={resetChecks}
      onSubmit={submit}
    >
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
            <CountedInput maxLength={80} minLength={3} name="title" required />
          </label>
          <label>
            <span>一行説明</span>
            <CountedTextarea
              maxLength={240}
              minLength={20}
              name="summary"
              required
              rows={3}
            />
          </label>
          <label>
            <span>なぜ開発を始めたのか</span>
            <CountedTextarea
              maxLength={2000}
              minLength={20}
              name="motivation"
              required
              rows={5}
            />
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
          <div className="guided-field">
            <div className="guided-field-heading">
              <label htmlFor="current-state">現在の実装状況</label>
              <button
                className="button button-secondary button-small"
                disabled={currentState.trim().length > 0}
                onClick={() => setCurrentState(CURRENT_STATE_TEMPLATE)}
                type="button"
              >
                フォーマットを挿入
              </button>
            </div>
            <p className="field-guidance" id="current-state-guidance">
              機能名の列挙ではなく、動作する範囲、仮実装、中断地点を記載します。
            </p>
            <CountedTextarea
              aria-describedby="current-state-guidance"
              id="current-state"
              maxLength={3000}
              minLength={20}
              name="currentState"
              onChange={(event) => setCurrentState(event.currentTarget.value)}
              required
              rows={10}
              value={currentState}
            />
            <details className="field-example">
              <summary>記入例を見る</summary>
              <pre>{`【到達段階】
主要フローが動作するMVPの状態です。

【一連で動作する範囲】
- ログインから学習記録の登録・一覧表示まで動作します

【仮実装・未接続の箇所】
- メール通知はConsole出力で代用しています

【作業を中断した地点】
学習記録の編集画面からAPIを呼び出す処理の実装途中です。

【次に確認する場所】
- components/learning-record-form.tsx`}</pre>
            </details>
          </div>
          <label>
            <span>開発を断念した理由</span>
            <CountedTextarea
              maxLength={2000}
              minLength={20}
              name="abandonmentReason"
              required
              rows={5}
            />
          </label>
          <label>
            <span>既知の制約・不具合</span>
            <CountedTextarea
              maxLength={3000}
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
              <CountedTextarea
                maxLength={120}
                name="implementedFeatures"
                perLine
                placeholder={"メール認証\n学習記録の追加"}
                rows={6}
              />
            </label>
            <label>
              <span>実装予定だった機能</span>
              <CountedTextarea
                maxLength={120}
                name="plannedFeatures"
                perLine
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
              <CountedTextarea
                maxLength={50}
                name="customTechnologies"
                perLine
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
              <CountedTextarea
                maxLength={50}
                name="customLearningTopics"
                perLine
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
                maxLength={300}
                name="runtimeRequirements"
                onValueChange={setRuntimeRequirements}
                options={RUNTIME_OPTIONS}
                placeholder="候補を検索"
                required
              />
            </label>
            <label>
              <span>Package Manager・Version</span>
              <SearchCombobox
                maxLength={80}
                name="packageManager"
                options={PACKAGE_MANAGER_OPTIONS}
                placeholder="候補を検索"
                required
              />
            </label>
            <label>
              <span>Install Command</span>
              <CountedInput
                maxLength={300}
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
                maxLength={500}
                name="testedEnvironment"
                options={TESTED_ENVIRONMENT_OPTIONS}
                placeholder="候補を検索"
                required
              />
            </label>
            <label>
              <span>Default Branch</span>
              <CountedInput
                defaultValue="main"
                maxLength={100}
                name="defaultBranch"
                required
              />
            </label>
          </div>
          <label>
            <span>最後に動作確認したCommit SHA（任意）</span>
            <CountedInput
              maxLength={64}
              minLength={7}
              name="lastTestedCommit"
              placeholder="a1b2c3d"
            />
          </label>
          <label>
            <span>Setup手順</span>
            <CountedTextarea
              maxLength={3000}
              minLength={20}
              name="setupInstructions"
              placeholder="環境変数の作成、Migration、起動までを順番に記載してください。"
              required
              rows={6}
            />
          </label>
          <label>
            <span>依存関係・互換性の注意</span>
            <CountedTextarea
              maxLength={3000}
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
            <CountedInput
              name="repositoryUrl"
              placeholder="https://github.com/owner/repository"
              required
              type="url"
            />
          </label>
          <div className="two-column-fields">
            <label>
              <span>ライセンス</span>
              <CountedInput
                maxLength={80}
                name="licenseIdentifier"
                placeholder="MIT / Apache-2.0"
                required
              />
            </label>
          </div>
          <label>
            <span>学習・改変・成果公開の利用条件</span>
            <CountedTextarea
              maxLength={2000}
              minLength={20}
              name="usageTerms"
              required
              rows={5}
            />
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
            <span
              className={`status-dot${completedCount === 5 ? " is-complete" : ""}`}
            />
            <span>公開前の最終確認</span>
            <small>{completedCount}/5</small>
          </div>

          <ul className="check-list" aria-live="polite">
            <ChecklistItem
              complete={repositoryCheck.status === "valid"}
              detail={repositoryCheck.detail}
              label="Repositoryは公開されていますか"
              pending={repositoryCheck.status === "checking"}
              type="自動判定"
            />
            <ChecklistItem
              complete={runtimeAndLockfileComplete}
              detail="Runtimeと利用可能なLockfileの状態を入力"
              label="RuntimeとLockfileを明記しましたか"
              type="自動判定"
            />
            <ChecklistItem
              complete={formChecks.license}
              detail="ライセンス欄を入力"
              label="ライセンスを確認しましたか"
              type="自動判定"
            />
            <ChecklistItem
              complete={formChecks.secrets}
              detail="Repositoryと履歴を確認してチェック"
              label="秘密情報を削除しましたか"
              type="手動確認"
            />
            <ChecklistItem
              complete={formChecks.rights}
              detail="掲載権限と所有権について確認してチェック"
              label="所有権は移転しないと理解していますか"
              type="手動確認"
            />
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
