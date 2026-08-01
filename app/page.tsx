import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "未完成のコードを、次の学びへ",
  description:
    "開発を止めた人の構想を、学習者の実践的な開発経験へつなげます。",
};

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
                未完成のコードを、
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

            <div className="hero-visual" aria-label="Projectを見つけて開発を始める流れ">
              <div className="terminal-float terminal-float-top">
                <span>ACTIVE PROJECTS</span>
                <strong>{projects.length.toString().padStart(2, "0")}</strong>
              </div>
              <div className="hero-terminal">
                <div className="terminal-top">
                  <span className="terminal-dot red" />
                  <span className="terminal-dot yellow" />
                  <span className="terminal-dot green" />
                  <span>hunger-cli / explore</span>
                  <span className="terminal-status">● LIVE</span>
                </div>
                <div className="terminal-body">
                  <p>
                    <span>$</span> hunger explore --tech typescript
                  </p>
                  <div className="terminal-result">
                    <div className="terminal-result-heading">
                      <strong>Study Streak</strong>
                      <small>PUBLIC</small>
                    </div>
                    <span>Next.js · Supabase · Tailwind</span>
                    <small>危険度 D · 18 beyonds</small>
                    <div className="terminal-progress" aria-hidden="true">
                      <span />
                    </div>
                  </div>
                  <p>
                    <span>$</span> hunger beyond study-streak
                  </p>
                  <p className="success-line">✓ Repositoryを開きました</p>
                  <p className="cursor-line">
                    <span>$</span> <i />
                  </p>
                </div>
              </div>
              <div className="terminal-float terminal-float-bottom">
                <span className="float-icon" aria-hidden="true">↗</span>
                <span><strong>{totalBeyonds}</strong> BEYONDS</span>
              </div>
            </div>
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
              誰かが本気で作ろうとしたコードへ。読むだけで終わらない、実践の学びを始めよう。
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
