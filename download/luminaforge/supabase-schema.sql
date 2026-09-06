-- =====================================================================
-- LuminaForge.ai — Canonical Supabase Postgres Schema
-- =====================================================================
-- This is the production-grade schema for Vercel + free-tier Supabase.
-- Run it inside the Supabase SQL editor (or `supabase db push`) to
-- provision every table, policy, and storage bucket the app needs.
--
-- All tables use `auth.uid()` for row-level security so a user can
-- only see and mutate their own projects, generations, and assets.
-- =====================================================================

-- ---------- 1. PROFILES (1:1 with auth.users) -------------------------
-- We never write PII directly into auth.users, so we keep a public
-- `profiles` table for app-level display fields (name, avatar, etc.).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text unique not null,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2. SETTINGS (encrypted credentials per user) ------------
-- Stores per-user OpenRouter + Hugging Face tokens.
-- In production, encrypt with `pgcrypto` (or store as opaque ciphertext
-- from the client using a server action) — see encrypt/decrypt helpers.
create extension if not exists pgcrypto;

create table if not exists public.settings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null unique references public.profiles (id) on delete cascade,
  openrouter_key     bytea,        -- AES-encrypted OpenRouter API key
  huggingface_token  bytea,        -- AES-encrypted HF token
  supabase_url       text,
  supabase_anon_key  text,
  default_model      text default 'qwen/qwen3-coder:free',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- 3. PROJECTS (one per Forge site) -------------------------
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  name           text not null,
  description    text,
  current_html   text,             -- latest self-contained HTML
  current_spec   jsonb,             -- latest structured design spec
  last_prompt    text,
  last_ref_url   text,
  vibe_tags      text[],            -- array of selected vibe chips
  thumbnail_url  text,
  seo_score      int default 0,
  perf_score     int default 0,
  a11y_score     int default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists projects_user_idx on public.projects (user_id);
create index if not exists projects_updated_idx on public.projects (updated_at desc);

-- ---------- 4. GENERATIONS (full history of agent runs) -------------
create table if not exists public.generations (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  prompt        text not null,
  reference_url text,
  html          text not null,
  spec          jsonb,
  transcript    jsonb,                -- array of {agent, role, content, ts}
  version       int not null,
  seo_score     int,
  perf_score    int,
  a11y_score    int,
  created_at    timestamptz not null default now()
);

create index if not exists generations_project_idx on public.generations (project_id);

-- ---------- 5. ASSETS (moodboards / sketches / generated images) -----
create table if not exists public.assets (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  kind        text not null,         -- 'moodboard' | 'sketch' | 'logo' | 'hero'
  url         text not null,         -- Supabase Storage public URL
  file_name   text,
  mime_type   text,
  size_bytes  bigint,
  analysis    text,                  -- vision-agent caption
  created_at  timestamptz not null default now()
);

create index if not exists assets_project_idx on public.assets (project_id);

-- ---------- 6. STORAGE BUCKET (moodboards) --------------------------
-- A single private bucket; we serve images via signed URLs from
-- Server Actions so only the owner can read them.
insert into storage.buckets (id, name, public)
values ('moodboards', 'moodboards', false)
on conflict (id) do nothing;

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================
-- Enable RLS on every table. Every policy uses auth.uid() so users
-- can only touch their own rows.
-- =====================================================================

alter table public.profiles    enable row level security;
alter table public.settings    enable row level security;
alter table public.projects    enable row level security;
alter table public.generations enable row level security;
alter table public.assets      enable row level security;

-- profiles: a user can read/update only their own profile.
create policy "profiles_select_self" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

-- settings: only the owner.
create policy "settings_owner_all" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- projects: only the owner.
create policy "projects_owner_all" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- generations: owner of the parent project.
create policy "generations_owner_all" on public.generations
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- assets: owner of the parent project.
create policy "assets_owner_all" on public.assets
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- Storage policies: owners can CRUD only inside their own folder
-- (storage path convention: `{user_id}/{project_id}/{file}`).
create policy "moodboards_owner_read" on storage.objects
  for select using (
    bucket_id = 'moodboards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "moodboards_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'moodboards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "moodboards_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'moodboards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- HELPER: encrypt / decrypt columns with pgcrypto (server-side usage)
-- =====================================================================
-- Use these from a Server Action when persisting API keys:
--
--   insert into settings (user_id, openrouter_key)
--   values ($1, pgp_sym_encrypt($2::text, current_setting('app.secret')))
--   on conflict (user_id) do update set openrouter_key = excluded.openrouter_key;
--
-- And to read:
--   select pgp_sym_decrypt(openrouter_key, current_setting('app.secret')) as key
--   from settings where user_id = $1;
-- =====================================================================

-- updated_at triggers — keep timestamps fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
