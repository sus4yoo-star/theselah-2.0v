/**
 * Client-side crisis-keyword detector.
 *
 * Intentionally sensitive: the cost of *missing* someone in distress is far
 * higher than the cost of showing a gentle help card when it wasn't strictly
 * needed. So we accept some false positives ("better to surface than to
 * miss"). The card itself is soft and dismissable, never alarming.
 *
 * Coverage spans all 30 languages SELAH ships. Korean and English are the
 * most carefully tuned (primary audiences); the rest target the unmistakable
 * signals — the word "suicide", "kill myself", "want to die", "self-harm"
 * and close equivalents — in each language. These are detection keywords
 * only; they never produce a phone number.
 *
 * Returns `true` if any pattern matches.
 */

// ── Korean ──────────────────────────────────────────────────────────────
const KO_PATTERNS: RegExp[] = [
  /자살/,
  /자해/,
  /목숨[을이]?\s*끊/,
  /죽고\s*싶/,
  /사라지고\s*싶/,
  /더\s*못\s*살/,
  /살기\s*싫/,
  /끝내고\s*싶/,
  /때려요|때렸|폭행|학대받/, // abuse / immediate danger
];

// ── English ─────────────────────────────────────────────────────────────
const EN_PATTERNS: RegExp[] = [
  /\b(suicide|suicidal|kill myself|killing myself)\b/i,
  /\b(end my life|end it all|don'?t want to (live|be alive))\b/i,
  /\b(want to die|wanna die|wish i (were|was) dead)\b/i,
  /\bself[\s-]?harm(?:ing)?\b/i,
  /\bcutting myself\b/i,
  /\bhurt myself\b/i,
  /\b(he|she|they)\s+(hits?|hit|beats?|beat|hurts?|hurt)\s+me\b/i,
  /\bbeing abused\b/i,
];

// ── All other supported languages ───────────────────────────────────────
// One block per language. For non-Latin scripts we match substrings (word
// boundaries don't apply); for Latin scripts we use the case-insensitive
// flag. Over-triggering is acceptable by design.
const MULTI_PATTERNS: RegExp[] = [
  // Japanese
  /自殺/, /死にたい/, /消えたい/, /自傷/, /リストカット/,
  // Chinese (Simplified & Traditional)
  /自杀|自殺/, /想死/, /不想活/, /活不下去/, /自残|自殘/,
  // Spanish
  /suicid/i, /quiero morir/i, /no quiero vivir/i, /matarme/i,
  /hacerme daño/i, /autolesi/i,
  // Portuguese
  /suicíd|suicid/i, /quero morrer/i, /não quero viver/i, /me matar|matar-me/i,
  /me machucar/i, /automutil|autoles/i,
  // French
  /suicid/i, /veux mourir|envie de mourir/i, /me tuer/i, /me faire du mal/i,
  /automutil/i,
  // German
  /suizid|selbstmord/i, /sterben will|will sterben/i, /umbringen/i,
  /selbstverletz/i, /nicht mehr leben/i,
  // Italian
  /suicid/i, /voglio morire/i, /uccidermi/i, /farmi del male/i, /autolesion/i,
  // Dutch
  /zelfmoord|suïcid|suicid/i, /dood wil|wil dood/i, /mezelf pijn/i,
  /zelfbeschadig/i,
  // Russian
  /суицид|самоуб/i, /хочу умереть/i, /убить себя/i, /не хочу жить/i,
  /покончить с собой/i, /самоповреж/i,
  // Ukrainian
  /суїцид|самогуб/i, /хочу померти/i, /вбити себе/i, /не хочу жити/i,
  /покінчити/i,
  // Polish
  /samobój/i, /chcę umrzeć/i, /zabić się/i, /nie chcę żyć/i, /samookalecz/i,
  // Czech
  /sebevraž/i, /chci zemřít/i, /zabít se/i, /nechci žít/i, /sebepoškoz/i,
  // Hungarian
  /öngyilkos/i, /meg akarok halni/i, /megölni magam/i, /nem akarok élni/i,
  // Romanian
  /sinucid/i, /vreau să mor/i, /să mă omor/i, /nu mai vreau să trăiesc/i,
  /automutil/i,
  // Turkish
  /intihar/i, /ölmek istiyorum/i, /kendimi öldür/i, /yaşamak istemiyorum/i,
  /kendime zarar/i,
  // Thai
  /ฆ่าตัวตาย/, /อยากตาย/, /ไม่อยากมีชีวิต/, /ทำร้ายตัวเอง/,
  // Vietnamese
  /tự tử|tự sát/i, /muốn chết/i, /không muốn sống/i, /tự làm hại|tự hại/i,
  // Indonesian
  /bunuh diri/i, /ingin mati|mau mati/i, /tidak ingin hidup/i,
  /menyakiti diri/i,
  // Malay
  /bunuh diri/i, /mahu mati|nak mati/i, /tidak mahu hidup/i,
  /mencederakan diri/i,
  // Filipino / Tagalog
  /magpakamatay/i, /gusto ko nang mamatay/i, /ayoko nang mabuhay/i,
  /saktan ang sarili/i,
  // Hindi
  /आत्महत्या/, /मरना चाहत/, /जीना नहीं चाहत/, /खुद को नुकसान/,
  // Bengali
  /আত্মহত্যা/, /মরতে চাই/, /বাঁচতে চাই না/,
  // Tamil
  /தற்கொலை/, /சாக வேண்டும்|இறக்க வேண்டும்/,
  // Telugu
  /ఆత్మహత్య/, /చనిపోవాలని|చావాలని/,
  // Arabic
  /انتحار/, /أريد أن أموت|اريد الموت/, /أقتل نفسي|اقتل نفسي/, /إيذاء النفس/,
  /لا أريد العيش/,
  // Persian / Farsi
  /خودکشی/, /می‌خواهم بمیرم|میخوام بمیرم/, /خودم را بکشم/,
  /نمی‌خواهم زندگی کنم/,
  // Swahili
  /kujiua/i, /nataka kufa/i, /sitaki kuishi/i, /kujidhuru/i,
];

export function detectCrisis(text: string): boolean {
  const s = String(text || "");
  if (!s) return false;
  for (const re of KO_PATTERNS) if (re.test(s)) return true;
  for (const re of EN_PATTERNS) if (re.test(s)) return true;
  for (const re of MULTI_PATTERNS) if (re.test(s)) return true;
  return false;
}
