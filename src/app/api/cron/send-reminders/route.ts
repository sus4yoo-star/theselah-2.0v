import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendPush, pushReady } from "@/lib/push-server";

export const runtime = "nodejs";

/**
 * Cron entry point.
 *
 * Run this every 1–5 minutes from cron-job.org, Vercel Cron, GitHub
 * Actions, or Supabase pg_cron. Use a shared secret to keep randoms
 * off the endpoint:
 *
 *    GET /api/cron/send-reminders
 *      header  x-cron-secret: <CRON_SECRET>
 *
 * For each reminder where:
 *   - enabled = true,
 *   - the user's local "HH:MM" right now equals their hh_mm,
 *   - they haven't already been sent today,
 * we send a Web Push to every one of their registered devices.
 *
 * Bad subscriptions (gone after 404/410) get pruned.
 */
function adminClient() {
  // Uses service role to bypass RLS — needed to read every user's row.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !service) return null;
  // We don't need real cookies; pass empty no-ops.
  return createServerClient(url, service, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        /* noop */
      },
    },
  });
}

function localHHMM(tz: string): string {
  try {
    const f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    // en-US 2-digit gives "08:30"
    return f.format(new Date()).replace(/\s/g, "");
  } catch {
    return "";
  }
}

function localYMD(tz: string): string {
  try {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return f.format(new Date()); // "2026-05-27"
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret) {
    return NextResponse.json({ ok: false, error: "no-cron-secret" }, { status: 503 });
  }
  const provided = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret") || "";
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (!pushReady()) {
    return NextResponse.json({ ok: false, error: "vapid-missing" }, { status: 503 });
  }
  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "no-service-role" }, { status: 503 });
  }

  // 1) Pull every enabled reminder row.
  const { data: reminders, error } = await supabase
    .from("prayer_reminders")
    .select("*")
    .eq("enabled", true);
  if (error) {
    return NextResponse.json({ ok: false, error: "db", detail: error.message }, { status: 500 });
  }
  const rows = (reminders as any[]) || [];

  // 2) Filter to "right now in user's TZ" matching their hh_mm and not already sent today.
  const due: any[] = [];
  for (const r of rows) {
    if (!r.timezone || !r.hh_mm) continue;
    const nowHHMM = localHHMM(r.timezone);
    if (!nowHHMM) continue;
    // ± 4 minutes tolerance — if cron only runs every 5 min we still
    // catch the user's slot reliably.
    const [hh, mm] = r.hh_mm.split(":").map(Number);
    const [nh, nm] = nowHHMM.split(":").map(Number);
    const targetMin = hh * 60 + mm;
    const nowMin = nh * 60 + nm;
    if (Math.abs(nowMin - targetMin) > 4) continue;

    // Dedupe per user per local day
    const lastSent = r.last_sent_at ? new Date(r.last_sent_at) : null;
    if (lastSent) {
      const lastYMDinTz = new Intl.DateTimeFormat("en-CA", { timeZone: r.timezone }).format(lastSent);
      if (lastYMDinTz === localYMD(r.timezone)) continue;
    }
    due.push(r);
  }

  if (due.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, due: 0 });
  }

  // 3) Pull subscriptions for those users in one query.
  const userIds = due.map((r) => r.user_id);
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);
  const subsByUser = new Map<string, any[]>();
  for (const s of (subs as any[]) || []) {
    if (!subsByUser.has(s.user_id)) subsByUser.set(s.user_id, []);
    subsByUser.get(s.user_id)!.push(s);
  }

  // 4) Fire pushes.
  const BRAND = process.env.APP_BRAND_LABEL || "SELAH";
  const DEFAULT_KO = "잠시 멈춰, 오늘 마음을 올려드려 보세요.";
  const DEFAULT_EN = "Pause for a moment and lift today's heart to God.";

  let sent = 0;
  for (const r of due) {
    const userSubs = subsByUser.get(r.user_id) || [];
    if (userSubs.length === 0) continue;
    const body = r.message || (r.lang === "en" ? DEFAULT_EN : DEFAULT_KO);
    let anyOk = false;
    for (const s of userSubs) {
      const res = await sendPush(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        { title: BRAND, body, url: "/chat" }
      );
      if (res.ok) {
        anyOk = true;
        sent++;
      } else if (res.gone) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
    if (anyOk) {
      await supabase
        .from("prayer_reminders")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("user_id", r.user_id);
    }
  }

  return NextResponse.json({ ok: true, sent, due: due.length });
}
