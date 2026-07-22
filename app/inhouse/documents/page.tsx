"use client";

import { useMemo, useState } from "react";
import { PortalScreen, useInhouseData } from "../portal-shared";

const documents = [
  { category: "운영 규칙", title: "Native 프로젝트 운영 원칙", copy: "아이디어 제안부터 PO 결정, 팀 구성과 출시까지의 기준", date: "2026.07.18", type: "RULE" },
  { category: "재무", title: "외주 수금 및 풀 배분 기준", copy: "운영풀·적립풀·배당풀의 배분과 정산 방식", date: "2026.07.15", type: "FINANCE" },
  { category: "템플릿", title: "프로젝트 킥오프 문서", copy: "목표, 사용자, 핵심 기능과 일정을 정리하는 시작 문서", date: "2026.07.10", type: "TEMPLATE" },
  { category: "NativeLab", title: "외주 프로젝트 진행 가이드", copy: "문의 접수부터 계약, 제작, 납품과 수금까지의 절차", date: "2026.07.08", type: "GUIDE" },
  { category: "팀 규칙", title: "회의와 의사결정 원칙", copy: "짧게 논의하고 명확하게 기록하는 팀의 방식", date: "2026.07.03", type: "RULE" },
];

export default function InhouseDocumentsPage() {
  const { data, error } = useInhouseData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const filtered = useMemo(() => documents.filter((item) => (category === "전체" || item.category === category) && `${item.title} ${item.copy}`.includes(query)), [category, query]);
  const categories = ["전체", "운영 규칙", "재무", "템플릿", "NativeLab", "팀 규칙"];
  return <PortalScreen data={data} error={error} active="documents">{data && <>
    <section className="pf-doc-hero"><div><span>TEAM LIBRARY</span><h1>팀의 기준을<br />한곳에서 찾아요.</h1><p>규칙도 문서의 일부예요. 운영 기준, 재무 정책,<br />업무 템플릿을 같은 문서함에서 관리합니다.</p></div><label><i>⌕</i><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="찾고 싶은 문서를 검색해보세요" /></label></section>
    <section className="pf-doc-body"><aside>{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}<span>{item === "전체" ? documents.length : documents.filter((doc) => doc.category === item).length}</span></button>)}</aside><div className="pf-doc-list"><header><b>{category}</b><span>{filtered.length}개의 문서</span></header>{filtered.map((item) => <article key={item.title}><small>{item.type}</small><div><b>{item.title}</b><p>{item.copy}</p></div><time>{item.date}</time><i>→</i></article>)}{filtered.length === 0 && <div className="pf-empty">검색 결과가 없어요.</div>}</div></section>
  </>}</PortalScreen>;
}
