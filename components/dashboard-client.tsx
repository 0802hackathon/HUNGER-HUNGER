"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProgressUpdateForm } from "@/components/progress-update-form";
import {
  getBrowserSupabase,
  isBrowserSupabaseConfigured,
} from "@/lib/supabase-browser";
import { sampleContinuations, sampleProjects } from "@/lib/sample-data";

type ExplorationActivity = {
  id: string;
  isSample?: boolean;
  projectId: string;
  projectTitle: string;
  status: string;
  summary: string;
  progressPercent: number;
};

type ContinuationActivity = {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  repositoryUrl: string;
};

type OwnedProject = {
  id: string;
  title: string;
  continuationCount: number;
};

type DashboardTab = "beyond" | "shoot" | "projects";

const demoExplorations: ExplorationActivity[] = sampleProjects
  .slice(0, 2)
  .map((project, index) => ({
    id: `demo-${project.id}`,
    isSample: true,
    projectId: project.id,
    projectTitle: project.title,
    status: "active",
    summary:
      index === 0
        ? "認証フローと日付処理を読解中"
        : "検索処理の構成を確認中",
    progressPercent: index === 0 ? 58 : 24,
  }));

const demoContinuations: ContinuationActivity[] = sampleContinuations
  .slice(0, 1)
  .map((item) => ({
    id: item.id,
    projectId: item.sourceProjectId,
    title: item.title,
    summary: item.summary,
    repositoryUrl: item.repositoryUrl,
  }));

const demoOwnedProjects: OwnedProject[] = [
  {
    id: sampleProjects[3].id,
    title: sampleProjects[3].title,
    continuationCount: sampleProjects[3].continuationCount,
  },
];

const demoBio = "既存コードを読み、次の一歩を作る学習者。";
const demoSkills = ["Next.js", "TypeScript", "Supabase"];

function getHttpsUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function DashboardClient() {
  const configured = isBrowserSupabaseConfigured();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("デモハンター");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState(demoBio);
  const [experienceSummary, setExperienceSummary] = useState("");
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>(demoSkills);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [activeTab, setActiveTab] = useState<DashboardTab>("beyond");
  const [reloadKey, setReloadKey] = useState(0);
  const [explorations, setExplorations] =
    useState<ExplorationActivity[]>(demoExplorations);
  const [continuations, setContinuations] =
    useState<ContinuationActivity[]>(demoContinuations);
  const [ownedProjects, setOwnedProjects] =
    useState<OwnedProject[]>(demoOwnedProjects);

  useEffect(() => {
    async function load() {
      const supabase = await getBrowserSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const userResult = await supabase!.auth.getUser();
      const user = userResult.data.user;
      if (!user) {
        setLoading(false);
        return;
      }
      setAuthenticated(true);
      setAvatarUrl(
        [
          user.user_metadata?.avatar_url ??
            user.user_metadata?.picture,
          ...(user.identities?.flatMap((identity) => [
            identity.identity_data?.avatar_url,
            identity.identity_data?.picture,
          ]) ?? []),
        ]
          .map(getHttpsUrl)
          .find((value): value is string => Boolean(value)) ?? null,
      );
      setName(
        String(
          user.user_metadata?.display_name ??
            user.email?.split("@")[0] ??
            "ハンター",
        ),
      );

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
      if (!profile) {
        setLoading(false);
        return;
      }
      setName(String(profile.display_name));
      setBio(String(profile.bio ?? ""));
      setExperienceSummary(String(profile.experience_summary ?? ""));
      setGithubUrl(getHttpsUrl(profile.github_url));
      setSkills(
        Array.from(
          new Set(
            (
              (profile.user_skills as Array<{ name: string; kind: string }> | null) ??
              []
            ).map((skill) => skill.name),
          ),
        ),
      );

      const [explorationResult, continuationResult, projectResult] =
        await Promise.all([
          supabase!
            .from("project_explorations")
            .select(
              "id, status, project_id, projects!project_explorations_project_id_fkey(id, title), progress_updates(summary, progress_percent, created_at)",
            )
            .eq("learner_profile_id", profile.id)
            .order("updated_at", { ascending: false }),
          supabase!
            .from("project_continuations")
            .select("id, source_project_id, title, summary, repository_url")
            .eq("author_profile_id", profile.id)
            .eq("status", "published")
            .order("published_at", { ascending: false }),
          supabase!
            .from("projects")
            .select("id, title, continuation_count")
            .eq("owner_profile_id", profile.id)
            .order("updated_at", { ascending: false }),
        ]);

      const explorationRows =
        (explorationResult.data as Array<Record<string, unknown>> | null) ?? [];
      const loadedExplorations = explorationRows.map((row) => {
        const project = row.projects as Record<string, unknown> | null;
        const updates =
          (row.progress_updates as Array<Record<string, unknown>> | null) ?? [];
        const latest = [...updates].sort((a, b) =>
          String(b.created_at).localeCompare(String(a.created_at)),
        )[0];
        return {
          id: String(row.id),
          projectId: String(row.project_id),
          projectTitle: String(project?.title ?? "削除済みProject"),
          status: String(row.status),
          summary: String(latest?.summary ?? "まだ進捗記録はありません"),
          progressPercent: Number(latest?.progress_percent ?? 0),
        };
      });
      setExplorations(
        loadedExplorations.length ? loadedExplorations : demoExplorations,
      );

      const continuationRows =
        (continuationResult.data as Array<Record<string, unknown>> | null) ?? [];
      const loadedContinuations = continuationRows.map((row) => ({
        id: String(row.id),
        projectId: String(row.source_project_id),
        title: String(row.title),
        summary: String(row.summary),
        repositoryUrl: String(row.repository_url),
      }));
      setContinuations(
        loadedContinuations.length ? loadedContinuations : demoContinuations,
      );

      const projectRows =
        (projectResult.data as Array<Record<string, unknown>> | null) ?? [];
      const loadedProjects = projectRows.map((row) => ({
        id: String(row.id),
        title: String(row.title),
        continuationCount: Number(row.continuation_count ?? 0),
      }));
      setOwnedProjects(
        loadedProjects.length ? loadedProjects : demoOwnedProjects,
      );
      setLoading(false);
    }

    void load();
  }, [reloadKey]);

  function selectTab(tab: DashboardTab) {
    setActiveTab(tab);
    window.requestAnimationFrame(() => {
      tabListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="dashboard-grid">
      <aside className="profile-card">
        <span
          aria-label={avatarUrl ? `${name}のアカウント画像` : undefined}
          className={`profile-avatar${avatarUrl ? " profile-avatar-image" : ""}`}
          role={avatarUrl ? "img" : undefined}
          style={
            avatarUrl
              ? { backgroundImage: `url(${JSON.stringify(avatarUrl)})` }
              : undefined
          }
        >
          {!avatarUrl && name.slice(0, 1)}
        </span>
        <h1>{name}</h1>
        {bio ? (
          <p>{bio}</p>
        ) : (
          <p className="profile-empty">自己紹介はまだ入力されていません。</p>
        )}
        <div className="profile-details">
          {experienceSummary && (
            <div>
              <strong>実務・学習経験</strong>
              <p>{experienceSummary}</p>
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <strong>登録スキル</strong>
              <ul aria-label="登録スキル">
                {skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
          {githubUrl && (
            <a href={githubUrl} rel="noopener noreferrer" target="_blank">
              GitHubプロフィール ↗
            </a>
          )}
        </div>
        <div className="profile-actions">
          <Link className="button button-secondary button-block" href="/profile">
            プロフィールを編集
          </Link>
          <Link className="button button-secondary button-block" href="/projects">
            次のプロジェクトを探す
          </Link>
        </div>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-heading">
          <span className="eyebrow">YOUR ACTIVITY</span>
          <Link className="button button-primary" href="/projects/new">
            Projectを投稿
          </Link>
        </div>

        {configured && !authenticated && !loading && (
          <div className="notice-panel">
            <strong>ログインすると自分の活動を表示できます。</strong>
            <Link href="/login">ログインへ →</Link>
          </div>
        )}

        <div
          className="tab-nav"
          aria-label="ダッシュボード表示"
          ref={tabListRef}
          role="tablist"
        >
          <button
            aria-controls="beyond-panel"
            aria-selected={activeTab === "beyond"}
            id="beyond-tab"
            onClick={() => selectTab("beyond")}
            role="tab"
            type="button"
          >
            ビヨンド <span>{explorations.length}</span>
          </button>
          <button
            aria-controls="shoot-panel"
            aria-selected={activeTab === "shoot"}
            id="shoot-tab"
            onClick={() => selectTab("shoot")}
            role="tab"
            type="button"
          >
            シュート <span>{continuations.length}</span>
          </button>
          <button
            aria-controls="projects-panel"
            aria-selected={activeTab === "projects"}
            id="projects-tab"
            onClick={() => selectTab("projects")}
            role="tab"
            type="button"
          >
            投稿Project <span>{ownedProjects.length}</span>
          </button>
        </div>

        {activeTab === "beyond" && (
          <section
            aria-labelledby="beyond-tab"
            className="dashboard-section"
            id="beyond-panel"
            role="tabpanel"
            tabIndex={0}
          >
            <div className="section-heading">
              <h3>進行中のビヨンド</h3>
              <span>学習記録は本人だけが更新できます</span>
            </div>
            {loading ? (
              <p className="empty-copy">活動を読み込んでいます…</p>
            ) : explorations.length ? (
              explorations.map((activity) => (
                <article
                  className="activity-row activity-row-expandable activity-card"
                  key={activity.id}
                >
                  <span className="activity-icon" aria-hidden="true">
                    ↗
                  </span>
                  <div className="activity-body">
                    <strong>{activity.projectTitle}</strong>
                    <p>{activity.summary}</p>
                    <div className="progress-track">
                      <span style={{ width: `${activity.progressPercent}%` }} />
                    </div>
                    <small>{activity.progressPercent}% · {activity.status}</small>
                  </div>
                  <Link
                    aria-label={`${activity.projectTitle}のProjectを見る`}
                    className="activity-card-link"
                    href={`/projects/${activity.projectId}`}
                  >
                    <span className="activity-link-label">Projectを見る</span>
                  </Link>
                  {authenticated && !activity.isSample && (
                    <div className="activity-actions">
                      <ProgressUpdateForm
                        explorationId={activity.id}
                        initialPercent={activity.progressPercent}
                        onSaved={() => setReloadKey((value) => value + 1)}
                      />
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="empty-copy">
                ビヨンドしたProjectはまだありません。興味のあるRepositoryから始めましょう。
              </p>
            )}
          </section>
        )}

        {activeTab === "shoot" && (
          <section
            aria-labelledby="shoot-tab"
            className="dashboard-section"
            id="shoot-panel"
            role="tabpanel"
            tabIndex={0}
          >
            <div className="section-heading">
              <h3>最近のシュート</h3>
              <span>追加開発した成果</span>
            </div>
            {continuations.length ? (
              continuations.map((continuation) => (
                <article
                  className="activity-row activity-card"
                  key={continuation.id}
                >
                  <span className="activity-icon shoot-icon" aria-hidden="true">
                    ●
                  </span>
                  <div className="activity-body">
                    <strong>{continuation.title}</strong>
                    <p>{continuation.summary}</p>
                  </div>
                  <a
                    aria-label={`${continuation.title}のRepositoryを見る`}
                    className="activity-card-link"
                    href={continuation.repositoryUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="activity-link-label">Repository ↗</span>
                  </a>
                </article>
              ))
            ) : (
              <p className="empty-copy">シュートした成果はまだありません。</p>
            )}
          </section>
        )}

        {activeTab === "projects" && (
          <section
            aria-labelledby="projects-tab"
            className="dashboard-section"
            id="projects-panel"
            role="tabpanel"
            tabIndex={0}
          >
            <div className="section-heading">
              <h3>投稿したProject</h3>
              <span>所有者として成果を確認</span>
            </div>
            {ownedProjects.length ? (
              ownedProjects.map((project) => (
                <article className="activity-row activity-card" key={project.id}>
                  <span className="activity-icon owner-icon" aria-hidden="true">
                    ⌘
                  </span>
                  <div className="activity-body">
                    <strong>{project.title}</strong>
                    <p>届いたシュート: {project.continuationCount}件</p>
                  </div>
                  <Link
                    aria-label={`${project.title}に届いた成果を確認`}
                    className="activity-card-link"
                    href={`/projects/${project.id}#shoots`}
                  >
                    <span className="activity-link-label">成果を確認</span>
                  </Link>
                </article>
              ))
            ) : (
              <p className="empty-copy">投稿したProjectはまだありません。</p>
            )}
          </section>
        )}
      </section>
    </div>
  );
}
