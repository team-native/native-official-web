create table if not exists public.logo_contest_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade smallint not null check (grade between 1 and 3),
  class_number smallint not null check (class_number between 1 and 20),
  student_number smallint not null check (student_number between 1 and 50),
  school_email text not null,
  email_normalized text generated always as (lower(btrim(school_email))) stored,
  file_path text not null unique,
  file_name text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  creation_method text not null check (creation_method in ('direct', 'ai')),
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'winner', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists logo_contest_email_unique
on public.logo_contest_submissions (email_normalized);

drop trigger if exists logo_contest_submissions_set_updated_at on public.logo_contest_submissions;
create trigger logo_contest_submissions_set_updated_at before update on public.logo_contest_submissions
for each row execute function public.set_updated_at();

alter table public.logo_contest_submissions enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bookon-logo-contest', 'bookon-logo-contest', false, 10485760, array['image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
