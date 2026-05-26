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

  // ── 2026.05.27 senior + share round ─────────────────────────────────
  viewSettings: string;
  highContrastLabel: string;
  highContrastOn: string;
  highContrastOff: string;

  ttsLabel: string;
  ttsAutoOn: string;
  ttsAutoOff: string;
  ttsPlay: string;
  ttsStop: string;
  ttsUnsupported: string;

  saveAsImage: string;
  imageSaved: string;

  favorite: string;
  unfavorite: string;
  favoritesTitle: string;
  favoritesEmpty: string;
  showAllChats: string;
  showFavorites: string;

  forgetConversation: string;
  forgetConfirm: string;
  forgetDone: string;

  pinLockTitle: string;
  pinLockEnter: string;
  pinLockSet: string;
  pinLockWrong: string;
  pinLockEnable: string;
  pinLockDisable: string;
  pinLockDigits: string;

  autoDelete: string;
  autoDeleteNever: string;
  autoDelete30: string;
  autoDelete90: string;

  guideStep1Title: string;
  guideStep1Body: string;
  guideStep2Title: string;
  guideStep2Body: string;
  guideStep3Title: string;
  guideStep3Body: string;
  guideNext: string;
  guideDone: string;
  guideSkip: string;

  todayTitle: string;
  todaySubtitle: string;
  todayShare: string;
  todayOpenApp: string;

  crossLinkSelahToMannaTitle: string;
  crossLinkSelahToMannaBody: string;
  crossLinkMannaToSelahTitle: string;
  crossLinkMannaToSelahBody: string;
  crossLinkOpen: string;
  crossLinkDismiss: string;
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

  viewSettings: "보기 설정",
  highContrastLabel: "고대비",
  highContrastOn: "켬",
  highContrastOff: "끔",

  ttsLabel: "읽어주기",
  ttsAutoOn: "자동 읽기 켬",
  ttsAutoOff: "자동 읽기 끔",
  ttsPlay: "소리로 듣기",
  ttsStop: "멈추기",
  ttsUnsupported: "이 브라우저에서는 읽어주기가 지원되지 않아요.",

  saveAsImage: "이미지로 저장",
  imageSaved: "저장됨",

  favorite: "즐겨찾기",
  unfavorite: "즐겨찾기 해제",
  favoritesTitle: "즐겨찾기",
  favoritesEmpty: "아직 즐겨찾기한 기도가 없어요.",
  showAllChats: "전체 대화",
  showFavorites: "즐겨찾기만",

  forgetConversation: "이 대화 잊어주세요",
  forgetConfirm:
    "이 대화와 그로 인해 기억된 내용을 모두 삭제할까요? 되돌릴 수 없어요.",
  forgetDone: "잊었어요.",

  pinLockTitle: "비밀번호",
  pinLockEnter: "비밀번호를 입력하세요",
  pinLockSet: "네 자리 숫자를 설정하세요",
  pinLockWrong: "다시 시도해 주세요",
  pinLockEnable: "잠금 사용",
  pinLockDisable: "잠금 해제",
  pinLockDigits: "숫자만 4자리",

  autoDelete: "오래된 대화 자동 삭제",
  autoDeleteNever: "사용 안 함",
  autoDelete30: "30일 후 삭제",
  autoDelete90: "90일 후 삭제",

  guideStep1Title: "글자 크기를 바꿔보세요",
  guideStep1Body: "오른쪽 위의 A 버튼으로 글자를 크게 키울 수 있어요.",
  guideStep2Title: "음성으로 말해도 돼요",
  guideStep2Body: "키보드가 어려우면 마이크를 누르고 편하게 말씀하세요.",
  guideStep3Title: "기도를 나눌 수 있어요",
  guideStep3Body:
    "받은 기도를 길게 보관하거나 가족과 카카오톡으로 나눌 수 있어요.",
  guideNext: "다음",
  guideDone: "시작하기",
  guideSkip: "건너뛰기",

  todayTitle: "오늘의 한 줄",
  todaySubtitle: "마음에 머무를 짧은 말씀과 기도",
  todayShare: "오늘의 말씀 나누기",
  todayOpenApp: "셀라 열기",

  crossLinkSelahToMannaTitle: "마음이 무거우신가요?",
  crossLinkSelahToMannaBody:
    "신앙을 떠나, 누구와도 부담 없이 마음을 나눌 수 있는 만나도 있어요.",
  crossLinkMannaToSelahTitle: "기도가 필요하신가요?",
  crossLinkMannaToSelahBody:
    "셀라에서는 신앙 안에서 함께 기도하고 말씀을 나눌 수 있어요.",
  crossLinkOpen: "열어보기",
  crossLinkDismiss: "다음에",
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

  viewSettings: "View settings",
  highContrastLabel: "High contrast",
  highContrastOn: "On",
  highContrastOff: "Off",

  ttsLabel: "Read aloud",
  ttsAutoOn: "Auto read on",
  ttsAutoOff: "Auto read off",
  ttsPlay: "Listen",
  ttsStop: "Stop",
  ttsUnsupported: "Read-aloud isn't supported in this browser.",

  saveAsImage: "Save as image",
  imageSaved: "Saved",

  favorite: "Favorite",
  unfavorite: "Unfavorite",
  favoritesTitle: "Favorites",
  favoritesEmpty: "No favorites yet.",
  showAllChats: "All chats",
  showFavorites: "Favorites",

  forgetConversation: "Forget this conversation",
  forgetConfirm:
    "Delete this conversation and everything it taught me to remember? This cannot be undone.",
  forgetDone: "Forgotten.",

  pinLockTitle: "PIN lock",
  pinLockEnter: "Enter PIN",
  pinLockSet: "Set a 4-digit PIN",
  pinLockWrong: "Try again",
  pinLockEnable: "Enable lock",
  pinLockDisable: "Disable lock",
  pinLockDigits: "4 digits only",

  autoDelete: "Auto-delete old chats",
  autoDeleteNever: "Never",
  autoDelete30: "After 30 days",
  autoDelete90: "After 90 days",

  guideStep1Title: "Adjust the text size",
  guideStep1Body: "Use the A button at the top to make the text bigger.",
  guideStep2Title: "Speak instead of typing",
  guideStep2Body: "Tap the microphone and just talk — at your own pace.",
  guideStep3Title: "Share what you receive",
  guideStep3Body:
    "Save a prayer to read later, or share it with family on KakaoTalk.",
  guideNext: "Next",
  guideDone: "Begin",
  guideSkip: "Skip",

  todayTitle: "Today's word",
  todaySubtitle: "A short verse and prayer to carry today",
  todayShare: "Share today's word",
  todayOpenApp: "Open SELAH",

  crossLinkSelahToMannaTitle: "Feeling heavy?",
  crossLinkSelahToMannaBody:
    "MANNA is here for anyone, of any faith, to share what's on their mind.",
  crossLinkMannaToSelahTitle: "Need to pray?",
  crossLinkMannaToSelahBody:
    "In SELAH you can pray and reflect on Scripture together.",
  crossLinkOpen: "Open",
  crossLinkDismiss: "Later",
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
