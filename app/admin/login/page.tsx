"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type AccessStatus = "none" | "pending" | "approved" | "rejected";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "request">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<AccessStatus>("none");
  const client = getBrowserSupabase();

  useEffect(() => {
    client?.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const result = await fetchAccessStatus(data.session.access_token);
      setEmail(data.session.user.email ?? "");
      setStatus(result.status);
      if (result.status === "approved") router.replace("/admin");
      if (result.status === "pending") setMessage("관리자 권한 승인 대기 중입니다. 최고관리자가 승인하면 이용할 수 있어요.");
      if (result.status === "rejected") setMessage("관리자 권한 요청이 거절되었습니다. 최고관리자에게 문의해주세요.");
    }).catch(() => undefined);
  }, [client, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return setError("Supabase 환경 설정이 필요합니다.");
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "request") {
      const { data, error: signupError } = await client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName.trim() || "Native Admin" } },
      });
      if (signupError) {
        setLoading(false);
        return setError(signupError.message.includes("already") ? "이미 등록된 이메일입니다. 로그인 후 권한을 요청해주세요." : "계정을 만들지 못했습니다. 입력 내용을 확인해주세요.");
      }
      if (!data.session) {
        setLoading(false);
        setMode("login");
        return setMessage("인증 메일을 보냈습니다. 이메일 인증 후 로그인하면 관리자 권한 요청을 이어갈 수 있어요.");
      }
      const requestResult = await requestAccess(data.session.access_token, displayName);
      setLoading(false);
      if (!requestResult.ok) return setError(requestResult.error ?? "권한 요청을 접수하지 못했습니다.");
      setStatus(requestResult.status ?? "pending");
      if (requestResult.status === "approved") return router.replace("/admin");
      return setMessage("관리자 권한 요청을 접수했습니다. 최고관리자가 승인하면 이용할 수 있어요.");
    }

    const { error: loginError } = await client.auth.signInWithPassword({ email, password });
    if (loginError) {
      setLoading(false);
      return setError("이메일 또는 비밀번호를 확인해주세요.");
    }
    const session = (await client.auth.getSession()).data.session;
    if (!session) {
      setLoading(false);
      return setError("로그인 정보를 확인하지 못했습니다. 다시 시도해주세요.");
    }
    let access = await fetchAccessStatus(session.access_token);
    if (access.status === "none") access = await requestAccess(session.access_token, session.user.user_metadata?.display_name ?? "Native Admin");
    setLoading(false);
    setStatus(access.status ?? "none");
    if (access.status === "approved") return router.replace("/admin");
    setMessage(access.status === "rejected" ? "관리자 권한 요청이 거절되었습니다. 최고관리자에게 문의해주세요." : access.status === "pending" ? "관리자 권한 승인 대기 중입니다. 승인 후 다시 로그인해주세요." : "권한 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.");
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand">
        <a href="/" className="admin-brand"><span><Image src="/native-logo.png" alt="" fill sizes="42px" unoptimized /></span>Native</a>
        <div>
          <small>NATIVE CONTROL ROOM</small>
          <h1>제품과 팀의 소식을<br />한곳에서 관리합니다.</h1>
          <p>프로젝트, 지원 공고, 지원서와 문의를 안전하게 관리하는 Native 전용 공간입니다.</p>
        </div>
        <div className="admin-login-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      </section>
      <section className="admin-login-form-wrap">
        <form className="admin-login-form" onSubmit={submit}>
          <div className="admin-login-mark"><span>N</span></div>
          <small>ADMIN ACCESS</small>
          <h2>{mode === "login" ? "관리자 로그인" : "관리 권한 요청"}</h2>
          <p>{mode === "login" ? "등록된 계정으로 로그인하거나 관리자 권한을 요청해주세요." : "계정을 만든 뒤 최고관리자의 승인을 받으면 관리 페이지를 사용할 수 있어요."}</p>
          <div className="admin-login-tabs" role="tablist" aria-label="관리자 인증 방식">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); setMessage(""); }}>로그인</button>
            <button type="button" className={mode === "request" ? "active" : ""} onClick={() => { setMode("request"); setError(""); setMessage(""); }}>권한 요청</button>
          </div>
          {!client && <div className="admin-setup-notice">Supabase 연결 후 관리자 로그인을 사용할 수 있습니다.</div>}
          {mode === "request" && <label><span>이름</span><input type="text" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="이름을 입력해주세요" required /></label>}
          <label><span>이메일</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@native.team" required /></label>
          <label><span>비밀번호</span><input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상 입력해주세요" required /></label>
          {error && <div className="admin-form-error">{error}</div>}
          {message && <div className={`admin-form-message status-${status}`}>{message}</div>}
          <button type="submit" disabled={loading || !client}>{loading ? "처리 중..." : mode === "login" ? "관리 페이지 열기" : "권한 요청 보내기"}<span>→</span></button>
          <a href="/">홈페이지로 돌아가기</a>
        </form>
      </section>
    </main>
  );
}

async function fetchAccessStatus(token: string) {
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
