"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { fallbackJobs, type JobPosting } from "@/lib/content";

const fallbackRoles = fallbackJobs.filter((job) => job.status === "open").map((job) => job.title);
const applicationEmail = "native.team@example.com";
type ApplicationErrors = Partial<Record<"studentName" | "email" | "goal", string>>;

export default function ApplyPage() {
  const [roles, setRoles] = useState(fallbackRoles);
  const [role, setRole] = useState(fallbackRoles[0]);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole) {
      setRoles((current) => current.includes(requestedRole) ? current : [requestedRole, ...current]);
      setRole(requestedRole);
    }

    fetch("/api/content", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as { jobs?: JobPosting[] } : null)
      .then((payload) => {
        const openRoles = [...new Set((payload?.jobs ?? [])
          .filter((job) => job.status === "open")
          .map((job) => job.title)
          .filter(Boolean))];
        if (openRoles.length === 0) return;

        setRoles(openRoles);
        setRole((current) => {
          if (requestedRole && openRoles.includes(requestedRole)) return requestedRole;
          return openRoles.includes(current) ? current : openRoles[0];
        });
      })
      .catch(() => undefined);
  }, []);

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const studentName = String(data.get("studentName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const goal = String(data.get("goal") ?? "").trim();
    const nextErrors: ApplicationErrors = {};

    if (!studentName) nextErrors.studentName = "학번과 이름을 입력해주세요.";
    if (!email) nextErrors.email = "합격 안내를 받을 이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "이메일 형식을 다시 확인해주세요. 예: name@example.com";
    if (!goal) nextErrors.goal = "지원한 이유와 이루고 싶은 목표를 작성해주세요.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !agreed) return;

    setSubmitting(true);
    setServerError("");
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, studentName, email, goal, website: data.get("website") }),
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
      setServerError(payload.error ?? "지원서를 보내지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const subject = `[Native 지원] ${role} · ${studentName}`;
    const body = [
      `지원 포지션: ${role}`,
      `학번과 이름: ${studentName}`,
      `이메일: ${email}`,
      "",
      "지원한 이유와 이루고 싶은 목표",
      goal,
    ].join("\n");

    window.location.href = `mailto:${applicationEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitting(false);
  };

  return (
    <main className="apply-page">
      <header className="apply-header">
        <a className="brand apply-brand" href="/" aria-label="Native 홈페이지">
          <span className="brand-mark"><Image src="/native-logo.png" alt="" fill sizes="38px" priority unoptimized /></span>
          <span>Native</span>
        </a>
        <a className="apply-back" href="/#recruit">지원 공고로 돌아가기 <span>↗</span></a>
      </header>

      <section className="apply-layout">
        <div className="apply-intro">
          <div className="apply-kicker">NATIVE 지원서</div>
          <h1>함께 만들고 싶은<br />목표를 들려주세요.</h1>
          <p>복잡한 서류보다 Native에 지원한 이유와 팀에서 이루고 싶은 목표를 궁금해합니다.</p>

          <div className="apply-role-card">
            <span>선택한 포지션</span>
            <strong>{role}</strong>
            <small>지원 → 모집 마감 → 이메일 합격 안내 → 합류 미팅</small>
          </div>

          <div className="apply-n" aria-hidden="true">N</div>
        </div>

        <div className="application-form-wrap">
          <div className="application-form-head">
            <span>01 / 지원서 작성</span>
            <h2>지원서 작성</h2>
            <p>필수 항목만 간단하고 솔직하게 작성해주세요.</p>
          </div>

          {submitted ? <div className="form-success"><span>✓</span><small>APPLICATION RECEIVED</small><h3>지원서가 접수되었습니다.</h3><p>지원 결과는 공고에 안내된 기일 이후 작성한 이메일로 개별 안내합니다.</p><a href="/">Native 홈페이지로 돌아가기</a></div> : <form className="application-form" onSubmit={submitApplication} noValidate>
            <input className="form-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <label className="form-field form-field-full select-field">
              <span>지원 포지션</span>
              <span className="select-shell">
                <select value={role} onChange={(event) => setRole(event.target.value)} name="role">
                  {roles.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
                <i aria-hidden="true" />
              </span>
            </label>

            <label className={`form-field form-field-full question-field ${errors.studentName ? "has-error" : ""}`}>
              <span>학번과 이름을 기재해주세요 <b>*</b></span>
              <input
                type="text"
                name="studentName"
                placeholder="예: 2301 홍길동"
                aria-invalid={Boolean(errors.studentName)}
                aria-describedby={errors.studentName ? "student-name-error" : undefined}
                onChange={() => errors.studentName && setErrors((current) => ({ ...current, studentName: undefined }))}
              />
              {errors.studentName && <small className="field-error" id="student-name-error"><i>!</i>{errors.studentName}</small>}
            </label>

            <label className={`form-field form-field-full question-field ${errors.email ? "has-error" : ""}`}>
              <span>합격 안내를 받을 이메일을 기재해주세요 <b>*</b></span>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "application-email-error" : undefined}
                onChange={() => errors.email && setErrors((current) => ({ ...current, email: undefined }))}
              />
              {errors.email && <small className="field-error" id="application-email-error"><i>!</i>{errors.email}</small>}
            </label>

            <label className={`form-field form-field-full question-field ${errors.goal ? "has-error" : ""}`}>
              <span>지원한 이유와 이루고 싶은 목표를 함께 작성해주세요 <b>*</b></span>
              <textarea
                name="goal"
                placeholder="Native에 지원한 이유와 팀에서 이루고 싶은 목표를 자유롭게 작성해주세요."
                aria-invalid={Boolean(errors.goal)}
                aria-describedby={errors.goal ? "goal-error" : undefined}
                onChange={() => errors.goal && setErrors((current) => ({ ...current, goal: undefined }))}
              />
              {errors.goal && <small className="field-error" id="goal-error"><i>!</i>{errors.goal}</small>}
            </label>

            <label className="consent-field form-field-full">
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>지원 검토와 연락을 위한 개인정보 수집·이용에 동의합니다.</span>
            </label>

            <div className="submit-row form-field-full">
              <p>공고에 안내된 기일 이후 합격자에게 이메일로 개별 안내합니다.<br />제출한 지원서는 Native 관리자만 확인할 수 있습니다.</p>
              <div>{serverError && <small className="form-server-error">{serverError}</small>}<button type="submit" disabled={!agreed || submitting}>{submitting ? "접수 중..." : "지원서 제출하기"} <span>→</span></button></div>
            </div>
          </form>}
        </div>
      </section>
    </main>
  );
}
