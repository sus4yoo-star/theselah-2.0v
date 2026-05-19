import type { LangCode } from "./types";

export interface BibleMeta {
  /** Localized label shown above the verse block. */
  label: string;
  /** Translation/version name appended to the reference. */
  version: string;
}

export const BIBLE_META: Record<LangCode, BibleMeta> = {
  ko: { label: "개역개정 말씀", version: "개역개정" },
  en: { label: "Bible Verse", version: "NIV" },
  th: { label: "ข้อพระคัมภีร์", version: "Thai Standard Version" },
  es: { label: "Versículo bíblico", version: "Reina-Valera" },
  pt: { label: "Versículo bíblico", version: "Almeida" },
  hi: { label: "बाइबल वचन", version: "OV Hindi" },
  zh: { label: "圣经经文", version: "和合本" },
};

/**
 * Korean 개역개정 verses are conventionally quoted WITHOUT a trailing
 * period. Strip any sentence-ending punctuation for ko, keep others.
 */
export function cleanVerseText(lang: LangCode, raw: string): string {
  let t = String(raw || "").trim();
  // Drop surrounding quotation marks the model sometimes adds.
  t = t.replace(/^["“”'']+|["“”'']+$/g, "").trim();
  if (lang === "ko") {
    t = t.replace(/[.。!！?？\u3002]+$/g, "").trim();
  }
  return t;
}

export function bibleMeta(lang: LangCode): BibleMeta {
  return BIBLE_META[lang] || BIBLE_META.en;
}
