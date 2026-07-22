"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type AccessStatus = "none" | "pending" | "approved" | "rejected";

export default function InhouseLoginPage() {
  const router = useRouter();
  const client = getBrowserSupabase();
  const [mode, setMode] = useState<"login" | "request">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("native-inhouse-email");
    if (savedEmail) { setEmail(savedEmail); setRemember(true); }
    client?.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const access = await accessStatus(data.session.access_token);
      if (access.status === "approved") router.replace("/inhouse");
    }).catch(() => undefined);
  }, [client, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return setError("로그인 설정을 확인하지 못했습니다.");
    setLoading(true);
    setError("");
    setMessage("");
    if (remember) localStorage.setItem("native-inhouse-email", email);
    else localStorage.removeItem("native-inhouse-email");

    if (mode === "request") {
      const { data, error: signUpError } = await client.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() || "Native Member" } },
      });
      if (signUpError) {
        setLoading(false);
        return setError(signUpError.message.includes("already") ? "이미 등록된 이메일입니다. 로그인 탭을 이용해주세요." : "계정을 만들지 못했습니다. 입력 내용을 확인해주세요.");
      }
      if (!data.session) {
        setLoading(false);
        setMode("login");
        return setMessage("인증 메일을 보냈어요. 이메일 인증 후 로그인해주세요.");
      }
      const result = await requestAccess(data.session.access_token, name);
      setLoading(false);
      if (!result.ok) return setError(result.error ?? "접근 요청을 보내지 못했습니다.");
      return setMessage("접근 요청을 보냈어요. 승인 후 인하우스에 들어올 수 있습니다.");
    }

    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError || !data.session) {
      setLoading(false);
      return setError("이메일 또는 비밀번호를 확인해주세요.");
    }
    let access = await accessStatus(data.session.access_token);
    if (access.status === "none") access = await requestAccess(data.session.access_token, data.user.user_metadata?.display_name ?? "Native Member");
    setLoading(false);
    if (access.status === "approved") return router.replace("/inhouse");
    if (access.status === "rejected") return setError("접근 요청이 승인되지 않았습니다. 운영진에게 문의해주세요.");
    setMessage("접근 승인 대기 중이에요. 운영진이 승인하면 이용할 수 있습니다.");
  };

  return (
    <main className="pf-login-page">
      <header><a href="/" className="pf-login-brand"><span><Image src="/native-logo.png" alt="Native" fill sizes="32px" unoptimized /></span><b>Native</b><em>inhouse</em></a></header>
      <section className="pf-login-center">
        <form onSubmit={submit} className="pf-login-form">
          <div className="pf-login-logo"><Image src="/native-logo.png" alt="" fill sizes="48px" unoptimized /></div>
          <h1>{mode === "login" ? "팀스페이스 로그인" : "인하우스 가입 요청"}</h1>
          <p>{mode === "login" ? "승인된 Native 계정으로 로그인해주세요." : "계정을 만들고 운영진에게 접근 승인을 요청해요."}</p>
          {mode === "request" && <label><input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" required /></label>}
          <label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일" required /></label>
          <label className="pf-password"><input type={showPassword ? "text" : "password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? "숨김" : "보기"}</button></label>
          {mode === "login" && <label className="pf-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><i />이메일 기억하기</label>}
          {error && <div className="pf-login-alert error">{error}</div>}
          {message && <div className="pf-login-alert">{message}</div>}
          <button className="pf-login-submit" disabled={loading || !client}>{loading ? "확인 중..." : mode === "login" ? "로그인" : "가입 요청 보내기"}</button>
          <div className="pf-login-switch">{mode === "login" ? "처음이신가요?" : "이미 계정이 있나요?"}<button type="button" onClick={() => { setMode(mode === "login" ? "request" : "login"); setError(""); setMessage(""); }}>{mode === "login" ? "가입 요청하기" : "로그인하기"}</button></div>
        </form>
      </section>
      <footer><a href="/">← Native 홈페이지</a><div><a href="#">이용 약관</a><a href="#">개인정보처리방침</a></div></footer>
    </main>
  );
}

async function accessStatus(token: string) {
  const response = await fetch("/api/admin/access", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return { status: "none" as AccessStatus, ok: false };
  return await response.json() as { status: AccessStatus; ok: boolean; error?: string };
}

async function requestAccess(token: string, displayName: string) {
  const response = await fetch("/api/admin/access", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ displayName }),
  });
  const result = await response.json() as { status: AccessStatus; ok: boolean; error?: string };
  return { ...result, ok: response.ok && result.ok };
}
