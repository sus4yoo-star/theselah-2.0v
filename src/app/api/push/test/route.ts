import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPush, pushReady } from "@/lib/push-server";

export const runtime = "nodejs";

/**
 * Used by the Reminders settings page so the user can verify the loop
 * end-to-end ("send a test now"). Sends to *every* subscription the
 * user has — phone + laptop alike — using their stored preferences for
 * the message body.
 */
export async function POST() {
  if (!pushReady()) {
    return NextResponse.json({ ok: false, error: "vapid-missing" }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  }

  const [{ data: subs }, { data: pref }] = await Promise.all([
    supabase.from("push_subscriptions").select("*").eq("user_id", u.user.id),
    supabase.from("prayer_reminders").select("*").eq("user_id", u.user.id).single(),
  ]);

  const body =
    pref?.message ||
    (pref?.lang === "en"
      ? "Pause for a moment and lift today's heart to God."
      : "잠시 멈춰, 오늘 마음을 올려드려 보세요.");

  const subsArr = (subs as any[]) || [];
  if (subsArr.length === 0) {
    return NextResponse.json({ ok: false, error: "no-subscriptions" }, { status: 404 });
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
      await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
    }
  }

  return NextResponse.json({ ok: true, sent, total: subsArr.length });
}
