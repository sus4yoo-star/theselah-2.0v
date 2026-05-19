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

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: LangCode;
}) {
  const [lang, setLangState] = React.useState<LangCode>(initialLang || "en");

  // Resolve preferred language on mount: stored → profile → browser.
  React.useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as LangCode | null)
        : null;
    if (stored) {
      setLangState(normalizeLang(stored));
      return;
    }
    if (initialLang) {
      setLangState(initialLang);
      return;
    }
    const nav =
      typeof navigator !== "undefined"
        ? navigator.language || (navigator.languages && navigator.languages[0])
        : "en";
    setLangState(normalizeLang(nav));
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
      localStorage.setItem(STORAGE_KEY, norm);
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
