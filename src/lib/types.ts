export type LangCode =
  | "ko" | "en" | "ja" | "zh" | "zh-TW"
  | "es" | "pt" | "fr" | "de" | "it" | "nl"
  | "ru" | "uk" | "pl" | "cs" | "hu" | "ro" | "tr"
  | "th" | "vi" | "id" | "ms" | "tl"
  | "hi" | "bn" | "ta" | "te"
  | "ar" | "fa" | "sw";

export type Role = "user" | "assistant";

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  language: LangCode;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: Role;
  content: string;
  language: LangCode;
  created_at: string;
}

/** Lightweight message shape used while streaming before persistence. */
export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  language: LangCode;
  pending?: boolean;
  /** Data-URL of an attached image, kept only in memory (not persisted). */
  image?: string;
}

export type IntentType = "emotional" | "bible" | "general";
