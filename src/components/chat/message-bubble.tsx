"use client";

import * as React from "react";
import type { ChatMessage, LangCode } from "@/lib/types";
import { parseAI, stripTagsForLive } from "@/lib/format";
import { bibleMeta } from "@/lib/bible";
import { cn } from "@/lib/utils";

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
      <div className="text-[15px] leading-7 text-selah-cream2">{children}</div>
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
          <div className="rounded-2xl rounded-tr-sm border border-sky-300/20 bg-sky-400/20 px-4 py-3 text-[15px] leading-7 text-selah-cream1 shadow-soft">
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
        <div className="rounded-2xl rounded-tl-sm border border-selah-gold/10 bg-selah-bg2/80 px-4 py-3 text-[15px] leading-7 text-selah-cream2 shadow-soft">
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
        <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-selah-gold/10 bg-selah-bg2/80 px-4 py-3 text-[15px] leading-7 text-selah-cream2 shadow-soft">
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
            <p className="whitespace-pre-wrap">{parsed.prayer}</p>
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
