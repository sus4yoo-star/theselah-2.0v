/* SELAH service worker, v3. Bump the version string at the top whenever
 * shipping a new build — that's the lever that clears users' stale shell
 * cache so they pick up new code on next visit. */
const CACHE = "selah-shell-v3";

/* Files that should be available even when the user is offline. The list
 * is intentionally small so install never fails on a slow connection. */
const PRECACHE = [
  "/",
  "/today",
  "/manifest.json",
  "/symbol-transparent.png",
  "/favicon.png",
  "/icon-192.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) =>
        Promise.all(
          PRECACHE.map((url) =>
            c.add(url).catch(() => {
              /* one missing asset shouldn't tank install */
            })
          )
        )
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* Never cache anything dynamic — auth flows, API, Supabase RPC, Next.js
   * data fetches. Those always go to the network. */
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/data") ||
    url.hostname.endsWith("supabase.co") ||
    url.hostname.endsWith("supabase.in")
  ) {
    return;
  }

  /* Stale-while-revalidate: serve the cached copy if any, but always
   * kick off a background fetch to refresh it. Offline → fall back to
   * cache, then to the cached "/" shell so the splash still loads. */
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached || caches.match("/"));
      return cached || fetched;
    })
  );
});

/* Listen for an explicit "skip waiting" message so the app can prompt
 * the user to refresh when a new version is detected. */
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
