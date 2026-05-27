/* SELAH service worker, v3. Bump the version string at the top whenever
 * shipping a new build — that's the lever that clears users' stale shell
 * cache so they pick up new code on next visit. */
const CACHE = "selah-shell-v4";

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

/* ── Web Push ──────────────────────────────────────────────────────
 * Triggered by the cron job. Payload is a JSON string:
 *   { title, body, url? }
 * If the payload is missing or malformed we fall back to a generic
 * reminder so the user still gets a nudge. */
self.addEventListener("push", (e) => {
  let data = { title: "SELAH", body: "잠시 멈춰, 오늘 마음을 올려드려 보세요.", url: "/chat" };
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
      // tag so a backlog of unread reminders collapses into one
      tag: "selah-reminder",
      renotify: false,
    })
  );
});

/* Open / focus the app when a reminder is tapped. */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "/chat";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      for (const client of all) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            try { client.navigate(target); } catch { /* ignore */ }
          }
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
