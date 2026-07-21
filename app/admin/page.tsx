"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JobPosting, Project } from "@/lib/content";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type Tab = "overview" | "projects" | "jobs" | "contest" | "applications" | "inquiries" | "access";
type Application = { id: string; role: string; student_name: string; email: string; goal: string; status: string; created_at: string };
type Inquiry = { id: string; topic: string; student_name: string; email: string; message: string; status: string; created_at: string };
type AccessRequest = { id: string; user_id: string; email: string; display_name: string; status: "pending" | "approved" | "rejected"; requested_at: string; reviewed_at: string | null };
type LogoContestSubmission = { id: string; name: string; grade: number; class_number: number; student_number: number; school_email: string; file_name: string; file_size: number; creation_method: "direct" | "ai"; status: "submitted" | "reviewing" | "winner" | "rejected"; created_at: string; preview_url: string };
type AdminData = { admin: { email: string; displayName: string; role: "owner" | "admin" }; projects: Project[]; jobs: JobPosting[]; logoContestSubmissions: LogoContestSubmission[]; applications: Application[]; inquiries: Inquiry[]; accessRequests: AccessRequest[] };

const emptyProject: Project = { slug: "", name: "", type: "", description: "", summary: "", content: "", logo: "/native-logo.png", images: [], tone: "bookon", visual: "web-screen", tags: [], sortOrder: 0, published: true };
const emptyJob: JobPosting = { slug: "", department: "전공", title: "", summary: "", description: "", priority: false, status: "draft", closeDate: null, sortOrder: 0 };

