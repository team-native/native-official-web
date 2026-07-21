import type { Metadata } from "next";
import "./recruit.css";

export const metadata: Metadata = {
  title: "전공 상세 | Native",
  description: "Native의 모집 전공과 활동 내용을 확인하고 지원할 수 있습니다.",
};

export default function RecruitLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
