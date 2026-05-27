import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  const userAgent = body?.user_agent ?? null;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  }

  // Upsert by unique endpoint — same device re-subscribing should
  // replace the old row, not duplicate it.
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: u.user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent,
      },
      { onConflict: "endpoint" }
    );

  if (error) {
    return NextResponse.json({ ok: false, error: "db", detail: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
