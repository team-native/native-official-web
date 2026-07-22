import type { Metadata } from "next";
import "./inhouse.css";

export const metadata: Metadata = {
  title: "Native Inhouse",
  description: "Native 팀을 위한 재무와 운영 허브",
  robots: { index: false, follow: false },
};

export default function InhouseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
