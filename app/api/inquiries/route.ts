import { getAdminSupabase, jsonError } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const client = getAdminSupabase();
  if (!client) return jsonError("문의 저장 기능이 아직 연결되지 않았습니다.", 503);

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const topic = String(body?.topic ?? "").trim();
  const studentName = String(body?.studentName ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const website = String(body?.website ?? "").trim();

  if (website) return Response.json({ ok: true });
  if (!topic || !studentName || !email || !message) return jsonError("필수 항목을 모두 작성해주세요.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("이메일 형식을 확인해주세요.");

  const { error } = await client.from("inquiries").insert({
    topic: topic.slice(0, 120),
    student_name: studentName.slice(0, 120),
    email: email.slice(0, 200),
    message: message.slice(0, 5000),
  });

  if (error) return jsonError("문의를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.", 500);
  return Response.json({ ok: true }, { status: 201 });
}
