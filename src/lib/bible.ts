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
  ja: { label: "聖書のことば", version: "新共同訳" },
  zh: { label: "圣经经文", version: "和合本" },
  "zh-TW": { label: "聖經經文", version: "和合本" },
  es: { label: "Versículo bíblico", version: "Reina-Valera" },
  pt: { label: "Versículo bíblico", version: "Almeida" },
  fr: { label: "Verset biblique", version: "Louis Segond" },
  de: { label: "Bibelvers", version: "Lutherbibel" },
  it: { label: "Versetto biblico", version: "Nuova Riveduta" },
  nl: { label: "Bijbeltekst", version: "NBV" },
  ru: { label: "Стих из Библии", version: "Синодальный" },
  uk: { label: "Біблійний вірш", version: "Огієнка" },
  pl: { label: "Werset biblijny", version: "Biblia Tysiąclecia" },
  cs: { label: "Biblický verš", version: "Český ekumenický" },
  hu: { label: "Bibliai ige", version: "új fordítású" },
  ro: { label: "Verset biblic", version: "Cornilescu" },
  tr: { label: "Kutsal Kitap ayeti", version: "Kutsal Kitap" },
  th: { label: "ข้อพระคัมภีร์", version: "Thai Standard Version" },
  vi: { label: "Câu Kinh Thánh", version: "Bản Truyền Thống" },
  id: { label: "Ayat Alkitab", version: "Terjemahan Baru" },
  ms: { label: "Ayat Alkitab", version: "Berita Baik" },
  tl: { label: "Talata sa Bibliya", version: "Magandang Balita" },
  hi: { label: "बाइबल वचन", version: "OV Hindi" },
  bn: { label: "বাইবেলের পদ", version: "Common Language" },
  ta: { label: "வேதவசனம்", version: "Tamil O.V." },
  te: { label: "బైబిల్ వచనం", version: "Telugu O.V." },
  ar: { label: "آية كتابية", version: "فاندايك" },
  fa: { label: "آیهٔ کتاب‌مقدّس", version: "هزارهٔ نو" },
  sw: { label: "Andiko la Biblia", version: "Habari Njema" },
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
