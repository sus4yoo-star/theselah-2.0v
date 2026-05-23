"use client";

import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LANG_OPTIONS } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSelector({
  compact = false,
  onChange,
}: {
  compact?: boolean;
  onChange?: (l: string) => void;
}) {
  const { lang, setLang } = useLanguage();
  const current = LANG_OPTIONS.find((o) => o.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-selah-gold/20 bg-selah-bg/60 text-selah-cream2 outline-none transition-colors hover:border-selah-gold/50",
          compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-[13px]"
        )}
        aria-label="Select language"
      >
        <Globe className="h-3.5 w-3.5 opacity-70" />
        <span>{current?.label ?? "English"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(70vh,28rem)] overflow-y-auto overscroll-contain"
      >
        {LANG_OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.code}
            onSelect={() => {
              setLang(o.code);
              onChange?.(o.code);
            }}
            className="justify-between"
          >
            <span>{o.label}</span>
            {o.code === lang ? (
              <Check className="h-3.5 w-3.5 text-selah-gold" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
