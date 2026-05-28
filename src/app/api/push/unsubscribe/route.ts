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
  if (!endpoint) {
    return NextResponse.json(
      { ok: false, error: "missing-endpoint" },
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

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
