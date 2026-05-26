"use client";

import * as React from "react";
import { Heart, X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";

/**
 * Soft cross-promo card from SELAH → MANNA.
 *
 * Shown once per device after the user has had at least 3 real
 * conversations. Idea: a SELAH user who is going through a faith-neutral
 * grief / anxiety moment may welcome MANNA's faith-agnostic tone, and
 * vice versa. Dismissable; remembers via localStorage forever.
 */
const SEEN_KEY = "selah_cross_link_seen";
const MIN_SESSIONS = 3;

export function CrossLinkCard({
  sessionCount,
}: {
  sessionCount: number;
}) {
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (sessionCount < MIN_SESSIONS) return;
    try {
      if (localStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      return;
    }
    setVisible(true);
  }, [sessionCount]);

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mx-auto mb-5 w-full max-w-2xl rounded-2xl border border-selah-cream2/20 bg-selah-bg1/70 p-4 shadow-soft animate-rise">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-selah-cream2/25 bg-selah-cream2/[0.04] text-selah-cream2">
          <Heart className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-selah-cream">
            {fs.crossLinkSelahToMannaTitle}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-selah-cream2">
            {fs.crossLinkSelahToMannaBody}
          </p>
          <a
            href="https://manna.amov.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-selah-gold/30 px-3 py-1.5 text-[12px] font-medium text-selah-gold transition hover:bg-selah-gold/[0.08]"
            onClick={close}
          >
            {fs.crossLinkOpen}
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={fs.crossLinkDismiss}
          className="ml-1 rounded-full p-1 text-selah-cream3 transition-colors hover:bg-white/[0.04] hover:text-selah-cream"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
