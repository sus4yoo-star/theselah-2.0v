/**
 * Lightweight favorites — purely localStorage so we don't have to
 * migrate the DB schema yet. Stores message IDs the user has starred.
 * If the messages get deleted server-side the IDs become stale but
 * are harmless; we simply skip non-existent ones when rendering.
 *
 * Shape:
 *   selah_favorites = JSON string of FavoriteEntry[]
 *
 * Each entry keeps the displayed content cached so favorites still
 * render even when the originating session is offline.
 */

const KEY = "selah_favorites";

export interface FavoriteEntry {
  id: string;
  sessionId: string | null;
  content: string;
  language: string;
  savedAt: number; // ms epoch
}

export function loadFavorites(): FavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e && typeof e.id === "string" && typeof e.content === "string"
    );
  } catch {
    return [];
  }
}

function writeFavorites(list: FavoriteEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function isFavorited(id: string): boolean {
  return loadFavorites().some((e) => e.id === id);
}

export function toggleFavorite(entry: FavoriteEntry): boolean {
  const list = loadFavorites();
  const idx = list.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeFavorites(list);
    return false;
  }
  list.unshift(entry); // newest first
  // cap at 200 so localStorage never explodes
  writeFavorites(list.slice(0, 200));
  return true;
}

export function removeFavorite(id: string) {
  const list = loadFavorites();
  writeFavorites(list.filter((e) => e.id !== id));
}
