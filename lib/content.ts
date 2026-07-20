export type Project = {
  id?: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  summary: string;
  content: string;
  logo: string;
  images: string[];
  tone: string;
  visual: string;
  tags: string[];
  sortOrder: number;
  published: boolean;
};

export type JobPosting = {
  id?: string;
  slug: string;
  department: string;
  title: string;
  summary: string;
  description: string;
  priority: boolean;
  status: "open" | "closed" | "draft";
  closeDate: string | null;
  sortOrder: number;
};

export const fallbackProjects: Project[] = [
  {
    slug: "book-on",
    name: "BOOK-ON",
    type: "Main product · Mobile",
    description: "독서 기록부터 마라톤까지, 읽는 경험을 오래 이어주는 Native의 메인 서비스",
    summary: "책을 찾고, 빌리고, 기록하며 함께 읽는 경험을 하나의 앱으로 연결합니다.",
    content: "BOOK-ON은 교내 도서관의 대출 경험과 개인 독서 기록을 자연스럽게 연결하는 Native의 메인 서비스입니다. iOS와 Android에서 같은 기능을 제공하되 각 플랫폼의 사용 방식에 맞는 인터랙션을 설계했습니다. 도서 검색, 대출 현황, 상세 정보, 독서 마라톤과 AI 추천까지 읽기 전후의 흐름을 한곳에서 이어갑니다.",
    logo: "/brand/bookon-symbol.png",
    images: ["/book-on.png", "/bookon-detail.png", "/bookon-mypage.png"],
    tone: "bookon",
    visual: "phone-pair",
    tags: ["iOS", "Android", "Back-End"],
    sortOrder: 1,
    published: true,
  },
  {
    slug: "hopes",
    name: "HOPES",
    type: "AI school platform",
    description: "학생의 질문과 경험을 연결해 더 솔직한 학교 생활을 돕는 AI 선배 챗봇",
    summary: "학교생활에 관한 질문을 실제 선배의 경험과 AI로 연결하는 웹 플랫폼입니다.",
    content: "HOPES는 재학생과 신입생이 학교생활에서 마주치는 질문에 더 솔직한 답을 얻을 수 있도록 만든 AI 선배 챗봇입니다. 기숙사 생활, 전공과 진로, 입학 준비처럼 학교 안에서만 알기 쉬운 정보를 실제 경험을 바탕으로 정리하고, 필요한 답을 빠르게 찾을 수 있도록 설계했습니다.",
    logo: "/brand/hopes-symbol.png",
    images: ["/hopes-ui.png"],
    tone: "hopes",
    visual: "web-screen",
    tags: ["Flutter", "Android", "Front-End", "Back-End"],
    sortOrder: 2,
    published: true,
  },
  {
    slug: "it-da",
    name: "IT-DA",
    type: "Project community",
    description: "학교 안에서 프로젝트와 사람을 발견하고 함께 팀을 만드는 협업 커뮤니티",
    summary: "아이디어와 사람을 연결해 학생 프로젝트의 시작과 합류를 돕습니다.",
    content: "IT-DA는 학교 안의 프로젝트와 사람을 발견하고 팀을 만들 수 있는 협업 커뮤니티입니다. 관심 기술과 역할을 기반으로 프로젝트를 탐색하고, 지원과 제안을 주고받으며, 자신의 활동을 포트폴리오처럼 쌓을 수 있도록 구성했습니다.",
    logo: "/brand/itda-symbol.png",
    images: ["/itda-login.png", "/itda-home.png", "/itda-profile.png"],
    tone: "itda",
    visual: "phone-trio",
    tags: ["iOS", "Front-End", "Back-End", "Android"],
    sortOrder: 3,
    published: true,
  },
];

export const fallbackJobs: JobPosting[] = [
  { slug: "ios", department: "NATIVE APP", title: "iOS", summary: "iPhone과 iPad에서 자연스럽게 작동하는 제품 경험을 함께 만듭니다.", description: "Swift와 Apple 플랫폼의 문법을 이해하고 Native 제품의 iOS 경험을 함께 설계하고 구현합니다.", priority: false, status: "open", closeDate: null, sortOrder: 1 },
  { slug: "android", department: "NATIVE APP", title: "Android", summary: "다양한 Android 기기에서 안정적이고 일관된 경험을 구현합니다.", description: "Android 생태계와 기기 특성을 이해하고 안정적인 앱 경험을 함께 구현합니다.", priority: false, status: "open", closeDate: null, sortOrder: 2 },
  { slug: "front-end", department: "WEB", title: "Front-End", summary: "빠른 실험을 이해하기 쉽고 완성도 높은 웹 화면으로 연결합니다.", description: "제품의 아이디어를 반응형 웹 경험으로 빠르게 구현하고 품질을 함께 높입니다.", priority: true, status: "open", closeDate: null, sortOrder: 3 },
  { slug: "design", department: "DESIGN", title: "Design", summary: "문제를 발견하고 사용자가 바로 이해하는 경험으로 구체화합니다.", description: "제품의 문제를 정의하고 브랜드와 인터페이스 전반의 경험을 설계합니다.", priority: true, status: "open", closeDate: null, sortOrder: 4 },
  { slug: "back-end", department: "SERVER", title: "Back-End", summary: "여러 제품이 안정적으로 성장할 수 있는 구조와 데이터를 설계합니다.", description: "제품의 API와 데이터 구조를 설계하고 안정적인 운영 기반을 함께 만듭니다.", priority: false, status: "open", closeDate: null, sortOrder: 5 },
];

export function projectFromRow(row: Record<string, unknown>): Project {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    type: String(row.type ?? ""),
    description: String(row.description ?? ""),
    summary: String(row.summary ?? ""),
    content: String(row.content ?? ""),
    logo: String(row.logo_url ?? "/native-logo.png"),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    tone: String(row.tone ?? "bookon"),
    visual: String(row.visual ?? "web-screen"),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    sortOrder: Number(row.sort_order ?? 0),
    published: Boolean(row.published),
  };
}

export function jobFromRow(row: Record<string, unknown>): JobPosting {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    department: String(row.department ?? ""),
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    description: String(row.description ?? ""),
    priority: Boolean(row.priority),
    status: (row.status === "closed" || row.status === "draft") ? row.status : "open",
    closeDate: row.close_date ? String(row.close_date) : null,
    sortOrder: Number(row.sort_order ?? 0),
  };
}
