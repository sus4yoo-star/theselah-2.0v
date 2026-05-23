"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import type {
  ChatSession,
  ChatMessage,
  Profile,
  LangCode,
} from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { createClient } from "@/lib/supabase/client";
import {
  createSession,
  renameSession,
  deleteSession,
  listMessages,
  saveMessage,
} from "@/lib/chat-data";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { cn } from "@/lib/utils";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function titleFromText(text: string): string {
  const clean = text
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "")
    .trim();
  return clean.length > 38 ? clean.slice(0, 38) + "…" : clean || "New Chat";
}

export function ChatApp({
  userId,
  userEmail,
  initialSessions,
  profile,
}: {
  userId: string;
  userEmail: string;
  initialSessions: ChatSession[];
  profile: Profile | null;
}) {
  const { t, lang } = useLanguage();

  const [sessions, setSessions] =
    React.useState<ChatSession[]>(initialSessions);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = React.useState(false);
  const [loadingMsgs, setLoadingMsgs] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  // Keep profile.language in sync with the UI language. The browser
  // preference (cookie + localStorage, set by LanguageProvider) is the
  // source of truth — NOT profile.language. For OAuth signups (Kakao /
  // Google) the DB trigger defaults profile.language to 'en' because no
  // language metadata is passed in the OAuth call, so pulling FROM profile
  // here would constantly flip the UI back to English for Korean users.
  // We push the other way instead: whenever the UI language differs from
  // what the profile holds, update the profile to match.
  React.useEffect(() => {
    if (!profile || profile.language === lang) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .update({ language: lang })
      .eq("id", userId)
      .then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const newChat = () => {
    setActiveId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const selectSession = async (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setLoadingMsgs(true);
    try {
      const rows = await listMessages(id);
      setMessages(
        rows.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          language: m.language as LangCode,
        }))
      );
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleRename = async (id: string, title: string) => {
    setSessions((s) =>
      s.map((x) => (x.id === id ? { ...x, title } : x))
    );
    try {
      await renameSession(id, title);
    } catch {
      /* keep optimistic update */
    }
  };

  const handleDelete = async (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    if (activeId === id) newChat();
    try {
      await deleteSession(id);
    } catch {
      /* ignore */
    }
  };

  const bumpSession = (id: string) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      return [{ ...item, updated_at: new Date().toISOString() }, ...copy];
    });
  };

  const sendMessage = async (text: string, image?: string) => {
    if (streaming) return;
    if (!text.trim() && !image) return;

    const displayContent =
      text.trim() || (image ? t.photoSent : "");

    // Ensure a session exists (created lazily on first message).
    let sessionId = activeId;
    if (!sessionId) {
      const title =
        text.trim() ? titleFromText(text) : image ? t.photoChat : "New Chat";
      try {
        const session = await createSession(userId, title);
        sessionId = session.id;
        setSessions((s) => [session, ...s]);
        setActiveId(session.id);
      } catch {
        // Fall back to an ephemeral in-memory conversation.
        sessionId = null;
      }
    }

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: displayContent,
      language: lang,
      image: image || undefined,
    };
    const aiId = uid();
    const aiMsg: ChatMessage = {
      id: aiId,
      role: "assistant",
      content: "",
      language: lang,
      pending: true,
    };

    const history = [...messages, userMsg];
    setMessages([...history, aiMsg]);
    setStreaming(true);

    if (sessionId) {
      // The image itself is not persisted (keeps storage light); the
      // caption / marker is saved so history stays readable.
      saveMessage(sessionId, "user", displayContent, lang).catch(() => {});
    }

    try {
      // For the model, send the raw text on the latest turn (empty is
      // fine — the server adds the image and a fallback instruction).
      const apiMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          bibleMode: true,
          image: image || undefined,
          sessionId,
          messages: apiMessages,
        }),
      });

      if (!res.ok || !res.body) {
        let msg = "SELAH could not respond. Please try again.";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          /* ignore */
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId
              ? { ...m, content: msg, pending: false }
              : m
          )
        );
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: full } : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId ? { ...m, content: full, pending: false } : m
        )
      );

      if (sessionId && full.trim()) {
        saveMessage(sessionId, "assistant", full, lang).catch(() => {});
        bumpSession(sessionId);
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? {
                ...m,
                content:
                  "The connection is unstable for a moment. Please try once more.",
                pending: false,
              }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-selah-bg">
      {/* Sidebar — desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-white/[0.06] lg:block">
        <ChatSidebar
          sessions={sessions}
          activeId={activeId}
          onNew={newChat}
          onSelect={selectSession}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </aside>

      {/* Sidebar — mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[82%] max-w-xs border-r border-white/[0.06] shadow-2xl transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <ChatSidebar
            sessions={sessions}
            activeId={activeId}
            onNew={newChat}
            onSelect={selectSession}
            onRename={handleRename}
            onDelete={handleDelete}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatWindow
          email={userEmail}
          messages={messages}
          streaming={streaming}
          loadingMsgs={loadingMsgs}
          onSend={sendMessage}
          menuButton={
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-selah-cream2 hover:text-selah-cream lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          }
        />
      </div>
    </div>
  );
}
