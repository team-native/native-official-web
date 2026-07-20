"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Project } from "@/lib/content";

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${encodeURIComponent(params.slug)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { project?: Project; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "프로젝트를 찾을 수 없습니다.");
        if (!payload.project) throw new Error("프로젝트를 찾을 수 없습니다.");
        setProject(payload.project);
      })
      .catch((reason) => setError(reason.message));
  }, [params.slug]);

  if (error) return <main className="project-detail-state"><span>404</span><h1>{error}</h1><a href="/#projects">프로젝트 목록으로</a></main>;
  if (!project) return <main className="project-detail-state"><span>N</span><p>프로젝트를 불러오고 있습니다.</p></main>;

  return (
    <main className={`project-detail ${project.tone}`}>
      <header className="project-detail-header"><a className="project-detail-brand" href="/"><span><Image src="/native-logo.png" alt="" fill sizes="38px" unoptimized /></span>Native</a><nav><a href="/#projects">프로젝트</a><a href="/#recruit">지원 공고</a></nav></header>
      <section className="project-detail-hero">
        <div className="project-detail-copy"><a href="/#projects">← 모든 프로젝트</a><small>{project.type}</small><div className="project-detail-title"><span><Image src={project.logo} alt="" fill sizes="70px" unoptimized /></span><h1>{project.name}</h1></div><p>{project.description}</p><div className="project-detail-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
        <div className="project-detail-art"><div className="project-detail-letter">{project.name.slice(0, 1)}</div>{project.images.slice(0, 2).map((image, index) => <div className={`project-detail-screen screen-${index + 1}`} key={image}><Image src={image} alt={`${project.name} 화면 ${index + 1}`} fill sizes="(max-width:760px) 70vw, 34vw" unoptimized /></div>)}</div>
      </section>
      <section className="project-detail-story"><div><small>THE PROJECT</small><h2>{project.summary}</h2></div><p>{project.content}</p></section>
      <section className="project-detail-gallery"><div className="project-detail-section-title"><small>PRODUCT SCREENS</small><h2>제품 화면</h2></div><div className={`project-detail-gallery-grid images-${project.images.length}`}>{project.images.map((image, index) => <figure key={image}><div><Image src={image} alt={`${project.name} 제품 화면 ${index + 1}`} fill sizes="(max-width:760px) 88vw, 32vw" unoptimized /></div><figcaption>0{index + 1} · {project.name}</figcaption></figure>)}</div></section>
      <section className="project-detail-cta"><div><small>BUILD THE NEXT EXPERIENCE</small><h2>다음 제품을<br />함께 만들어봐요.</h2></div><a href="/#recruit">지원 공고 보기 <span>→</span></a></section>
      <footer className="project-detail-footer"><span>© 2026 NATIVE TEAM</span><a href="/">Native 홈페이지</a></footer>
    </main>
  );
}
