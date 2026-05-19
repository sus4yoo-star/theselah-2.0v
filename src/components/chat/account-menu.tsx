"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, LogOut, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { FeedbackModal, feedbackLabel } from "@/components/chat/feedback-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({ email }: { email: string }) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [fbOpen, setFbOpen] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-selah-cream2 outline-none transition-colors hover:border-selah-gold/40 hover:text-selah-cream"
          aria-label="Account"
        >
          <User className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-3 py-2 text-[12px] text-selah-cream3">
            <div className="truncate">{email || "—"}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              // Defer one tick so the menu fully closes (and Radix restores
              // body pointer-events) before the modal mounts.
              setTimeout(() => setFbOpen(true), 0);
            }}
          >
            <MessageCircle className="h-4 w-4" />
            {feedbackLabel(lang)}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              if (!busy) signOut();
            }}
            className="text-red-300 focus:text-red-200"
          >
            <LogOut className="h-4 w-4" />
            {t.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FeedbackModal open={fbOpen} onClose={() => setFbOpen(false)} />
    </>
  );
}
