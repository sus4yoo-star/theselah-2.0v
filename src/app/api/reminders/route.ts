import { NextResponse, type NextRequest } from "next/server";
import { getApiAuth } from "@/lib/supabase/api-auth";
import { CORS_HEADERS, preflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

const VALID_TZ = (tz: string) => {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export async function GET(req: NextRequest) {
  const auth = await getApiAuth(req);
  if (!auth) {
    return NextResponse.json(
      { ok: false, error: "auth" },
      { status: 401, headers: CORS_HEADERS }
    );
  }
  const { supabase, user } = auth;
  const { data } = await supabase
    .from("prayer_reminders")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return NextResponse.json(
    { ok: true, reminder: data ?? null },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "bad-json" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const auth = await getApiAuth(req);
  if (!auth) {
    return NextResponse.json(
      { ok: false, error: "auth" },
      { status: 401, headers: CORS_HEADERS }
    );
  }
  const { supabase, user } = auth;

  const enabled = typeof body.enabled === "boolean" ? body.enabled : true;
  const hh_mm =
    typeof body.hh_mm === "string" && /^\d{2}:\d{2}$/.test(body.hh_mm)
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

  const { error } = await supabase.from("prayer_reminders").upsert(
    { user_id: user.id, enabled, hh_mm, timezone, message, lang },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json(
      { ok: false, error: "db", detail: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
