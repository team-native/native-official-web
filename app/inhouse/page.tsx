"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PortalScreen, useInhouseData, won } from "./portal-shared";

export default function InhouseHomePage() {
  const { data, error } = useInhouseData();
  const preview = typeof window !== "undefined" && window.location.search.includes("preview=1");
  const link = (href: string) => preview ? `${href}?preview=1` : href;
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".pf-reveal"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .16, rootMargin: "0px 0px -40px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [data]);

  return <PortalScreen data={data} error={error} active="home">{data && <>
    <section className="pf-home-hero">
      <div className="pf-home-copy pf-rise">
        <span><i /> NATIVE TEAMSPACE</span>
        <h1>Native의 일을<br />한곳에서.</h1>
        <p>팀의 재무 흐름과 요청, 기준과 문서를<br />누구나 같은 화면에서 확인해요.</p>
      </div>
      <FinancePreview data={data} href={link("/inhouse/finance")} />
    </section>

    <section className="pf-shortcuts">
      <div className="pf-section-copy pf-reveal"><span>WORKSPACE</span><h2>필요한 일에 바로<br />도착할 수 있도록.</h2><p>재무 확인부터 문서 요청, 운영 기준 열람까지<br />팀에서 자주 하는 일을 짧게 연결했어요.</p></div>
      <div className="pf-shortcut-grid">
        <Link className="pf-shortcut pf-reveal" href={link("/inhouse/requests")}><i>01</i><span>문서 신청</span><h3>비용과 업무에 필요한<br />요청을 남겨요.</h3><b>신청 시작하기 →</b></Link>
        <Link className="pf-shortcut pf-reveal delay" href={link("/inhouse/documents")}><i>02</i><span>문서함</span><h3>규칙과 템플릿을<br />한곳에서 찾아요.</h3><b>문서 찾아보기 →</b></Link>
      </div>
    </section>

    <section className="pf-recent">
      <div className="pf-section-copy pf-reveal"><span>RECENT</span><h2>지금 팀이<br />알아야 할 것들.</h2></div>
      <div className="pf-recent-list pf-reveal">{data.notices.map((item) => <Link href={link("/inhouse/documents")} key={item.title}><span>{item.category}</span><div><b>{item.title}</b><small>{item.meta}</small></div><i>→</i></Link>)}</div>
    </section>
    <footer className="pf-footer"><b>Native inhouse</b><span>팀의 운영이 투명하고 단순해지도록.</span><small>INTERNAL USE ONLY</small></footer>
  </>}</PortalScreen>;
}

function FinancePreview({ data, href }: { data: NonNullable<ReturnType<typeof useInhouseData>["data"]>; href: string }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const started = performance.now(); let id = 0;
    const tick = (now: number) => { const p = Math.min((now - started) / 1000, 1); setShown(Math.round(data.summary.available * (1 - Math.pow(1 - p, 4)))); if (p < 1) id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id);
  }, [data.summary.available]);
  const max = Math.max(...data.flow.map((item) => item.income));
  const points = data.flow.map((item, index) => `${index * 120 + 5},${125 - item.income / max * 90}`).join(" ");
  return <div ref={ref} className="pf-finance-preview pf-rise delay">
    <div className="pf-preview-head"><div><i /> 재무 트래픽</div><span>{data.period}</span></div>
    <div className="pf-preview-main"><small>지금 사용할 수 있는 금액</small><strong>{won.format(shown)}원</strong><p>운영풀과 확정 수금을 기준으로 계산했어요.</p></div>
    <svg viewBox="0 0 610 145" aria-label="최근 수금 흐름"><polyline points={points} /></svg>
    <div className="pf-home-pools">{data.pools.map((pool) => <div key={pool.id}><span><i style={{ background: pool.color }} />{pool.label}<small>{pool.ratio}%</small></span><b>{won.format(pool.amount)}원</b></div>)}</div>
    <div className="pf-preview-meta"><span><small>이번 달 수금</small><b>+{won.format(data.summary.monthlyRevenue)}원</b></span><span><small>이번 달 지출</small><b>-{won.format(data.summary.monthlyExpense)}원</b></span><Link href={href}>자세히 보기 <b>→</b></Link></div>
  </div>;
}
