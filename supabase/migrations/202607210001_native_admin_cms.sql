create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Native Admin',
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type text not null,
  description text not null,
  summary text not null default '',
  content text not null default '',
  logo_url text not null default '/native-logo.png',
  images text[] not null default '{}',
  tone text not null default 'bookon',
  visual text not null default 'web-screen',
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  department text not null,
  title text not null,
  summary text not null,
  description text not null default '',
  priority boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  close_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_postings(id) on delete set null,
  role text not null,
  student_name text not null,
  email text not null,
  goal text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  student_name text not null,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'answered', 'archived')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists job_postings_set_updated_at on public.job_postings;
create trigger job_postings_set_updated_at before update on public.job_postings
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.job_postings enable row level security;
alter table public.applications enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects for select
using (published = true);

drop policy if exists "Public can read open jobs" on public.job_postings;
create policy "Public can read open jobs"
on public.job_postings for select
using (status = 'open');

insert into public.projects (slug, name, type, description, summary, content, logo_url, images, tone, visual, tags, sort_order, published)
values
  ('book-on', 'BOOK-ON', 'Main product · Mobile', '독서 기록부터 마라톤까지, 읽는 경험을 오래 이어주는 Native의 메인 서비스', '책을 찾고, 빌리고, 기록하며 함께 읽는 경험을 하나의 앱으로 연결합니다.', 'BOOK-ON은 교내 도서관의 대출 경험과 개인 독서 기록을 자연스럽게 연결하는 Native의 메인 서비스입니다. iOS와 Android에서 같은 기능을 제공하되 각 플랫폼의 사용 방식에 맞는 인터랙션을 설계했습니다. 도서 검색, 대출 현황, 상세 정보, 독서 마라톤과 AI 추천까지 읽기 전후의 흐름을 한곳에서 이어갑니다.', '/brand/bookon-symbol.png', array['/book-on.png','/bookon-detail.png','/bookon-mypage.png'], 'bookon', 'phone-pair', array['iOS','Android','Back-End'], 1, true),
  ('hopes', 'HOPES', 'AI school platform', '학생의 질문과 경험을 연결해 더 솔직한 학교 생활을 돕는 AI 선배 챗봇', '학교생활에 관한 질문을 실제 선배의 경험과 AI로 연결하는 웹 플랫폼입니다.', 'HOPES는 재학생과 신입생이 학교생활에서 마주치는 질문에 더 솔직한 답을 얻을 수 있도록 만든 AI 선배 챗봇입니다. 기숙사 생활, 전공과 진로, 입학 준비처럼 학교 안에서만 알기 쉬운 정보를 실제 경험을 바탕으로 정리하고, 필요한 답을 빠르게 찾을 수 있도록 설계했습니다.', '/brand/hopes-symbol.png', array['/hopes-ui.png'], 'hopes', 'web-screen', array['Flutter','Android','Front-End','Back-End'], 2, true),
  ('it-da', 'IT-DA', 'Project community', '학교 안에서 프로젝트와 사람을 발견하고 함께 팀을 만드는 협업 커뮤니티', '아이디어와 사람을 연결해 학생 프로젝트의 시작과 합류를 돕습니다.', 'IT-DA는 학교 안의 프로젝트와 사람을 발견하고 팀을 만들 수 있는 협업 커뮤니티입니다. 관심 기술과 역할을 기반으로 프로젝트를 탐색하고, 지원과 제안을 주고받으며, 자신의 활동을 포트폴리오처럼 쌓을 수 있도록 구성했습니다.', '/brand/itda-symbol.png', array['/itda-login.png','/itda-home.png','/itda-profile.png'], 'itda', 'phone-trio', array['iOS','Front-End','Back-End','Android'], 3, true)
on conflict (slug) do nothing;

insert into public.job_postings (slug, department, title, summary, description, priority, status, sort_order)
values
  ('ios', 'NATIVE APP', 'iOS', 'iPhone과 iPad에서 자연스럽게 작동하는 제품 경험을 함께 만듭니다.', 'Swift와 Apple 플랫폼의 문법을 이해하고 Native 제품의 iOS 경험을 함께 설계하고 구현합니다.', false, 'open', 1),
  ('android', 'NATIVE APP', 'Android', '다양한 Android 기기에서 안정적이고 일관된 경험을 구현합니다.', 'Android 생태계와 기기 특성을 이해하고 안정적인 앱 경험을 함께 구현합니다.', false, 'open', 2),
  ('front-end', 'WEB', 'Front-End', '빠른 실험을 이해하기 쉽고 완성도 높은 웹 화면으로 연결합니다.', '제품의 아이디어를 반응형 웹 경험으로 빠르게 구현하고 품질을 함께 높입니다.', true, 'open', 3),
  ('design', 'DESIGN', 'Design', '문제를 발견하고 사용자가 바로 이해하는 경험으로 구체화합니다.', '제품의 문제를 정의하고 브랜드와 인터페이스 전반의 경험을 설계합니다.', true, 'open', 4),
  ('back-end', 'SERVER', 'Back-End', '여러 제품이 안정적으로 성장할 수 있는 구조와 데이터를 설계합니다.', '제품의 API와 데이터 구조를 설계하고 안정적인 운영 기반을 함께 만듭니다.', false, 'open', 5)
on conflict (slug) do nothing;

-- Supabase Authentication에서 관리자 계정을 만든 뒤 아래 쿼리로 권한을 부여하세요.
-- insert into public.admin_users (user_id, display_name)
-- select id, 'Native Admin' from auth.users where email = 'admin@example.com';
