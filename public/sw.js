/* SELAH service worker, v5.
 *
 * IMPORTANT: bumped to v5 (and CACHE renamed to "selah-shell-v5") because
 * v3/v4 was caching page HTML for navigation requests under the wrong
 * "selah-shell-*" key, which collided with the Selah PWA and caused an
 * infinite login loop when a stale /chat or /login page was served from
 * the cache.
 *
 * Strategy in v5:
 *   - Navigation requests (HTML pages) → NETWORK FIRST. The cache is
 *     only used as an offline fallback.
 *   - Static assets (CSS, JS chunks, images) → stale-while-revalidate.
 *   - API, /auth/, /_next/data, Supabase → bypass cache entirely.
 */
const CACHE = "selah-shell-v5";

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

  /* Never cache anything dynamic — auth, API, Supabase, Next data. */
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/data") ||
    url.hostname.endsWith("supabase.co") ||
    url.hostname.endsWith("supabase.in")
  ) {
    return;
  }

  /* Navigation requests (HTML pages) are NETWORK-FIRST. Returning a
   * stale /chat or /login HTML from the cache after a fresh build is
   * what caused the auth loop, so we always try the network first and
   * only fall back to cache if the user is offline. */
  const isNavigation =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          // Keep a fresh copy in the cache for offline fallback only —
          // never serve it on the next online visit.
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  /* Static assets: stale-while-revalidate. */
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

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ── Web Push ────────────────────────────────────────────────────── */
self.addEventListener("push", (e) => {
  let data = {
    title: "SELAH",
    body: "잠시 멈춰, 오늘 마음을 올려드려 보세요.",
    url: "/chat",
  };
  if (e.data) {
    try {
      const parsed = e.data.json();
      data = { ...data, ...parsed };
    } catch {
      try {
        data.body = e.data.text();
      } catch {
        /* ignore */
      }
    }
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/chat" },
      tag: "selah-reminder",
      renotify: false,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "/chat";
  e.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((all) => {
        for (const client of all) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              try {
                client.navigate(target);
              } catch {
                /* ignore */
              }
            }
            return;
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      })
  );
});
