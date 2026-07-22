"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { InhouseHeader } from "./portal-shared";

type FinanceData = {
  period: string;
  demo: boolean;
  member: { name: string; email: string };
  summary: { available: number; monthlyRevenue: number; monthlyExpense: number; externalReceipts: number; reserveBalance: number };
  pools: { id: string; label: string; amount: number; ratio: number; color: string; note: string }[];
  flow: { month: string; income: number; expense: number }[];
  receipts: { client: string; project: string; amount: number; status: string; date: string }[];
  notices: { category: string; title: string; meta: string }[];
};

const won = new Intl.NumberFormat("ko-KR");

export default function FinanceClient() {
  const router = useRouter();
  const client = getBrowserSupabase();
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState("");
  const requestsHref = typeof window !== "undefined" && window.location.search.includes("preview=1") ? "/inhouse/requests?preview=1" : "/inhouse/requests";

  useEffect(() => {
    const load = async () => {
      const isLocalPreview = window.location.search.includes("preview=1");
      if (isLocalPreview) {
        const previewResponse = await fetch("/api/inhouse?preview=1", { cache: "no-store" });
        if (!previewResponse.ok) throw new Error("인하우스 미리보기를 불러오지 못했습니다.");
        setData(await previewResponse.json());
        return;
      }

      const session = (await client?.auth.getSession())?.data.session;
      if (!session) return router.replace("/inhouse/login");
      const response = await fetch("/api/inhouse", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      if (response.status === 401) return router.replace("/inhouse/login");
      if (!response.ok) throw new Error("인하우스 데이터를 불러오지 못했습니다.");
      setData(await response.json());
    };
    load().catch((reason) => setError(reason.message));
  }, [client, router]);

  if (error) return <main className="ih-state"><b>!</b><h1>잠시 문제가 생겼어요</h1><p>{error}</p><button onClick={() => location.reload()}>다시 불러오기</button></main>;
  if (!data) return <main className="ih-state loading"><div className="ih-loader"><i /><i /><i /></div><p>Native의 흐름을 불러오고 있어요</p></main>;

  return (
    <main className="pf-shell pf-finance">
      <InhouseHeader member={data.member} />
      <div className="ih-shell">

      <section className="ih-hero" id="finance">
        <div className="ih-hero-copy ih-enter">
          <span className="ih-kicker"><i /> 팀 재무 흐름</span>
          <h1>팀의 돈이 흐르는 길을<br />한눈에 보여드려요.</h1>
          <p>외주 수금부터 운영, 적립, 배당까지.<br />복잡한 숫자를 이해하기 쉬운 흐름으로 정리했어요.</p>
          <div className="ih-hero-actions"><Link href={requestsHref}>문서 신청하기 <b>→</b></Link></div>
        </div>
        <div className="ih-traffic-card ih-enter delay-1">
          <div className="ih-traffic-head"><span>이번 달 재무 트래픽</span><small>{data.period} <b>{data.demo ? "데모 데이터" : "LIVE"}</b></small></div>
          <div className="ih-traffic-source"><small>외주 수금액</small><strong><CountUp value={data.summary.externalReceipts} />원</strong><em>이번 달 확정·예정 수금</em></div>
          <div className="ih-flow-line" aria-hidden="true"><i /><i /><i /></div>
          <div className="ih-traffic-pools">
            {data.pools.map((pool, index) => <div key={pool.id} style={{ "--pool": pool.color, "--delay": `${.55 + index * .16}s` } as React.CSSProperties}><i /><small>{pool.label}</small><strong>{won.format(pool.amount)}원</strong><span>{pool.ratio}%</span></div>)}
          </div>
        </div>
      </section>

      <section className="ih-overview ih-container">
        <Reveal className="ih-section-head"><div><span>이번 달</span><h2>돈의 흐름을 요약했어요</h2></div><p>마지막 업데이트 · 오늘 09:42</p></Reveal>
        <div className="ih-summary-grid">
          <Reveal className="ih-balance-card" delay={0}>
            <div><span>지금 사용할 수 있는 금액</span><small>가용 운영 자금</small></div>
            <strong><CountUp value={data.summary.available} />원</strong>
            <div className="ih-balance-bottom"><span>지난달보다 <b>12.8% 늘었어요</b></span><i>↗</i></div>
          </Reveal>
          <Reveal className="ih-summary-card income" delay={80}><span>이번 달 들어온 돈</span><strong>+<CountUp value={data.summary.monthlyRevenue} />원</strong><small>외주 프로젝트 3건</small><i>↗</i></Reveal>
          <Reveal className="ih-summary-card expense" delay={160}><span>이번 달 나간 돈</span><strong>-<CountUp value={data.summary.monthlyExpense} />원</strong><small>운영비 포함 8건</small><i>↘</i></Reveal>
          <Reveal className="ih-summary-card reserve" delay={240}><span>현재 쌓인 적립풀</span><strong><CountUp value={data.summary.reserveBalance} />원</strong><small>다음 프로젝트를 위한 자금</small><i>＋</i></Reveal>
        </div>
      </section>

      <section className="ih-chart-section ih-container">
        <Reveal className="ih-chart-card">
          <div className="ih-chart-head"><div><span>월별 현금 흐름</span><h3>수금과 지출의 간격이<br />꾸준히 벌어지고 있어요</h3></div><div className="ih-chart-legend"><span><i className="blue" />들어온 돈</span><span><i className="gray" />나간 돈</span></div></div>
          <CashFlowChart items={data.flow} />
        </Reveal>
        <Reveal className="ih-allocation-card" delay={100}>
          <span>풀 배분</span><h3>들어온 돈은<br />이렇게 나누고 있어요</h3>
          <div className="ih-donut" style={{ background: `conic-gradient(${data.pools.map((pool, index) => `${pool.color} ${data.pools.slice(0, index).reduce((sum, item) => sum + item.ratio, 0)}% ${data.pools.slice(0, index + 1).reduce((sum, item) => sum + item.ratio, 0)}%`).join(",")})` }}><div><b>100%</b><small>자동 배분</small></div></div>
          <ul>{data.pools.map((pool) => <li key={pool.id}><i style={{ background: pool.color }} /><div><b>{pool.label}</b><small>{pool.note}</small></div><strong>{pool.ratio}%</strong></li>)}</ul>
        </Reveal>
      </section>

      <section className="ih-receipts ih-container">
        <Reveal className="ih-section-head"><div><span>외주 수금</span><h2>이번 달 수금 현황이에요</h2></div><button>전체 내역 보기 <b>→</b></button></Reveal>
        <Reveal className="ih-receipt-table" delay={100}>
          {data.receipts.map((item, index) => <article key={item.client} style={{ "--row": index } as React.CSSProperties}><div className="ih-client-logo">{item.client.slice(0, 1)}</div><div><b>{item.client}</b><small>{item.project}</small></div><span className={item.status === "수금 완료" ? "done" : "scheduled"}>{item.status}</span><time>{item.date}</time><strong>{won.format(item.amount)}원</strong><button aria-label={`${item.client} 상세 내역`}>›</button></article>)}
        </Reveal>
      </section>

      <footer className="ih-footer"><div className="ih-wordmark"><span><Image src="/native-logo.png" alt="" fill sizes="30px" unoptimized /></span><b>Native</b></div><p>플랫폼에 맞는 자연스러운 경험을 설계하고 구현합니다.</p><small>INTERNAL USE ONLY · 2026 NATIVE</small></footer>
      </div>
    </main>
  );
}

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - started) / 1100, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - progress, 4))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return won.format(shown);
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: .16, rootMargin: "0px 0px -40px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`ih-reveal ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function CashFlowChart({ items }: { items: FinanceData["flow"] }) {
  const width = 760;
  const height = 245;
  const max = Math.max(...items.flatMap((item) => [item.income, item.expense])) * 1.12;
  const point = (value: number, index: number) => `${52 + index * ((width - 92) / (items.length - 1))},${height - 38 - (value / max) * (height - 70)}`;
  const income = items.map((item, index) => point(item.income, index)).join(" ");
  const expense = items.map((item, index) => point(item.expense, index)).join(" ");
  const area = `M ${income.replaceAll(" ", " L ")} L ${width - 40},${height - 38} L 52,${height - 38} Z`;
  return <div className="ih-chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="월별 수입 및 지출 추이"><defs><linearGradient id="financeArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9b928" stopOpacity=".18" /><stop offset="1" stopColor="#e9b928" stopOpacity="0" /></linearGradient></defs><path className="area" d={area} /><polyline className="expense-line" points={expense} /><polyline className="income-line" points={income} />{items.map((item, index) => { const [x,y] = point(item.income,index).split(","); return <circle key={item.month} cx={x} cy={y} r="4.5" />; })}</svg><div className="ih-chart-labels">{items.map((item) => <span key={item.month}>{item.month}</span>)}</div></div>;
}
