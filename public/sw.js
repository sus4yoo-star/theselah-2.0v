/* SELAH service worker, v6.
 *
 * v6 changes: PWA-critical files (manifest.json, /icon-*.png, apple-touch
 * icons) are now ALWAYS fetched from the network so iOS can read the
 * latest display:standalone value when a user installs the PWA. v5 was
 * stale-while-revalidating these and we saw cases where iOS read a stale
 * cached manifest and refused to install as standalone.
 *
 * Strategy:
 *   - PWA install files (manifest, icons) → NETWORK ONLY, no caching.
 *   - Navigation requests (HTML)         → NETWORK-FIRST, cache offline.
 *   - Static assets (JS/CSS bundles)     → stale-while-revalidate.
 *   - API / auth / Supabase              → bypass entirely.
 */
const CACHE = "selah-shell-v6";

const PRECACHE = [
  "/",
  "/today",
  "/symbol-transparent.png",
];

// Pattern-matchers for the routing logic below.
// Note: sw.js MUST be here — if the SW caches its own script, users can
// get permanently stuck on an old version even after a new deploy.
const PWA_CRITICAL = /^\/(sw\.js|manifest\.json|icon-\d+\.png|apple-touch-icon\.png|favicon\.png)$/;

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

  /* Dynamic stuff: never touched by SW. */
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/data") ||
    url.hostname.endsWith("supabase.co") ||
    url.hostname.endsWith("supabase.in")
  ) {
    return;
  }

  /* PWA install files: ALWAYS network. iOS reads these once at install
   * time to decide standalone vs browser mode — a stale cached copy
   * here will silently break PWA installation. */
  if (url.origin === self.location.origin && PWA_CRITICAL.test(url.pathname)) {
    e.respondWith(
      fetch(req, { cache: "no-store" }).catch(() => caches.match(req))
    );
    return;
  }

  /* Navigation requests (HTML pages) — network-first. */
  const isNavigation =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("/"))
        )
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
