"use client";

import { FormEvent, useState } from "react";
import { PortalScreen, useInhouseData } from "../portal-shared";

const requestTypes = [
  { id: "budget", eyebrow: "BUDGET", title: "예산 품의서 신청", copy: "프로젝트와 팀 운영에 필요한 비용을 신청해요.", meta: "금액 · 목적 · 증빙" },
  { id: "purchase", eyebrow: "PURCHASE", title: "구매 요청", copy: "도구, 계정, 장비 등 업무에 필요한 항목을 요청해요.", meta: "품목 · 수량 · 희망일" },
  { id: "project", eyebrow: "PROJECT", title: "프로젝트 지원", copy: "새 프로젝트의 예산과 인원 지원을 요청해요.", meta: "목표 · 일정 · 필요 자원" },
];

export default function InhouseRequestsPage() {
  const { data, error } = useInhouseData();
  const [selected, setSelected] = useState<typeof requestTypes[number] | null>(null);
  const [done, setDone] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setDone(true); };
  return <PortalScreen data={data} error={error} active="requests">{data && <>
    <section className="pf-page-hero pf-request-hero"><span>DOCUMENT REQUEST</span><h1>필요한 요청을<br />문서로 남겨요.</h1><p>누가, 왜, 무엇을 요청했는지 명확하게 남기고<br />진행 상태를 함께 확인할 수 있어요.</p><i aria-hidden="true">N</i></section>
    <section className="pf-request-grid">{requestTypes.map((item, index) => <button key={item.id} onClick={() => { setSelected(item); setDone(false); }} className="pf-request-card" style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}><i>{String(index + 1).padStart(2,"0")}</i><small>{item.eyebrow}</small><h2>{item.title}</h2><p>{item.copy}</p><span>{item.meta}</span><b>→</b></button>)}</section>
    <section className="pf-request-history"><div><span>MY REQUESTS</span><h2>내가 작성한 신청</h2></div><article><i>검토 중</i><div><b>Book-on 테스트 기기 구매</b><small>예산 품의 · 오늘</small></div><strong>420,000원</strong><span>→</span></article></section>
    {selected && <div className="pf-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><section className="pf-request-modal">{done ? <div className="pf-request-done"><i>✓</i><h2>요청서를 작성했어요</h2><p>연결된 저장소가 준비되면 담당자에게 바로 전달돼요.</p><button onClick={() => setSelected(null)}>확인</button></div> : <><header><div><span>{selected.eyebrow}</span><h2>{selected.title}</h2></div><button onClick={() => setSelected(null)}>×</button></header><form onSubmit={submit}><label><span>요청 제목</span><input required placeholder="무엇이 필요한지 한 줄로 적어주세요" /></label><div className="pf-form-row"><label><span>요청 금액</span><input type="number" min="0" placeholder="0" /></label><label><span>필요한 날짜</span><input type="date" /></label></div><label><span>요청 사유</span><textarea required placeholder="목적과 필요한 이유를 알려주세요" /></label><footer><button type="button" onClick={() => setSelected(null)}>취소</button><button type="submit">신청서 보내기 →</button></footer></form></>}</section></div>}
  </>}</PortalScreen>;
}
