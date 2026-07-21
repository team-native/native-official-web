"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fallbackJobs, fallbackProjects, JobPosting, Project } from "@/lib/content";

const teamFacts = [
  { value: "03", label: "PUBLIC PRODUCTS", copy: "BOOK-ON · HOPES · IT-DA" },
  { value: "19", label: "TEAM MEMBERS", copy: "기획 · 디자인 · 개발이 한 팀으로" },
  { value: "03", label: "CORE PLATFORMS", copy: "iOS · Android · Web" },
];

const principles = [
  { number: "01", title: "빠르게 시도해요", copy: "긴 고민보다 작은 실행으로 가설을 확인합니다. 빠른 시작이 더 나은 방향을 만든다고 믿어요.", visual: "speed" },
  { number: "02", title: "솔직하게 리뷰해요", copy: "사람이 아니라 문제에 집중합니다. 코드와 결과물을 투명하게 공유하고 더 좋은 답을 함께 찾아요.", visual: "review" },
  { number: "03", title: "끝까지 완성해요", copy: "출시는 끝이 아니라 시작입니다. 사용자의 반응을 살피고 제품이 좋아질 때까지 개선해요.", visual: "ship" },
];

const benefits = [
  { number: "01", title: "프로젝트 제작비", copy: "아이디어를 검증하고 실제로 출시하는 데 필요한 비용을 지원해요.", icon: "funding", visualTitle: "만드는 데 필요한 비용", visualBadge: "아이디어 검증 · 출시" },
  { number: "02", title: "팀 빌딩 지원", copy: "프로젝트에 필요한 전공과 인원을 찾고 함께할 팀을 꾸릴 수 있도록 도와요.", icon: "people", visualTitle: "함께할 동료를 연결", visualBadge: "필요 전공 · 팀 구성" },
  { number: "03", title: "팀 아이덴티티 키트", copy: "Native의 정체성을 함께 느낄 수 있는 웰컴 키트와 활동 물품을 제공해요.", icon: "kit", visualTitle: "팀으로 움직이는 물건", visualBadge: "웰컴 키트 · 활동 물품" },
  { number: "04", title: "성장 도구 지원", copy: "필요한 도서, 강의, 개발 도구를 팀의 성장을 위해 지원해요.", icon: "book", visualTitle: "배우고 만드는 도구", visualBadge: "도서 · 강의 · 개발 도구" },
];

