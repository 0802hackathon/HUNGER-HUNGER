import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilters } from "@/components/project-filters";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  filterProjects,
  getLearningTechnologyOptions,
  getTechnologyOptions,
  listProjects,
} from "@/lib/projects";
import type { Difficulty } from "@/lib/types";

export const metadata: Metadata = {
  title: "Projectを探す",
  description: "技術、学びたいこと、難易度から未完成Projectを探します。",
};

type SearchParams = Promise<{
  q?: string;
  technology?: string;
  learningTechnology?: string;
  difficulty?: string;
}>;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const allProjects = await listProjects();
  const current = {
    query: params.q,
    technology: params.technology,
    learningTechnology: params.learningTechnology,
    difficulty: (params.difficulty ?? "") as Difficulty | "",
  };
  const projects = filterProjects(allProjects, current);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <div className="page-heading split-heading">
          <div>
            <span className="eyebrow">EXPLORE</span>
            <h1>Projectを探す</h1>
            <p>未完成のコードから、次の学びを見つけましょう。</p>
          </div>
          <Link className="button button-secondary" href="/projects/new">
            ＋ Projectを投稿
          </Link>
        </div>

        <ProjectFilters
          current={current}
          learningTechnologies={getLearningTechnologyOptions(allProjects)}
          technologies={getTechnologyOptions(allProjects)}
        />

        <div className="result-heading">
          <strong>{projects.length}件のProject</strong>
          <span>更新日の新しい順</span>
        </div>

        {projects.length ? (
          <div className="project-list">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">⌕</span>
            <h2>条件に合うProjectがありません</h2>
            <p>技術や難易度を減らして、もう一度探してみてください。</p>
            <Link className="button button-secondary" href="/projects">
              条件をリセット
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
