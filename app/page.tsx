import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "未完成のコードを、次の学びへ",
  description:
    "開発を止めた人の構想を、学習者の実践的な開発経験へつなげます。",
};

function CodeLine({
  children,
  number,
}: {
  children?: ReactNode;
  number: number;
}) {
  return (
    <span className="code-line">
      <span aria-hidden="true" className="code-line-number">
        {number}
      </span>
      <span className="code-line-source">{children ?? "\u00a0"}</span>
    </span>
  );
}

export default async function Home() {
  const projects = await listProjects();
  const totalBeyonds = projects.reduce(
    (total, project) => total + project.beyondCount,
    0,
  );
  const totalContinuations = projects.reduce(
    (total, project) => total + project.continuationCount,
    0,
  );
  const learningTopics = new Set(
    projects.flatMap((project) => project.learnableTechnologies),
  );

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-glow hero-glow-green" aria-hidden="true" />
          <div className="hero-glow hero-glow-blue" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-copy">
              <h1>
                <span className="hero-heading-line">未完成のコードを、</span>
                <em>次の学びへ。</em>
              </h1>
              <p>
                未完成の構想と、実践的な題材を探すためのプラットフォーム。
                <br />
                公開されたRepositoryから自由に始められます。
              </p>
              <div className="hero-actions">
                <Link className="button button-primary button-large" href="/projects">
                  Projectを探す
                </Link>
                <Link className="button button-ghost-light button-large" href="/projects/new">
                  未完成Projectを投稿
                </Link>
              </div>
            </div>

            <figure className="hero-visual" aria-label="識別情報を一般化した開発途中コードの例">
              <div className="code-editor">
                <div className="code-editor-topbar">
                  <span className="windows-app-icon" aria-hidden="true">C</span>
                  <span className="code-editor-title">work-in-progress.c</span>
                  <span className="windows-controls" aria-hidden="true">
                    <i>—</i>
                    <i>□</i>
                    <i className="windows-close">×</i>
                  </span>
                </div>
                <div className="code-editor-tabs" aria-hidden="true">
                  <span className="code-editor-tab active">
                    <i>C</i>
                    work-in-progress.c
                    <b>●</b>
                  </span>
                </div>
                <div className="code-editor-body">
                  <pre aria-label="識別情報を一般化した開発途中コードの例">
                    <code>
                      <CodeLine number={41}>
                        <span className="syntax-keyword">typedef struct</span>{" {"}
                      </CodeLine>
                      <CodeLine number={42}>{"    bool is_ready;"}</CodeLine>
                      <CodeLine number={43}>{"    int retry_count;"}</CodeLine>
                      <CodeLine number={44}>{"} WorkState;"}</CodeLine>
                      <CodeLine number={45} />
                      <CodeLine number={46}>
                        <span className="syntax-keyword">static</span>{" Status "}
                        <span className="syntax-function">continue_work</span>
                        {"(WorkState *state) {"}
                      </CodeLine>
                      <CodeLine number={47}>
                        <span className="syntax-todo">{"    /* TODO: replace the temporary implementation */"}</span>
                      </CodeLine>
                      <CodeLine number={48}>
                        {"    "}
                        <span className="syntax-keyword">if</span>
                        {" (!state || !state->is_ready) {"}
                      </CodeLine>
                      <CodeLine number={49}>
                        {"        "}
                        <span className="syntax-function">debug_log</span>
                        {"("}
                        <span className="syntax-string">&quot;work still in progress&quot;</span>
                        {");"}
                      </CodeLine>
                      <CodeLine number={50}>
                        {"        "}
                        <span className="syntax-keyword">return</span>
                        {" STATUS_PENDING;"}
                      </CodeLine>
                      <CodeLine number={51}>{"    }"}</CodeLine>
                      <CodeLine number={52} />
                      <CodeLine number={53}>
                        <span className="syntax-todo">{"    /* FIXME: add the recovery path */"}</span>
                      </CodeLine>
                      <CodeLine number={54}>
                        {"    "}
                        <span className="syntax-keyword">return</span>
                        {" STATUS_NOT_IMPLEMENTED;"}
                      </CodeLine>
                      <CodeLine number={55}>{"}"}</CodeLine>
                    </code>
                  </pre>
                </div>
                <div className="code-editor-footer" aria-hidden="true">
                  <span>main*</span>
                  <span>Ln 53, Col 5</span>
                  <span>UTF-8</span>
                  <span>C</span>
                </div>
              </div>
            </figure>
          </div>
        </section>

        <section className="signal-strip" aria-label="現在公開中の情報">
          <div className="signal-strip-inner">
            <div>
              <strong>{projects.length}</strong>
              <span>公開Project</span>
            </div>
            <div>
              <strong>{learningTopics.size}</strong>
              <span>学べるテーマ</span>
            </div>
            <div>
              <strong>{totalBeyonds}</strong>
              <span>ビヨンド</span>
            </div>
            <div>
              <strong>{totalContinuations}</strong>
              <span>公開されたシュート</span>
            </div>
          </div>
        </section>

        <section className="how-section">
          <div className="section-container">
            <div className="section-intro section-intro-split">
              <div>
                <span className="eyebrow">HOW IT WORKS</span>
                <h2>止まった場所が、<br />誰かのスタート地点になる。</h2>
              </div>
              <p>
                完成しなかった理由も、残っている課題も、次の人にとっては実践的な教材です。Projectの所有者は変わらず、学習者は自分のForkで試し、成果を元Projectへつなげられます。
              </p>
            </div>
            <div className="concept-grid">
              <article>
                <div className="concept-card-top">
                  <span className="concept-number">01</span>
                  <span className="concept-label">OWNER</span>
                </div>
                <div
                  aria-label="未完成のコードと設計を整理して残すイラスト"
                  className="concept-illustration concept-save"
                  role="img"
                />
                <h3>残す</h3>
                <p>コードだけでは伝わらない、目的、現在地、止めた理由、実現したかった構想まで公開します。</p>
              </article>
              <article className="concept-featured">
                <div className="concept-card-top">
                  <span className="concept-number">02</span>
                  <span className="concept-label">LEARNER</span>
                </div>
                <div
                  aria-label="公開Repositoryを自分の開発環境へつなぐイラスト"
                  className="concept-illustration concept-beyond"
                  role="img"
                />
                <h3>ビヨンドする</h3>
                <p>技術、難易度、学べることから題材を選び、自分の環境へForkまたはCloneして始めます。</p>
              </article>
              <article>
                <div className="concept-card-top">
                  <span className="concept-number">03</span>
                  <span className="concept-label">CONTINUATION</span>
                </div>
                <div
                  aria-label="追加開発した成果を共有Projectへ投稿するイラスト"
                  className="concept-illustration concept-shoot"
                  role="img"
                />
                <h3>シュートする</h3>
                <p>追加実装したForkと学んだことを公開し、元Projectから辿れる成果として残します。</p>
              </article>
            </div>
          </div>
        </section>

        <section className="featured-section">
          <div className="section-container">
            <div className="featured-heading">
              <div>
                <span className="eyebrow">EXPLORE PROJECTS</span>
                <h2>ビヨンドできるProject</h2>
                <p>実装状況と学べることが整理された、現在公開中のProjectです。</p>
              </div>
              <Link className="button button-secondary" href="/projects">
                すべて見る →
              </Link>
            </div>
            <div className="project-list">
              {projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-inner">
            <span className="eyebrow">THE NEXT COMMIT IS YOURS</span>
            <h2>止まっているコードに、次のCommitを。</h2>
            <p>
              誰かが本気で作ろうとしたコードへ。
              <br />
              読むだけで終わらない、実践の学びを始めよう。
            </p>
            <div className="cta-actions">
              <Link className="button button-primary button-large" href="/projects">
                Projectを探しに行く
              </Link>
              <Link className="cta-text-link" href="/about">
                HUNGER×HUNGERについて <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
