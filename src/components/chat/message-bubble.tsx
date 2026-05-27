"use client";

import * as React from "react";
import { Share2, Copy, Check, Volume2, Square, Image as ImageIcon, Star } from "lucide-react";
import type { ChatMessage, LangCode } from "@/lib/types";
import { parseAI, stripTagsForLive } from "@/lib/format";
import { bibleMeta } from "@/lib/bible";
import { getFeatureStrings } from "@/lib/feature-strings";
import { ttsSpeak, ttsStop, ttsSupported } from "@/lib/tts";
import { useViewSettings } from "@/components/view-settings-provider";
import { isFavorited, toggleFavorite } from "@/lib/favorites";
import { buildCardSvg, svgToPngBlob, downloadBlob } from "@/lib/share-card";
import { cn } from "@/lib/utils";

/**
 * Expanded action bar pinned to the prayer / "당신에게 건네는 말" section.
 *
 *  - Web Share (mobile native share sheet — KakaoTalk, IG, Messages…)
 *  - Copy to clipboard
 *  - Save as 1080×1080 PNG card (Instagram-ready, no html2canvas needed)
 *  - Read aloud (Web Speech Synthesis) — toggle play/stop
 *  - Favorite (localStorage; appears in the sidebar Favorites tab)
 *
 * Auto-TTS: when `ttsAuto` is on in view-settings, the message reads
 * itself once on first render (after streaming completes).
 */
