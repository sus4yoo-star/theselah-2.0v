"use client";

import * as React from "react";
import { Type, Mic, Share2, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "selah_intro_done";

/**
 * Tiny three-card intro shown once per device on the chat screen.
 * Dismisses to `selah_intro_done = "1"` so it never reappears.
 *
 * Senior-first: large icons, generous text, a single "건너뛰기" / "다음" /
 * "시작하기" button at a time. No overlapping interactions.
 */
export function IntroTour() {
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const [step, setStep] = React.useState<number>(-1);

  React.useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      // small delay so the tour doesn't clash with the splash fade-out
      const t = setTimeout(() => setStep(0), 1100);
      return () => clearTimeout(t);
    } catch {
      /* ignore */
    }
  }, []);

  const close = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setStep(-1);
  }, []);

  if (step < 0) return null;

  const steps = [
    {
      icon: <Type className="h-7 w-7" />,
      title: fs.guideStep1Title,
      body: fs.guideStep1Body,
    },
    {
      icon: <Mic className="h-7 w-7" />,
      title: fs.guideStep2Title,
      body: fs.guideStep2Body,
    },
    {
      icon: <Share2 className="h-7 w-7" />,
      title: fs.guideStep3Title,
      body: fs.guideStep3Body,
    },
  ];
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-3xl border border-selah-gold/20 bg-selah-bg1/95 p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-selah-gold/30 bg-selah-gold/[0.08] text-selah-gold">
            {current.icon}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={fs.guideSkip}
            className="rounded-full p-1.5 text-selah-cream3 transition-colors hover:bg-white/5 hover:text-selah-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mb-2 font-serif text-xl font-medium text-selah-cream">
          {current.title}
        </h3>
        <p className="mb-6 text-[15px] leading-relaxed text-selah-cream2">
          {current.body}
        </p>

        <div className="mb-5 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                i === step ? "bg-selah-gold" : "bg-white/15"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-[14px] text-selah-cream2 transition-colors hover:bg-white/5"
          >
            {fs.guideSkip}
          </button>
          <button
            type="button"
            onClick={() => (isLast ? close() : setStep(step + 1))}
            className="flex-1 rounded-2xl bg-selah-gold px-4 py-3 text-[14px] font-semibold text-selah-bg transition hover:brightness-110 active:scale-[0.98]"
          >
            {isLast ? fs.guideDone : fs.guideNext}
          </button>
        </div>
      </div>
    </div>
  );
}
