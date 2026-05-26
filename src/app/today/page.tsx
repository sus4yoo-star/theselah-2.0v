"use client";

import * as React from "react";
import Link from "next/link";
import { Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmovFooter } from "@/components/amov-footer";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";

/**
 * "오늘의 한 줄" — a daily verse + reflection card.
 *
 * Deterministic by day so the card stays stable for ~24h. Each day
 * the page picks one entry from a curated bank using
 * `dayIndex = floor(unixDays) % bank.length`. No server / DB needed.
 *
 * Designed to be share-friendly: tap the share button to send to
 * KakaoTalk / Messages / Instagram via the Web Share API.
 */
const KO_BANK: { verse: string; ref: string; reflection: string }[] = [
  {
    verse: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
    ref: "마태복음 11:28",
    reflection:
      "오늘 마음에 진 짐이 있다면, 그 짐을 그대로 들고 와도 됩니다. 먼저 쉬고, 그다음에 걸어가도 늦지 않습니다.",
  },
  {
    verse: "여호와는 마음이 상한 자를 가까이 하시고 충심으로 통회하는 자를 구원하시는도다",
    ref: "시편 34:18",
    reflection:
      "상한 자리를 부끄러워하지 않아도 됩니다. 그 자리에 가장 가까이 와 계시는 분이 있습니다.",
  },
  {
    verse: "내가 평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라",
    ref: "요한복음 14:27",
    reflection:
      "오늘 받을 평안은 세상이 주는 평안과 다릅니다. 결과가 정리되기 전에도 마음을 머무르게 합니다.",
  },
  {
    verse: "내가 너희를 위하여 생각하는 생각을 내가 아나니 평안이요 재앙이 아니니라",
    ref: "예레미야 29:11",
    reflection:
      "지금 보이는 길이 흐릿해도, 당신을 향한 선한 마음은 흐려지지 않습니다.",
  },
  {
    verse: "두려워하지 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라",
    ref: "이사야 41:10",
    reflection:
      "두려움이 사라지는 것이 아니라, 두려움 한가운데 함께 있어 주시는 분이 있다는 약속입니다.",
  },
  {
    verse: "사랑은 오래 참고 사랑은 온유하며 시기하지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며",
    ref: "고린도전서 13:4",
    reflection:
      "오늘 누군가에게 그런 사랑이 되기 어려운 날이라면, 나에게 먼저 그렇게 대해주세요.",
  },
  {
    verse: "범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라",
    ref: "데살로니가전서 5:18",
    reflection:
      "큰 일을 감사하라는 게 아닙니다. 오늘 가능한 한 가지를 떠올려 보세요.",
  },
];

function todayIndex(bankLen: number): number {
  // Unix days, anchored so the same calendar day worldwide gets the
  // same entry within a small window. (Not perfectly TZ-correct, but
  // good enough for a single daily card.)
  const days = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  return ((days % bankLen) + bankLen) % bankLen;
}

export default function TodayPage() {
  const { t, lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const [busyShare, setBusyShare] = React.useState(false);

  // Pick today's entry (memoized so re-renders stay stable).
  const entry = React.useMemo(() => KO_BANK[todayIndex(KO_BANK.length)], []);

  const shareText = `${entry.verse}\n— ${entry.ref}\n\n${entry.reflection}\n\nselah.theamov.com`;

  const onShare = async () => {
    setBusyShare(true);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text: shareText });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      /* user cancelled */
    } finally {
      setBusyShare(false);
    }
  };

  return (
    <main className="selah-aurora selah-scroll flex min-h-dvh flex-col items-center overflow-y-auto px-6 pb-12 pt-[max(48px,calc(env(safe-area-inset-top)+24px))]">
      <div className="absolute right-5 top-[max(20px,env(safe-area-inset-top))]">
        <LanguageSelector compact />
      </div>

      <div className="flex w-full max-w-md flex-col items-center">
        <div className="relative mb-5 flex h-20 w-28 items-center justify-center animate-fade-in">
          <img
            src="/symbol-transparent.png"
            alt=""
            className="relative h-20 w-28 object-contain drop-shadow-[0_0_22px_rgba(212,175,55,0.38)]"
          />
        </div>

        <p
          className="mb-1 text-center text-[12px] tracking-[0.18em] text-selah-cream3 animate-rise"
          style={{ animationDelay: "0.08s" }}
        >
          {fs.todayTitle}
        </p>
        <p
          className="mb-7 text-center text-[13px] text-selah-cream3 animate-rise"
          style={{ animationDelay: "0.12s" }}
        >
          {fs.todaySubtitle}
        </p>

        <blockquote
          className="verse-card mb-5 w-full rounded-r-xl px-5 py-5 text-left animate-rise"
          style={{ animationDelay: "0.18s" }}
        >
          <p className="font-serif text-[17px] italic leading-relaxed text-selah-cream/95">
            “{entry.verse}”
          </p>
          <cite className="mt-2 block text-[13px] not-italic tracking-wide text-selah-gold">
            — {entry.ref}
          </cite>
        </blockquote>

        <p
          className="mb-8 text-center text-[15px] leading-relaxed text-selah-cream2 animate-rise"
          style={{ animationDelay: "0.26s" }}
        >
          {entry.reflection}
        </p>

        <button
          type="button"
          onClick={onShare}
          disabled={busyShare}
          className="mb-3 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl border border-selah-gold/30 px-5 py-3 text-[14px] font-medium text-selah-gold transition hover:bg-selah-gold/[0.08] active:scale-[0.98] animate-rise"
          style={{ animationDelay: "0.32s" }}
        >
          <Share2 className="h-4 w-4" />
          {fs.todayShare}
        </button>

        <Button asChild size="lg" className="w-full max-w-xs animate-rise" style={{ animationDelay: "0.36s" }}>
          <Link href="/chat">
            {fs.todayOpenApp}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <AmovFooter />
      </div>
    </main>
  );
}
