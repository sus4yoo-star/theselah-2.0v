"use client";

import * as React from "react";
import { X, Copy, Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const KAKAO_URL = "https://qr.kakaopay.com/Ej8e6adEv";
const PAYPAL_URL = "https://www.paypal.com/ncp/payment/N29LYULR9V5A4";
const BANK_NAME = "토스뱅크";
const BANK_NUM = "1002-4843-0808";
const HOLDER = "유상철 (아모브)";

export function DonateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_NUM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.donateAccount, BANK_NUM);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-selah-gold/20 bg-selah-bg1 shadow-[0_30px_90px_rgba(0,0,0,0.55)] animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-selah-cream3 transition-colors hover:bg-white/5 hover:text-selah-cream"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pb-7 pt-9 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-selah-gold/25 bg-selah-gold/[0.08] text-2xl">
            🙏
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold tracking-wide text-selah-gold">
            {t.donateTitle}
          </h2>
          <p className="mx-auto mb-6 max-w-xs text-[14px] leading-relaxed text-selah-cream2">
            {t.donateSub}
          </p>

          {/* KakaoPay */}
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 flex items-center gap-3 rounded-2xl border border-selah-gold/15 bg-selah-bg2 px-4 py-3.5 text-left transition-colors hover:border-selah-gold/40 hover:bg-selah-bg3"
          >
            <span className="text-xl">💛</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-selah-cream">
                {t.donateKakao}
              </span>
              <span className="block text-[12px] text-selah-cream3">
                {t.donateKakaoDesc}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-selah-gold" />
          </a>

          {/* PayPal — for international supporters worldwide */}
          <a
            href={PAYPAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 flex items-center gap-3 rounded-2xl border border-[#0070ba]/30 bg-[#0070ba]/[0.08] px-4 py-3.5 text-left transition-colors hover:border-[#0070ba]/55 hover:bg-[#0070ba]/[0.16]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-xl">🌍</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-selah-cream">
                {t.donatePaypal}
              </span>
              <span className="block text-[12px] text-selah-cream3">
                {t.donatePaypalDesc}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#3b9ae1]" />
          </a>

          {/* Bank transfer */}
          <div className="rounded-2xl border border-white/[0.06] bg-selah-bg/60 px-4 py-4 text-left">
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-selah-gold">
              📋 {t.donateBankLabel}
            </div>
            <Row k={t.donateBank} v={BANK_NAME} />
            <Row k={t.donateAccount} v={BANK_NUM}>
              <button
                onClick={copyAccount}
                className={cn(
                  "ml-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors",
                  copied
                    ? "border-emerald-400/30 text-emerald-300"
                    : "border-selah-gold/25 text-selah-gold hover:bg-selah-gold/10"
                )}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? t.donateCopied : t.donateCopy}
              </button>
            </Row>
            <Row k={t.donateHolder} v={HOLDER} last />
          </div>

          <p className="mt-5 text-[12px] leading-relaxed text-selah-cream3">
            {t.donateNote}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  children,
  last,
}: {
  k: string;
  v: string;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center py-2 text-[14px]",
        !last && "border-b border-white/[0.05]"
      )}
    >
      <span className="w-20 shrink-0 text-selah-cream3">{k}</span>
      <span className="flex-1 truncate font-medium text-selah-cream">
        {v}
      </span>
      {children}
    </div>
  );
}
