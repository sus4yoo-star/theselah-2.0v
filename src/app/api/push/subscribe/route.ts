import { NextResponse, type NextRequest } from "next/server";
import { getApiAuth } from "@/lib/supabase/api-auth";
import { CORS_HEADERS, preflight } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
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
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  const userAgent = body?.user_agent ?? null;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { ok: false, error: "missing-fields" },
      { status: 400, headers: CORS_HEADERS }
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

  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: user.id, endpoint, p256dh, auth, user_agent: userAgent },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json(
      { ok: false, error: "db", detail: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
