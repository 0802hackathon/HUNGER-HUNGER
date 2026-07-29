import type { Metadata } from "next";
import "@fontsource-variable/mona-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "HUNGER×HUNGER — 未完成のコードを、次の学びへ",
    template: "%s | HUNGER×HUNGER",
  },
  description:
    "開発途中のProjectと、実践的な開発題材を探す学習者をつなぐオープンな学習プラットフォーム。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "HUNGER×HUNGER",
    title: "HUNGER×HUNGER — 未完成のコードを、次の学びへ",
    description:
      "未完成の構想と、実践的な題材を探すためのプラットフォーム。公開されたRepositoryから自由に始められます。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "未完成のコードから次の実装へ架かる橋",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HUNGER×HUNGER",
    description: "未完成のコードを、次の学びへ。",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
