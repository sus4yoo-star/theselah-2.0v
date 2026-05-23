-- ============================================================
--  SELAH 2.0 — Database schema & Row Level Security
--  Run this in the Supabase SQL Editor (one time).
--  Project → SQL Editor → New query → paste → Run.
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ============================================================
--  TABLE: profiles
--  One row per auth user. Auto-created on signup via trigger.
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  name        text,
  language    text not null default 'en',
  created_at  timestamptz not null default now()
);

-- ============================================================
--  TABLE: chat_sessions
--  ChatGPT-style conversation containers.
-- ============================================================
create table if not exists public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'New Chat',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists chat_sessions_user_idx
  on public.chat_sessions (user_id, updated_at desc);

-- ============================================================
--  TABLE: messages
--  Individual chat messages, auto-saved per session.
-- ============================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions (id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  language    text not null default 'en',
  created_at  timestamptz not null default now()
);

create index if not exists messages_session_idx
  on public.messages (session_id, created_at asc);

-- ============================================================
--  Keep chat_sessions.updated_at fresh when messages arrive
-- ============================================================
create or replace function public.touch_session_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_sessions
     set updated_at = now()
   where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_session on public.messages;
create trigger trg_touch_session
  after insert on public.messages
  for each row execute function public.touch_session_updated_at();

-- ============================================================
--  Auto-create a profile row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name',
             new.raw_user_meta_data ->> 'full_name'),
    coalesce(new.raw_user_meta_data ->> 'language', 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  ROW LEVEL SECURITY
--  Every user can only ever read/write their own data.
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages      enable row level security;

-- ----- profiles -----
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----- chat_sessions -----
drop policy if exists "sessions_select_own" on public.chat_sessions;
create policy "sessions_select_own"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.chat_sessions;
create policy "sessions_insert_own"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.chat_sessions;
create policy "sessions_update_own"
  on public.chat_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "sessions_delete_own" on public.chat_sessions;
create policy "sessions_delete_own"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- ----- messages (ownership inherited through the parent session) -----
drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own"
  on public.messages for delete
  using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

-- ============================================================
--  Backfill profiles for any users that already exist
-- ============================================================
insert into public.profiles (id, email, name, language)
select u.id, u.email,
       coalesce(u.raw_user_meta_data ->> 'name',
                u.raw_user_meta_data ->> 'full_name'),
       'en'
from auth.users u
on conflict (id) do nothing;
