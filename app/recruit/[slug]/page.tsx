"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { JobPosting } from "@/lib/content";

const sectionKinds: Record<string, "list" | "text"> = {
  "함께하게 될 일": "list",
  "이런 분을 기다립니다": "list",
  "Native의 지원": "list",
  "지원 전 확인해 주세요": "text",
};

type DescriptionBlock = { title: string; kind: "list" | "text"; lines: string[] };

export default function RecruitDetailPage() {
  const params = useParams<{ slug: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${encodeURIComponent(params.slug)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { job?: JobPosting; error?: string };
        if (!response.ok || !payload.job) throw new Error(payload.error ?? "모집 중인 전공을 찾을 수 없습니다.");
        setJob(payload.job);
      })
      .catch((reason) => setError(reason.message));
  }, [params.slug]);

  const blocks = useMemo(() => parseDescription(job?.description ?? ""), [job?.description]);

  if (error) return <main className="recruit-detail-state"><span>404</span><h1>{error}</h1><a href="/#recruit">모집 전공으로 돌아가기</a></main>;
  if (!job) return <main className="recruit-detail-state"><span>N</span><p>상세 공고를 불러오고 있습니다.</p></main>;

  const deadline = job.closeDate ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(new Date(`${job.closeDate}T00:00:00`)) : "상시 모집";

  return (
    <main className="recruit-detail-page">
      <header className="recruit-detail-header">
        <a className="recruit-detail-brand" href="/" aria-label="Native 홈페이지">
          <span><Image src="/native-logo.png" alt="" fill sizes="38px" priority unoptimized /></span>Native
        </a>
        <nav><a href="/#recruit">모집 전공</a><a href="/contact">지원 문의</a></nav>
      </header>

      <section className="recruit-detail-hero">
        <div className="recruit-detail-hero-copy">
          <a className="recruit-detail-back" href="/#recruit">← 모든 모집 전공</a>
          <div className="recruit-detail-eyebrow"><i /> NATIVE 전공 · {job.priority ? "우대 모집" : "모집 중"}</div>
          <h1>{job.title}</h1>
          <p>{job.summary}</p>
          <div className="recruit-detail-meta"><span>모집 상태 <b>모집 중</b></span><span>마감 <b>{deadline}</b></span></div>
          <a className="recruit-detail-apply" href={`/apply?role=${encodeURIComponent(job.title)}`}>지원서 작성하기 <span>→</span></a>
        </div>
        <div className="recruit-detail-visual" aria-hidden="true">
          <div className="recruit-detail-code"><span>Native</span><b>{job.title}</b><small>build · ship · grow</small></div>
          <div className="recruit-detail-n">N</div>
        </div>
      </section>

      <section className="recruit-detail-content">
        <aside>
          <small>전공 안내</small>
          <h2>아이디어를 실제 결과물로<br />끝까지 완성합니다.</h2>
          <div><span>01</span><p><b>직접 제안해요</b>정해진 일만 수행하지 않고 방향을 함께 결정합니다.</p></div>
          <div><span>02</span><p><b>팀으로 만들어요</b>필요한 동료를 만나 하나의 제품을 완성합니다.</p></div>
          <div><span>03</span><p><b>실제로 출시해요</b>사용자에게 전달하고 반응을 바탕으로 개선합니다.</p></div>
        </aside>
        <article className="recruit-detail-description">
          <div className="recruit-detail-section-label">전공 상세 설명</div>
          {blocks.length ? blocks.map((block, index) => (
            <section className={block.kind === "list" ? "detail-list-section" : "detail-text-section"} key={`${block.title}-${index}`}>
              {block.title && <h3>{block.title}</h3>}
              {block.kind === "list" ? <ul>{block.lines.map((line) => <li key={line}>{line}</li>)}</ul> : block.lines.map((line) => <p key={line}>{line}</p>)}
            </section>
          )) : <p>상세 설명을 준비하고 있습니다.</p>}
        </article>
      </section>

      <section className="recruit-detail-bottom">
        <div><small>READY TO JOIN?</small><h2>{job.title} 전공에서<br />함께 시작해요.</h2></div>
        <a href={`/apply?role=${encodeURIComponent(job.title)}`}>지원서 작성하기 <span>→</span></a>
      </section>
      <footer className="recruit-detail-footer"><span>© 2026 NATIVE TEAM</span><a href="/">Native 홈페이지</a></footer>
    </main>
  );
}

function parseDescription(value: string): DescriptionBlock[] {
  const lines = value.split(/\r?\n/).map((line) => line.trim().replace(/^[•·-]\s*/, "")).filter(Boolean);
  if (!lines.length) return [];

  const blocks: DescriptionBlock[] = [];
  let current: DescriptionBlock = { title: "", kind: "text", lines: [] };
  for (const line of lines) {
    const kind = sectionKinds[line];
    if (kind) {
      if (current.lines.length) blocks.push(current);
      current = { title: line, kind, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length || current.title) blocks.push(current);
  return blocks;
}
