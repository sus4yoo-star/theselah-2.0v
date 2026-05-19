"use client";

import * as React from "react";
import type { ChatMessage } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { LanguageSelector } from "@/components/language-selector";
import { DonateButton } from "@/components/chat/donate-button";
import { AccountMenu } from "@/components/chat/account-menu";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Loader2 } from "lucide-react";

export function ChatWindow({
  email,
  messages,
  streaming,
  loadingMsgs,
  onSend,
  menuButton,
}: {
  email: string;
  messages: ChatMessage[];
  streaming: boolean;
  loadingMsgs: boolean;
  onSend: (text: string, image?: string) => void;
  menuButton: React.ReactNode;
}) {
  const { t, lang } = useLanguage();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loadingMsgs]);

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
          <div className="font-display text-xl font-semibold tracking-[0.16em] text-selah-gold lg:hidden">
            SELAH
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DonateButton />
            <LanguageSelector compact />
            <AccountMenu email={email} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        ref={scrollRef}
        className="selah-scroll flex-1 overflow-y-auto px-4 py-6"
      >
        {loadingMsgs ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-selah-gold/70" />
          </div>
        ) : empty ? (
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

      {/* Input */}
      <ChatInput onSend={onSend} disabled={streaming} />
    </div>
  );
}
