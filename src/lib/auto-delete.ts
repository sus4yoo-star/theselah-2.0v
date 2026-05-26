/**
 * Auto-delete preference: "never" | "30d" | "90d".
 * Stored client-side; the actual delete is fired from ChatApp when the
 * sidebar mounts. We never touch sessions newer than the threshold.
 */

const KEY = "selah_auto_delete";

export type AutoDelete = "never" | "30d" | "90d";

export function getAutoDelete(): AutoDelete {
  if (typeof window === "undefined") return "never";
  try {
    const v = localStorage.getItem(KEY);
    if (v === "30d" || v === "90d" || v === "never") return v;
  } catch {
    /* ignore */
  }
  return "never";
}

export function setAutoDelete(v: AutoDelete) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* ignore */
  }
}

export function autoDeleteThresholdMs(v: AutoDelete): number | null {
  if (v === "30d") return 30 * 24 * 60 * 60 * 1000;
  if (v === "90d") return 90 * 24 * 60 * 60 * 1000;
  return null;
}
