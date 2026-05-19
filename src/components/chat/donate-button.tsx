"use client";

import * as React from "react";
import { useLanguage } from "@/components/language-provider";
import { DonateModal } from "@/components/chat/donate-modal";

export function DonateButton() {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t.donate}
        aria-label={t.donate}
        className="flex h-9 items-center gap-1.5 rounded-full border border-selah-gold/25 bg-selah-gold/[0.06] px-3 text-[15px] text-selah-gold transition-colors hover:bg-selah-gold/[0.14]"
      >
        <span className="leading-none">🙏</span>
        <span className="hidden text-[13px] sm:inline">{t.donate}</span>
      </button>
      <DonateModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
