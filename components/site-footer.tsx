import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">H×H</span>
          <div>
            <strong>HUNGER×HUNGER</strong>
            <p>未完成のコードを、次の学びへ。</p>
          </div>
        </div>
        <nav className="footer-links" aria-label="フッターナビゲーション">
          <Link href="/about">サービスについて</Link>
          <Link href="/projects">プロジェクトを探す</Link>
          <Link href="/projects/new">プロジェクトを投稿</Link>
        </nav>
        <div className="footer-note">
          <p>
            本サービスはソースコードの所有権移転を
            <br />
            仲介するものではありません。
          </p>
          <small>© 2026 HUNGER×HUNGER</small>
        </div>
      </div>
    </footer>
  );
}
