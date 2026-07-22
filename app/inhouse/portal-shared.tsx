"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export type FinanceData = {
  period: string;
  demo: boolean;
  member: { name: string; email: string };
  summary: { available: number; monthlyRevenue: number; monthlyExpense: number; externalReceipts: number; reserveBalance: number };
  pools: { id: string; label: string; amount: number; ratio: number; color: string; note: string }[];
  flow: { month: string; income: number; expense: number }[];
  receipts: { client: string; project: string; amount: number; status: string; date: string }[];
  notices: { category: string; title: string; meta: string }[];
};

export function useInhouseData() {
  const router = useRouter();
  const client = getBrowserSupabase();
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const preview = window.location.search.includes("preview=1");
      if (preview) {
        const response = await fetch("/api/inhouse?preview=1", { cache: "no-store" });
        if (!response.ok) throw new Error("인하우스 미리보기를 불러오지 못했습니다.");
        setData(await response.json());
        return;
      }
      const session = (await client?.auth.getSession())?.data.session;
      if (!session) return router.replace("/inhouse/login");
      const response = await fetch("/api/inhouse", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      if (response.status === 401) return router.replace("/inhouse/login");
      if (!response.ok) throw new Error("인하우스 데이터를 불러오지 못했습니다.");
      setData(await response.json());
    };
    load().catch((reason) => setError(reason.message));
  }, [client, router]);

  return { data, error };
}

const menu = [
  ["홈", "/inhouse"],
  ["재무", "/inhouse/finance"],
  ["문서 신청", "/inhouse/requests"],
  ["문서함", "/inhouse/documents"],
] as const;

export function InhouseHeader({ member }: { member: FinanceData["member"] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const client = getBrowserSupabase();
  const [menuOpen, setMenuOpen] = useState(false);
  const preview = searchParams.get("preview") === "1";
  const link = (href: string) => preview ? `${href}?preview=1` : href;
  const signOut = async () => {
    await client?.auth.signOut();
    router.replace("/inhouse/login");
  };

  return <header className="pf-header">
    <Link href={link("/inhouse")} className="pf-brand">
      <span><Image src="/native-logo.png" alt="Native" fill sizes="30px" unoptimized /></span>
      <b>Native</b><em>팀</em>
    </Link>
    <nav aria-label="인하우스 메뉴">
      {menu.map(([label, href]) => <Link key={href} href={link(href)} className={pathname === href ? "active" : ""}>{label}</Link>)}
    </nav>
    <div className="pf-member">
      <span>{member.name.slice(0, 1)}</span>
      <div><b>{member.name}</b><small>{member.email}</small></div>
      {!preview && <button onClick={signOut}>로그아웃</button>}
      <button className="pf-menu-button" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><i /><i /></button>
    </div>
    {menuOpen && <nav className="pf-mobile-menu" aria-label="모바일 인하우스 메뉴">{menu.map(([label, href]) => <Link key={href} href={link(href)} onClick={() => setMenuOpen(false)} className={pathname === href ? "active" : ""}>{label}<span>→</span></Link>)}</nav>}
  </header>;
}

export function PortalScreen({ data, error, active, children }: { data: FinanceData | null; error: string; active?: string; children: ReactNode }) {
  if (error) return <main className="pf-state"><b>!</b><h1>잠시 문제가 생겼어요</h1><p>{error}</p><button onClick={() => location.reload()}>다시 불러오기</button></main>;
  if (!data) return <main className="pf-state"><div className="pf-loading"><i /><i /><i /></div><p>Native 인하우스를 준비하고 있어요</p></main>;
  return <main className={`pf-shell ${active ? `pf-${active}` : ""}`}><InhouseHeader member={data.member} />{children}</main>;
}

export const won = new Intl.NumberFormat("ko-KR");
