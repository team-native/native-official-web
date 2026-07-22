"use client";

import Image from "next/image";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

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

export default function InhousePage() {
  const router = useRouter();
  const client = getBrowserSupabase();
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState("");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetDone, setBudgetDone] = useState(false);

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

  const signOut = async () => {
    await client?.auth.signOut();
    router.replace("/inhouse/login");
  };

  if (error) return <main className="ih-state"><b>!</b><h1>잠시 문제가 생겼어요</h1><p>{error}</p><button onClick={() => location.reload()}>다시 불러오기</button></main>;
  if (!data) return <main className="ih-state loading"><div className="ih-loader"><i /><i /><i /></div><p>Native의 흐름을 불러오고 있어요</p></main>;

  return (
    <main className="ih-shell">
      <header className="ih-header">
        <a href="/inhouse" className="ih-wordmark"><span><Image src="/native-logo.png" alt="Native" fill sizes="34px" unoptimized /></span><b>Native</b><em>inhouse</em></a>
        <nav aria-label="인하우스 메뉴">
          <a href="#finance" className="active">재무</a>
          <a href="#approval">품의</a>
          <a href="#documents">문서</a>
          <a href="#rules">규칙</a>
        </nav>
        <div className="ih-account"><span>{data.member.name.slice(0, 1)}</span><div><b>{data.member.name}</b><small>Native member</small></div><button onClick={signOut}>로그아웃</button></div>
      </header>

      <section className="ih-hero" id="finance">
        <div className="ih-hero-copy ih-enter">
          <span className="ih-kicker"><i /> 팀 재무 흐름</span>
          <h1>팀의 돈이 흐르는 길을<br />한눈에 보여드려요.</h1>
          <p>외주 수금부터 운영, 적립, 배당까지.<br />복잡한 숫자를 이해하기 쉬운 흐름으로 정리했어요.</p>
          <div className="ih-hero-actions"><button onClick={() => setBudgetOpen(true)}>예산 품의서 신청 <b>→</b></button><a href="#documents">운영 문서 보기</a></div>
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

      <section className="ih-work ih-container" id="approval">
        <Reveal className="ih-section-head"><div><span>운영 바로가기</span><h2>필요한 일은 여기서 시작하세요</h2></div></Reveal>
        <div className="ih-work-grid">
          <Reveal className="ih-work-card approval" delay={0}><div className="ih-work-art"><i /><i /><b>₩</b></div><span>예산 품의</span><h3>필요한 비용을<br />간편하게 요청하세요</h3><p>금액과 사용 목적만 적으면 검토 상태를 한눈에 확인할 수 있어요.</p><button onClick={() => setBudgetOpen(true)}>새 품의서 작성 <b>→</b></button></Reveal>
          <Reveal className="ih-work-card documents" delay={100}><div className="ih-work-art"><i /><i /><b>≡</b></div><span>팀 문서</span><h3>자주 찾는 문서를<br />한곳에 모았어요</h3><p>계약서, 정산표, 프로젝트 템플릿을 바로 찾아보세요.</p><a href="#documents">문서 보러 가기 <b>→</b></a></Reveal>
          <Reveal className="ih-work-card rules" delay={200}><div className="ih-work-art"><i /><i /><b>✓</b></div><span>운영 규칙</span><h3>우리의 기준을<br />쉽게 확인하세요</h3><p>외주, 비용, 배당과 프로젝트 운영 원칙을 정리했어요.</p><a href="#rules">규칙 확인하기 <b>→</b></a></Reveal>
        </div>
      </section>

      <section className="ih-updates ih-container" id="documents">
        <Reveal className="ih-update-copy"><span>DOCUMENTS</span><h2>필요한 정보가<br />흩어지지 않도록.</h2><p>자주 바뀌는 운영 기준과 중요한 문서를<br />모두가 같은 곳에서 확인해요.</p></Reveal>
        <Reveal className="ih-update-list" delay={100}>{data.notices.map((item) => <a href="#" key={item.title}><span>{item.category}</span><div><b>{item.title}</b><small>{item.meta}</small></div><i>→</i></a>)}<button>모든 문서 보기</button></Reveal>
      </section>

      <section className="ih-rule-banner ih-container" id="rules">
        <Reveal><span>Native의 운영 원칙</span><h2>좋은 팀은 숫자를 숨기지 않고,<br />같은 기준으로 결정합니다.</h2><a href="#documents">운영 원칙 전체 보기 <b>→</b></a><div className="ih-rule-orbits" aria-hidden="true"><i /><i /><i /></div></Reveal>
      </section>

      <footer className="ih-footer"><div className="ih-wordmark"><span><Image src="/native-logo.png" alt="" fill sizes="30px" unoptimized /></span><b>Native</b></div><p>플랫폼에 맞는 자연스러운 경험을 설계하고 구현합니다.</p><small>INTERNAL USE ONLY · 2026 NATIVE</small></footer>

      {budgetOpen && <BudgetModal done={budgetDone} onClose={() => { setBudgetOpen(false); setTimeout(() => setBudgetDone(false), 350); }} onSubmit={() => setBudgetDone(true)} />}
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
  return <div className="ih-chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="월별 수입 및 지출 추이"><defs><linearGradient id="financeArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3182f6" stopOpacity=".22" /><stop offset="1" stopColor="#3182f6" stopOpacity="0" /></linearGradient></defs><path className="area" d={area} /><polyline className="expense-line" points={expense} /><polyline className="income-line" points={income} />{items.map((item, index) => { const [x,y] = point(item.income,index).split(","); return <circle key={item.month} cx={x} cy={y} r="4.5" />; })}</svg><div className="ih-chart-labels">{items.map((item) => <span key={item.month}>{item.month}</span>)}</div></div>;
}

function BudgetModal({ done, onClose, onSubmit }: { done: boolean; onClose: () => void; onSubmit: () => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSubmit(); };
  return <div className="ih-modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><section className="ih-budget-modal" role="dialog" aria-modal="true" aria-label="예산 품의서 신청">{done ? <div className="ih-budget-done"><i>✓</i><span>REQUEST READY</span><h2>품의서 초안을 만들었어요</h2><p>실제 저장 기능이 연결되면 운영진에게 바로 전달됩니다.<br />지금은 화면 구성을 확인할 수 있는 미리보기예요.</p><button onClick={onClose}>확인</button></div> : <><header><div><span>BUDGET REQUEST</span><h2>예산 품의서 신청</h2><p>필요한 비용과 이유를 간단히 알려주세요.</p></div><button onClick={onClose}>×</button></header><form onSubmit={submit}><div className="ih-budget-grid"><label><span>요청 제목</span><input placeholder="예: Book-on 테스트 기기 구매" required /></label><label><span>사용 목적</span><select required defaultValue=""><option value="" disabled>선택해주세요</option><option>프로젝트 운영</option><option>외주 진행</option><option>팀 공통 비용</option><option>기타</option></select></label></div><label><span>요청 금액</span><div className="ih-money-input"><input type="number" min="1" placeholder="0" required /><b>원</b></div></label><label><span>상세 사유</span><textarea placeholder="왜 필요한 비용인지, 언제 사용할 예정인지 적어주세요." required /></label><div className="ih-budget-notice"><i>i</i><p>작성한 품의서는 재무 담당자의 검토 후 승인돼요.<br /><small>10만 원 이상은 영수증 또는 견적서가 필요합니다.</small></p></div><footer><button type="button" onClick={onClose}>취소</button><button type="submit">품의서 초안 만들기 <b>→</b></button></footer></form></>}</section></div>;
}
