# SELAH 2.0 — Deployment Guide

A global Christian emotional-support + Bible-reflection companion, powered by AI.
Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · OpenAI** and deployable to **Netlify** as a PWA.

This guide takes you from zero to a live site. Expect ~15 minutes.

---

## 0. What you need

- A free **Supabase** account → https://supabase.com
- An **OpenAI** API key with billing enabled → https://platform.openai.com
- A **Netlify** account → https://netlify.com
- (Optional) a **Google Cloud** project for Google login

---

## 1. Supabase — database & auth

### 1a. Create the project
1. Supabase dashboard → **New project**. Pick a name, a strong DB password and a region close to your users.
2. Wait for it to finish provisioning.

### 1b. Run the schema migration
1. Left sidebar → **SQL Editor** → **New query**.
2. Open `supabase/migrations/0001_init.sql` from this repo, copy the **entire** file, paste it in, and click **Run**.
3. This creates the `profiles`, `chat_sessions`, `messages` tables, all Row-Level-Security policies, and the trigger that auto-creates a profile on signup. It is safe to re-run.

### 1c. Turn OFF email confirmation (so signup logs in immediately)
1. **Authentication → Sign In / Providers → Email**.
2. Disable **"Confirm email"** and save.
   (With confirmation on, new users would have to click an email link before they can use the app. The product spec asks for instant login, so keep it off.)

### 1d. Get your keys
1. **Project Settings → API**.
2. Copy the **Project URL** (e.g. `https://abcd1234.supabase.co`) — do **not** add `/rest/v1`.
3. Copy the **anon public** key (the long `eyJ...` string). This is a public client key; it is safe in the browser.

### 1e. (Optional) Google login
1. In Google Cloud Console create an **OAuth 2.0 Client ID** (Web application).
2. Authorized redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase → **Authentication → Sign In / Providers → Google**: paste the Client ID & Secret, enable it.
4. In Supabase → **Authentication → URL Configuration**:
   - **Site URL**: your final site URL (e.g. `https://selah.netlify.app`)
   - **Redirect URLs**: add `https://selah.netlify.app/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).

Email/password login works without any of step 1e.

---

## 2. Netlify — deploy

### 2a. Push the code
Put this project in a Git repo (GitHub / GitLab / Bitbucket).

### 2b. Create the site
1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - The official **@netlify/plugin-nextjs** runtime is applied automatically.

### 2c. Add environment variables
**Site settings → Environment variables** → add these (Production + Deploy previews):

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your Anthropic API key (`sk-ant-...`) |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` (optional; this is the default) |
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key |
| `SUPABASE_URL` | same as the URL above |
| `SUPABASE_ANON_KEY` | same as the anon key above |

> The `NEXT_PUBLIC_*` pair is used by the browser; the non-prefixed pair is read by the server (middleware / OAuth callback). The build also auto-maps `SUPABASE_URL` / `SUPABASE_ANON_KEY` into the public pair, so setting **either** naming works — but adding all four is the safest.
>
> `netlify.toml` already sets `SECRETS_SCAN_ENABLED=false` because Netlify's scanner otherwise mistakes the **public** Supabase anon key for a leaked secret and fails the build.

### 2d. Deploy
Trigger a deploy (Netlify does this automatically on the first import and on every push).

### 2e. Point Supabase at the live URL
Once you know the final URL, set it in Supabase **Authentication → URL Configuration** (Site URL + the `/auth/callback` redirect URL) so Google login redirects correctly.

The app works immediately after deploy.

---

## 3. Local development

```bash
cp .env.example .env.local      # then fill in real values
npm install
npm run dev                     # http://localhost:3000
```

For Google login locally, add `http://localhost:3000/auth/callback` to the Supabase redirect URLs.

---

## 4. How it works (architecture)

```
src/
  app/
    page.tsx              calm intro / landing
    login/page.tsx        Google + email auth (signup logs in instantly)
    chat/page.tsx         protected; loads the user's sessions server-side
    auth/callback/route   OAuth code → session exchange
    api/chat/route.ts     server-only OpenAI proxy (streaming)
  components/
    chat/                 sidebar, window, message card, input, toggles
    ui/                   shadcn primitives (button, input, switch, …)
    language-provider     i18n context (detect → persist → profile sync)
  lib/
    prompt.ts             intent classifier + structured system prompt
    i18n.ts               7-language UI dictionary
    bible.ts              per-language Bible versions + verse cleaning
    chat-data.ts          session/message CRUD (Supabase, RLS-protected)
    supabase/             SSR client, server client, middleware
  middleware.ts           session refresh + /chat route protection
```

- **Auth**: Supabase Auth with cookie sessions via `@supabase/ssr`. Sessions auto-restore; routes under `/chat` are protected by middleware.
- **AI engine**: `ANTHROPIC_API_KEY` is used **only** on the server. Each message is classified into **Type A (emotional)**, **Type B (Bible)** or **Type C (general)**; the system prompt enforces the right response shape — empathy only for Type A, direct explanation for Type B, direct answers for Type C. The model streams back and is parsed into structured sections client-side.
- **Bible Mode**: a top-right toggle. When on, the reply appends a verse in the **selected language's** standard version — Korean 개역개정 (no trailing punctuation), English NIV, Thai Thai Standard Version, Spanish Reina-Valera, Portuguese Almeida, Hindi OV Hindi, Chinese Chinese Union Version.
- **Languages**: Korean, English, Thai, Spanish, Portuguese, Hindi, Chinese. Browser language is detected, the choice is persisted to `localStorage` and synced to the user's profile. UI, buttons, placeholders, emotion chips and loading states are all localized; emotion chips show only for the selected language.
- **Data**: every user only ever sees their own rows — enforced by Postgres RLS, not just the UI.
- **PWA**: installable, with a network-first service worker and offline app shell.

---

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| Login page says "Supabase is not configured" | The `NEXT_PUBLIC_SUPABASE_*` vars are missing/blank on Netlify. Add them and redeploy. |
| Signup asks to confirm email | You skipped **step 1c**. Disable "Confirm email" in Supabase. |
| Chat replies with "Anthropic authentication failed" | `ANTHROPIC_API_KEY` is wrong, lacks credit, or the model name in `ANTHROPIC_MODEL` is invalid. |
| Google button does nothing / redirect error | Redirect URLs in Supabase don't match your live domain (step 2e). |
| Netlify build fails on "secret detected" | Confirm `netlify.toml` still has `SECRETS_SCAN_ENABLED = "false"`. |
| Sessions/messages don't save | Re-run `0001_init.sql`; confirm RLS policies were created. |

---

SELAH does not replace professional counseling. If someone is in crisis, the app encourages contacting a professional or a local emergency line first.
