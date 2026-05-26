"use client";

import * as React from "react";

/**
 * Bundles all visual-accessibility preferences that the user can adjust
 * from the chat header: text size, high-contrast mode, and whether
 * assistant replies should auto-speak via the browser's TTS.
 *
 * All three persist to localStorage with a SELAH-specific prefix so
 * MANNA and SELAH don't share state when both are installed on the
 * same device.
 *
 * Font-size is exposed as a CSS variable (--chat-font-size) so any
 * component can opt in with `style={{ fontSize: "var(--chat-font-size)" }}`.
 * High-contrast adds a `data-contrast="high"` attribute to <html> so
 * we can target overrides from globals.css without rebuilding the
 * theme system.
 */

export type FontSize = "sm" | "md" | "lg";

const FONT_KEY = "selah_font_size";
const CONTRAST_KEY = "selah_contrast";
const TTS_KEY = "selah_tts_auto";

const FONT_VALUES: Record<FontSize, string> = {
  sm: "14px",
  md: "17px",
  lg: "21px",
};

interface Ctx {
  size: FontSize;
  setSize: (s: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  ttsAuto: boolean;
  setTtsAuto: (v: boolean) => void;
}

const ViewContext = React.createContext<Ctx | null>(null);

function applyFont(size: FontSize) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--chat-font-size",
    FONT_VALUES[size]
  );
}

function applyContrast(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) {
    document.documentElement.setAttribute("data-contrast", "high");
  } else {
    document.documentElement.removeAttribute("data-contrast");
  }
}

export function ViewSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [size, setSizeState] = React.useState<FontSize>("md");
  const [highContrast, setHighContrastState] = React.useState(false);
  const [ttsAuto, setTtsAutoState] = React.useState(false);

  React.useEffect(() => {
    try {
      const f = localStorage.getItem(FONT_KEY);
      if (f === "sm" || f === "md" || f === "lg") {
        setSizeState(f);
        applyFont(f);
      } else {
        applyFont("md");
      }
      const c = localStorage.getItem(CONTRAST_KEY) === "1";
      setHighContrastState(c);
      applyContrast(c);
      const t = localStorage.getItem(TTS_KEY) === "1";
      setTtsAutoState(t);
    } catch {
      applyFont("md");
    }
  }, []);

  const setSize = React.useCallback((s: FontSize) => {
    setSizeState(s);
    applyFont(s);
    try {
      localStorage.setItem(FONT_KEY, s);
    } catch {
      /* ignore */
    }
  }, []);

  const setHighContrast = React.useCallback((v: boolean) => {
    setHighContrastState(v);
    applyContrast(v);
    try {
      localStorage.setItem(CONTRAST_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const setTtsAuto = React.useCallback((v: boolean) => {
    setTtsAutoState(v);
    try {
      localStorage.setItem(TTS_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({ size, setSize, highContrast, setHighContrast, ttsAuto, setTtsAuto }),
    [size, setSize, highContrast, setHighContrast, ttsAuto, setTtsAuto]
  );

  return (
    <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
  );
}

export function useViewSettings(): Ctx {
  const ctx = React.useContext(ViewContext);
  if (!ctx) {
    return {
      size: "md",
      setSize: () => {},
      highContrast: false,
      setHighContrast: () => {},
      ttsAuto: false,
      setTtsAuto: () => {},
    };
  }
  return ctx;
}

/* Back-compat: existing imports of useFontSize keep working. */
export function useFontSize() {
  const { size, setSize } = useViewSettings();
  return { size, setSize };
}
