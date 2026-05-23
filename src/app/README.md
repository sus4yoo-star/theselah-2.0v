# SELAH 2.0

> *Selah* — pause before you respond.

A global Christian emotional-support and Bible-reflection companion, powered by AI.
Calm, premium, trustworthy — not cheesy church design.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Auth + Postgres + RLS) · OpenAI (`gpt-4o-mini`) · PWA · Netlify.

## Features

- **Google + email auth** — instant login on signup, persistent sessions, protected routes, logout.
- **ChatGPT-style sessions** — create, rename, delete, auto-save, restore on login. Each user sees only their own data (Postgres RLS).
- **Intelligent intent classification** — emotional counseling vs. Bible questions vs. general questions, each answered in the right shape (no forced empathy on study questions).
- **Bible Mode** — appends a verse in the selected language's standard version (Korean 개역개정 without trailing punctuation, English NIV, Thai Standard, Reina-Valera, Almeida, OV Hindi, Chinese Union).
- **7 languages** — Korean, English, Thai, Spanish, Portuguese, Hindi, Chinese. Browser-detected, persisted, fully localized including emotion chips.
- **Streaming responses** with a smooth typing animation, mobile-first responsive layout, installable PWA.

## Quick start

```bash
cp .env.example .env.local   # fill in OpenAI + Supabase values
npm install
npm run dev
```

## Deploy

See **[README_DEPLOY.md](./README_DEPLOY.md)** for the full step-by-step Supabase + Netlify guide and the database migration (`supabase/migrations/0001_init.sql`).

Required environment variables: `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

---

SELAH does not replace professional counseling.
