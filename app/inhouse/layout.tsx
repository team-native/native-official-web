import type { Metadata } from "next";
import "./inhouse.css";
import "./portal.css";

export const metadata: Metadata = {
  title: "Native Inhouse",
  description: "Native 팀의 재무, 요청과 문서를 연결하는 내부 팀스페이스",
  robots: { index: false, follow: false },
};

export default function InhouseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
