import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export function getPublicSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function getAdminSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function requireAdmin(request: Request) {
  const publicClient = getPublicSupabase();
  const adminClient = getAdminSupabase();
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!publicClient || !adminClient || !token) return null;

  const { data: userData, error: userError } = await publicClient.auth.getUser(token);
  if (userError || !userData.user) return null;

  const { data: admin, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id, display_name")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !admin) return null;
  return { user: userData.user, admin, client: adminClient };
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