function CultureVisual({ type }: { type: string }) {
  if (type === "speed") {
    return <div className="mini-scene speed-scene" aria-hidden="true"><div className="mini-window"><i /><i /><i /><span /><span /><span /></div><b>↗</b><div className="speed-chip">SHIP</div></div>;
  }
  if (type === "review") {
    return <div className="mini-scene review-scene" aria-hidden="true"><div className="review-code"><span /><span /><span /><span /></div><div className="bubble bubble-one">✓</div><div className="bubble bubble-two">+</div></div>;
  }
  return <div className="mini-scene ship-scene" aria-hidden="true"><div className="phone-frame"><span /><span /><b>✓</b></div><div className="orbit-dot" /><div className="launch-arrow">→</div><div className="done-chip">LIVE</div></div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [openings, setOpenings] = useState<JobPosting[]>(fallbackJobs);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as { projects?: Project[]; jobs?: JobPosting[] } : null)
      .then((payload) => {
        if (payload?.projects?.length) setProjects(payload.projects);
        if (payload?.jobs) setOpenings(payload.jobs);
      })
      .catch(() => undefined);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <header className={scrolled ? "site-header scrolled" : "site-header"}>
        <a className="brand" href="#top" aria-label="Native 홈" onClick={closeMenu}>
          <span className="brand-mark"><Image src="/native-logo.png" alt="" fill sizes="38px" priority unoptimized /></span>
          <span>Native</span>
        </a>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="주요 메뉴">
          <a href="#about" onClick={closeMenu}>팀 소개</a>
          <a href="#projects" onClick={closeMenu}>프로젝트</a>
          <a href="#nativelab" onClick={closeMenu}>NativeLab</a>
          <a href="#culture" onClick={closeMenu}>개발 문화</a>
          <a href="#benefits" onClick={closeMenu}>팀 혜택</a>
          <a href="/book-on-logo-contest" onClick={closeMenu}>Book-on 공모전</a>
          <a className="nav-recruit" href="#recruit" onClick={closeMenu}><i />지원 공고</a>
        </nav>
        <a className="header-cta" href="#recruit">지원 공고 <span>↗</span></a>
        <button className="menu-button" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span /><span /></button>
      </header>

      <section className="hero" id="top">
        <Image className="hero-background" src="/native-hero-dev-v6.png" alt="" fill sizes="100vw" priority unoptimized />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-monogram hero-monogram-one" aria-hidden="true">N</div>
        <div className="hero-monogram hero-monogram-two" aria-hidden="true">N</div>
        <div className="hero-copy">
          <div className="eyebrow">NATIVE DEVELOPMENT TEAM</div>
          <h1>플랫폼에 맞는<br /><span>자연스러운 경험을</span><br />설계하고 구현하는 팀.</h1>
          <p>iOS, Android, Web의 특성과 사용 방식을 이해하고<br />각 기기에서 가장 자연스럽게 느껴지는 제품을 만듭니다.</p>
          <div className="hero-platforms" aria-label="Native 핵심 플랫폼"><span>iOS</span><span>Android</span><span>Web</span></div>
          <div className="hero-actions">
            <a className="button button-primary" href="#recruit">지원 공고 보기 <span>→</span></a>
            <a className="button button-ghost" href="#projects">프로젝트 보기</a>
          </div>
        </div>
        <a href="#about" className="scroll-cue" aria-label="팀 소개로 이동"><span>SCROLL</span><i>↓</i></a>
      </section>

      <aside className="floating-recruit" aria-label="Native 지원 안내">
        <div><i /> 현재 {openings.length}개 전공 지원 접수 중</div>
        <a href="#recruit">지원 공고 보기 <span>→</span></a>
      </aside>

      <section className="about section-shell" id="about">
        <div className="about-top">
          <div className="section-intro">
            <div className="section-kicker"><span>01</span> ABOUT NATIVE</div>
            <h2>아이디어의 주인이<br />제품의 주인이 됩니다.</h2>
            <p>Native는 직책보다 문제를 발견한 사람의 관점을 믿습니다. 만들고 싶은 아이디어가 있다면 직접 프로젝트를 이끌고, 팀의 도움을 받아 실제 제품으로 완성할 수 있어요.</p>
          </div>
          <div className="about-illustration" aria-hidden="true">
            <div className="code-card card-back"><div className="code-dots"><i /><i /><i /></div><span /><span /><span /><span /></div>
            <div className="code-card card-front"><div className="code-dots"><i /><i /><i /></div><b>idea / owner / product</b><span /><span /><span /><em>You are the PO</em></div>
            <div className="collab-badge"><span>✓</span> Ready to own</div>
            <div className="cursor-note">아이디어에서 제품까지<span>↖</span></div>
          </div>
        </div>

        <div className="brand-pillars">
          <article className="brand-pillar owner-pillar">
            <div className="pillar-label">01 / OWN THE IDEA</div>
            <div className="pillar-monogram" aria-hidden="true">N</div>
            <h3>아이디어를 내면,<br />직접 프로젝트를 이끌 수 있어요.</h3>
            <p>전공이나 경험과 상관없이 제안한 사람이 제품의 방향을 정합니다. 팀은 허락을 기다리는 곳이 아니라, 좋은 아이디어가 실제로 출시되도록 함께 만드는 동료입니다.</p>
            <div className="pillar-flow" aria-label="아이디어가 제품이 되는 과정"><span>IDEA</span><i>→</i><span>LEAD</span><i>→</i><span>PRODUCT</span></div>
          </article>
          <article className="brand-pillar native-pillar">
            <div className="pillar-label">02 / NATIVE BY DEFAULT</div>
            <div className="pillar-monogram" aria-hidden="true">N</div>
            <h3>플랫폼에 맞게 구현해<br />자연스러운 경험을 만들어요.</h3>
            <p>웹과 앱을 모두 만들지만, 우리의 중심 역량은 플랫폼에 맞는 구현입니다. iOS와 Android의 언어와 인터랙션을 이해하고 각 기기에서 가장 자연스럽게 느껴지는 방식으로 완성합니다.</p>
            <div className="platform-tags"><span>iOS</span><span>Android</span><span>Web</span></div>
          </article>
        </div>

        <div className="team-facts" aria-label="Native 팀 정보">
          {teamFacts.map((fact) => (
            <div key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span><small>{fact.copy}</small></div>
          ))}
        </div>
      </section>

      <section className="projects section-shell" id="projects">
        <div className="section-heading">
          <div><div className="section-kicker"><span>02</span> SELECTED WORK</div><h2>우리가 만든 제품</h2></div>
          <p>각 플랫폼의 문법을 존중하면서<br />아이디어를 실제 사용 경험으로 완성합니다.</p>
        </div>
        <div className="project-list">
          {projects.map((project, index) => (
            <article className={`project-card ${project.tone}`} key={project.name}>
              <div className="project-copy">
                <span>0{index + 1} · {project.type}</span>
                <div className="project-title">
                  <span className="project-title-symbol"><Image src={project.logo} alt="" fill sizes="42px" unoptimized /></span>
                  <h3>{project.name}</h3>
                </div>
                <p>{project.description}</p>
                <div className="project-tags">{project.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>
                <a className="case-link" href={`/projects/${project.slug}`}>프로젝트 자세히 보기 <b>→</b></a>
              </div>
              <div className={`project-stage ${project.visual}`}>
                <span className="project-symbol" aria-hidden="true"><Image src={project.logo} alt="" fill sizes="180px" unoptimized /></span>
                <span className="project-n" aria-hidden="true">N</span>
                <div className="project-visual">
                  {project.images.map((image, imageIndex) => (
                    <div className={`product-screen screen-${imageIndex + 1}`} key={image}>
                      <Image src={image} alt={`${project.name} 제품 화면 ${imageIndex + 1}`} fill sizes="(max-width: 760px) 82vw, 42vw" unoptimized />
                    </div>
                  ))}
                </div>
                <small className="project-platform">{project.type}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-preview-section section-shell" id="nativelab">
        <div className="lab-preview-card">
          <div className="lab-preview-visual">
            <div className="lab-logo-wrap">
              <Image src="/brand/nativelab-symbol.png" alt="NativeLab" fill sizes="(max-width: 760px) 72vw, 34vw" unoptimized />
            </div>
            <span>별도 외주 개발팀</span>
          </div>
          <div className="native-lab-copy">
            <span>NativeLab · 외주 프로젝트 전담</span>
            <h3>의뢰받은 아이디어를<br />실제 제품으로 완성합니다.</h3>
            <p>NativeLab은 Native 안에서 별도로 운영되는 외주 개발팀입니다. 의뢰받은 프로젝트만 전담하며, 요구사항 정리부터 디자인과 앱·웹 개발, 출시까지 한 팀으로 수행합니다.</p>
            <div className="native-lab-services"><span>제품 기획</span><span>앱·웹 개발</span><span>디자인·출시</span></div>
            <a className="native-lab-link" href="/nativelab">NativeLab 소개 보기 <b>→</b></a>
          </div>
        </div>
      </section>

      <section className="culture section-shell" id="culture">
        <div className="section-heading culture-title">
          <div><div className="section-kicker"><span>03</span> HOW WE WORK</div><h2>Native가 일하는 방식</h2></div>
          <p>완벽한 계획을 기다리기보다<br />작게 만들고, 함께 배우고, 끝까지 개선합니다.</p>
        </div>
        <div className="culture-cards">
          {principles.map((item) => (
            <article key={item.number}>
              <CultureVisual type={item.visual} />
              <span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="benefits section-shell" id="benefits">
        <div className="section-heading">
          <div><div className="section-kicker"><span>04</span> WHY NATIVE</div><h2>함께 성장하는 환경</h2></div>
          <p>좋은 결과를 오래 만들 수 있도록<br />팀의 성장과 몰입을 지원합니다.</p>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article key={benefit.number}>
              <div className={`benefit-visual ${benefit.icon}`}>
                <div className="benefit-visual-copy"><small>Native 지원</small><strong>{benefit.visualTitle}</strong></div>
                <span className="benefit-visual-badge">{benefit.visualBadge}</span>
                <div className="benefit-art" aria-hidden="true"><i /><i /><i /></div>
              </div>
              <span>{benefit.number}</span><h3>{benefit.title}</h3><p>{benefit.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="recruit section-shell" id="recruit">
        <div className="recruit-panel">
          <div className="recruit-head">
            <div className="section-kicker"><span>05</span> NATIVE 지원 공고</div>
            <h2>지금 지원할 수 있는<br />전공을 확인하세요.</h2>
            <p>아이디어를 직접 이끌고, 플랫폼에 가장 자연스러운 경험을 끝까지 구현할 동료를 모집합니다.</p>
            <div className="recruit-points">
              <span><b>{openings.length}</b> 모집 전공</span>
              <span><b>{openings.filter((opening) => opening.priority).length}</b> 우대 모집</span>
              <span><b>19</b> 팀 멤버</span>
            </div>
          </div>

          <div className="job-board">
            <div className="job-board-title"><h3>모집 전공</h3><span>{openings.length}개 전공 · 우대 모집 공고 포함</span></div>
            <div className="job-grid">
              {openings.map((opening) => (
                <a className={opening.priority ? "job-card featured" : "job-card"} href={`/recruit/${encodeURIComponent(opening.slug)}`} key={opening.title}>
                  <div className="job-top"><small>전공</small><b>{opening.priority ? "우대 모집" : "모집 중"}</b></div>
                  <h4>{opening.title}</h4>
                  <p>{opening.summary}</p>
                  <div className="job-action">상세 공고 보기 <span>↗</span></div>
                </a>
              ))}
            </div>
          </div>

          <div className="hiring-process">
            <div><small>지원 절차</small><h3>Native 합류 과정</h3><p>학번과 이름, 지원한 이유와 이루고 싶은 목표를 중심으로 지원서를 확인합니다.</p></div>
            <ol>
              <li><span>01</span><b>지원서 작성</b><small>학번 · 이름 · 지원 목표</small></li>
              <li><span>02</span><b>모집 마감</b><small>공고에 안내된 기일까지</small></li>
              <li><span>03</span><b>합격 안내</b><small>안내 기일 이후 이메일 통지</small></li>
              <li><span>04</span><b>합류 미팅</b><small>일정과 첫 프로젝트 안내</small></li>
            </ol>
          </div>

          <p className="result-notice">지원 결과는 공고에 안내된 기일 이후 검토되며, 합격자에게 지원서에 작성한 이메일로 개별 안내합니다.</p>

          <div className="recruit-foot">
            <div><strong>지원 전에 궁금한 점이 있나요?</strong><small>전공과 팀 문화에 관한 질문도 편하게 보내주세요.</small></div>
            <a href="/contact">지원 문의하기 <span>→</span></a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-main">
          <a className="brand footer-brand" href="#top"><span className="brand-mark"><Image src="/native-logo.png" alt="" fill sizes="38px" unoptimized /></span><span>Native</span></a>
          <p>플랫폼에 맞는 자연스러운 경험을 설계하고 구현합니다.</p>
          <a href="#recruit">Native 지원하기 ↗</a>
        </div>
        <div className="footer-bottom"><span>© 2026 NATIVE TEAM</span><span>iOS · Android · Web</span><a href="#top">맨 위로 ↑</a></div>
      </footer>
    </main>
  );
}
