import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "ダッシュボード",
};

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell wide-shell">
        <DashboardClient />
      </main>
    </>
  );
}
