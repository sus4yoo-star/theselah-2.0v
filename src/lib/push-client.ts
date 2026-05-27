/**
 * Push subscription helper.
 *
 * Talks to the browser's Service Worker registration to acquire a Web
 * Push subscription, then POSTs it to /api/push/subscribe so the cron
 * job can send daily reminders.
 *
 * The VAPID public key is exposed via NEXT_PUBLIC_VAPID_PUBLIC_KEY and
 * is safe to ship to the client — only the private counterpart needs
 * to stay on the server.
 */

const VAPID_PUBLIC_KEY =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
    : "";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function notificationPermission(): NotificationPermission {
  if (typeof Notification === "undefined") return "denied";
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/* Base64URL → Uint8Array, as required by PushManager.subscribe. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export interface SubscribeResult {
  ok: boolean;
  reason?: "unsupported" | "permission" | "no-vapid" | "register-failed" | "save-failed";
  subscription?: PushSubscription;
}

export async function subscribePush(): Promise<SubscribeResult> {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };
  if (!VAPID_PUBLIC_KEY) return { ok: false, reason: "no-vapid" };

  const perm = await requestPermission();
  if (perm !== "granted") return { ok: false, reason: "permission" };

  let reg: ServiceWorkerRegistration;
  try {
    reg = await navigator.serviceWorker.ready;
  } catch {
    return { ok: false, reason: "register-failed" };
  }

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    } catch {
      return { ok: false, reason: "register-failed" };
    }
  }

  // Persist on our server. Endpoint dedupes via unique(endpoint) at the DB.
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
          auth: arrayBufferToBase64(sub.getKey("auth")),
        },
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
      }),
    });
    if (!res.ok) return { ok: false, reason: "save-failed", subscription: sub };
  } catch {
    return { ok: false, reason: "save-failed", subscription: sub };
  }

  return { ok: true, subscription: sub };
}

export async function unsubscribePush(): Promise<void> {
  if (!pushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

function arrayBufferToBase64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
