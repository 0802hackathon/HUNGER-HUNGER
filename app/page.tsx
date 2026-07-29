import type { Metadata } from "next";
import Image from "next/image";
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

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-kicker">OPEN PROJECTS FOR REAL LEARNING</span>
              <h1>
                未完成のコードを、<em>次の学びへ。</em>
              </h1>
              <p>
                未完成の構想と、実践的な題材を探すためのプラットフォーム。公開されたRepositoryから自由に始められます。
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

            <div className="repository-preview">
              <div className="repository-preview-header">
                <span className="repository-preview-mark" aria-hidden="true">
                  {"<>"}
                </span>
                <strong>study-streak</strong>
                <span className="preview-visibility">Public</span>
              </div>
              <div className="repository-preview-tabs" aria-hidden="true">
                <span className="active">Overview</span>
                <span>Environment</span>
                <span>Learning</span>
              </div>
              <div className="repository-preview-body">
                <div className="preview-file-heading">
                  <div>
                    <span className="preview-status-dot" />
                    <strong>project.yml</strong>
                  </div>
                  <small>開発環境を確認済み</small>
                </div>
                <dl className="preview-definition-list">
                  <div>
                    <dt>status</dt>
                    <dd>unfinished</dd>
                  </div>
                  <div>
                    <dt>runtime</dt>
                    <dd>Node.js 22.x</dd>
                  </div>
                  <div>
                    <dt>package manager</dt>
                    <dd>pnpm 10</dd>
                  </div>
                  <div>
                    <dt>lockfile</dt>
                    <dd className="preview-ok">committed</dd>
                  </div>
                  <div>
                    <dt>next idea</dt>
                    <dd>タイムゾーン対応</dd>
                  </div>
                </dl>
                <div className="preview-footer">
                  <span>Next.js</span>
                  <span>TypeScript</span>
                  <strong>ビヨンドできる →</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="how-section">
          <div className="section-container">
            <div className="section-intro">
              <span className="eyebrow">HOW IT WORKS</span>
              <h2>失敗作ではなく、誰かの実践課題。</h2>
              <p>
                Projectの所有者は変わりません。学習者は自分のForkで自由に試し、追加開発した成果を元Projectへ関連付けて投稿できます。
              </p>
            </div>
            <div className="concept-grid">
              <article>
                <span className="concept-number">01</span>
                <div className="concept-illustration concept-save">
                  <Image
                    alt="未完成のコードと設計を整理して残すイラスト"
                    height={724}
                    src="/concept-flow.png"
                    width={2172}
                  />
                </div>
                <h3>残す</h3>
                <p>目的、実装状況、断念理由、実現したかった構想をProjectとして公開。</p>
              </article>
              <article className="concept-featured">
                <span className="concept-number">02</span>
                <div className="concept-illustration concept-beyond">
                  <Image
                    alt="公開Repositoryを自分の開発環境へつなぐイラスト"
                    height={724}
                    src="/concept-flow.png"
                    width={2172}
                  />
                </div>
                <h3>ビヨンドする</h3>
                <p>気になるRepositoryを見つけたら、自分の環境で開発開始。</p>
              </article>
              <article>
                <span className="concept-number">03</span>
                <div className="concept-illustration concept-shoot">
                  <Image
                    alt="追加開発した成果を共有Projectへ投稿するイラスト"
                    height={724}
                    src="/concept-flow.png"
                    width={2172}
                  />
                </div>
                <h3>シュートする</h3>
                <p>追加実装したForkと学んだことを、元Projectに紐づけて投稿。</p>
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
              チュートリアルの次は、誰かが本気で作ろうとしたコードを読んでみよう。
            </p>
            <Link className="button button-primary button-large" href="/projects">
              Projectを探しに行く
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
