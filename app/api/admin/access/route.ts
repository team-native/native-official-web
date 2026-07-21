import { getAdminSupabase, getPublicSupabase, jsonError } from "@/lib/supabase-server";

async function authenticatedUser(request: Request) {
  const client = getPublicSupabase();
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!client || !token) return null;
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  const admin = getAdminSupabase();
  if (!user || !admin) return jsonError("로그인이 필요합니다.", 401);

  const [{ data: granted }, { data: accessRequest }] = await Promise.all([
    admin.from("admin_users").select("role").eq("user_id", user.id).maybeSingle(),
    admin.from("admin_access_requests").select("status").eq("user_id", user.id).maybeSingle(),
  ]);

  return Response.json({ ok: true, status: granted ? "approved" : accessRequest?.status ?? "none", role: granted?.role ?? null });
}

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  const admin = getAdminSupabase();
  if (!user || !admin || !user.email) return jsonError("로그인이 필요합니다.", 401);
  const body = await request.json().catch(() => ({})) as { displayName?: string };
  const displayName = String(body.displayName || user.user_metadata?.display_name || "Native Admin").trim().slice(0, 80);

  const { data: granted } = await admin.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (granted) return Response.json({ ok: true, status: "approved", role: granted.role });

  const { data, error } = await admin.from("admin_access_requests").upsert({
    user_id: user.id,
    email: user.email.toLowerCase(),
    display_name: displayName,
    status: "pending",
    requested_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null,
  }, { onConflict: "user_id" }).select("status").single();
  if (error) return jsonError("권한 요청을 저장하지 못했습니다.", 500);
  return Response.json({ ok: true, status: data.status });
}
