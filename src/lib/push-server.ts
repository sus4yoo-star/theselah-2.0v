/**
 * Server-side Web Push helper.
 *
 * Uses the `web-push` library with VAPID keys. All env access is
 * lazy + try/catch so a missing key during build never throws — the
 * route handlers will just respond 503 at runtime.
 */
import webpush from "web-push";

let configured = false;
function ensure() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT || "mailto:hello@amov.kr";
  if (!pub || !priv) return;
  try {
    webpush.setVapidDetails(sub, pub, priv);
    configured = true;
  } catch {
    /* keep configured=false; routes will 503 */
  }
}

export interface PushTarget {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPush(target: PushTarget, payload: PushPayload): Promise<{
  ok: boolean;
  statusCode?: number;
  gone?: boolean;
}> {
  ensure();
  if (!configured) return { ok: false, statusCode: 503 };
  try {
    await webpush.sendNotification(
      target as any,
      JSON.stringify(payload),
      { TTL: 60 * 60 * 6 } // 6h — overnight reminders are still OK to wake
    );
    return { ok: true, statusCode: 201 };
  } catch (e: any) {
    const code = e?.statusCode || e?.status || 0;
    // 404/410 → subscription is dead, caller should delete from DB.
    const gone = code === 404 || code === 410;
    return { ok: false, statusCode: code, gone };
  }
}

export function pushReady(): boolean {
  ensure();
  return configured;
}
