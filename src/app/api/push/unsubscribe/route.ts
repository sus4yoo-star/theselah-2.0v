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
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "missing-endpoint" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  }

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", u.user.id)
    .eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}
