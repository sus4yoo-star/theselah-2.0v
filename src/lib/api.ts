"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Resolves the base URL for API calls.
 *
 *  • Web build (Netlify): NEXT_PUBLIC_API_BASE is empty, so we call the
 *    same-origin "/api/...". Cookies authenticate the request as before.
 *
 *  • Capacitor app build: NEXT_PUBLIC_API_BASE is set to the deployed
 *    backend (e.g. https://manna.theamov.com). The WebView origin is
 *    capacitor://localhost, which has no cookies for that domain, so we
 *    authenticate with a Bearer token instead (see authedFetch below).
 */
export function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  return base.replace(/\/$/, ""); // strip trailing slash
}

/** Builds a full API URL, e.g. apiUrl("/api/chat"). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
}

/**
 * fetch() wrapper that attaches the current Supabase access token as a
 * Bearer header. This is what lets the static mobile app authenticate
 * against the remote API without relying on cookies.
 *
 * On the web build it is harmless: the cookie still authenticates, and
 * sending the Bearer token too is accepted by the updated API routes.
 */
export async function authedFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  let token = "";
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || "";
  } catch {
    /* no session — request will be rejected by the API with 401 */
  }

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(apiUrl(path), { ...init, headers });
}
