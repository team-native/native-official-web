import { jsonError, requireAdmin } from "@/lib/supabase-server";

const financeData = {
  period: "2026년 7월",
  demo: true,
  summary: {
    available: 10840000,
    monthlyRevenue: 7260000,
    monthlyExpense: 3480000,
    externalReceipts: 8900000,
    reserveBalance: 6240000,
  },
  pools: [
    { id: "operation", label: "운영풀", amount: 3560000, ratio: 40, color: "#3182f6", note: "제품 운영과 공통 비용" },
    { id: "reserve", label: "적립풀", amount: 2670000, ratio: 30, color: "#6b5ce7", note: "다음 프로젝트를 위한 적립" },
    { id: "dividend", label: "배당풀", amount: 2670000, ratio: 30, color: "#00b8a9", note: "프로젝트 기여 배분 예정액" },
  ],
  flow: [
    { month: "1월", income: 1800000, expense: 940000 },
    { month: "2월", income: 2600000, expense: 1280000 },
    { month: "3월", income: 2200000, expense: 1440000 },
    { month: "4월", income: 4100000, expense: 1760000 },
    { month: "5월", income: 4800000, expense: 2310000 },
    { month: "6월", income: 5900000, expense: 2860000 },
    { month: "7월", income: 7260000, expense: 3480000 },
  ],
  receipts: [
    { client: "BRIDGE", project: "iOS 앱 프로토타입", amount: 3600000, status: "수금 완료", date: "07.18" },
    { client: "MOTION", project: "브랜드 웹 구축", amount: 2800000, status: "수금 완료", date: "07.12" },
    { client: "CAMPUS", project: "관리자 도구 개발", amount: 2500000, status: "수금 예정", date: "07.29" },
  ],
  notices: [
    { category: "재무", title: "7월 프로젝트 정산 기준 안내", meta: "어제 업데이트" },
    { category: "규칙", title: "외주 프로젝트 착수 전 체크리스트", meta: "5일 전 업데이트" },
    { category: "문서", title: "NativeLab 계약서 작성 가이드", meta: "7월 10일" },
  ],
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isLocalPreview = process.env.NODE_ENV !== "production" && url.searchParams.get("preview") === "1";

  if (isLocalPreview) {
    return Response.json({
      ...financeData,
      member: { email: "preview@native.team", name: "Native 팀원" },
    });
  }

  const auth = await requireAdmin(request);
  if (!auth) return jsonError("승인된 Native 팀원만 접근할 수 있습니다.", 401);

  return Response.json({
    ...financeData,
    member: {
      email: auth.user.email ?? "",
      name: auth.admin.display_name ?? auth.user.email?.split("@")[0] ?? "Native 팀원",
    },
  });
}
