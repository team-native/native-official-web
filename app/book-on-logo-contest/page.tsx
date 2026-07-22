"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type FormValue = {
  name: string;
  grade: string;
  classNumber: string;
  studentNumber: string;
  email: string;
  creationMethod: "ai" | "direct" | "";
};

const initialValue: FormValue = { name: "", grade: "", classNumber: "", studentNumber: "", email: "", creationMethod: "" };
const SCHOOL_EMAIL_PATTERN = /^s\d{5}@gsm\.hs\.kr$/i;
const SCHOOL_EMAIL_EXAMPLE = "s25038@gsm.hs.kr";

const requirements = [
  ["01", "모던하고 심플한 스타일 (Apple 감성)", "불필요한 장식을 덜어내고 여백과 비례가 정돈된, 오래 보아도 편안한 디자인을 원해요."],
  ["02", "Book-on을 닮은 초록색", "밝고 친근한 초록을 중심으로, 흰색과 검정 배경에서도 잘 보이게 만들어주세요."],
  ["03", "책과 도서관을 연결하는 의미", "책, 독서 기록, 대출, 도서관 중 Book-on다운 이야기가 형태에 담겨야 해요."],
  ["04", "작게 보아도 같은 로고", "16px 아이콘부터 포스터까지 크기가 달라져도 형태가 무너지지 않아야 해요."],
  ["05", "직접 만든 새로운 아이디어", "기존 브랜드나 다른 사람의 작업을 따라 하지 않은 독창적인 작품이어야 해요."],
  ["06", "가장 자신 있는 한 작품", "한 사람당 PNG 파일 한 개만 제출할 수 있어요. 제출 후에는 바꿀 수 없습니다."],
];

const prizes = [
  { rank: "01", title: "1등", reward: "15,000원", copy: "Book-on 공식 로고 선정" },
  { rank: "02", title: "2등", reward: "5,000원", copy: "우수한 브랜드 아이디어" },
  { rank: "03", title: "3등", reward: "Native 키링", copy: "Native 로고 아크릴 키링" },
];

