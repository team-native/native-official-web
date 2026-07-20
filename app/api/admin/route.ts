import { jobFromRow, projectFromRow } from "@/lib/content";
import { jsonError, requireAdmin } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

const allowedResources = ["projects", "jobs", "applications", "inquiries"] as const;
type Resource = (typeof allowedResources)[number];

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth) return jsonError("관리자 로그인이 필요합니다.", 401);

  const [projects, jobs, applications, inquiries] = await Promise.all([
    auth.client.from("projects").select("*").order("sort_order"),
    auth.client.from("job_postings").select("*").order("sort_order"),
    auth.client.from("applications").select("*").order("created_at", { ascending: false }),
    auth.client.from("inquiries").select("*").order("created_at", { ascending: false }),
  ]);

  const error = projects.error || jobs.error || applications.error || inquiries.error;
  if (error) return jsonError("관리 데이터를 불러오지 못했습니다.", 500);

  return Response.json({
    admin: { email: auth.user.email, displayName: auth.admin.display_name },
    projects: (projects.data ?? []).map(projectFromRow),
    jobs: (jobs.data ?? []).map(jobFromRow),
    applications: applications.data ?? [],
    inquiries: inquiries.data ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth) return jsonError("관리자 로그인이 필요합니다.", 401);

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const resource = body?.resource as Resource;
  const action = String(body?.action ?? "");
  const data = (body?.data ?? {}) as Record<string, unknown>;
  if (!allowedResources.includes(resource)) return jsonError("지원하지 않는 관리 항목입니다.");

  if (resource === "projects") {
    if (action === "delete") return remove(auth.client, "projects", data.id);
    const payload = {
      ...(data.id ? { id: data.id } : {}),
      slug: clean(data.slug, 100),
      name: clean(data.name, 120),
      type: clean(data.type, 160),
      description: clean(data.description, 500),
      summary: clean(data.summary, 1000),
      content: clean(data.content, 10000),
      logo_url: clean(data.logo, 500) || "/native-logo.png",
      images: stringArray(data.images),
      tone: clean(data.tone, 30) || "bookon",
      visual: clean(data.visual, 40) || "web-screen",
      tags: stringArray(data.tags),
      sort_order: numberValue(data.sortOrder),
      published: Boolean(data.published),
    };
    if (!payload.slug || !payload.name || !payload.description) return jsonError("프로젝트 이름, 주소, 설명은 필수입니다.");
    const { error } = await auth.client.from("projects").upsert(payload);
    if (error) return jsonError(error.message, 500);
  }

  if (resource === "jobs") {
    if (action === "delete") return remove(auth.client, "job_postings", data.id);
    const status = ["draft", "open", "closed"].includes(String(data.status)) ? String(data.status) : "draft";
    const payload = {
      ...(data.id ? { id: data.id } : {}),
      slug: clean(data.slug, 100),
      department: clean(data.department, 100),
      title: clean(data.title, 120),
      summary: clean(data.summary, 600),
      description: clean(data.description, 5000),
      priority: Boolean(data.priority),
      status,
      close_date: data.closeDate || null,
      sort_order: numberValue(data.sortOrder),
    };
    if (!payload.slug || !payload.department || !payload.title || !payload.summary) return jsonError("공고 제목, 주소, 직군, 요약은 필수입니다.");
    const { error } = await auth.client.from("job_postings").upsert(payload);
    if (error) return jsonError(error.message, 500);
  }

  if (resource === "applications" || resource === "inquiries") {
    if (action === "delete") return remove(auth.client, resource, data.id);
    if (action !== "status") return jsonError("지원하지 않는 작업입니다.");
    const { error } = await auth.client.from(resource).update({ status: clean(data.status, 30) }).eq("id", data.id);
    if (error) return jsonError(error.message, 500);
  }

  return Response.json({ ok: true });
}

async function remove(client: SupabaseClient, table: string, id: unknown) {
  if (!id) return jsonError("삭제할 항목이 없습니다.");
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) return jsonError(error.message, 500);
  return Response.json({ ok: true });
}

function clean(value: unknown, length: number) {
  return String(value ?? "").trim().slice(0, length);
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => clean(item, 500)).filter(Boolean).slice(0, 20);
  return String(value ?? "").split(",").map((item) => clean(item, 500)).filter(Boolean).slice(0, 20);
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
