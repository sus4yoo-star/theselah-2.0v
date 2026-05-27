-- ────────────────────────────────────────────────────────────────────
-- SELAH — Prayer Reminders schema (push notifications)
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- to add the two tables we need for the reminder feature.
--
-- Why two tables?
--   push_subscriptions  → one row per device the user has authorized
--                         (a single user can subscribe from phone + laptop)
--   prayer_reminders    → the user's preference (time, message, on/off);
--                         one row per user (PRIMARY KEY user_id)
--
-- The cron job (see /api/cron/send-reminders) joins these every minute,
-- finds users whose local prayer_time matches "now in their timezone",
-- and POSTs a Web Push to every subscription they own.
-- ────────────────────────────────────────────────────────────────────

create table if not exists public.push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  endpoint    text        not null unique,
  p256dh      text        not null,
  auth        text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

create table if not exists public.prayer_reminders (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  enabled     boolean     not null default true,
  -- Stored as a "HH:MM" string so we don't have to wrangle TIME types
  -- in the cron query. Default 08:00 local.
  hh_mm       text        not null default '08:00',
  -- IANA TZ identifier (e.g. 'Asia/Seoul'); we use this to compute
  -- the user's local "now" in the cron job.
  timezone    text        not null default 'Asia/Seoul',
  -- Optional custom message. NULL = use the default from the app.
  message     text,
  lang        text        not null default 'ko',
  -- Last time we successfully sent the daily nudge (UTC). Used to
  -- prevent duplicate sends inside the same calendar day.
  last_sent_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Row-level security ──────────────────────────────────────────────
alter table public.push_subscriptions  enable row level security;
alter table public.prayer_reminders    enable row level security;

-- push_subscriptions: users only see/manage their own devices
drop policy if exists "subs select own"  on public.push_subscriptions;
drop policy if exists "subs insert own"  on public.push_subscriptions;
drop policy if exists "subs delete own"  on public.push_subscriptions;

create policy "subs select own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "subs insert own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subs delete own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- prayer_reminders: users read/write only their own row
drop policy if exists "rem select own"  on public.prayer_reminders;
drop policy if exists "rem upsert own"  on public.prayer_reminders;
drop policy if exists "rem update own"  on public.prayer_reminders;

create policy "rem select own"
  on public.prayer_reminders for select
  using (auth.uid() = user_id);

create policy "rem upsert own"
  on public.prayer_reminders for insert
  with check (auth.uid() = user_id);

create policy "rem update own"
  on public.prayer_reminders for update
  using (auth.uid() = user_id);

-- Touch updated_at on any row update
create or replace function public.touch_prayer_reminders_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists prayer_reminders_touch on public.prayer_reminders;
create trigger prayer_reminders_touch
  before update on public.prayer_reminders
  for each row execute function public.touch_prayer_reminders_updated_at();
