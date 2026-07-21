"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

const contactEmail = "native.team@example.com";
const topics = ["지원 전공", "모집 일정", "팀 문화", "프로젝트", "기타 문의"];
type ContactErrors = Partial<Record<"studentName" | "email" | "question", string>>;

export default function ContactPage() {
  const [agreed, setAgreed] = useState(false);
  const [topic, setTopic] = useState(topics[0]);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const isProjectInquiry = topic === "프로젝트";

  useEffect(() => {
    const requestedTopic = new URLSearchParams(window.location.search).get("topic");
    if (requestedTopic && topics.includes(requestedTopic)) setTopic(requestedTopic);
  }, []);

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const studentName = String(data.get("studentName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const question = String(data.get("question") ?? "").trim();
    const nextErrors: ContactErrors = {};

    if (!studentName) nextErrors.studentName = "학번과 이름을 입력해주세요.";
    if (!email) nextErrors.email = "답변받을 이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "이메일 형식을 다시 확인해주세요. 예: name@example.com";
    if (!question) nextErrors.question = "문의 내용을 작성해주세요.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !agreed) return;

    setSubmitting(true);
    setServerError("");
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, studentName, email, message: question, website: data.get("website") }),
    }).catch(() => null);

    if (response?.ok) {
      setSubmitting(false);
      setSubmitted(true);
      form.reset();
      setAgreed(false);
      return;
    }

    if (response && response.status !== 503) {
      const payload = await response.json().catch(() => ({})) as { error?: string };
      setSubmitting(false);
      setServerError(payload.error ?? "문의를 보내지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const subject = `[Native 지원 문의] ${data.get("topic")} · ${studentName}`;
    const body = [
      `학번과 이름: ${studentName}`,
      `답변 받을 이메일: ${email}`,
      `문의 유형: ${data.get("topic")}`,
      "",
      "문의 내용",
      question,
    ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitting(false);
  };

  return (
    <main className="apply-page contact-page">
      <header className="apply-header">
        <a className="brand apply-brand" href="/" aria-label="Native 홈페이지">
          <span className="brand-mark"><Image src="/native-logo.png" alt="" fill sizes="38px" priority unoptimized /></span>
          <span>Native</span>
        </a>
        <a className="apply-back" href={isProjectInquiry ? "/nativelab" : "/#recruit"}>
          {isProjectInquiry ? "NativeLab으로 돌아가기" : "지원 공고로 돌아가기"} <span>↗</span>
        </a>
      </header>

      <section className="apply-layout">
        <div className="apply-intro contact-intro">
          <div className="apply-kicker">{isProjectInquiry ? "NativeLab 프로젝트 문의" : "Native 지원 문의"}</div>
          <h1>{isProjectInquiry ? <>만들고 싶은 제품을<br />편하게 들려주세요.</> : <>궁금한 점을<br />편하게 남겨주세요.</>}</h1>
          <p>{isProjectInquiry ? "아이디어의 현재 단계와 해결하고 싶은 문제를 알려주시면 함께 만들 수 있는 방법을 안내합니다." : "지원 전공, 모집 일정, 팀 문화와 프로젝트에 관한 질문을 받습니다."}</p>

          <div className="apply-role-card">
            <span>RESPONSE</span>
            <strong>이메일로 답변드려요.</strong>
            <small>문의 내용을 확인한 뒤 작성한 이메일로 안내합니다.</small>
          </div>

          <div className="apply-n" aria-hidden="true">?</div>
        </div>

        <div className="application-form-wrap">
          <div className="application-form-head">
            <span>01 / 문의 작성</span>
            <h2>{isProjectInquiry ? "프로젝트 문의" : "지원 문의"}</h2>
            <p>필요한 내용만 간단히 작성해주세요.</p>
          </div>

          {submitted ? <div className="form-success"><span>✓</span><small>MESSAGE RECEIVED</small><h3>문의가 접수되었습니다.</h3><p>작성한 이메일로 확인 후 답변드리겠습니다.</p><a href={isProjectInquiry ? "/nativelab" : "/"}>돌아가기</a></div> : <form className="application-form" onSubmit={submitQuestion} noValidate>
            <input className="form-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <label className={`form-field form-field-full question-field ${errors.studentName ? "has-error" : ""}`}>
              <span>학번과 이름 <b>*</b></span>
              <input
                type="text"
                name="studentName"
                placeholder="예: 2301 홍길동"
                aria-invalid={Boolean(errors.studentName)}
                aria-describedby={errors.studentName ? "contact-student-name-error" : undefined}
                onChange={() => errors.studentName && setErrors((current) => ({ ...current, studentName: undefined }))}
              />
              {errors.studentName && <small className="field-error" id="contact-student-name-error"><i>!</i>{errors.studentName}</small>}
            </label>

            <label className={`form-field form-field-full question-field ${errors.email ? "has-error" : ""}`}>
              <span>답변 받을 이메일 <b>*</b></span>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                onChange={() => errors.email && setErrors((current) => ({ ...current, email: undefined }))}
              />
              {errors.email && <small className="field-error" id="contact-email-error"><i>!</i>{errors.email}</small>}
            </label>

            <label className="form-field form-field-full select-field">
              <span>문의 유형</span>
              <span className="select-shell">
                <select name="topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
                  {topics.map((topic) => <option value={topic} key={topic}>{topic}</option>)}
                </select>
                <i aria-hidden="true" />
              </span>
            </label>

            <label className={`form-field form-field-full question-field ${errors.question ? "has-error" : ""}`}>
              <span>문의 내용을 작성해주세요 <b>*</b></span>
              <textarea
                name="question"
                placeholder="궁금한 점을 자유롭게 작성해주세요."
                aria-invalid={Boolean(errors.question)}
                aria-describedby={errors.question ? "question-error" : undefined}
                onChange={() => errors.question && setErrors((current) => ({ ...current, question: undefined }))}
              />
              {errors.question && <small className="field-error" id="question-error"><i>!</i>{errors.question}</small>}
            </label>

            <label className="consent-field form-field-full">
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>문의 답변을 위한 개인정보 수집·이용에 동의합니다.</span>
            </label>

            <div className="submit-row form-field-full">
              <p>접수한 문의는 Native 관리자만 확인할 수 있습니다.<br />작성한 이메일로 확인 후 답변드리겠습니다.</p>
              <div>{serverError && <small className="form-server-error">{serverError}</small>}<button type="submit" disabled={!agreed || submitting}>{submitting ? "전송 중..." : isProjectInquiry ? "프로젝트 문의 보내기" : "지원 문의 보내기"} <span>→</span></button></div>
            </div>
          </form>}
        </div>
      </section>
    </main>
  );
}
