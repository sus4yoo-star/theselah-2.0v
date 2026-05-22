"use client";

import * as React from "react";
import { MessageCircle, Send } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  FeedbackModal,
  feedbackLabel,
  type FeedbackKind,
} from "@/components/chat/feedback-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * Header button shaped like a praying hand. Tapping it opens a small menu
 * with two actions — leave feedback, or send an inquiry. Both reuse
 * FeedbackModal under the hood, passing `kind` so the copy and storage
 * tag differ.
 */
export function PrayerMenu() {
  const { lang } = useLanguage();
  const [open, setOpen] = React.useState<FeedbackKind | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-9 items-center gap-1.5 rounded-full border border-selah-gold/25 bg-selah-gold/[0.06] px-3 text-[15px] text-selah-gold outline-none transition-colors hover:bg-selah-gold/[0.14]"
          aria-label="Feedback and contact"
        >
          <span className="leading-none">🙏</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              // Defer one tick so the dropdown fully closes before the
              // modal mounts (Radix needs to restore body pointer-events).
              setTimeout(() => setOpen("feedback"), 0);
            }}
          >
            <MessageCircle className="h-4 w-4" />
            {feedbackLabel(lang, "feedback")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setOpen("inquiry"), 0);
            }}
          >
            <Send className="h-4 w-4" />
            {feedbackLabel(lang, "inquiry")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FeedbackModal
        open={open !== null}
        onClose={() => setOpen(null)}
        kind={open ?? "feedback"}
      />
    </>
  );
}
