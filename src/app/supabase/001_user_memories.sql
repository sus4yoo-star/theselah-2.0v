-- SELAH 2.1 long-term pastoral memory
-- Run this once in Supabase SQL Editor.
-- The app is safe even before this table exists, but memory will activate after this is created.

create table if not exists public.user_memories (
  user_id uuid primary key references auth.users(id) on delete cascade,
  memory jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_memories enable row level security;

drop policy if exists "Users can read own memory" on public.user_memories;
create policy "Users can read own memory"
on public.user_memories
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own memory" on public.user_memories;
create policy "Users can insert own memory"
on public.user_memories
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own memory" on public.user_memories;
create policy "Users can update own memory"
on public.user_memories
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
