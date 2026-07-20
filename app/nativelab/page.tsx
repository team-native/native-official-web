import Image from "next/image";

const services = [
  {
    number: "01",
    title: "Product Strategy",
    copy: "아이디어와 요구사항을 정리하고, 사용자와 비즈니스에 필요한 핵심 문제부터 정의합니다.",
  },
  {
    number: "02",
    title: "Experience Design",
    copy: "플랫폼의 사용 방식에 맞는 흐름과 인터페이스를 설계해 이해하기 쉬운 경험을 만듭니다.",
  },
  {
    number: "03",
    title: "Mobile & Web Development",
    copy: "iOS, Android, Web 환경에 맞는 구현으로 실제 사용할 수 있는 제품을 빠르게 완성합니다.",
  },
];

const process = [
  ["01", "Discover", "문제와 목표를 함께 정리합니다."],
  ["02", "Design", "제품의 흐름과 화면을 구체화합니다."],
  ["03", "Build", "플랫폼에 맞게 안정적으로 구현합니다."],
  ["04", "Launch", "출시 이후의 개선까지 함께합니다."],
];

export default function NativeLabPage() {
  return (
    <main className="lab-page">
      <header className="lab-header">
        <a className="lab-header-brand" href="/" aria-label="Native 홈페이지">
          <span className="lab-header-logo"><Image src="/brand/nativelab-symbol.png" alt="" fill sizes="42px" unoptimized /></span>
          <span>NativeLab</span>
        </a>
        <a href="/">Native 팀 홈페이지 <span>↗</span></a>
      </header>

      <section className="lab-hero">
        <div className="lab-hero-copy">
          <span>별도 외주 개발팀</span>
          <h1>의뢰한 아이디어를<br />작동하는 제품으로.</h1>
          <p>NativeLab은 외주 프로젝트를 전담하는 별도 팀입니다. 요구사항 정리부터 UX/UI 디자인, iOS·Android·Web 개발과 출시까지 필요한 과정을 하나의 팀으로 수행합니다.</p>
          <a href="/contact?topic=프로젝트">프로젝트 문의하기 <b>→</b></a>
        </div>
        <div className="lab-hero-art">
          <div className="lab-hero-logo"><Image src="/brand/nativelab-symbol.png" alt="NativeLab 로고" fill sizes="(max-width: 760px) 74vw, 36vw" priority unoptimized /></div>
          <div className="lab-orbit orbit-one" />
          <div className="lab-orbit orbit-two" />
        </div>
      </section>

      <section className="lab-content">
        <div className="lab-section-heading">
          <span>01 / WHAT WE DO</span>
          <h2>기획부터 출시까지<br />한 흐름으로 연결합니다.</h2>
          <p>필요한 역할을 따로 찾는 대신, 제품을 이해하는 한 팀과 처음부터 끝까지 협업합니다.</p>
        </div>
        <div className="lab-service-grid">
          {services.map((service) => (
            <article key={service.number}>
              <span>{service.number}</span>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
              <div aria-hidden="true"><i /><i /><i /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-process-section">
        <div className="lab-process-head">
          <span>02 / HOW WE WORK</span>
          <h2>작게 검증하고,<br />끝까지 완성합니다.</h2>
        </div>
        <ol className="lab-process">
          {process.map(([number, title, copy]) => (
            <li key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></li>
          ))}
        </ol>
      </section>

      <section className="lab-cta">
        <div>
          <span>START A PROJECT</span>
          <h2>만들고 싶은 제품이 있나요?</h2>
          <p>아이디어의 현재 단계부터 편하게 들려주세요.</p>
        </div>
        <a href="/contact?topic=프로젝트">NativeLab에 문의하기 <span>→</span></a>
      </section>

      <footer className="lab-footer">
        <span>© 2026 NativeLab</span>
        <a href="/">Native Team으로 돌아가기 ↑</a>
      </footer>
    </main>
  );
}
