import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "プロフィール",
};

export default function ProfilePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell form-page">
        <div className="page-heading">
          <span className="eyebrow">YOUR PROFILE</span>
          <h1>プロフィールとスキル</h1>
          <p>
            学習中の技術と経験のある技術を分けて登録し、題材選びの基準にします。
          </p>
        </div>
        <ProfileForm />
      </main>
    </>
  );
}
