import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContinuationForm } from "@/components/continuation-form";
import { SiteHeader } from "@/components/site-header";
import { getProject } from "@/lib/projects";

export const metadata: Metadata = {
  title: "成果をシュート",
};

type Params = Promise<{ projectId: string }>;

export default async function NewContinuationPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project || project.status === "archived") notFound();

  return (
    <>
      <SiteHeader />
      <main className="page-shell form-shell">
        <div className="page-heading">
          <div className="breadcrumb simple">
            <Link href={`/projects/${project.id}`}>{project.title}</Link>
            <span>/</span>
            <strong>Shoot</strong>
          </div>
          <span className="eyebrow">PUBLISH YOUR CONTINUATION</span>
          <h1>成果をシュートする</h1>
          <p>
            自分のForkで追加開発した内容と学びを、元Projectに関連付けて投稿します。
          </p>
        </div>
        <div className="form-page-card">
          <div className="notice-card">
            <strong>元Projectへのマージ申請ではありません</strong>
            <p>
              シュートは学習成果の公開です。元Repositoryへの反映を希望する場合は、別途Pull
              Requestを作成してください。
            </p>
          </div>
          <ContinuationForm projectId={project.id} />
        </div>
      </main>
    </>
  );
}
