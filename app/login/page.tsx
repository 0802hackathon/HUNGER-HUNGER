import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "ログイン",
};

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;
  const initialMessage =
    error === "oauth_callback"
      ? "ログインを完了できませんでした。ProviderとRedirect URLの設定を確認してください。"
      : "";

  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <AuthForm initialMessage={initialMessage} />
      </main>
    </>
  );
}
