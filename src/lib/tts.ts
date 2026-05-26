import type { LangCode } from "./types";

/**
 * Lightweight wrapper around `window.speechSynthesis`. Picks a voice that
 * matches the user's UI language when available. Single global queue —
 * starting a new utterance cancels the previous one so two messages
 * never speak over each other.
 */

function bcp47For(lang: LangCode): string {
  const map: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
    zh: "zh-CN",
    "zh-TW": "zh-TW",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    ru: "ru-RU",
    th: "th-TH",
    vi: "vi-VN",
    id: "id-ID",
    hi: "hi-IN",
    ar: "ar-SA",
    tr: "tr-TR",
  };
  return map[lang] || "en-US";
}

export function ttsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof (window as any).SpeechSynthesisUtterance !== "undefined"
  );
}

export function ttsStop(): void {
  if (!ttsSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export interface TtsHandle {
  stop: () => void;
}

export function ttsSpeak(
  text: string,
  lang: LangCode,
  opts?: { rate?: number; onEnd?: () => void; onError?: () => void }
): TtsHandle {
  if (!ttsSupported() || !text.trim()) {
    return { stop: () => {} };
  }
  try {
    window.speechSynthesis.cancel();
    const u = new (window as any).SpeechSynthesisUtterance(text) as SpeechSynthesisUtterance;
    u.lang = bcp47For(lang);
    u.rate = opts?.rate ?? 0.95; // slightly slow — senior-friendly
    u.pitch = 1;
    u.volume = 1;

    // Prefer a same-language voice if one is installed.
    try {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === u.lang) ||
                    voices.find((v) => v.lang.startsWith(u.lang.split("-")[0]));
      if (match) u.voice = match;
    } catch {
      /* ignore */
    }

    u.onend = () => opts?.onEnd?.();
    u.onerror = () => opts?.onError?.();
    window.speechSynthesis.speak(u);
  } catch {
    opts?.onError?.();
  }
  return { stop: ttsStop };
}
