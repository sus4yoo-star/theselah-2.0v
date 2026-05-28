/**
 * CORS for the API routes.
 *
 * The mobile app calls these routes cross-origin from the Capacitor
 * WebView (origin is https://localhost on Android, capacitor://localhost
 * on iOS). Because we authenticate with a Bearer token rather than
 * cookies, it is safe to allow any origin: a request without a valid
 * token is rejected regardless of where it came from, and `*` does not
 * permit cookie credentials to ride along.
 *
 * Same-origin web requests don't trigger CORS at all, so these headers
 * are a no-op there.
 */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/** Merge CORS headers into an existing headers object. */
export function withCors(
  headers: Record<string, string> = {}
): Record<string, string> {
  return { ...headers, ...CORS_HEADERS };
}

/** Standard 204 response for an OPTIONS preflight request. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