export default function AdminPage() {
  const router = useRouter();
  const client = getBrowserSupabase();
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [projectEditor, setProjectEditor] = useState<Project | null>(null);
  const [jobEditor, setJobEditor] = useState<JobPosting | null>(null);

  const token = useCallback(async () => (await client?.auth.getSession())?.data.session?.access_token, [client]);
  const load = useCallback(async () => {
    const accessToken = await token();
    if (!accessToken) return router.replace("/admin/login");
    const response = await fetch("/api/admin", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    if (response.status === 401) return router.replace("/admin/login");
    const payload = await response.json() as AdminData & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "관리 데이터를 불러오지 못했습니다.");
    setData(payload);
    setLoading(false);
  }, [router, token]);

  useEffect(() => { load().catch((reason) => { setError(reason.message); setLoading(false); }); }, [load]);

  const mutate = async (resource: string, action: string, payload: Record<string, unknown>) => {
    const accessToken = await token();
    if (!accessToken) return router.replace("/admin/login");
    setNotice("");
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ resource, action, data: payload }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error ?? "저장하지 못했습니다.");
    await load();
    setNotice(action === "delete" ? "삭제했습니다." : "변경 내용을 저장했습니다.");
  };

  const signOut = async () => { await client?.auth.signOut(); router.replace("/admin/login"); };
  const counts = useMemo(() => ({
    projects: data?.projects.filter((item) => item.published).length ?? 0,
    jobs: data?.jobs.filter((item) => item.status === "open").length ?? 0,
    contest: data?.logoContestSubmissions.filter((item) => item.status === "submitted").length ?? 0,
    applications: data?.applications.filter((item) => item.status === "new").length ?? 0,
    inquiries: data?.inquiries.filter((item) => item.status === "new").length ?? 0,
    access: data?.accessRequests.filter((item) => item.status === "pending").length ?? 0,
  }), [data]);

  if (loading) return <main className="admin-loading"><span>N</span><p>관리 페이지를 준비하고 있습니다.</p></main>;
  if (error || !data) return <main className="admin-loading"><span>!</span><p>{error || "관리 데이터를 불러오지 못했습니다."}</p><a href="/admin/login">다시 로그인</a></main>;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand"><span><Image src="/native-logo.png" alt="" fill sizes="38px" unoptimized /></span>Native</a>
        <div className="admin-space-label"><small>WORKSPACE</small><strong>Official Web</strong></div>
        <nav>
          <AdminNav active={tab === "overview"} onClick={() => setTab("overview")} icon="⌂" label="대시보드" />
          <AdminNav active={tab === "projects"} onClick={() => setTab("projects")} icon="◇" label="프로젝트" count={data.projects.length} />
          <AdminNav active={tab === "jobs"} onClick={() => setTab("jobs")} icon="＋" label="지원 공고" count={counts.jobs} />
          <AdminNav active={tab === "contest"} onClick={() => setTab("contest")} icon="▣" label="로고 공모전" count={counts.contest} />
          <AdminNav active={tab === "applications"} onClick={() => setTab("applications")} icon="▤" label="지원서" count={counts.applications} />
          <AdminNav active={tab === "inquiries"} onClick={() => setTab("inquiries")} icon="◌" label="문의함" count={counts.inquiries} />
          {data.admin.role === "owner" && <AdminNav active={tab === "access"} onClick={() => setTab("access")} icon="◎" label="접근 승인" count={counts.access} />}
        </nav>
        <div className="admin-sidebar-foot"><div><small>{data.admin.displayName}</small><span>{data.admin.email}</span></div><button onClick={signOut}>로그아웃</button></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><div><small>NATIVE ADMIN</small><h1>{tabTitle(tab)}</h1></div><div><a href="/book-on-logo-contest" target="_blank">공모전 보기 ↗</a><a href="/" target="_blank">홈페이지 보기 ↗</a><span>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(new Date())}</span></div></header>
        {notice && <div className="admin-notice">✓ {notice}<button onClick={() => setNotice("")}>×</button></div>}

        {tab === "overview" && <Overview data={data} counts={counts} go={setTab} />}
        {tab === "projects" && <ProjectsPanel projects={data.projects} onNew={() => setProjectEditor({ ...emptyProject, sortOrder: data.projects.length + 1 })} onEdit={setProjectEditor} onDelete={(id) => confirm("이 프로젝트를 삭제할까요?") && mutate("projects", "delete", { id }).catch((reason) => setError(reason.message))} />}
        {tab === "jobs" && <JobsPanel jobs={data.jobs} onNew={() => setJobEditor({ ...emptyJob, sortOrder: data.jobs.length + 1 })} onEdit={setJobEditor} onDelete={(id) => confirm("이 지원 공고를 삭제할까요?") && mutate("jobs", "delete", { id }).catch((reason) => setError(reason.message))} />}
        {tab === "contest" && <LogoContestPanel items={data.logoContestSubmissions} onStatus={(id, status) => mutate("logo-contest", "status", { id, status }).catch((reason) => setError(reason.message))} onDelete={(id) => confirm("이 공모전 작품과 파일을 영구 삭제할까요?") && mutate("logo-contest", "delete", { id }).catch((reason) => setError(reason.message))} />}
        {tab === "applications" && <InboxPanel type="applications" items={data.applications} onStatus={(id, status) => mutate("applications", "status", { id, status }).catch((reason) => setError(reason.message))} onDelete={(id) => confirm("지원서를 영구 삭제할까요?") && mutate("applications", "delete", { id }).catch((reason) => setError(reason.message))} />}
        {tab === "inquiries" && <InboxPanel type="inquiries" items={data.inquiries} onStatus={(id, status) => mutate("inquiries", "status", { id, status }).catch((reason) => setError(reason.message))} onDelete={(id) => confirm("문의를 영구 삭제할까요?") && mutate("inquiries", "delete", { id }).catch((reason) => setError(reason.message))} />}
        {tab === "access" && data.admin.role === "owner" && <AccessPanel requests={data.accessRequests} onReview={(id, status) => mutate("access", "review", { id, status }).catch((reason) => setError(reason.message))} />}
      </section>

      {projectEditor && <ProjectEditor project={projectEditor} onClose={() => setProjectEditor(null)} onSave={(project) => mutate("projects", "save", project as unknown as Record<string, unknown>).then(() => setProjectEditor(null)).catch((reason) => setError(reason.message))} />}
      {jobEditor && <JobEditor job={jobEditor} onClose={() => setJobEditor(null)} onSave={(job) => mutate("jobs", "save", job as unknown as Record<string, unknown>).then(() => setJobEditor(null)).catch((reason) => setError(reason.message))} />}
    </main>
  );
}

