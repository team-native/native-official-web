import { getAdminSupabase, jsonError } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const client = getAdminSupabase();
  if (!client) return jsonError("지원서 저장 기능이 아직 연결되지 않았습니다.", 503);

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const role = String(body?.role ?? "").trim();
  const studentName = String(body?.studentName ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const goal = String(body?.goal ?? "").trim();
  const website = String(body?.website ?? "").trim();

  if (website) return Response.json({ ok: true });
  if (!role || !studentName || !email || !goal) return jsonError("필수 항목을 모두 작성해주세요.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("이메일 형식을 확인해주세요.");

  const { data: job } = await client.from("job_postings").select("id").eq("title", role).maybeSingle();
  const { error } = await client.from("applications").insert({
    job_id: job?.id ?? null,
    role,
    student_name: studentName.slice(0, 120),
    email: email.slice(0, 200),
    goal: goal.slice(0, 5000),
  });

  if (error) return jsonError("지원서를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.", 500);
  return Response.json({ ok: true }, { status: 201 });
}
