"use client";

import * as React from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
} from "lucide-react";
import type { ChatSession } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";
import { Logo } from "@/components/logo";
import { AmovFooter } from "@/components/amov-footer";
import { sessionIcon } from "@/lib/session-icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  sessions,
  activeId,
  onNew,
  onSelect,
  onRename,
  onDelete,
  onClose,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}) {
  const { t, lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, query]);

  const startEdit = (s: ChatSession) => {
    setEditingId(s.id);
    setDraft(s.title);
  };

  const commitEdit = () => {
    if (editingId && draft.trim()) {
      onRename(editingId, draft.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full w-full flex-col bg-selah-bg1">
      <div className="flex items-center justify-between px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
        <Logo href="/" showSub />
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-selah-cream3 hover:text-selah-cream lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2.5 rounded-xl border border-selah-gold/25 bg-selah-gold/[0.06] px-4 py-3 text-[14px] font-medium text-selah-gold transition-colors hover:bg-selah-gold/[0.12]"
        >
          <Plus className="h-4 w-4" />
          {t.newChat}
        </button>
      </div>

      {sessions.length > 0 && (
        <div className="mt-3 px-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-selah-cream3" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={fs.searchPlaceholder}
              aria-label={fs.searchPlaceholder}
              className="w-full rounded-xl border border-white/[0.06] bg-selah-bg2/40 px-9 py-2 text-[13px] text-selah-cream placeholder:text-selah-cream3/60 focus:border-selah-gold/35 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-selah-cream3 hover:text-selah-cream"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 px-5 text-[11px] font-medium uppercase tracking-[0.14em] text-selah-cream3">
        {t.history}
      </div>

      <nav className="selah-scroll mt-2 flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-4">
        {sessions.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] leading-relaxed text-selah-cream3/70">
            {t.noSessions}
          </p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] leading-relaxed text-selah-cream3/70">
            {fs.searchNoResults}
          </p>
        ) : null}

        {filtered.map((s) => {
          const active = s.id === activeId;
          const editing = editingId === s.id;
          return (
            <div
              key={s.id}
              className={cn(
                "group flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
                active
                  ? "bg-selah-bg3/70 text-selah-cream"
                  : "text-selah-cream2 hover:bg-white/[0.04]"
              )}
            >
              <span className="shrink-0 text-base leading-none">
                {sessionIcon(s.title)}
              </span>

              {editing ? (
                <div className="flex flex-1 items-center gap-1">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-full rounded-md border border-selah-gold/30 bg-selah-bg px-2 py-1 text-[13px] text-selah-cream outline-none"
                  />
                  <button
                    onClick={commitEdit}
                    className="text-emerald-300"
                    aria-label="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-selah-cream3"
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onSelect(s.id)}
                    className="flex-1 truncate text-left"
                    title={s.title}
                  >
                    {s.title}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        "rounded-md p-1 text-selah-cream3 outline-none transition-opacity hover:text-selah-cream",
                        "opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                      )}
                      aria-label="Session options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => startEdit(s)}>
                        <Pencil className="h-4 w-4" />
                        {t.rename}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          if (confirm(t.confirmDelete)) onDelete(s.id);
                        }}
                        className="text-red-300 focus:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.04] px-3 py-3">
        <AmovFooter variant="inline" />
      </div>
    </div>
  );
}
