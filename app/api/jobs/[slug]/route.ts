import { fallbackJobs, jobFromRow } from "@/lib/content";
import { getPublicSupabase } from "@/lib/supabase-server";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const decodedSlug = safeDecode(slug);
  const client = getPublicSupabase();

  if (client) {
    const { data, error } = await client
      .from("job_postings")
      .select("*")
      .eq("slug", decodedSlug)
      .eq("status", "open")
      .maybeSingle();
    if (!error && data) return Response.json({ job: jobFromRow(data) });
  }

  const fallback = fallbackJobs.find((job) => job.slug === decodedSlug && job.status === "open");
  if (!fallback) return Response.json({ error: "모집 중인 전공을 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ job: fallback });
}

function safeDecode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}
