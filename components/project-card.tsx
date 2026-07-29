import Link from "next/link";
import type { Difficulty, Project } from "@/lib/types";

const difficultyLabel: Record<Difficulty, string> = {
  beginner: "危険度 D",
  intermediate: "危険度 C",
  advanced: "危険度 B",
  expert: "危険度 A",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="repo-card">
      <div className="repo-card-main">
        <div className="repo-card-heading">
          <div>
            <div className="repo-owner">{project.ownerName} /</div>
            <h2>
              <Link href={`/projects/${project.id}`}>{project.title}</Link>
            </h2>
          </div>
          <span className={`difficulty difficulty-${project.difficulty}`}>
            {difficultyLabel[project.difficulty]}
          </span>
        </div>

        <p className="repo-description">{project.summary}</p>

        <div className="tag-list" aria-label="使用技術">
          {project.technologies.map((technology) => (
            <span className="topic-tag" key={technology}>
              {technology}
            </span>
          ))}
        </div>

        <div className="repo-meta">
          <span>
            <i className="language-dot" aria-hidden="true" />{" "}
            {project.technologies[0]}
          </span>
          <span>↗ {project.beyondCount} ビヨンド</span>
          <span>● {project.continuationCount} シュート</span>
          <span>更新 {formatDate(project.updatedAt)}</span>
        </div>
      </div>

      <div className="repo-card-side">
        <div className="side-label">学べること</div>
        <ul>
          {project.learnableTechnologies.slice(0, 4).map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <Link className="text-link" href={`/projects/${project.id}`}>
          構想とコードを見る →
        </Link>
      </div>
    </article>
  );
}
