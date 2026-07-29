import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "ログイン",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <div className="auth-intro">
          <Link className="brand auth-brand" href="/">
            <span className="brand-mark">H×H</span>
            <span>HUNGER×HUNGER</span>
          </Link>
          <span className="eyebrow">CONTINUE THE UNFINISHED</span>
          <h1>次のCommitを、あなたから。</h1>
          <p>
            ログインすると、ビヨンドしたProject、進捗、シュートした成果を記録できます。
          </p>
          <ul className="auth-benefits">
            <li>↗ ビヨンド履歴を残す</li>
            <li>⌁ ForkやPull Requestを記録する</li>
            <li>● 追加開発した成果をシュートする</li>
          </ul>
        </div>
        <AuthForm />
      </main>
    </>
  );
}
