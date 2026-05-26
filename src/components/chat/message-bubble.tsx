"use client";

import * as React from "react";
import { Share2, Copy, Check } from "lucide-react";
import type { ChatMessage, LangCode } from "@/lib/types";
import { parseAI, stripTagsForLive } from "@/lib/format";
import { bibleMeta } from "@/lib/bible";
import { getFeatureStrings } from "@/lib/feature-strings";
import { cn } from "@/lib/utils";

/**
 * Small share/copy widget pinned to the prayer section.
 *
 * Uses the Web Share API on mobile (so the user gets the native share
 * sheet — KakaoTalk, Messages, etc.) and falls back to clipboard on
 * desktop / unsupported browsers.
 */
function PrayerShareActions({
  text,
  reference,
  lang,
}: {
  text: string;
  reference?: string;
  lang: LangCode;
}) {
  const fs = getFeatureStrings(lang);
  const [copied, setCopied] = React.useState(false);

  const composed = React.useMemo(() => {
    const body = text.trim();
    if (reference && reference.trim()) {
      return `${body}\n\n— ${reference.trim()}`;
    }
    return body;
  }, [text, reference]);

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
      // User cancelled or share failed silently; fall back to copy.
      handleCopy();
    }
  };

  return (
    <div className="mt-3 flex items-center justify-end gap-2 border-t border-amber-200/10 pt-2.5">
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
}: {
  message: ChatMessage;
  lang: LangCode;
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
                text={parsed.prayer}
                reference={parsed.scripture?.ref}
                lang={lang}
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
