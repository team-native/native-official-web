"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const client = getBrowserSupabase();

  useEffect(() => {
    client?.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/admin");
    });
  }, [client, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return setError("Supabase 환경 설정이 필요합니다.");
    setLoading(true);
    setError("");
    const { error: loginError } = await client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) return setError("이메일 또는 비밀번호를 확인해주세요.");
    router.replace("/admin");
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
          <h2>관리자 로그인</h2>
          <p>등록된 Native 관리자 계정으로 로그인해주세요.</p>
          {!client && <div className="admin-setup-notice">Supabase 연결 후 관리자 로그인을 사용할 수 있습니다.</div>}
          <label><span>이메일</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@native.team" required /></label>
          <label><span>비밀번호</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호를 입력해주세요" required /></label>
          {error && <div className="admin-form-error">{error}</div>}
          <button type="submit" disabled={loading || !client}>{loading ? "로그인 중..." : "관리 페이지 열기"}<span>→</span></button>
          <a href="/">홈페이지로 돌아가기</a>
        </form>
      </section>
    </main>
  );
}
