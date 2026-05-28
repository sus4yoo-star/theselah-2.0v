import { createClient as createCookieClient } from "@/lib/supabase/server";
import { createClient as createTokenClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

/**
 * Unified API authentication for BOTH clients:
 *
 *   • Web build (same-origin): the browser sends the Supabase session
 *     cookie. We read it with the cookie-based server client — exactly
 *     the original behavior.
 *
 *   • Mobile app build (cross-origin): the WebView origin has no cookie
 *     for the API domain, so the app sends `Authorization: Bearer
 *     <access_token>` instead. We verify that token and build a Supabase
 *     client that carries it on every query, so RLS still applies as the
 *     signed-in user.
 *
 * Returns { supabase, user } on success, or null if unauthenticated.
 */
export async function getApiAuth(
  req: NextRequest
): Promise<{ supabase: any; user: any } | null> {
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  // ── Bearer token path (mobile app) ─────────────────────────────
  if (bearer) {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const anon =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "";
    if (!url || !anon) return null;

    const supabase = createTokenClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${bearer}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(bearer);
    if (error || !data.user) return null;
    return { supabase, user: data.user };
  }

  // ── Cookie path (web) ───────────────────────────────────────────
  try {
    const supabase = await createCookieClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return { supabase, user: data.user };
  } catch {
    return null;
  }
}
