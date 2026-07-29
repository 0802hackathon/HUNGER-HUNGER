import type { Metadata } from "next";
import Link from "next/link";
import { ProjectForm } from "@/components/project-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "未完成Projectを投稿",
  description: "開発目的、現状、断念理由、構想を次の学習者へ残します。",
};

export default function NewProjectPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell wide-shell">
        <div className="page-heading">
          <div className="breadcrumb simple">
            <Link href="/projects">Projects</Link>
            <span>/</span>
            <strong>New</strong>
          </div>
          <span className="eyebrow">SHARE THE UNFINISHED</span>
          <h1>未完成Projectを投稿する</h1>
          <p>
            コードだけでなく、始めた理由と実現したかった未来を残してください。
          </p>
        </div>
        <ProjectForm />
      </main>
    </>
  );
}
