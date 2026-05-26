import type { LangCode } from "./types";

/**
 * Feature strings introduced by the 2026.05 senior-UX patch.
 * Kept OUTSIDE the main Dict so we don't have to backfill 30 languages
 * every release. Korean + English are the source of truth; other
 * languages fall back to English. Patches over time can add localized
 * entries here without touching the main i18n dictionary.
 */
export interface FeatureStrings {
  // font-size control
  fontSizeLabel: string;
  fontSizeSmall: string;
  fontSizeMedium: string;
  fontSizeLarge: string;

  // voice input
  voiceStart: string;
  voiceListening: string;
  voiceUnsupported: string;
  voiceError: string;

  // crisis card
  crisisTitle: string;
  crisisBody: string;
  crisisCallNow: string;
  crisisDismiss: string;
  crisisDisclaimer: string;

  // share / copy
  shareWords: string;
  copy: string;
  copied: string;

  // session search
  searchPlaceholder: string;
  searchNoResults: string;
}

const ko: FeatureStrings = {
  fontSizeLabel: "글자 크기",
  fontSizeSmall: "작게",
  fontSizeMedium: "보통",
  fontSizeLarge: "크게",

  voiceStart: "음성으로 말하기",
  voiceListening: "듣고 있어요…",
  voiceUnsupported: "이 브라우저에서는 음성 입력이 지원되지 않아요.",
  voiceError: "음성을 인식하지 못했어요. 다시 시도해 주세요.",

  crisisTitle: "지금 당신은 혼자가 아닙니다",
  crisisBody:
    "마음이 많이 무거운 것 같아요. 지금 바로 도움을 받을 수 있는 곳이 있어요.",
  crisisCallNow: "전화 연결",
  crisisDismiss: "닫기",
  crisisDisclaimer:
    "셀라는 의료·심리 상담을 대체하지 않습니다. 위급한 상황에서는 전문가의 도움이 가장 안전합니다.",

  shareWords: "기도 나누기",
  copy: "복사",
  copied: "복사됨",

  searchPlaceholder: "대화 검색",
  searchNoResults: "검색 결과가 없어요",
};

const en: FeatureStrings = {
  fontSizeLabel: "Text size",
  fontSizeSmall: "Small",
  fontSizeMedium: "Default",
  fontSizeLarge: "Large",

  voiceStart: "Speak instead of typing",
  voiceListening: "Listening…",
  voiceUnsupported: "Voice input isn't supported in this browser.",
  voiceError: "Couldn't catch that. Please try again.",

  crisisTitle: "You are not alone right now",
  crisisBody:
    "This feels heavy. There are people who can help right now — please reach out.",
  crisisCallNow: "Call now",
  crisisDismiss: "Dismiss",
  crisisDisclaimer:
    "SELAH is not a substitute for medical or psychological care. In an emergency, please contact a professional.",

  shareWords: "Share the prayer",
  copy: "Copy",
  copied: "Copied",

  searchPlaceholder: "Search chats",
  searchNoResults: "No matching chats",
};

/**
 * Crisis hotlines. Korean speakers get the Korean numbers; everyone
 * else gets a universal-ish English set. Adding more locale-specific
 * numbers later is straightforward.
 */
export interface Hotline {
  label: string;
  number: string;
  hours?: string;
}

export function hotlinesFor(lang: LangCode): Hotline[] {
  if (lang === "ko") {
    return [
      { label: "자살예방상담전화", number: "1393", hours: "24시간 · 무료" },
      { label: "정신건강위기상담", number: "1577-0199" },
      { label: "청소년전화", number: "1388" },
      { label: "응급", number: "119" },
    ];
  }
  // English / international fallback.
  return [
    { label: "Suicide & Crisis Lifeline (US)", number: "988" },
    { label: "Emergency (US)", number: "911" },
    { label: "Find a Helpline (international)", number: "findahelpline.com" },
  ];
}

const TABLE: Partial<Record<LangCode, FeatureStrings>> = { ko, en };

export function getFeatureStrings(lang: LangCode): FeatureStrings {
  return TABLE[lang] || en;
}
