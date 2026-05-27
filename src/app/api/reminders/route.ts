import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const VALID_TZ = (tz: string) => {
  // Lightweight validation — Supabase will reject bad TZs at JSON anyway.
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export async function GET() {
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  }
  const { data } = await supabase
    .from("prayer_reminders")
    .select("*")
    .eq("user_id", u.user.id)
    .maybeSingle();
  return NextResponse.json({ ok: true, reminder: data ?? null });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  }

  const enabled = typeof body.enabled === "boolean" ? body.enabled : true;
  const hh_mm = typeof body.hh_mm === "string" && /^\d{2}:\d{2}$/.test(body.hh_mm)
    ? body.hh_mm
    : "08:00";
  const timezone =
    typeof body.timezone === "string" && VALID_TZ(body.timezone)
      ? body.timezone
      : "Asia/Seoul";
  const message =
    typeof body.message === "string" && body.message.trim().length > 0
      ? body.message.trim().slice(0, 300)
      : null;
  const lang = typeof body.lang === "string" ? body.lang.slice(0, 8) : "ko";

  const { error } = await supabase
    .from("prayer_reminders")
    .upsert(
      {
        user_id: u.user.id,
        enabled,
        hh_mm,
        timezone,
        message,
        lang,
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return NextResponse.json({ ok: false, error: "db", detail: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
