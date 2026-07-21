import type { Metadata } from "next";
import "./contest.css";

export const metadata: Metadata = {
  title: "Book-on 로고 공모전 | Native",
  description: "Native의 도서관 플랫폼 Book-on을 대표할 새로운 공식 로고를 모집합니다.",
  alternates: { canonical: "/book-on-logo-contest" },
  openGraph: {
    title: "Book-on 로고 공모전",
    description: "학교 전체를 대상으로 Book-on의 새로운 공식 로고를 모집합니다.",
    url: "/book-on-logo-contest",
    type: "website",
    images: [{ url: "/contest-og.png", width: 1729, height: 910, alt: "Book-on 로고 공모전 — 학교 도서관 플랫폼의 새로운 얼굴을 찾습니다" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book-on 로고 공모전",
    description: "학교 도서관 플랫폼의 새로운 얼굴을 찾습니다.",
    images: ["/contest-og.png"],
  },
};

export default function ContestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
