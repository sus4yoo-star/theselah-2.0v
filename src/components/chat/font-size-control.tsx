"use client";

import * as React from "react";
import { Type } from "lucide-react";
import { useFontSize, type FontSize } from "@/components/font-size-provider";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const OPTIONS: { value: FontSize; sample: string; key: keyof ReturnType<typeof getFeatureStrings> }[] = [
  { value: "sm", sample: "A", key: "fontSizeSmall" },
  { value: "md", sample: "A", key: "fontSizeMedium" },
  { value: "lg", sample: "A", key: "fontSizeLarge" },
];

export function FontSizeControl() {
  const { size, setSize } = useFontSize();
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-selah-cream2 outline-none transition-colors hover:border-selah-gold/40 hover:text-selah-cream"
        aria-label={fs.fontSizeLabel}
        title={fs.fontSizeLabel}
      >
        <Type className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-selah-cream3">
          {fs.fontSizeLabel}
        </div>
        <DropdownMenuSeparator />
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={(e) => {
              e.preventDefault();
              setSize(opt.value);
            }}
            className={cn(
              "flex items-center justify-between gap-3",
              size === opt.value && "text-selah-gold"
            )}
          >
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center font-serif",
                opt.value === "sm" && "text-[13px]",
                opt.value === "md" && "text-[16px]",
                opt.value === "lg" && "text-[20px]"
              )}
              aria-hidden
            >
              {opt.sample}
            </span>
            <span className="flex-1">{fs[opt.key]}</span>
            {size === opt.value && (
              <span className="text-[10px] uppercase tracking-widest text-selah-gold">
                •
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
