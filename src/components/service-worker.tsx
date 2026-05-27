"use client";

import { useEffect } from "react";

/**
 * Service-worker registration with aggressive update-checking.
 *
 * We had an infinite-login bug in early May 2026 where users were
 * stuck on a stale /chat or /login HTML page that an old v3 service
 * worker had cached. The fix below makes sure:
 *
 *   1. The browser ALWAYS asks for /sw.js with no caching (the SW
 *      script itself must never be stale).
 *   2. On every page load we explicitly call `registration.update()`
 *      so a freshly-deployed SW is picked up immediately.
 *   3. When a brand-new SW finishes installing and there is already
 *      a controller, we tell it to skip the "waiting" state — so
 *      users get the new code on the very next navigation instead
 *      of after they close every tab.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          // Force a fresh fetch of /sw.js right now so a newly-deployed
          // version is detected without waiting for the 24-hour default.
          try {
            reg.update();
          } catch {
            /* ignore */
          }

          // When a new worker takes the "waiting" state, push it to
          // active so users don't need to close all tabs to upgrade.
          const promote = (worker: ServiceWorker | null) => {
            if (worker && worker.state === "installed" && navigator.serviceWorker.controller) {
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
        })
        .catch(() => {
          /* offline registration is best-effort */
        });

      // When a new SW activates, reload the page once so the new
      // bundles take effect immediately.
      let didReload = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (didReload) return;
        didReload = true;
        window.location.reload();
      });
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);
  return null;
}
