import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

/**
 * OAuth / magic-link callback.
 *
 * The critical fix here (vs the old pattern) is that we build the
 * NextResponse.redirect() FIRST and wire the Supabase client to write
 * session cookies ONTO THAT RESPONSE. The old code wrote cookies into
 * the next/headers cookie-store which, in Next.js 15 Route Handlers,
 * does not automatically propagate to the outgoing HTTP response — so
 * the browser never received the auth tokens and `/chat` always saw
 * an unauthenticated request, causing the infinite-login loop.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";

  if (code) {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  || process.env.SUPABASE_URL  || "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

    if (!url || !anon) {
      return NextResponse.redirect(`${origin}/login?error=config`);
    }

    // Build the redirect response FIRST so we can attach cookies to it.
    const redirectTo = next.startsWith("/") ? `${origin}${next}` : `${origin}/chat`;
    const response = NextResponse.redirect(redirectTo);

    // Create a Supabase client whose setAll() writes directly onto the
    // response we're about to return — the browser will receive these
    // cookies together with the 302 and send them on every subsequent
    // request, making the server-side session visible immediately.
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Write to request so downstream middleware sees them too.
            request.cookies.set(name, value);
            // Write to response so the browser actually receives them.
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response; // carries the freshly-minted session cookies
    }

    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
  }

  // Fallback: send back to login with an error flag.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