export default function BookOnLogoContestPage() {
  const [value, setValue] = useState<FormValue>(initialValue);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "checking" | "available" | "duplicate">("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [showRecruitPopup, setShowRecruitPopup] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    if (window.localStorage.getItem("native-recruit-popup-hidden-date") !== today) setShowRecruitPopup(true);
  }, []);
  useEffect(() => {
    if (!showRecruitPopup) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") dismissRecruitPopup(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showRecruitPopup]);

  const studentInfo = useMemo(() => [value.grade, value.classNumber, value.studentNumber].filter(Boolean).join(" · "), [value]);

  const dismissRecruitPopup = () => {
    setShowRecruitPopup(false);
  };

  const hideRecruitPopupToday = () => {
    window.localStorage.setItem("native-recruit-popup-hidden-date", new Date().toLocaleDateString("en-CA"));
    setShowRecruitPopup(false);
  };

  const update = (key: keyof FormValue, next: string) => {
    setValue((current) => ({ ...current, [key]: next }));
    if (key === "email") setEmailState("idle");
  };

  const validateFile = (nextFile?: File | null) => {
    if (!nextFile) return "로고 PNG 파일을 선택해주세요.";
    if (nextFile.type !== "image/png" || !nextFile.name.toLowerCase().endsWith(".png")) return "PNG 파일만 업로드할 수 있습니다.";
    if (nextFile.size > 10 * 1024 * 1024) return "파일 크기는 최대 10MB까지 가능합니다.";
    if (nextFile.size === 0) return "비어 있는 파일은 제출할 수 없습니다.";
    return "";
  };

  const chooseFile = (nextFile?: File | null) => {
    const message = validateFile(nextFile);
    if (message) { setFile(null); setError(message); return; }
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile ?? null);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : "");
  };

  const checkEmail = async () => {
    const email = value.email.trim().toLowerCase();
    if (!SCHOOL_EMAIL_PATTERN.test(email)) {
      setEmailState("idle");
      setError(`학교 이메일을 ${SCHOOL_EMAIL_EXAMPLE} 형식으로 입력해주세요.`);
      return false;
    }
    setError("");
    setEmailState("checking");
    try {
      const response = await fetch(`/api/contests/book-on?email=${encodeURIComponent(email)}`, { cache: "no-store" });
      const payload = await response.json() as { exists?: boolean };
      const duplicate = response.ok && Boolean(payload.exists);
      setEmailState(duplicate ? "duplicate" : "available");
      return !duplicate;
    } catch {
      setEmailState("idle");
      return true;
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const fileError = validateFile(file);
    if (fileError) return setError(fileError);
    if (!value.name.trim() || !value.grade || !value.classNumber || !value.studentNumber || !value.email.trim() || !value.creationMethod) return setError("모든 항목을 빠짐없이 작성해주세요.");
    if (!SCHOOL_EMAIL_PATTERN.test(value.email.trim())) return setError(`학교 이메일을 ${SCHOOL_EMAIL_EXAMPLE} 형식으로 입력해주세요.`);
    if (emailState !== "available") return setError("학교 이메일 중복 확인을 먼저 완료해주세요.");

    setBusy(true);
    try {
      const prepareResponse = await fetch("/api/contests/book-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prepare", email: value.email, fileName: file?.name, fileSize: file?.size }),
      });
      const prepared = await prepareResponse.json() as { path?: string; token?: string; error?: string };
      if (!prepareResponse.ok || !prepared.path || !prepared.token) throw new Error(prepared.error ?? "업로드를 준비하지 못했습니다.");

      const supabase = getBrowserSupabase();
      if (!supabase || !file) throw new Error("파일 저장소에 연결하지 못했습니다.");
      const { error: uploadError } = await supabase.storage.from("bookon-logo-contest").uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: "image/png", upsert: false });
      if (uploadError) throw new Error("파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");

      const completeResponse = await fetch("/api/contests/book-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", ...value, email: value.email.trim().toLowerCase(), fileName: file.name, fileSize: file.size, filePath: prepared.path }),
      });
      const result = await completeResponse.json() as { error?: string };
      if (!completeResponse.ok) throw new Error(result.error ?? "제출 내용을 저장하지 못했습니다.");
      setComplete(true);
      window.scrollTo({ top: document.getElementById("submit")?.offsetTop ?? 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="contest-page">
      {showRecruitPopup && (
        <div className="recruit-popup-backdrop" role="presentation">
          <section className="recruit-popup" role="dialog" aria-modal="true" aria-labelledby="recruit-popup-title">
            <button className="recruit-popup-close" type="button" onClick={dismissRecruitPopup} aria-label="채용 안내 닫기">×</button>
            <div className="recruit-popup-mark" aria-hidden="true"><Image src="/native-logo.png" alt="" fill sizes="64px" unoptimized /></div>
            <div className="recruit-popup-copy">
              <small><i /> NATIVE OPEN ROLES</small>
              <h2 id="recruit-popup-title">지금, 함께 만들<br />사람을 찾고 있어요.</h2>
              <p>Native는 현재 <b>디자인·프론트엔드·게임 개발</b> 전공의 지원을 우선적으로 받고 있습니다.</p>
              <div className="recruit-popup-roles" aria-label="우선 모집 전공">
                <article><small>01 · PRIORITY</small><b>디자인</b><span>브랜드와 제품의 경험을 설계해요.</span></article>
                <article><small>02 · PRIORITY</small><b>프론트엔드</b><span>사용자가 만나는 화면을 구현해요.</span></article>
                <article><small>03 · PRIORITY</small><b>게임 개발</b><span>새로운 플레이 경험을 만들어요.</span></article>
              </div>
              <div className="recruit-popup-benefits" aria-label="Native 활동 혜택">
                <div><i>01</i><span><b>프로젝트 활동비 지원</b><small>좋은 아이디어를 실제 제품으로 만드는 데 필요한 비용을 지원해요.</small></span></div>
                <div><i>02</i><span><b>팀원 모집 지원</b><small>프로젝트에 필요한 전공과 인원을 함께 찾고 팀 구성을 도와드려요.</small></span></div>
                <div><i>03</i><span><b>팀 아이덴티티 제공</b><small>Native 구성원으로 활동할 수 있는 공식 팀 아이템을 제공해요.</small></span></div>
              </div>
              <p className="recruit-popup-notice"><b>지원 전 확인</b> 합류 시 2학기 전공동아리와 소속 팀을 Native로 변경해야 합니다.</p>
            </div>
            <div className="recruit-popup-actions">
              <a href="/#recruit" onClick={dismissRecruitPopup}>Native 지원 공고 보기 <span>→</span></a>
              <button type="button" onClick={dismissRecruitPopup}>닫기</button>
              <button className="recruit-popup-today" type="button" onClick={hideRecruitPopupToday}>오늘 보지 않기</button>
            </div>
          </section>
        </div>
      )}
      <header className="contest-header">
        <a className="contest-brand" href="/" aria-label="Native 홈페이지"><span><Image src="/native-logo.png" alt="" fill sizes="36px" unoptimized /></span><b>Native</b></a>
        <div className="contest-header-label"><i /> BOOK-ON 로고 공모전</div>
        <nav aria-label="공모전 메뉴"><a href="#guide">공모 요강</a><a href="#prize">시상 안내</a><a className="contest-header-cta" href="#submit">작품 제출하기 <span>↓</span></a></nav>
      </header>

      <section className="contest-hero">
        <div className="contest-hero-copy">
          <div className="contest-eyebrow"><span>2026</span> 학교 전체 대상 · Native 주최</div>
          <h1><em>Book-on</em><br />로고 공모전</h1>
          <p>학교 도서관 플랫폼 Book-on의 공식 로고를 찾습니다.<br />앱을 대표할 단순하고 선명한 아이디어를 보내주세요.</p>
          <div className="contest-hero-actions"><a href="#submit">공모전 참여하기 <span>→</span></a><a href="#guide">요강 먼저 보기</a></div>
          <div className="contest-hero-facts"><span><b>마감</b> 7월 25일 23:59</span><span><b>형식</b> PNG · 최대 10MB</span><span><b>제출</b> 1인 1작품</span></div>
        </div>
        <div className="contest-hero-product">
          <div className="hero-logo-placeholder"><strong>?</strong><b>여러분의 로고가 들어갑니다</b></div>
          <div className="hero-phone hero-phone-home"><Image src="/book-on.png" alt="Book-on 홈 화면" fill sizes="260px" unoptimized /></div>
          <div className="hero-phone hero-phone-detail"><Image src="/bookon-detail.png" alt="Book-on 도서 상세 화면" fill sizes="220px" unoptimized /></div>
          <div className="hero-usage"><span>앱 아이콘</span><span>시작 화면</span><span>포스터</span></div>
        </div>
        <div className="contest-hero-meta"><div><small>주최</small><b>Native</b></div><div><small>접수 마감</small><b>2026. 07. 25 · 23:59</b></div><div><small>1등 상금</small><b>15,000원</b></div></div>
      </section>

      <section className="contest-intro contest-shell" id="guide">
        <div className="contest-section-heading"><div><small>01 · 디자인 요구사항</small><h2>이 여섯 가지만<br />확실히 지켜주세요.</h2></div><p>멋있어 보이는 장식보다 Book-on을 바로 떠올릴 수 있는지,<br />작은 화면에서도 선명한지를 가장 중요하게 봅니다.</p></div>
        <div className="requirement-grid">
          {requirements.map(([number, title, copy], index) => <article key={number}>
            <div className={`brief-example example-${index + 1}`} aria-hidden="true">
              {index === 0 && <><span>불필요한 장식</span><i>→</i><b>정돈된 디자인</b></>}
              {index === 1 && <><span>#8FD323</span><i /><i /><i /></>}
              {index === 2 && <><span>책</span><span>독서 기록</span><span>도서관</span></>}
              {index === 3 && <><i>16</i><i>48</i><i>128</i></>}
              {index === 4 && <><span>COPY</span><i>×</i><b>ORIGINAL</b><i>✓</i></>}
              {index === 5 && <><strong>01</strong><span>PNG · 1 FILE</span></>}
            </div>
            <small>{number}</small><h3>{title}</h3><p>{copy}</p>
          </article>)}
        </div>
        <div className="judging-board" id="judging">
          <div className="judging-heading"><small>JUDGING STANDARD</small><h3>Book-on다운 로고를<br />이 기준으로 선정합니다.</h3><p>화려함보다 서비스에 잘 어울리고, 작은 화면에서도 오래 사용할 수 있는지를 봅니다.</p></div>
          <div className="judging-criteria">
            <div><b>01</b><span><strong>브랜드 적합성</strong><small>Book-on과 도서관 서비스의 성격이 자연스럽게 드러나는가</small></span><em>35%</em></div>
            <div><b>02</b><span><strong>완성도와 확장성</strong><small>앱 아이콘부터 인쇄물까지 다양한 환경에서 선명한가</small></span><em>30%</em></div>
            <div><b>03</b><span><strong>심플함과 가독성</strong><small>불필요한 장식 없이 한눈에 인식되고 기억되는가</small></span><em>25%</em></div>
            <div><b>04</b><span><strong>독창성</strong><small>기존 브랜드와 구별되는 자신만의 아이디어가 있는가</small></span><em>10%</em></div>
          </div>
          <div className="judging-disqualify"><span>무조건 탈락</span><div><strong>다른 작품이나 기존 브랜드를 베끼거나 도용한 경우</strong><p>모방·도용 또는 과도한 유사성이 확인되면 점수와 관계없이 즉시 심사에서 제외합니다.</p></div></div>
        </div>
        <div className="contest-caution"><span>!</span><div><b>제출 전에 꼭 확인해주세요.</b><p>AI를 사용했다면 제출 단계에서 반드시 표시해야 하며, 제출 작품의 저작권과 독창성에 대한 책임은 제출자에게 있습니다.</p></div></div>
      </section>

      <section className="prize-section" id="prize">
        <div className="contest-shell">
          <div className="contest-section-heading light"><div><small>02 · 시상 안내</small><h2>선정된 로고는<br />Book-on의 공식 얼굴이 됩니다.</h2></div><p>심사 결과는 추후 디스코드 공지로 알려드릴게요.<br />1등 작품은 실제 서비스에 적용할 예정입니다.</p></div>
          <div className="prize-grid">{prizes.map((prize) => <article className={`prize-card prize-card-${prize.rank}`} key={prize.rank}><small>{prize.rank}</small>{prize.rank === "03" ? <div className="prize-keyring"><Image src="/native-keyring-prize.png" alt="3등 상품 Native 로고 아크릴 키링" fill sizes="(max-width: 760px) 90vw, 360px" unoptimized /></div> : <div className="prize-rank">{prize.title}</div>}<div className="prize-card-copy"><b>{prize.title} 시상</b><strong>{prize.reward}</strong><p>{prize.copy}</p></div></article>)}</div>
          <div className="contest-process"><div><small>01</small><b>작품 접수</b><span>7월 25일 23:59까지</span></div><i>→</i><div><small>02</small><b>내부 심사</b><span>Native · Book-on 팀</span></div><i>→</i><div><small>03</small><b>결과 발표</b><span>디스코드 공지 예정</span></div></div>
        </div>
      </section>

      <section className="submit-section contest-shell" id="submit">
        <div className="submit-side"><small>03 · SUBMISSION</small><h2>준비한 로고를<br />보내주세요.</h2><p>제출은 한 번만 가능합니다. 이름과 학교 이메일, 파일을 다시 확인한 뒤 제출해주세요.</p><div className="submit-summary"><div><span>FILE</span><b>PNG · 최대 10MB</b></div><div><span>LIMIT</span><b>1인 1작품</b></div><div><span>DEADLINE</span><b>07.25 · 23:59</b></div></div></div>
        {complete ? (
          <div className="submit-complete"><div className="complete-mark"><span>✓</span></div><small>SUBMISSION COMPLETE</small><h2>작품이 안전하게<br />제출되었습니다.</h2><p><b>{value.name}</b>님의 Book-on 로고를 접수했어요.<br />심사 결과는 추후 디스코드 공지로 알려드릴게요.</p><div><span>{studentInfo}</span><span>{value.email}</span></div><a href="/">Native 홈페이지로 돌아가기 <b>→</b></a></div>
        ) : (
          <form className="contest-form" onSubmit={submit} noValidate>
            <div className="form-heading"><small>ENTRY FORM</small><h3>Book-on 로고 제출</h3><span>모든 항목은 필수입니다.</span></div>
            <label className="contest-field full"><span>이름</span><input value={value.name} onChange={(event) => update("name", event.target.value)} placeholder="이름을 입력해주세요" autoComplete="name" required /></label>
            <div className="student-fields"><label className="contest-field"><span>학년</span><input inputMode="numeric" maxLength={1} value={value.grade} onChange={(event) => update("grade", event.target.value.replace(/\D/g, ""))} placeholder="예: 2" required /></label><label className="contest-field"><span>반</span><input inputMode="numeric" maxLength={2} value={value.classNumber} onChange={(event) => update("classNumber", event.target.value.replace(/\D/g, ""))} placeholder="예: 3" required /></label><label className="contest-field"><span>번호</span><input inputMode="numeric" maxLength={2} value={value.studentNumber} onChange={(event) => update("studentNumber", event.target.value.replace(/\D/g, ""))} placeholder="예: 17" required /></label></div>
            <label className={`contest-field full email-field ${emailState}`}><span>학교 이메일</span><div><input type="email" value={value.email} onChange={(event) => update("email", event.target.value.toLowerCase())} placeholder={SCHOOL_EMAIL_EXAMPLE} pattern="s[0-9]{5}@gsm\.hs\.kr" maxLength={16} autoCapitalize="none" spellCheck={false} autoComplete="email" required /><button type="button" onClick={() => void checkEmail()} disabled={emailState === "checking" || !SCHOOL_EMAIL_PATTERN.test(value.email.trim())}>{emailState === "checking" ? "확인 중" : emailState === "available" ? "확인 완료 ✓" : "중복 확인"}</button></div>{emailState === "duplicate" ? <small>이미 제출된 이메일입니다. 다른 이메일을 입력해주세요.</small> : emailState === "available" ? <small className="available-message">제출 가능한 학교 이메일입니다.</small> : <small className="email-help">예: {SCHOOL_EMAIL_EXAMPLE} · s와 숫자 5자리를 입력해주세요.</small>}</label>
            <div className="contest-field full"><span>로고 파일</span><label className={`file-drop ${file ? "has-file" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }}><input type="file" accept="image/png,.png" onChange={(event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0])} />{file && preview ? <><span className="file-preview" style={{ backgroundImage: `url(${preview})` }} /><div><b>{file.name}</b><small>{(file.size / 1024 / 1024).toFixed(2)}MB · PNG</small><em>다른 파일 선택</em></div></> : <><div className="upload-symbol"><i>↑</i></div><div><b>PNG 파일을 올려주세요.</b><small>클릭하거나 파일을 여기로 드래그 · 최대 10MB</small></div></>}</label></div>
            <fieldset className="method-field"><legend>제작 방법</legend><label className={value.creationMethod === "direct" ? "selected" : ""}><input type="radio" name="creationMethod" value="direct" checked={value.creationMethod === "direct"} onChange={() => update("creationMethod", "direct")} /><span><i>✦</i><b>직접 제작</b><small>디자인 도구 또는 손으로 직접 만들었어요.</small></span></label><label className={value.creationMethod === "ai" ? "selected" : ""}><input type="radio" name="creationMethod" value="ai" checked={value.creationMethod === "ai"} onChange={() => update("creationMethod", "ai")} /><span><i>AI</i><b>AI 생성 사용</b><small>생성형 AI를 전부 또는 일부 사용했어요.</small></span></label></fieldset>
            {error && <div className="contest-error"><span>!</span>{error}</div>}
            <button className="contest-submit" type="submit" disabled={busy || emailState !== "available"}><span>{busy ? "작품을 제출하고 있습니다" : emailState === "available" ? "Book-on 로고 제출하기" : "이메일 중복 확인 후 제출 가능"}</span><b>{busy ? "···" : emailState === "available" ? "→" : "—"}</b></button>
            <p className="privacy-note">제출 정보는 공모전 심사와 결과 안내 목적으로만 사용됩니다.</p>
          </form>
        )}
      </section>

      <footer className="contest-footer"><a className="contest-brand" href="/"><span><Image src="/native-logo.png" alt="" fill sizes="34px" unoptimized /></span><b>Native</b></a><p>Book-on의 새로운 얼굴을 함께 만들어주세요.</p><div><a href="/">Native 홈페이지</a><span>© 2026 Native</span></div></footer>
    </main>
  );
}
