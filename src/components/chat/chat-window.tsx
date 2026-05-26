"use client";

import * as React from "react";
import type { ChatMessage } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { LanguageSelector } from "@/components/language-selector";
import { FontSizeControl } from "@/components/chat/font-size-control";
import { PrayerMenu } from "@/components/chat/prayer-menu";
import { AccountMenu } from "@/components/chat/account-menu";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { CrisisCard } from "@/components/chat/crisis-card";
import { Loader2, ChevronDown } from "lucide-react";

export function ChatWindow({
  email,
  messages,
  streaming,
  loadingMsgs,
  onSend,
  menuButton,
  crisisVisible,
  onDismissCrisis,
}: {
  email: string;
  messages: ChatMessage[];
  streaming: boolean;
  loadingMsgs: boolean;
  onSend: (text: string, image?: string) => void;
  menuButton: React.ReactNode;
  crisisVisible?: boolean;
  onDismissCrisis?: () => void;
}) {
  const { t, lang } = useLanguage();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // ── Smart auto-scroll ────────────────────────────────────────────────
  // The reader is "pinned" if they are within 80px of the bottom. While
  // pinned, new chunks of an assistant reply keep the view at the bottom.
  // If they scroll up to re-read, we stop snapping; auto-scroll resumes
  // only when they return near the bottom (or send a new message).
  const PIN_THRESHOLD = 80;
  const isPinnedRef = React.useRef(true);
  const [showJumpBtn, setShowJumpBtn] = React.useState(false);
  const prevUserCountRef = React.useRef(0);

  const updatePinned = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const pinned = distance < PIN_THRESHOLD;
    isPinnedRef.current = pinned;
    setShowJumpBtn(!pinned);
  }, []);

  const scrollToBottom = React.useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    isPinnedRef.current = true;
    setShowJumpBtn(false);
  }, []);

  // Whenever messages change, decide whether to follow the bottom.
  React.useEffect(() => {
    // Force scroll when the USER just sent a new message — they should
    // always see their own message and the incoming reply.
    const userCount = messages.reduce(
      (n, m) => n + (m.role === "user" ? 1 : 0),
      0
    );
    if (userCount > prevUserCountRef.current) {
      prevUserCountRef.current = userCount;
      scrollToBottom(false);
      return;
    }
    prevUserCountRef.current = userCount;

    // Otherwise (assistant streaming, history load, etc.): only follow if
    // the reader is currently pinned to the bottom.
    if (isPinnedRef.current) scrollToBottom(false);
  }, [messages, loadingMsgs, scrollToBottom]);

  const empty = messages.length === 0;
  const lastPendingEmpty =
    streaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content.trim() === "";

  return (
    <div className="flex h-full flex-col">
      {/* Header — reserves the iOS status-bar / notch area via safe-area inset */}
      <header className="shrink-0 border-b border-selah-gold/15 bg-selah-bg1 pt-[env(safe-area-inset-top)]">
        <div className="flex h-[60px] items-center gap-2 px-3 sm:px-4">
          {menuButton}
          <div className="font-display text-xl font-semibold tracking-[0.16em] text-selah-gold lg:hidden">SELAH</div>
          <div className="ml-auto flex items-center gap-2">
            <PrayerMenu />
            <FontSizeControl />
            <LanguageSelector compact />
            <AccountMenu email={email} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={updatePinned}
          className="selah-scroll h-full overflow-y-auto px-4 py-6"
          // Lets descendants opt into the responsive size via the variable.
          style={{ ["--chat-font-size" as any]: undefined }}
        >
        {crisisVisible && onDismissCrisis && (
          <CrisisCard onClose={onDismissCrisis} />
        )}

        {loadingMsgs ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-selah-gold/70" />
          </div>
        ) : empty && !crisisVisible ? (
          <div className="mx-auto mt-6 max-w-xl text-center animate-rise sm:mt-12">
            <h2 className="mb-2.5 font-serif text-xl font-medium text-selah-cream sm:text-2xl">
              {t.welcomeTitle}
            </h2>
            <p className="mb-7 text-[15px] leading-relaxed text-selah-cream2">
              {t.welcomeDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {t.examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() =>
                    onSend(
                      ex
                        .replace(
                          /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u,
                          ""
                        )
                        .trim()
                    )
                  }
                  className="rounded-full border border-selah-gold/20 bg-selah-bg1 px-4 py-2.5 text-[14px] text-selah-cream2 transition-colors hover:border-selah-gold hover:bg-selah-gold/[0.08] hover:text-selah-gold"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} lang={lang} />
            ))}
            {lastPendingEmpty && (
              <div className="mx-auto mb-5 flex w-full max-w-2xl items-center gap-2 text-[14px] text-selah-cream3">
                <Loader2 className="h-4 w-4 animate-spin text-selah-gold/70" />
                {t.thinking}
              </div>
            )}
          </>
        )}
        </div>

        {/* Floating "jump to latest" button — shows when user has scrolled up */}
        {showJumpBtn && (
          <button
            onClick={() => scrollToBottom(true)}
            aria-label="Scroll to latest"
            className="absolute bottom-4 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-selah-gold/30 bg-selah-bg1/90 text-selah-gold shadow-lg backdrop-blur-sm transition-colors hover:border-selah-gold/60 hover:bg-selah-bg1"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={streaming} />
    </div>
  );
}
