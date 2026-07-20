import { fallbackProjects, projectFromRow } from "@/lib/content";
import { getPublicSupabase } from "@/lib/supabase-server";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const client = getPublicSupabase();

  if (client) {
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (!error && data) return Response.json({ project: projectFromRow(data) });
  }

  const fallback = fallbackProjects.find((project) => project.slug === slug);
  if (!fallback) return Response.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
  return Response.json({ project: fallback });
}
