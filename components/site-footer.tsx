import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <strong>HUNGER×HUNGER</strong>
          <p>未完成のコードを、次の学びへ。</p>
        </div>
        <div className="footer-links">
          <Link href="/about">サービスについて</Link>
          <Link href="/projects">プロジェクトを探す</Link>
          <Link href="/projects/new">プロジェクトを投稿</Link>
        </div>
        <p className="footer-note">
          本サービスはソースコードの所有権移転を仲介するものではありません。
        </p>
      </div>
    </footer>
  );
}
