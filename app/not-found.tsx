import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="status-page">
        <span className="status-code">404</span>
        <h1>Projectが見つかりません</h1>
        <p>削除されたか、URLが間違っている可能性があります。</p>
        <Link className="button button-primary" href="/projects">
          Project一覧へ戻る
        </Link>
      </main>
    </>
  );
}
