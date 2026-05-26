"use client";

import * as React from "react";
import { X, Phone, LifeBuoy } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings, hotlinesFor } from "@/lib/feature-strings";
import { cn } from "@/lib/utils";

/**
 * A gentle, dismissable card surfaced when the client-side crisis
 * detector matches. Sits at the top of the message stream so the user
 * sees real-world resources immediately, alongside (not instead of)
 * SELAH's pastoral reply.
 *
 * Design choices:
 *  - Soft, warm border — not red/alarm coloured. We don't want this to
 *    feel like a punishment for sharing.
 *  - One tap to call. On desktop tel: links open the system handler.
 *  - Clear close button so the user retains control.
 */
export function CrisisCard({
  onClose,
}: {
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const lines = hotlinesFor(lang);

  return (
    <div
      role="region"
      aria-label={fs.crisisTitle}
      className="mx-auto mb-5 w-full max-w-2xl animate-rise rounded-2xl border border-amber-200/30 bg-amber-200/[0.06] p-5 shadow-soft"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/30 bg-amber-200/[0.08] text-amber-200">
          <LifeBuoy className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-amber-100">
            {fs.crisisTitle}
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-selah-cream2">
            {fs.crisisBody}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={fs.crisisDismiss}
          className="ml-1 rounded-full p-1 text-selah-cream3 transition-colors hover:bg-white/[0.04] hover:text-selah-cream"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-4 space-y-1.5">
        {lines.map((h) => {
          const isNumber = /^[\d\-+\s()]+$/.test(h.number);
          const href = isNumber
            ? `tel:${h.number.replace(/[\s\-()]/g, "")}`
            : `https://${h.number}`;
          return (
            <li key={h.label}>
              <a
                href={href}
                target={isNumber ? undefined : "_blank"}
                rel={isNumber ? undefined : "noopener noreferrer"}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-white/[0.025] px-4 py-2.5 transition-colors hover:border-amber-200/30 hover:bg-amber-200/[0.04]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] text-selah-cream">
                    {h.label}
                  </p>
                  {h.hours && (
                    <p className="text-[12px] text-selah-cream3">{h.hours}</p>
                  )}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-[14px] font-semibold tabular-nums",
                    "text-amber-100"
                  )}
                >
                  {isNumber && <Phone className="h-3.5 w-3.5" />}
                  <span>{h.number}</span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-selah-cream3/80">
        {fs.crisisDisclaimer}
      </p>
    </div>
  );
}
