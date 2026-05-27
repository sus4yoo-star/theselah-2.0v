"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Row { k: string; v: string }

export default function DebugClient({ serverRows }: { serverRows: Row[] }) {
  const [clientRows, setClientRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginResult, setLoginResult] = useState<string | null>(null);

  useEffect(() => {
    checkClient();
  }, []);

  async function checkClient() {
    const rows: Row[] = [];
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      rows.push({
        k: "Client getSession()",
        v: data.session
          ? "✅ session — " + data.session.user.email
          : "⚠️ no session on client",
      });

      // Show cookie names (not values) that are set in browser
      if (typeof document !== "undefined") {
        const cookieNames = document.cookie
          .split(";")
          .map((c) => c.trim().split("=")[0])
          .filter(Boolean);
        rows.push({
          k: "Browser cookies",
          v: cookieNames.length > 0
            ? "✅ " + cookieNames.length + " cookies: " + cookieNames.slice(0, 5).join(", ")
            : "❌ NO COOKIES in browser",
        });
        const sbCookies = cookieNames.filter((n) => n.startsWith("sb-"));
        rows.push({
          k: "Supabase cookies (sb-*)",
          v: sbCookies.length > 0
            ? "✅ " + sbCookies.join(", ")
            : "❌ NO supabase cookies — this is why server can't read session",
        });
      }
    } catch (e) {
      rows.push({ k: "Client error", v: "❌ " + String(e) });
    }
    setClientRows(rows);
  }

  async function handleTestLogin(e: React.MouseEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setLoginResult(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginResult("❌ Login error: " + error.message);
      } else if (data.session) {
        setLoginResult("✅ signInWithPassword succeeded! user: " + data.session.user.email);
        // Re-check cookies immediately after login
        await checkClient();
        // Also reload server side info by refreshing page
        setTimeout(() => window.location.reload(), 800);
      } else {
        setLoginResult("⚠️ No session returned from signInWithPassword");
      }
    } catch (e) {
      setLoginResult("❌ Exception: " + String(e));
    }
    setBusy(false);
  }

  const s = {
    page: { fontFamily: "monospace", background: "#03212a", color: "#f3efe6", padding: 24, minHeight: "100vh", margin: 0 } as React.CSSProperties,
    h1: { color: "#e3b975", marginBottom: 6, fontSize: 20 } as React.CSSProperties,
    h2: { color: "#e3b975", margin: "24px 0 8px", fontSize: 15 } as React.CSSProperties,
    table: { borderCollapse: "collapse" as const, width: "100%", maxWidth: 760, marginBottom: 8 },
    td: { padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", verticalAlign: "top" as const, fontSize: 13 },
    tdL: { color: "#cdd8d2", width: "42%" },
    card: { marginTop: 24, padding: "16px 20px", border: "1px solid rgba(227,185,117,0.25)", borderRadius: 14, maxWidth: 460 },
    input: { display: "block", width: "100%", marginBottom: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#f3efe6", fontSize: 14 } as React.CSSProperties,
    btn: { padding: "10px 24px", borderRadius: 10, background: "#e3b975", color: "#03212a", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14 } as React.CSSProperties,
    result: { marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.04)", fontSize: 13, lineHeight: 1.6 },
    note: { marginTop: 24, padding: 16, border: "1px solid rgba(227,185,117,0.2)", borderRadius: 12, fontSize: 12, color: "#cdd8d2", lineHeight: 1.7, maxWidth: 700 } as React.CSSProperties,
  };

  const allRows = [...serverRows, ...clientRows];

  return (
    <div style={s.page}>
      <h1 style={s.h1}>🔍 SELAH Auth Debug</h1>
      <p style={{ color: "#cdd8d2", fontSize: 12, marginBottom: 20 }}>서버 + 클라이언트 세션 상태</p>

      <table style={s.table}>
        <tbody>
          {allRows.map((r) => (
            <tr key={r.k}>
              <td style={{ ...s.td, ...s.tdL }}>{r.k}</td>
              <td style={s.td}>{r.v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── In-page login test ───────────────────────────── */}
      <h2 style={s.h2}>🔑 인페이지 로그인 테스트</h2>
      <p style={{ fontSize: 12, color: "#cdd8d2", marginBottom: 12 }}>
        여기서 바로 로그인 테스트 → 쿠키가 실제로 설정되는지 즉시 확인
      </p>
      <div style={s.card}>
        <input
          style={s.input}
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={s.input}
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={s.btn} onClick={handleTestLogin} disabled={busy}>
          {busy ? "확인 중…" : "로그인 테스트"}
        </button>
        {loginResult && <div style={s.result}>{loginResult}</div>}
      </div>

      {/* ── Diagnosis guide ──────────────────────────────── */}
      <div style={s.note}>
        <strong style={{ color: "#e3b975" }}>진단 가이드</strong>
        <br /><br />
        <strong>로그인 테스트 후 "Supabase cookies (sb-*)"를 확인하세요:</strong>
        <br />
        • ✅ sb-xxx 쿠키 있음 → 쿠키는 설정됨 → 서버 전달 문제
        <br />
        • ❌ 쿠키 없음 → createBrowserClient가 쿠키 안 씀 → client.ts 수정 필요
        <br /><br />
        <strong>로그인 에러 메시지:</strong>
        <br />
        • "Invalid login credentials" → 이메일/비밀번호 틀림
        <br />
        • "Email not confirmed" → 이메일 인증 필요
        <br />
        • "Unable to validate" → Supabase 설정 문제
      </div>
    </div>
  );
}