function AdminNav({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count?: number }) {
  return <button className={active ? "active" : ""} onClick={onClick}><i>{icon}</i><span>{label}</span>{count !== undefined && <b>{count}</b>}</button>;
}

function Overview({ data, counts, go }: { data: AdminData; counts: Record<string, number>; go: (tab: Tab) => void }) {
  const recent = [...data.logoContestSubmissions.map((item) => ({ type: "공모전", title: `${item.name} · ${item.file_name}`, date: item.created_at })), ...data.applications.map((item) => ({ type: "지원서", title: `${item.student_name} · ${item.role}`, date: item.created_at })), ...data.inquiries.map((item) => ({ type: "문의", title: `${item.student_name} · ${item.topic}`, date: item.created_at }))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  return <div className="admin-dashboard">
    <section className="admin-welcome"><div><small>CONTROL THE EXPERIENCE</small><h2>홈페이지의 오늘을<br />한눈에 확인하세요.</h2><p>공개 중인 콘텐츠와 새로 도착한 지원서·문의를 확인할 수 있습니다.</p></div><div className="admin-welcome-n">N</div></section>
    <section className="admin-stats">
      <button onClick={() => go("projects")}><small>공개 프로젝트</small><strong>{counts.projects}</strong><span>프로젝트 관리 →</span></button>
      <button onClick={() => go("jobs")}><small>진행 중 공고</small><strong>{counts.jobs}</strong><span>공고 관리 →</span></button>
      <button onClick={() => go("contest")}><small>새 공모전 작품</small><strong>{counts.contest}</strong><span>작품 심사 →</span></button>
      <button onClick={() => go("applications")}><small>새 지원서</small><strong>{counts.applications}</strong><span>지원서 보기 →</span></button>
      <button onClick={() => go("inquiries")}><small>새 문의</small><strong>{counts.inquiries}</strong><span>문의 확인 →</span></button>
    </section>
    <section className="admin-recent"><div className="admin-section-head"><div><small>LATEST ACTIVITY</small><h3>최근 도착한 항목</h3></div></div>{recent.length ? recent.map((item) => <div className="admin-recent-row" key={`${item.type}-${item.title}-${item.date}`}><span>{item.type}</span><strong>{item.title}</strong><time>{formatDate(item.date)}</time></div>) : <div className="admin-empty">아직 도착한 항목이 없습니다.</div>}</section>
  </div>;
}

function ProjectsPanel({ projects, onNew, onEdit, onDelete }: { projects: Project[]; onNew: () => void; onEdit: (item: Project) => void; onDelete: (id: string) => void }) {
  return <section className="admin-panel"><div className="admin-section-head"><div><small>CONTENT</small><h2>프로젝트 관리</h2><p>홈페이지의 프로젝트 카드와 상세 설명을 관리합니다.</p></div><button onClick={onNew}>새 프로젝트 <span>＋</span></button></div><div className="admin-content-list">{projects.map((project) => <article className="admin-project-row" key={project.id || project.slug}><div className={`admin-project-icon ${project.tone}`}><Image src={project.logo} alt="" fill sizes="44px" unoptimized /></div><div><small>{project.type}</small><h3>{project.name}</h3><p>{project.description}</p><div>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><b className={project.published ? "status-live" : "status-draft"}>{project.published ? "공개" : "비공개"}</b><div className="admin-row-actions"><a href={`/projects/${project.slug}`} target="_blank">보기</a><button onClick={() => onEdit(project)}>편집</button><button className="danger" onClick={() => project.id && onDelete(project.id)}>삭제</button></div></article>)}</div></section>;
}

function JobsPanel({ jobs, onNew, onEdit, onDelete }: { jobs: JobPosting[]; onNew: () => void; onEdit: (item: JobPosting) => void; onDelete: (id: string) => void }) {
  return <section className="admin-panel"><div className="admin-section-head"><div><small>RECRUIT</small><h2>지원 공고 관리</h2><p>모집 전공, 마감일과 공개 상태를 관리합니다.</p></div><button onClick={onNew}>새 지원 공고 <span>＋</span></button></div><div className="admin-job-list">{jobs.map((job) => <article key={job.id || job.slug}><div><small>전공</small><h3>{job.title}</h3><p>{job.summary}</p></div><div className="admin-job-meta"><b className={`status-${job.status}`}>{job.status === "open" ? "모집 중" : job.status === "closed" ? "마감" : "임시 저장"}</b>{job.priority && <span>우대 모집</span>}<time>{job.closeDate ? `${job.closeDate} 마감` : "상시 모집"}</time></div><div className="admin-row-actions">{job.status === "open" && <a href={`/recruit/${encodeURIComponent(job.slug)}`} target="_blank">보기</a>}<button onClick={() => onEdit(job)}>편집</button><button className="danger" onClick={() => job.id && onDelete(job.id)}>삭제</button></div></article>)}</div></section>;
}

function LogoContestPanel({ items, onStatus, onDelete }: { items: LogoContestSubmission[]; onStatus: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const statuses = [["submitted", "새 작품"], ["reviewing", "심사 중"], ["winner", "수상작"], ["rejected", "심사 제외"]];
  return <section className="admin-panel"><div className="admin-section-head"><div><small>BOOK-ON LOGO CONTEST</small><h2>공모전 제출 작품</h2><p>제출된 PNG 원본을 확인하고 심사 상태를 관리합니다.</p></div><a className="admin-contest-link" href="/book-on-logo-contest" target="_blank">공모전 페이지 ↗</a></div><div className="admin-contest-list">{items.length ? items.map((item) => <article className="admin-contest-card" key={item.id}>
    <a className="admin-contest-preview" href={item.preview_url || undefined} target="_blank" aria-label={`${item.name} 제출 로고 원본 보기`} style={item.preview_url ? { backgroundImage: `url(${item.preview_url})` } : undefined}><span>{item.preview_url ? "원본 크게 보기 ↗" : "미리보기 없음"}</span></a>
    <div className="admin-contest-info"><div><span className={`contest-status status-${item.status}`}>{statuses.find(([value]) => value === item.status)?.[1]}</span><time>{formatDate(item.created_at)}</time></div><h3>{item.name}</h3><p>{item.grade}학년 {item.class_number}반 {item.student_number}번</p><a href={`mailto:${item.school_email}`}>{item.school_email}</a><dl><div><dt>제작 방식</dt><dd>{item.creation_method === "ai" ? "AI 사용" : "직접 제작"}</dd></div><div><dt>파일</dt><dd>{formatBytes(item.file_size)} · PNG</dd></div></dl><div className="admin-contest-actions"><select value={item.status} onChange={(event) => onStatus(item.id, event.target.value)}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="danger" onClick={() => onDelete(item.id)}>삭제</button></div></div>
  </article>) : <div className="admin-empty">아직 제출된 작품이 없습니다.</div>}</div></section>;
}

function InboxPanel({ type, items, onStatus, onDelete }: { type: "applications" | "inquiries"; items: (Application | Inquiry)[]; onStatus: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const isApplication = type === "applications";
  const statuses = isApplication ? [["new", "신규"], ["reviewing", "검토 중"], ["accepted", "합격"], ["rejected", "불합격"]] : [["new", "신규"], ["answered", "답변 완료"], ["archived", "보관"]];
  return <section className="admin-panel"><div className="admin-section-head"><div><small>{isApplication ? "APPLICATIONS" : "INBOX"}</small><h2>{isApplication ? "지원서" : "문의함"}</h2><p>{isApplication ? "도착한 지원서를 확인하고 검토 상태를 관리합니다." : "지원 및 NativeLab 프로젝트 문의를 확인합니다."}</p></div></div><div className="admin-inbox-list">{items.length ? items.map((item) => { const application = item as Application; const inquiry = item as Inquiry; return <article key={item.id}><div className="admin-inbox-head"><span>{isApplication ? application.role : inquiry.topic}</span><time>{formatDate(item.created_at)}</time></div><h3>{item.student_name}</h3><a href={`mailto:${item.email}`}>{item.email}</a><p>{isApplication ? application.goal : inquiry.message}</p><div className="admin-inbox-actions"><select value={item.status} onChange={(event) => onStatus(item.id, event.target.value)}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="danger" onClick={() => onDelete(item.id)}>삭제</button></div></article>; }) : <div className="admin-empty">아직 도착한 항목이 없습니다.</div>}</div></section>;
}

function AccessPanel({ requests, onReview }: { requests: AccessRequest[]; onReview: (id: string, status: "approved" | "rejected") => void }) {
  return <section className="admin-panel"><div className="admin-section-head"><div><small>ADMIN ACCESS</small><h2>관리자 접근 승인</h2><p>관리 페이지 사용을 요청한 계정을 확인하고 직접 승인하거나 거절합니다.</p></div></div><div className="admin-access-list">{requests.length ? requests.map((request) => <article key={request.id}><div className="admin-access-avatar">{request.display_name.slice(0, 1).toUpperCase()}</div><div><span className={`status-${request.status}`}>{request.status === "pending" ? "승인 대기" : request.status === "approved" ? "승인됨" : "거절됨"}</span><h3>{request.display_name}</h3><a href={`mailto:${request.email}`}>{request.email}</a><time>요청 {formatDate(request.requested_at)}</time></div><div className="admin-access-actions">{request.status === "pending" ? <><button className="approve" onClick={() => onReview(request.id, "approved")}>관리자 승인</button><button onClick={() => onReview(request.id, "rejected")}>거절</button></> : <span>{request.reviewed_at ? formatDate(request.reviewed_at) : "처리 완료"}</span>}</div></article>) : <div className="admin-empty">아직 관리자 접근 요청이 없습니다.</div>}</div></section>;
}

function ProjectEditor({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (item: Project) => void }) {
  const [value, setValue] = useState(project);
  const submit = (event: FormEvent) => { event.preventDefault(); onSave(value); };
  return <div className="admin-modal-backdrop"><form className="admin-editor" onSubmit={submit}><header><div><small>PROJECT EDITOR</small><h2>{project.id ? "프로젝트 편집" : "새 프로젝트"}</h2></div><button type="button" onClick={onClose}>×</button></header><div className="admin-editor-grid">
    <Field label="프로젝트명" value={value.name} onChange={(name) => setValue({ ...value, name })} required />
    <Field label="주소 슬러그" value={value.slug} onChange={(slug) => setValue({ ...value, slug })} placeholder="book-on" required />
    <Field label="프로젝트 유형" value={value.type} onChange={(type) => setValue({ ...value, type })} placeholder="Main product · Mobile" required />
    <Field label="정렬 순서" value={String(value.sortOrder)} type="number" onChange={(sortOrder) => setValue({ ...value, sortOrder: Number(sortOrder) })} />
    <Field wide label="카드 설명" value={value.description} onChange={(description) => setValue({ ...value, description })} required />
    <Field wide label="상세 요약" value={value.summary} onChange={(summary) => setValue({ ...value, summary })} />
    <TextArea label="상세 소개" value={value.content} onChange={(content) => setValue({ ...value, content })} />
    <Field wide label="기술 태그" value={value.tags.join(", ")} onChange={(tags) => setValue({ ...value, tags: split(tags) })} placeholder="iOS, Android, Back-End" />
    <Field wide label="제품 이미지 경로" value={value.images.join(", ")} onChange={(images) => setValue({ ...value, images: split(images) })} placeholder="/image-1.png, /image-2.png" />
    <Field label="로고 경로" value={value.logo} onChange={(logo) => setValue({ ...value, logo })} />
    <label className="admin-field"><span>컬러 테마</span><select value={value.tone} onChange={(event) => setValue({ ...value, tone: event.target.value })}><option value="bookon">Green</option><option value="hopes">Blue</option><option value="itda">Purple</option></select></label>
    <label className="admin-check"><input type="checkbox" checked={value.published} onChange={(event) => setValue({ ...value, published: event.target.checked })} /><span>홈페이지에 공개</span></label>
  </div><footer><button type="button" onClick={onClose}>취소</button><button type="submit">변경 내용 저장</button></footer></form></div>;
}

function JobEditor({ job, onClose, onSave }: { job: JobPosting; onClose: () => void; onSave: (item: JobPosting) => void }) {
  const [value, setValue] = useState(job);
  const save = (event: FormEvent) => {
    event.preventDefault();
    const title = value.title.trim();
    onSave({ ...value, title, slug: value.slug.trim() || jobSlug(title), department: "전공" });
  };
  return <div className="admin-modal-backdrop"><form className="admin-editor" onSubmit={save}><header><div><small>RECRUIT EDITOR</small><h2>{job.id ? "지원 공고 편집" : "새 지원 공고"}</h2></div><button type="button" onClick={onClose}>×</button></header><div className="admin-editor-grid">
    <Field label="전공명" value={value.title} onChange={(title) => setValue({ ...value, title })} placeholder="예: 게임 개발" required />
    <Field label="정렬 순서" type="number" value={String(value.sortOrder)} onChange={(sortOrder) => setValue({ ...value, sortOrder: Number(sortOrder) })} />
    <Field wide label="공고 요약" value={value.summary} onChange={(summary) => setValue({ ...value, summary })} required />
    <TextArea label="상세 설명" value={value.description} onChange={(description) => setValue({ ...value, description })} />
    <label className="admin-field"><span>공개 상태</span><select value={value.status} onChange={(event) => setValue({ ...value, status: event.target.value as JobPosting["status"] })}><option value="draft">임시 저장</option><option value="open">모집 중</option><option value="closed">마감</option></select></label>
    <Field label="마감일" type="date" value={value.closeDate ?? ""} onChange={(closeDate) => setValue({ ...value, closeDate: closeDate || null })} />
    <label className="admin-check"><input type="checkbox" checked={value.priority} onChange={(event) => setValue({ ...value, priority: event.target.checked })} /><span>우대 모집으로 표시</span></label>
  </div><footer><button type="button" onClick={onClose}>취소</button><button type="submit">공고 저장</button></footer></form></div>;
}

function Field({ label, value, onChange, placeholder, type = "text", required, wide }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; wide?: boolean }) { return <label className={`admin-field ${wide ? "wide" : ""}`}><span>{label}{required && <b>*</b>}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="admin-field wide"><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function split(value: string) { return value.split(",").map((item) => item.trim()).filter(Boolean); }
function jobSlug(value: string) { return value.toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || `major-${Date.now()}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function formatBytes(value: number) { return `${(value / 1024 / 1024).toFixed(2)}MB`; }
function tabTitle(tab: Tab) { return ({ overview: "대시보드", projects: "프로젝트", jobs: "지원 공고", contest: "Book-on 로고 공모전", applications: "지원서", inquiries: "문의함", access: "접근 승인" })[tab]; }
