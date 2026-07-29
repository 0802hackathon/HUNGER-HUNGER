import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeyondButton } from "@/components/beyond-button";
import { OwnerProjectControls } from "@/components/owner-project-controls";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProject, getProjectContinuations } from "@/lib/projects";
import type { LockfileStatus } from "@/lib/types";

type Params = Promise<{ projectId: string }>;

const lockfileLabels: Record<LockfileStatus, string> = {
  committed: "RepositoryにCommit済み",
  missing: "Lockfileなし",
  not_applicable: "対象外",
  unknown: "不明",
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProject(projectId);
  return project
    ? { title: project.title, description: project.summary }
    : { title: "Projectが見つかりません" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();
  const continuations = await getProjectContinuations(projectId);
  const isArchived = project.status === "archived";

  return (
    <>
      <SiteHeader />
      <main className="repo-page">
        {isArchived && (
          <div className="archive-banner">
            このProjectはアーカイブされています。Repositoryの状態と利用条件を確認してください。
          </div>
        )}
        <div className="repo-titlebar">
          <div className="breadcrumb">
            <Link href="/projects">Projects</Link>
            <span>/</span>
            <strong>{project.title}</strong>
            <span className="visibility-badge">Public</span>
          </div>
          <div className="repo-actions">
            <span>↗ {project.beyondCount}</span>
            <span>● {project.continuationCount}</span>
          </div>
        </div>

        <nav className="repo-tabs" aria-label="Project内ナビゲーション">
          <a aria-current="page" href="#overview">概要</a>
          <a href="#environment">開発環境</a>
          <a href="#implemented">実装済み</a>
          <a href="#planned">構想</a>
          <a href="#shoots">シュート <span>{continuations.length}</span></a>
        </nav>

        <div className="repo-content" id="overview">
          <div className="repo-main-column">
            <section className="readme-card">
              <div className="readme-header">
                <span>README / HUNGER×HUNGER</span>
                <span>更新 {new Date(project.updatedAt).toLocaleDateString("ja-JP")}</span>
              </div>
              <div className="readme-body">
                <span className="owner-line">@{project.ownerName} が残したProject</span>
                <h1>{project.title}</h1>
                <p className="lead">{project.summary}</p>

                <hr />
                <h2>なぜ開発を始めたのか</h2>
                <p>{project.motivation}</p>

                <h2>現在の実装状況</h2>
                <p>{project.currentState}</p>

                <h2>なぜ開発を止めたのか</h2>
                <p>{project.abandonmentReason}</p>

                <div className="notice-card warning">
                  <strong>既知の制約・不具合</strong>
                  <p>{project.knownLimitations}</p>
                </div>

                <h2 id="environment">開発環境と依存関係</h2>
                <div className="notice-card dependency-notice">
                  <strong>最初に環境を揃えてください</strong>
                  <p>
                    Runtime、Package Manager、Lockfileをこの記載に合わせてからForkを変更すると、既存Moduleとの衝突を減らせます。
                  </p>
                </div>
                <dl className="environment-grid">
                  <div>
                    <dt>Runtime・Version</dt>
                    <dd>{project.runtimeRequirements}</dd>
                  </div>
                  <div>
                    <dt>Package Manager</dt>
                    <dd>{project.packageManager}</dd>
                  </div>
                  <div>
                    <dt>Install Command</dt>
                    <dd><code>{project.installCommand}</code></dd>
                  </div>
                  <div>
                    <dt>Lockfile</dt>
                    <dd>{lockfileLabels[project.lockfileStatus]}</dd>
                  </div>
                  <div>
                    <dt>動作確認環境</dt>
                    <dd>{project.testedEnvironment}</dd>
                  </div>
                  <div>
                    <dt>基準Branch</dt>
                    <dd><code>{project.defaultBranch}</code></dd>
                  </div>
                  {project.lastTestedCommit && (
                    <div>
                      <dt>最終確認Commit</dt>
                      <dd><code>{project.lastTestedCommit}</code></dd>
                    </div>
                  )}
                </dl>
                <div className="environment-notes">
                  <section>
                    <h3>Setup手順</h3>
                    <p>{project.setupInstructions}</p>
                  </section>
                  <section>
                    <h3>依存関係・互換性の注意</h3>
                    <p>{project.dependencyNotes}</p>
                  </section>
                </div>

                <h2 id="implemented">実装済みの機能</h2>
                <ul className="feature-list implemented-list">
                  {project.implementedFeatures.map((feature) => (
                    <li key={feature.id}>
                      <span aria-hidden="true">✓</span>
                      <div>
                        <strong>{feature.title}</strong>
                        {feature.description && <p>{feature.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>

                <h2 id="planned">実現したかった構想</h2>
                <div className="planned-grid">
                  {project.plannedFeatures.map((feature, index) => (
                    <article key={feature.id}>
                      <span>IDEA {String(index + 1).padStart(2, "0")}</span>
                      <h3>{feature.title}</h3>
                      {feature.description && <p>{feature.description}</p>}
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="shoot-section" id="shoots">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">CONTINUATIONS</span>
                  <h2>このProjectへのシュート</h2>
                </div>
                {!isArchived && (
                  <Link
                    className="button button-secondary"
                    href={`/projects/${project.id}/continuations/new`}
                  >
                    ● 成果をシュート
                  </Link>
                )}
              </div>
              {continuations.length ? (
                <div className="shoot-list">
                  {continuations.map((continuation) => (
                    <article key={continuation.id}>
                      <div className="shoot-line" aria-hidden="true">
                        <span />
                      </div>
                      <div className="shoot-content">
                        <div className="shoot-meta">
                          <strong>{continuation.authorName}</strong>
                          <span>
                            {new Date(continuation.publishedAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <h3>{continuation.title}</h3>
                        <p>{continuation.summary}</p>
                        <div className="shoot-links">
                          <a
                            href={continuation.repositoryUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Repository ↗
                          </a>
                          {continuation.pullRequestUrl && (
                            <a
                              href={continuation.pullRequestUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              Pull Request ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact">
                  <h3>まだシュートはありません</h3>
                  <p>最初の追加開発を、このProjectへ残してみませんか。</p>
                </div>
              )}
            </section>
          </div>

          <aside className="repo-sidebar">
            <div className="action-card">
              <BeyondButton
                disabled={isArchived}
                projectId={project.id}
                repositoryUrl={project.repositoryUrl}
              />
              <a
                className="button button-secondary button-block"
                href={project.repositoryUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHubで見る ↗
              </a>
            </div>

            <section className="sidebar-section">
              <h2>使用技術</h2>
              <div className="tag-list">
                {project.technologies.map((technology) => (
                  <span className="topic-tag" key={technology}>
                    {technology}
                  </span>
                ))}
              </div>
            </section>

            <section className="sidebar-section">
              <h2>このProjectで学べること</h2>
              <ul className="sidebar-list">
                {project.learnableTechnologies.map((technology) => (
                  <li key={technology}>
                    <span aria-hidden="true">●</span> {technology}
                  </li>
                ))}
              </ul>
            </section>

            <section className="sidebar-section environment-summary">
              <h2>開発前チェック</h2>
              <dl>
                <div>
                  <dt>Runtime</dt>
                  <dd>{project.runtimeRequirements}</dd>
                </div>
                <div>
                  <dt>Package Manager</dt>
                  <dd>{project.packageManager}</dd>
                </div>
                <div>
                  <dt>Lockfile</dt>
                  <dd>{lockfileLabels[project.lockfileStatus]}</dd>
                </div>
              </dl>
              <a href="#environment">Setup情報を確認 →</a>
            </section>

            <section className="sidebar-section terms-box">
              <h2>ライセンスと利用条件</h2>
              <strong>{project.licenseIdentifier}</strong>
              <p>{project.usageTerms}</p>
              <small>
                ビヨンド前に、元Repositoryの最新ライセンスも確認してください。
              </small>
            </section>

            <div className="rights-note">
              <strong>所有権は移転しません</strong>
              <p>
                学習者は自分のForkで開発します。元Repositoryへの反映は別途Pull Request等で提案してください。
              </p>
            </div>

            <OwnerProjectControls
              archived={isArchived}
              ownerId={project.ownerId}
              projectId={project.id}
            />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
