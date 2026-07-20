import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://native-web-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Native — 플랫폼에 맞는 자연스러운 경험을 설계하고 구현하는 팀",
  description: "iOS, Android, Web 각 플랫폼의 특성을 이해하고 가장 자연스러운 제품 경험을 설계하고 구현하는 개발팀 Native입니다.",
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/native-logo.png",
    shortcut: "/native-logo.png",
  },
  openGraph: {
    title: "Native — 플랫폼에 맞는 자연스러운 경험을 설계하고 구현하는 팀",
    description: "iOS, Android, Web의 특성을 이해하고 플랫폼에 가장 자연스러운 제품 경험을 만듭니다.",
    url: siteUrl,
    siteName: "Native",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og-v3.png", width: 1734, height: 907, alt: "Native — 플랫폼에 맞는 자연스러운 경험을 설계하고 구현하는 팀" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Native — 플랫폼에 맞는 자연스러운 경험을 설계하고 구현하는 팀",
    description: "iOS, Android, Web의 특성을 이해하고 플랫폼에 가장 자연스러운 제품 경험을 만듭니다.",
    images: ["/og-v3.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
