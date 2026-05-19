/**
 * Picks a calm emoji for a session based on its title, so the sidebar
 * reads like the reference (📖 Genesis Study · 🙏 Prayer · 💔 Relationship
 * · 🌱 My Heart Today) without storing icons in the database.
 */
export function sessionIcon(title: string): string {
  const t = (title || "").toLowerCase();

  if (
    /(genesis|exodus|psalm|proverb|matthew|john|romans|bible|verse|scripture|study|창세|시편|잠언|복음|성경|말씀|聖|圣经|พระคัมภีร์|estudio|estudo|बाइबल)/.test(
      t
    )
  )
    return "📖";
  if (/(pray|prayer|기도|祷|อธิษฐาน|oración|oração|प्रार्थना)/.test(t))
    return "🙏";
  if (
    /(relationship|marriage|love|family|친구|관계|결혼|사랑|가족|关系|ความสัมพันธ์|relación|relacionamento|रिश्ता)/.test(
      t
    )
  )
    return "💔";
  if (
    /(heart|today|feel|emotion|마음|오늘|감정|心|วันนี้|corazón|coração|मन)/.test(
      t
    )
  )
    return "🌱";
  if (/(anx|fear|afraid|불안|두려|焦虑|กลัว|miedo|medo|डर)/.test(t))
    return "😨";
  if (/(thank|grat|감사|感恩|ขอบคุณ|gracias|obrigad|धन्यवाद)/.test(t))
    return "✨";

  return "💬";
}
