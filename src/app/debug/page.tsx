/**
 * /debug — auth + config diagnostic page.
 * DELETE THIS FILE before going to production.
 */
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const results: Record<string, string> = {};

  // ── 1. Env vars ────────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  results["SUPABASE_URL configured"] = supabaseUrl
    ? "✅ " + supabaseUrl.replace(/https:\/\//, "").split(".")[0] + ".supabase.co"
    : "❌ MISSING — set NEXT_PUBLIC_SUPABASE_URL in Netlify";

  results["SUPABASE_ANON_KEY configured"] = supabaseAnon
    ? "✅ " + supabaseAnon.slice(0, 20) + "…"
    : "❌ MISSING — set NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify";

  // ── 2. Server-side session read ─────────────────────────────────
  let serverUser = "unknown";
  let getSessionResult = "unknown";

  try {
    const supabase = await createClient();

    // getSession — reads cookie, no network call
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      getSessionResult = "❌ getSession error: " + sessionErr.message;
    } else if (sessionData.session) {
      getSessionResult = "✅ session found — user: " + (sessionData.session.user?.email ?? "no email");
    } else {
      getSessionResult = "⚠️ getSession: no session in cookies";
    }

    // getUser — verifies JWT with Supabase (network call)
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      serverUser = "❌ getUser error: " + userErr.message;
    } else if (userData.user) {
      serverUser = "✅ " + userData.user.email;
    } else {
      serverUser = "⚠️ getUser returned null (JWT not verified)";
    }
  } catch (e) {
    serverUser = "❌ Exception: " + String(e);
  }

  results["Server getSession()"] = getSessionResult;
  results["Server getUser()"] = serverUser;

  const rows = Object.entries(results);

  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { font-family: monospace; background: #03212a; color: #f3efe6; padding: 24px; margin: 0; }
          h1 { color: #e3b975; margin-bottom: 24px; }
          table { border-collapse: collapse; width: 100%; max-width: 700px; }
          td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); vertical-align: top; }
          td:first-child { color: #cdd8d2; width: 50%; }
          .warn { color: #fcd34d; }
          .note { margin-top: 32px; padding: 16px; border: 1px solid rgba(227,185,117,0.3); border-radius: 12px; color: #cdd8d2; font-size: 13px; line-height: 1.6; }
          a { color: #e3b975; }
        `}</style>
      </head>
      <body>
        <h1>🔍 SELAH Debug</h1>
        <table>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="note" style={{
          marginTop: 32, padding: 16,
          border: "1px solid rgba(227,185,117,0.3)", borderRadius: 12,
          color: "#cdd8d2", fontSize: 13, lineHeight: 1.6
        }}>
          <strong style={{ color: "#e3b975" }}>무한 로그인 진단 방법:</strong>
          <br /><br />
          1. 로그인 페이지에서 로그인 시도<br />
          2. /login으로 돌아오면 바로 이 페이지(/debug) 접속<br />
          3. "Server getSession()" 결과 확인<br />
          ・ ✅ session found → /chat 페이지 코드 문제<br />
          ・ ⚠️ no session → 쿠키가 서버에 전달 안 되는 문제<br />
          ・ ❌ error → Supabase URL/키 문제<br />
          <br />
          <strong style={{ color: "#e3b975" }}>이 페이지 URL:</strong>{" "}
          <a href="/debug">selah.theamov.com/debug</a>
        </div>
      </body>
    </html>
  );
}
