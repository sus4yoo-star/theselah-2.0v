/**
 * /debug — interactive auth diagnostic.
 * DELETE before production.
 */
import DebugClient from "./client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function serverCheck() {
  const rows: { k: string; v: string }[] = [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  rows.push({
    k: "SUPABASE_URL",
    v: url ? "✅ " + url.replace("https://","").split(".")[0] + ".supabase.co" : "❌ MISSING",
  });
  rows.push({
    k: "SUPABASE_ANON_KEY",
    v: anon ? "✅ " + anon.slice(0, 20) + "…" : "❌ MISSING",
  });

  try {
    const supabase = await createClient();
    const { data: sd } = await supabase.auth.getSession();
    rows.push({
      k: "Server getSession()",
      v: sd.session
        ? "✅ session — " + sd.session.user.email
        : "⚠️ no session in cookies",
    });
    const { data: ud, error: ue } = await supabase.auth.getUser();
    rows.push({
      k: "Server getUser()",
      v: ue ? "❌ " + ue.message : ud.user ? "✅ " + ud.user.email : "⚠️ null user",
    });
  } catch (e) {
    rows.push({ k: "Server error", v: "❌ " + String(e) });
  }

  return rows;
}

export default async function DebugPage() {
  const serverRows = await serverCheck();
  return <DebugClient serverRows={serverRows} />;
}
