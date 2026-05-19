"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="selah-aurora relative flex min-h-dvh flex-col items-center justify-center overflow-y-auto px-6 py-12 text-center selah-scroll">
      <div className="absolute right-5 top-[max(20px,env(safe-area-inset-top))]">
        <LanguageSelector compact />
      </div>

      <div className="flex w-full max-w-md flex-col items-center">
        {/* Official 새빛교회 symbol with a soft breathing aura */}
        <div className="relative mb-6 flex h-32 w-44 items-center justify-center animate-fade-in">
          <span
            className="absolute left-1/2 top-1/2 h-40 w-40 animate-breathe rounded-full bg-selah-gold/10 blur-2xl"
            aria-hidden
          />
          <img
            src="/symbol-transparent.png"
            alt="SELAH"
            className="relative h-32 w-44 object-contain drop-shadow-[0_0_26px_rgba(212,175,55,0.4)]"
          />
        </div>

        <h1
          className="mb-2 font-display text-5xl font-semibold tracking-[0.22em] text-selah-gold animate-rise"
          style={{ animationDelay: "0.05s" }}
        >
          SELAH
        </h1>
        <p
          className="mb-8 text-sm tracking-wide text-selah-cream3 animate-rise"
          style={{ animationDelay: "0.12s" }}
        >
          {t.tagline}
        </p>

        <p
          className="mb-7 max-w-sm text-[15px] leading-relaxed text-selah-cream2 animate-rise"
          style={{ animationDelay: "0.2s" }}
        >
          {t.introDesc}
        </p>

        <blockquote
          className="verse-card mb-9 w-full max-w-sm rounded-r-xl px-5 py-4 text-left animate-rise"
          style={{ animationDelay: "0.28s" }}
        >
          <p className="font-serif text-[15px] italic leading-relaxed text-selah-cream/90">
            “{t.verseText}”
          </p>
          <cite className="mt-2 block text-[13px] not-italic tracking-wide text-selah-gold">
            — {t.verseRef}
          </cite>
        </blockquote>

        <Button
          asChild
          size="lg"
          className="w-full max-w-xs animate-rise"
          style={{ animationDelay: "0.36s" }}
        >
          <Link href="/chat">
            {t.enter}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <p
          className="mt-8 max-w-xs text-xs leading-relaxed text-selah-cream3 animate-rise"
          style={{ animationDelay: "0.44s" }}
        >
          {t.note}
        </p>
      </div>
    </main>
  );
}