function PrayerShareActions({
  messageId,
  sessionId,
  text,
  lang,
  variant,
  brandLabel,
}: {
  messageId: string;
  sessionId: string | null;
  text: string;
  lang: LangCode;
  variant: "selah" | "manna";
  brandLabel: string;
}) {
  const fs = getFeatureStrings(lang);
  const { ttsAuto } = useViewSettings();
  const [copied, setCopied] = React.useState(false);
  const [imageSaved, setImageSaved] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const [hasTts, setHasTts] = React.useState(false);
  const [fav, setFav] = React.useState(false);
  const autoSpokeRef = React.useRef(false);

  React.useEffect(() => {
    setHasTts(ttsSupported());
    setFav(isFavorited(messageId));
  }, [messageId]);

  // Auto-read once when the message arrives, if user enabled auto TTS.
  React.useEffect(() => {
    if (!ttsAuto || !text || autoSpokeRef.current) return;
    if (!ttsSupported()) return;
    autoSpokeRef.current = true;
    setSpeaking(true);
    ttsSpeak(text, lang, {
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
    return () => {
      ttsStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsAuto, text]);

  const composed = React.useMemo(() => {
    // Prayer text is the whole share payload. The scripture reference belongs
    // to a different section of the AI reply and was leaking into prayer shares
    // (e.g. "기도하는 내용 — 시편 23:1"), which made KakaoTalk previews look
    // wrong. Prayers stand alone now.
    return text.trim();
  }, [text]);

  const canShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(composed);
      } else {
        const ta = document.createElement("textarea");
        ta.value = composed;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ text: composed });
    } catch {
      handleCopy();
    }
  };

  const handleSaveImage = async () => {
    try {
      const svg = buildCardSvg({
        variant,
        shape: "prayer",         // ← no reference on prayer cards
        brandLabel,
        tagline: variant === "selah" ? "Pause before you respond" : "Walk with you",
        body: text,
        footer: variant === "selah" ? "selah.theamov.com" : "manna.amov.kr",
      });
      // svgToPngBlob defaults to 1080×1920 now — matches the new card shape.
      const blob = await svgToPngBlob(svg);

      const file = new File([blob], `${variant}-${Date.now()}.png`, {
        type: "image/png",
      });
      const shareData: any = { files: [file] };
      const canFileShare =
        typeof navigator.share === "function" &&
        typeof (navigator as any).canShare === "function" &&
        (navigator as any).canShare(shareData);
      if (canFileShare) {
        try {
          await (navigator as any).share(shareData);
          setImageSaved(true);
          setTimeout(() => setImageSaved(false), 1600);
          return;
        } catch {
          /* user cancelled — fall through to download */
        }
      }
      downloadBlob(blob, `${variant}-${Date.now()}.png`);
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const handleTts = () => {
    if (!hasTts) return;
    if (speaking) {
      ttsStop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    ttsSpeak(text, lang, {
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const handleFav = () => {
    const now = toggleFavorite({
      id: messageId,
      sessionId,
      content: text,
      language: lang,
      savedAt: Date.now(),
    });
    setFav(now);
  };

  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-amber-200/10 pt-2.5">
      <button
        type="button"
        onClick={handleFav}
        aria-label={fav ? fs.unfavorite : fs.favorite}
        title={fav ? fs.unfavorite : fs.favorite}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors",
          fav
            ? "border-amber-200/60 bg-amber-200/[0.12] text-amber-100"
            : "border-amber-200/25 text-amber-200/90 hover:bg-amber-200/[0.06]"
        )}
      >
        <Star className={cn("h-3.5 w-3.5", fav && "fill-current")} />
      </button>

      {hasTts && (
        <button
          type="button"
          onClick={handleTts}
          aria-label={speaking ? fs.ttsStop : fs.ttsPlay}
          title={speaking ? fs.ttsStop : fs.ttsPlay}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors",
            speaking
              ? "border-amber-200/60 bg-amber-200/[0.12] text-amber-100 animate-pulse"
              : "border-amber-200/25 text-amber-200/90 hover:bg-amber-200/[0.06]"
          )}
        >
          {speaking ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
          {speaking ? fs.ttsStop : fs.ttsPlay}
        </button>
      )}

      <button
        type="button"
        onClick={handleSaveImage}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/25 px-3 py-1 text-[12px] text-amber-200/90 transition-colors hover:bg-amber-200/[0.06]"
      >
        {imageSaved ? <Check className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
        {imageSaved ? fs.imageSaved : fs.saveAsImage}
      </button>

      {canShare && (
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/25 px-3 py-1 text-[12px] text-amber-200/90 transition-colors hover:bg-amber-200/[0.06]"
        >
          <Share2 className="h-3.5 w-3.5" />
          {fs.shareWords}
        </button>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/25 px-3 py-1 text-[12px] text-amber-200/90 transition-colors hover:bg-amber-200/[0.06]"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? fs.copied : fs.copy}
      </button>
    </div>
  );
}

type SectionTone =
  | "emotion"
  | "scripture"
  | "direction"
  | "hope"
  | "prayer";

function Section({
  label,
  tone,
  children,
}: {
  label: string;
  tone: SectionTone;
  children: React.ReactNode;
}) {
  const accent =
    tone === "emotion"
      ? "text-sky-300/90 before:bg-sky-300/70"
      : tone === "scripture"
        ? "text-selah-gold before:bg-selah-gold"
        : tone === "direction"
          ? "text-selah-cream2 before:bg-selah-cream3"
          : tone === "hope"
            ? "text-emerald-300/90 before:bg-emerald-300/70"
            : "text-amber-200 before:bg-amber-200";

  const box =
    tone === "scripture"
      ? "border-selah-gold/25 bg-selah-gold/[0.06]"
      : tone === "prayer"
        ? "border-amber-200/20 bg-amber-200/[0.05]"
        : "border-white/5 bg-white/[0.025]";

  return (
    <section className={cn("border-t px-5 py-4 first:border-t-0", box)}>
      <div
        className={cn(
          "mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] before:h-3 before:w-[3px] before:rounded-full",
          accent
        )}
      >
        {label}
      </div>
      <div
        className="leading-7 text-selah-cream2"
        style={{ fontSize: "var(--chat-font-size, 15px)" }}
      >
        {children}
      </div>
    </section>
  );
}

function labels(lang: LangCode) {
  if (lang === "ko") {
    return {
      empathy: "공감",
      scripture: "오늘 하나님이 주시는 말씀",
      direction: "지금의 방향",
      hope: "소망",
      prayer: "함께 드리는 기도",
    };
  }

  return {
    empathy: "Empathy",
    scripture: "Bible Verse",
    direction: "Direction",
    hope: "Hope",
    prayer: "Prayer",
  };
}

export function MessageBubble({
  message,
  lang,
  sessionId = null,
}: {
  message: ChatMessage;
  lang: LangCode;
  sessionId?: string | null;
}) {
  if (message.role === "user") {
    return (
      <div className="ml-auto max-w-[78%]">
        <div className="mb-1 text-right text-[11px] uppercase tracking-[0.2em] text-selah-cream3">
          You
        </div>
        {message.image && (
          <img
            src={message.image}
            alt=""
            className="mb-2 ml-auto max-h-72 w-auto rounded-2xl rounded-tr-sm border border-sky-300/20 object-contain"
          />
        )}
        {message.content && (
          <div
            className="rounded-2xl rounded-tr-sm border border-sky-300/20 bg-sky-400/20 px-4 py-3 leading-7 text-selah-cream1 shadow-soft"
            style={{ fontSize: "var(--chat-font-size, 15px)" }}
          >
            {message.content}
          </div>
        )}
      </div>
    );
  }

  const parsed = parseAI(message.content, lang);

  if (message.pending && !parsed.structured) {
    const live = stripTagsForLive(message.content);

    return (
      <div className="mr-auto max-w-[78%]">
        <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-selah-cream3">
          SELAH
        </div>
        <div
          className="rounded-2xl rounded-tl-sm border border-selah-gold/10 bg-selah-bg2/80 px-4 py-3 leading-7 text-selah-cream2 shadow-soft"
          style={{ fontSize: "var(--chat-font-size, 15px)" }}
        >
          {live}
          <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-selah-gold align-middle" />
        </div>
      </div>
    );
  }

  if (!parsed.structured) {
    return (
      <div className="mr-auto max-w-[78%]">
        <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-selah-cream3">
          SELAH
        </div>
        <div
          className="whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-selah-gold/10 bg-selah-bg2/80 px-4 py-3 leading-7 text-selah-cream2 shadow-soft"
          style={{ fontSize: "var(--chat-font-size, 15px)" }}
        >
          {parsed.raw}
          {message.pending && (
            <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-selah-gold align-middle" />
          )}
        </div>
      </div>
    );
  }

  const bm = bibleMeta(lang);
  const l = labels(lang);

  /**
   * Backward compatibility:
   * If an older saved answer has analysis/wisdom/comfort, render it
   * under the new section names so old conversations do not disappear.
   */
  const directionText = parsed.direction || parsed.wisdom || parsed.analysis;
  const hopeText = parsed.hope || parsed.comfort;

  return (
    <div className="mr-auto max-w-[78%]">
      <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-selah-cream3">
        SELAH
      </div>

      <div className="overflow-hidden rounded-2xl rounded-tl-sm border border-selah-gold/10 bg-selah-bg2/80 shadow-soft">
        {parsed.emotion && (
          <Section label={l.empathy} tone="emotion">
            {parsed.emotion}
          </Section>
        )}

        {parsed.scripture && (
          <Section label={l.scripture} tone="scripture">
            <p className="mb-3 text-[16px] leading-8 text-selah-cream1">
              “{parsed.scripture.text}”
            </p>
            <p className="mb-3 text-sm text-selah-gold">
              — {parsed.scripture.ref} ({bm.version})
            </p>
            {parsed.scripture.application && (
              <p className="border-t border-selah-gold/10 pt-3 text-[14px] leading-7 text-selah-cream2">
                {parsed.scripture.application}
              </p>
            )}
          </Section>
        )}

        {directionText && (
          <Section label={l.direction} tone="direction">
            {directionText}
          </Section>
        )}

        {hopeText && (
          <Section label={l.hope} tone="hope">
            {hopeText}
          </Section>
        )}

        {parsed.prayer && (
          <Section label={l.prayer} tone="prayer">
            <p
              className="whitespace-pre-wrap"
              style={{ fontSize: "var(--chat-font-size, 15px)" }}
            >
              {parsed.prayer}
            </p>
            {!message.pending && (
              <PrayerShareActions
                messageId={message.id}
                sessionId={sessionId}
                text={parsed.prayer}
                lang={lang}
                variant="selah"
                brandLabel="SELAH"
              />
            )}
          </Section>
        )}

        {message.pending && (
          <div className="px-5 py-3">
            <span className="inline-block h-4 w-[2px] animate-pulse bg-selah-gold align-middle" />
          </div>
        )}
      </div>
    </div>
  );
}
