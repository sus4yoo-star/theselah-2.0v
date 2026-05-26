/**
 * Client-side crisis-keyword detector.
 *
 * Intentionally conservative: we want to surface help when someone
 * may be at risk, but we also want to avoid making the experience
 * feel intrusive or surveillance-y. We trigger the help card only on
 * unmistakable signals.
 *
 * Returns `true` if any pattern matches. Multilingual but Korean/English
 * weighted because those are our primary audiences.
 */

// Patterns are split by language so we can tune per-locale without
// false-positive crosstalk (e.g. Korean "죽다" verb forms are common).
const KO_PATTERNS: RegExp[] = [
  // explicit suicidal ideation
  /자살/,
  /자해/,
  /목숨[을이]?\s*끊/,
  /죽고\s*싶/,
  /사라지고\s*싶/,
  /더\s*못\s*살/,
  /살기\s*싫/,
  /끝내고\s*싶/,
  // abuse / immediate danger
  /때려요|때렸|폭행|학대받/,
];

const EN_PATTERNS: RegExp[] = [
  /\b(suicide|suicidal|kill myself|killing myself)\b/i,
  /\b(end my life|end it all|don'?t want to (live|be alive))\b/i,
  /\b(want to die|wanna die|wish i (were|was) dead)\b/i,
  /\bself[\s-]?harm(?:ing)?\b/i,
  /\bcutting myself\b/i,
  /\bhurt myself\b/i,
  // direct abuse signals
  /\b(he|she|they)\s+(hits?|hit|beats?|beat|hurts?|hurt)\s+me\b/i,
  /\bbeing abused\b/i,
];

export function detectCrisis(text: string): boolean {
  const s = String(text || "");
  if (!s) return false;
  for (const re of KO_PATTERNS) if (re.test(s)) return true;
  for (const re of EN_PATTERNS) if (re.test(s)) return true;
  return false;
}
