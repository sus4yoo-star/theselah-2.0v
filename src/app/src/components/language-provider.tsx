"use client";

import * as React from "react";
import type { LangCode } from "@/lib/types";
import { getDict, normalizeLang, type Dict } from "@/lib/i18n";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: Dict;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "selah_lang";
// One full year — enough that returning users always get SSR in their language.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; Max-Age=" +
    COOKIE_MAX_AGE +
    "; Path=/; SameSite=Lax";
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: LangCode;
}) {
  // Default to "ko" (matches <html lang="ko"> in the root layout) so the
  // first server-rendered HTML lands in Korean instead of flashing English
  // for Korean users. When the server reads a `selah_lang` cookie it passes
  // it in via `initialLang` and SSR is already in that language.
  const [lang, setLangState] = React.useState<LangCode>(
    initialLang ? normalizeLang(initialLang) : "ko"
  );

  // After mount: if the server didn't already pre-render in the right
  // language, reconcile from localStorage → cookie → navigator and PERSIST
  // the result so subsequent loads (and the profile-sync logic in ChatApp)
  // see a consistent preference signal.
  React.useEffect(() => {
    // If the server already gave us an explicit language, trust it.
    if (initialLang) return;

    let next: LangCode | null = null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) next = normalizeLang(stored);
    } catch {
      /* localStorage may throw in private mode */
    }

    if (!next) {
      const fromCookie = readCookie(STORAGE_KEY);
      if (fromCookie) next = normalizeLang(fromCookie);
    }

    if (!next && typeof navigator !== "undefined") {
      const nav =
        navigator.language ||
        (navigator.languages && navigator.languages[0]) ||
        "ko";
      next = normalizeLang(nav);
    }

    if (next) {
      // Persist so the next SSR render already lands in this language,
      // and so profile-sync can use it as the source of truth.
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      writeCookie(STORAGE_KEY, next);
      if (next !== lang) setLangState(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = React.useCallback((l: LangCode) => {
    const norm = normalizeLang(l);
    setLangState(norm);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, norm);
      } catch {
        /* ignore */
      }
      // Mirror to a cookie so the next SSR render is already in this
      // language (no English flash for returning visitors).
      writeCookie(STORAGE_KEY, norm);
    }
  }, []);

  const value = React.useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: getDict(lang) }),
    [lang, setLang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
