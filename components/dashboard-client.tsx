"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressUpdateForm } from "@/components/progress-update-form";
import {
  getBrowserSupabase,
  isBrowserSupabaseConfigured,
} from "@/lib/supabase-browser";
import { sampleContinuations, sampleProjects } from "@/lib/sample-data";

type ExplorationActivity = {
  id: string;
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

const demoExplorations: ExplorationActivity[] = sampleProjects
  .slice(0, 2)
  .map((project, index) => ({
    id: `demo-${project.id}`,
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

export function DashboardClient() {
  const configured = isBrowserSupabaseConfigured();
  const [name, setName] = useState("デモハンター");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [reloadKey, setReloadKey] = useState(0);
  const [explorations, setExplorations] = useState<ExplorationActivity[]>(
    configured ? [] : demoExplorations,
  );
  const [continuations, setContinuations] = useState<ContinuationActivity[]>(
    configured ? [] : demoContinuations,
  );
  const [ownedProjects, setOwnedProjects] = useState<OwnedProject[]>(
    configured ? [] : demoOwnedProjects,
  );

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
        .select("id, display_name")
        .eq("id", profileId)
        .maybeSingle();
      if (!profile) {
        setLoading(false);
        return;
      }
      setName(String(profile.display_name));

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
      setExplorations(
        explorationRows.map((row) => {
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
        }),
      );

      const continuationRows =
        (continuationResult.data as Array<Record<string, unknown>> | null) ?? [];
      setContinuations(
        continuationRows.map((row) => ({
          id: String(row.id),
          projectId: String(row.source_project_id),
          title: String(row.title),
          summary: String(row.summary),
          repositoryUrl: String(row.repository_url),
        })),
      );

      const projectRows =
        (projectResult.data as Array<Record<string, unknown>> | null) ?? [];
      setOwnedProjects(
        projectRows.map((row) => ({
          id: String(row.id),
          title: String(row.title),
          continuationCount: Number(row.continuation_count ?? 0),
        })),
      );
      setLoading(false);
    }

    void load();
  }, [reloadKey]);

  return (
    <div className="dashboard-grid">
      <aside className="profile-card">
        <span className="profile-avatar">{name.slice(0, 1)}</span>
        <h1>{name}</h1>
        <p>既存コードを読み、次の一歩を作る学習者。</p>
        <div className={`connection-state ${configured ? "connected" : ""}`}>
          <span />
          {configured ? "Supabase接続済み" : "デモデータ表示中"}
        </div>
        <Link className="button button-secondary button-block" href="/profile">
          プロフィールを編集
        </Link>
        <Link className="button button-secondary button-block" href="/projects">
          次のProjectを探す
        </Link>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">YOUR ACTIVITY</span>
            <h2>ハンターダッシュボード</h2>
          </div>
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

        <nav className="tab-nav" aria-label="ダッシュボード表示">
          <a aria-current="page" href="#beyond">
            ビヨンド <span>{explorations.length}</span>
          </a>
          <a href="#shoot">
            シュート <span>{continuations.length}</span>
          </a>
          <a href="#projects">
            投稿Project <span>{ownedProjects.length}</span>
          </a>
        </nav>

        <section className="dashboard-section" id="beyond">
          <div className="section-heading">
            <h3>進行中のビヨンド</h3>
            <span>学習記録は本人だけが更新できます</span>
          </div>
          {loading ? (
            <p className="empty-copy">活動を読み込んでいます…</p>
          ) : explorations.length ? (
            explorations.map((activity) => (
              <article className="activity-row activity-row-expandable" key={activity.id}>
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
                <div className="activity-actions">
                  <Link href={`/projects/${activity.projectId}`}>Projectを見る</Link>
                  {authenticated && (
                    <ProgressUpdateForm
                      explorationId={activity.id}
                      initialPercent={activity.progressPercent}
                      onSaved={() => setReloadKey((value) => value + 1)}
                    />
                  )}
                </div>
              </article>
            ))
          ) : (
            <p className="empty-copy">
              ビヨンドしたProjectはまだありません。興味のあるRepositoryから始めましょう。
            </p>
          )}
        </section>

        <section className="dashboard-section" id="shoot">
          <div className="section-heading">
            <h3>最近のシュート</h3>
            <span>追加開発した成果</span>
          </div>
          {continuations.length ? (
            continuations.map((continuation) => (
              <article className="activity-row" key={continuation.id}>
                <span className="activity-icon shoot-icon" aria-hidden="true">
                  ●
                </span>
                <div className="activity-body">
                  <strong>{continuation.title}</strong>
                  <p>{continuation.summary}</p>
                </div>
                <a
                  href={continuation.repositoryUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Repository ↗
                </a>
              </article>
            ))
          ) : (
            <p className="empty-copy">シュートした成果はまだありません。</p>
          )}
        </section>

        <section className="dashboard-section" id="projects">
          <div className="section-heading">
            <h3>投稿したProject</h3>
            <span>所有者として成果を確認</span>
          </div>
          {ownedProjects.length ? (
            ownedProjects.map((project) => (
              <article className="activity-row" key={project.id}>
                <span className="activity-icon owner-icon" aria-hidden="true">
                  ⌘
                </span>
                <div className="activity-body">
                  <strong>{project.title}</strong>
                  <p>届いたシュート: {project.continuationCount}件</p>
                </div>
                <Link href={`/projects/${project.id}#shoots`}>成果を確認</Link>
              </article>
            ))
          ) : (
            <p className="empty-copy">投稿したProjectはまだありません。</p>
          )}
        </section>
      </section>
    </div>
  );
}
