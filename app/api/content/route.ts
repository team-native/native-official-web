import { fallbackJobs, fallbackProjects, jobFromRow, projectFromRow } from "@/lib/content";
import { getPublicSupabase } from "@/lib/supabase-server";

export async function GET() {
  const client = getPublicSupabase();
  if (!client) return Response.json({ projects: fallbackProjects, jobs: fallbackJobs, source: "fallback" });

  const [projectsResult, jobsResult] = await Promise.all([
    client.from("projects").select("*").eq("published", true).order("sort_order"),
    client.from("job_postings").select("*").eq("status", "open").order("sort_order"),
  ]);

  if (projectsResult.error || jobsResult.error) {
    return Response.json({ projects: fallbackProjects, jobs: fallbackJobs, source: "fallback" });
  }

  return Response.json({
    projects: (projectsResult.data ?? []).map(projectFromRow),
    jobs: (jobsResult.data ?? []).map(jobFromRow),
    source: "database",
  });
}
