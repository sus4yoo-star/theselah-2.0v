"use client";

import { useEffect } from "react";

/**
 * Service-worker registration — SAFE version (May 27, 2026).
 *
 * The previous iteration listened for `controllerchange` and called
 * `window.location.reload()`. In some PWA scenarios (especially on
 * iOS standalone), that caused an infinite reload loop because the
 * in-memory `didReload` flag is wiped on every reload. Users saw it
 * as "the login screen keeps reappearing" — but it was actually the
 * whole tab cycling forever.
 *
 * New strategy:
 *   1. On first run of THIS version, unregister every old service
 *      worker and clear every cache that doesn't match v6. This
 *      guarantees users who had an old v3/v4/v5 worker installed
 *      get a fully clean state on their next visit.
 *   2. Register /sw.js with updateViaCache:"none" so the browser
 *      always asks the network for the script itself.
 *   3. Call reg.update() to force-detect new builds without waiting
 *      for the 24-hour default.
 *   4. Promote any waiting SW to active immediately so users get
 *      new code on the very next navigation.
 *   5. NO MORE controllerchange-driven auto-reload. Users will pick
 *      up the new bundle naturally on the next navigation, which is
 *      safer than risking a reload loop.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const init = async () => {
      try {
        // ── One-time clean-up of legacy workers and caches ─────────
        // We tag this with a key in sessionStorage so we don't keep
        // running it on every navigation in the same session.
        const MIGRATION_KEY = "sw-migrate-v6";
        if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(MIGRATION_KEY)) {
          try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const r of regs) {
              // If this registration's active script URL doesn't match
              // /sw.js or is otherwise stale, unregister. Cheaper than
              // trying to introspect SW version strings.
              const scriptURL = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
              if (!scriptURL.endsWith("/sw.js")) {
                try { await r.unregister(); } catch {}
              }
            }
            if (typeof caches !== "undefined") {
              const keys = await caches.keys();
              // Purge legacy generations explicitly. Leave v6+ alone.
              for (const k of keys) {
                if (/^(selah|manna)-shell-v[12345]$/.test(k)) {
                  try { await caches.delete(k); } catch {}
                }
              }
            }
          } catch {
            /* best-effort cleanup */
          }
          try { sessionStorage.setItem(MIGRATION_KEY, "1"); } catch {}
        }

        // ── Register the current SW ────────────────────────────────
        const reg = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });

        // Detect new deployments without the 24-hour delay.
        try { reg.update(); } catch {}

        // Promote a waiting SW to active so users don't have to close
        // every tab to get the new code.
        const promote = (worker: ServiceWorker | null) => {
          if (
            worker &&
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            try {
              worker.postMessage({ type: "SKIP_WAITING" });
            } catch {
              /* ignore */
            }
          }
        };
        if (reg.waiting) promote(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const w = reg.installing;
          if (!w) return;
          w.addEventListener("statechange", () => promote(w));
        });
      } catch {
        /* registration is best-effort — never block the app */
      }
    };

    if (document.readyState === "complete") {
      init();
    } else {
      window.addEventListener("load", init, { once: true });
    }
  }, []);
  return null;
}
