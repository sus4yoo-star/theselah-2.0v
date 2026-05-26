"use client";

import * as React from "react";

/**
 * Senior-accessibility font-size control.
 *
 * Three steps controlled by a CSS variable `--chat-font-size`, applied
 * at the document root so any descendant that opts in with
 * `font-size: var(--chat-font-size)` scales together. The chat-window
 * body uses this variable; everything else (UI chrome) stays fixed so
 * the layout doesn't break.
 *
 * Persisted in localStorage under SELAH-specific key.
 */

export type FontSize = "sm" | "md" | "lg";

const STORAGE_KEY = "selah_font_size";
const VALUES: Record<FontSize, string> = {
  sm: "14px",
  md: "17px",
  lg: "21px",
};

interface Ctx {
  size: FontSize;
  setSize: (s: FontSize) => void;
}

const FontSizeContext = React.createContext<Ctx | null>(null);

function applyToRoot(size: FontSize) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--chat-font-size",
    VALUES[size]
  );
}

export function FontSizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default to "md" so first paint matches the previous look. After
  // mount we reconcile with whatever is in localStorage.
  const [size, setSizeState] = React.useState<FontSize>("md");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "sm" || raw === "md" || raw === "lg") {
        setSizeState(raw);
        applyToRoot(raw);
        return;
      }
    } catch {
      /* ignore */
    }
    applyToRoot("md");
  }, []);

  const setSize = React.useCallback((s: FontSize) => {
    setSizeState(s);
    applyToRoot(s);
    try {
      localStorage.setItem(STORAGE_KEY, s);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <FontSizeContext.Provider value={{ size, setSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): Ctx {
  const ctx = React.useContext(FontSizeContext);
  if (!ctx) {
    // Safe non-throwing fallback so a missing provider doesn't crash
    // the page; just becomes a no-op control.
    return { size: "md", setSize: () => {} };
  }
  return ctx;
}
