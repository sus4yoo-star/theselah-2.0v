import { NextResponse, type NextRequest } from "next/server";
import { getApiAuth } from "@/lib/supabase/api-auth";
import { CORS_HEADERS, preflight } from "@/lib/cors";
import { sendPush, pushReady } from "@/lib/push-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

/**
 * Used by the Reminders settings page so the user can verify the loop
 * end-to-end ("send a test now"). Sends to *every* subscription the
 * user has — phone + laptop alike — using their stored preferences for
 * the message body.
 */
export async function POST(req: NextRequest) {
  if (!pushReady()) {
    return NextResponse.json(
      { ok: false, error: "vapid-missing" },
      { status: 503, headers: CORS_HEADERS }
    );
  }
  const authed = await getApiAuth(req);
  if (!authed) {
    return NextResponse.json(
      { ok: false, error: "auth" },
      { status: 401, headers: CORS_HEADERS }
    );
  }
  const { supabase, user } = authed;

  const [{ data: subs }, { data: pref }] = await Promise.all([
    supabase.from("push_subscriptions").select("*").eq("user_id", user.id),
    supabase
      .from("prayer_reminders")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  const body =
    pref?.message ||
    (pref?.lang === "en"
      ? "Pause for a moment and lift today's heart to God."
      : "잠시 멈춰, 오늘 마음을 올려드려 보세요.");

  const subsArr = (subs as any[]) || [];
  if (subsArr.length === 0) {
    return NextResponse.json(
      { ok: false, error: "no-subscriptions" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  let sent = 0;
  for (const s of subsArr) {
    const res = await sendPush(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      { title: "SELAH", body, url: "/chat" }
    );
    if (res.ok) {
      sent++;
    } else if (res.gone) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", s.endpoint);
    }
  }

  return NextResponse.json(
    { ok: true, sent, total: subsArr.length },
    { headers: CORS_HEADERS }
  );
}
