import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "このサービスについて",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell prose-page">
        <span className="eyebrow">ABOUT HUNGER×HUNGER</span>
        <h1>二つの「足りない」をつなぐ。</h1>
        <p className="lead">
          作り切れなかった構想を誰かに役立ててほしい人と、実践的な開発題材を探す学習者をつなぎます。
        </p>

        <section>
          <h2>所有権を受け渡すサービスではありません</h2>
          <p>
            元Projectの所有者・著作権者は変わりません。学習者は公開RepositoryをForkまたはCloneし、
            記載されたライセンスと利用条件の範囲で、自分の環境に追加開発します。
          </p>
        </section>
        <section>
          <h2>ビヨンド</h2>
          <p>
            応募や承認を待たず、開発途中のProjectを学習題材として始めることです。
            ログインしていなくてもRepositoryを閲覧できます。
          </p>
        </section>
        <section>
          <h2>シュート</h2>
          <p>
            追加開発したFork、成果物、学んだことを元Projectに関連付けて投稿することです。
            シュートはPull Requestの承認やマージを意味しません。
          </p>
        </section>
        <section className="notice-card warning">
          <h2>安全に取り組むために</h2>
          <p>
            未検証コードを普段使う端末で不用意に実行せず、依存関係、実行スクリプト、履歴に残った秘密情報を確認してください。
            HUNGER×HUNGERはコードを実行せず、安全性やライセンスの法的有効性を保証しません。
          </p>
        </section>
        <Link className="button button-primary button-large" href="/projects">
          Projectを探す
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
