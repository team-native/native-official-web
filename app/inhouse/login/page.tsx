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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
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
    <main className="ih-login-page">
      <section className="ih-login-brand">
        <a href="/" className="ih-wordmark"><span><Image src="/native-logo.png" alt="Native" fill sizes="44px" unoptimized /></span><b>Native</b></a>
        <div className="ih-login-copy">
          <span className="ih-kicker"><i /> NATIVE ONLY</span>
          <h1>팀의 돈과 일을<br />한눈에 확인하세요.</h1>
          <p>재무 흐름부터 품의, 규칙과 문서까지<br />Native의 모든 운영 정보를 한곳에 모았어요.</p>
        </div>
        <div className="ih-login-orbit" aria-hidden="true"><i /><i /><i /></div>
      </section>
      <section className="ih-login-panel">
        <form onSubmit={submit} className="ih-login-form">
          <div className="ih-login-icon"><Image src="/native-logo.png" alt="" fill sizes="52px" unoptimized /></div>
          <span className="ih-kicker">INHOUSE ACCESS</span>
          <h2>{mode === "login" ? "다시 만나서 반가워요" : "팀 접근 권한 요청"}</h2>
          <p>{mode === "login" ? "승인된 Native 계정으로 로그인해주세요." : "계정을 만든 뒤 운영진의 승인을 받으면 사용할 수 있어요."}</p>
          <div className="ih-login-tabs">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); setMessage(""); }}>로그인</button>
            <button type="button" className={mode === "request" ? "active" : ""} onClick={() => { setMode("request"); setError(""); setMessage(""); }}>접근 요청</button>
          </div>
          {mode === "request" && <label><span>이름</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름을 입력해주세요" required /></label>}
          <label><span>이메일</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@native.team" required /></label>
          <label><span>비밀번호</span><input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상 입력해주세요" required /></label>
          {error && <div className="ih-form-alert error">{error}</div>}
          {message && <div className="ih-form-alert">{message}</div>}
          <button className="ih-login-submit" disabled={loading || !client}>{loading ? "확인 중..." : mode === "login" ? "인하우스 들어가기" : "접근 요청 보내기"}<b>→</b></button>
          <a href="/">Native 홈페이지로 돌아가기</a>
        </form>
      </section>
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
