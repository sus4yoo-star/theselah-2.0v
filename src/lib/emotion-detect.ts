/**
 * Lexicon-based sentiment + emotion classifier.
 *
 * Runs entirely on the client over already-rendered messages — no extra
 * model call, no server round-trip, no API key. The goal is a calm,
 * directionally-correct mood graph; we do NOT claim diagnostic accuracy.
 *
 *  valence  ∈ [-1, +1]   negative ↔ positive
 *  label    one of LABELS — the dominant emotional theme
 *
 * Korean and English keyword sets are intentionally short and high-
 * precision. Better to under-classify (return null) than mislabel a
 * vulnerable moment.
 */

export type EmotionLabel =
  | "anxious"
  | "sad"
  | "angry"
  | "lonely"
  | "hopeless"
  | "guilty"
  | "calm"
  | "grateful"
  | "joyful"
  | "hopeful"
  | "loved";

interface Lexicon {
  label: EmotionLabel;
  valence: number;   // -1 .. +1
  keywords: string[]; // lowercased
}

/* ── Korean lexicon ─────────────────────────────────────────────── */
const KO: Lexicon[] = [
  { label: "anxious",  valence: -0.6, keywords: ["불안", "긴장", "걱정", "두려", "무서", "초조", "조마", "떨려"] },
  { label: "sad",      valence: -0.7, keywords: ["슬프", "슬퍼", "눈물", "울고", "울었", "마음이 아파", "아프", "허전", "공허"] },
  { label: "angry",    valence: -0.6, keywords: ["화가", "화나", "분노", "짜증", "억울", "원망", "미워", "미움"] },
  { label: "lonely",   valence: -0.7, keywords: ["외로", "혼자", "외톨", "쓸쓸", "고립"] },
  { label: "hopeless", valence: -0.95,keywords: ["죽고", "사라지", "끝내고", "살기 싫", "포기", "절망", "희망이 없"] },
  { label: "guilty",   valence: -0.5, keywords: ["죄책", "미안", "잘못", "후회", "부끄"] },

  { label: "calm",     valence: 0.4,  keywords: ["평안", "차분", "괜찮", "안정", "쉬어"] },
  { label: "grateful", valence: 0.8,  keywords: ["감사", "고마워", "고맙", "축복"] },
  { label: "joyful",   valence: 0.9,  keywords: ["기쁘", "기뻐", "행복", "신나", "벅차", "황홀"] },
  { label: "hopeful",  valence: 0.7,  keywords: ["희망", "기대", "꿈꾸", "설레", "할 수 있"] },
  { label: "loved",    valence: 0.85, keywords: ["사랑받", "사랑해", "사랑하", "은혜", "위로받"] },
];

/* ── English lexicon ────────────────────────────────────────────── */
const EN: Lexicon[] = [
  { label: "anxious",  valence: -0.6, keywords: ["anxious", "anxiety", "worried", "worry", "nervous", "afraid", "scared", "panic"] },
  { label: "sad",      valence: -0.7, keywords: ["sad", "tears", "crying", "cry", "heartbroken", "broken", "hurt", "empty"] },
  { label: "angry",    valence: -0.6, keywords: ["angry", "anger", "furious", "mad", "resent", "rage", "frustrat"] },
  { label: "lonely",   valence: -0.7, keywords: ["lonely", "alone", "isolat", "no one", "no friends"] },
  { label: "hopeless", valence: -0.95,keywords: ["suicide", "kill myself", "end my life", "want to die", "give up", "hopeless", "no point"] },
  { label: "guilty",   valence: -0.5, keywords: ["guilty", "shame", "ashamed", "regret", "my fault", "sorry i"] },

  { label: "calm",     valence: 0.4,  keywords: ["calm", "peaceful", "okay", "fine", "settled", "steady"] },
  { label: "grateful", valence: 0.8,  keywords: ["grateful", "thankful", "thank you", "blessed"] },
  { label: "joyful",   valence: 0.9,  keywords: ["joy", "joyful", "happy", "happiness", "excited", "thrilled"] },
  { label: "hopeful",  valence: 0.7,  keywords: ["hope", "hopeful", "looking forward", "i can", "i will"] },
  { label: "loved",    valence: 0.85, keywords: ["loved", "love you", "i love", "grace", "comforted"] },
];

const LEX_FOR: Record<string, Lexicon[]> = {
  ko: KO,
  en: EN,
};

export interface EmotionResult {
  valence: number;          // -1 .. +1
  label: EmotionLabel | null;
  confidence: number;       // 0..1 — how many keywords hit
}

/* Strip the assistant's structural tags so we score user content cleanly. */
function clean(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .toLowerCase();
}

export function scoreEmotion(text: string, lang: string): EmotionResult {
  const lex = LEX_FOR[lang] || EN;
  const t = clean(text);
  if (!t.trim()) {
    return { valence: 0, label: null, confidence: 0 };
  }
  // Tally weighted hits per label.
  const hits = new Map<EmotionLabel, number>();
  let totalHits = 0;
  for (const entry of lex) {
    let count = 0;
    for (const kw of entry.keywords) {
      // Crude but fast: count occurrences.
      let idx = 0;
      while ((idx = t.indexOf(kw, idx)) !== -1) {
        count++;
        idx += kw.length;
      }
    }
    if (count > 0) {
      hits.set(entry.label, count);
      totalHits += count;
    }
  }
  if (hits.size === 0) {
    return { valence: 0, label: null, confidence: 0 };
  }
  // Dominant label = the one with the highest hit count.
  let dominant: EmotionLabel | null = null;
  let bestCount = 0;
  for (const [k, v] of hits) {
    if (v > bestCount) {
      bestCount = v;
      dominant = k;
    }
  }
  // Weighted valence = sum(hit * entryValence) / sum(hit).
  let weighted = 0;
  for (const entry of lex) {
    const c = hits.get(entry.label) ?? 0;
    if (c > 0) weighted += entry.valence * c;
  }
  const valence = Math.max(-1, Math.min(1, weighted / totalHits));
  const confidence = Math.min(1, totalHits / 4);
  return { valence, label: dominant, confidence };
}

/* ── Pretty labels for the chart legend ─────────────────────────── */
export const LABEL_KO: Record<EmotionLabel, string> = {
  anxious:  "불안",
  sad:      "슬픔",
  angry:    "분노",
  lonely:   "외로움",
  hopeless: "절망",
  guilty:   "죄책감",
  calm:     "평안",
  grateful: "감사",
  joyful:   "기쁨",
  hopeful:  "희망",
  loved:    "사랑",
};

export const LABEL_EN: Record<EmotionLabel, string> = {
  anxious:  "Anxious",
  sad:      "Sad",
  angry:    "Angry",
  lonely:   "Lonely",
  hopeless: "Hopeless",
  guilty:   "Guilty",
  calm:     "Calm",
  grateful: "Grateful",
  joyful:   "Joyful",
  hopeful:  "Hopeful",
  loved:    "Loved",
};

export function labelFor(label: EmotionLabel | null, lang: string): string {
  if (!label) return "";
  return lang === "ko" ? LABEL_KO[label] : LABEL_EN[label];
}
