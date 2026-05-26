"use client";

import * as React from "react";
import { Settings2, Check } from "lucide-react";
import {
  useViewSettings,
  type FontSize,
} from "@/components/view-settings-provider";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";
import { ttsSupported } from "@/lib/tts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const FONT_OPTIONS: { value: FontSize; sample: string; key: "fontSizeSmall" | "fontSizeMedium" | "fontSizeLarge"; sampleSize: string }[] = [
  { value: "sm", sample: "A", key: "fontSizeSmall", sampleSize: "13px" },
  { value: "md", sample: "A", key: "fontSizeMedium", sampleSize: "16px" },
  { value: "lg", sample: "A", key: "fontSizeLarge", sampleSize: "20px" },
];

/**
 * One header dropdown that bundles every accessibility toggle:
 *  - font size (sm / md / lg)
 *  - high contrast on / off
 *  - auto read-aloud on / off (only shown when the browser supports TTS)
 *
 * Replaces the older single-purpose font-size-control.
 */
export function ViewSettingsMenu() {
  const { size, setSize, highContrast, setHighContrast, ttsAuto, setTtsAuto } =
    useViewSettings();
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const [hasTts, setHasTts] = React.useState(false);

  React.useEffect(() => {
    setHasTts(ttsSupported());
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-selah-cream2 outline-none transition-colors hover:border-selah-gold/40 hover:text-selah-cream"
        aria-label={fs.viewSettings}
        title={fs.viewSettings}
      >
        <Settings2 className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <div className="px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-selah-cream3">
          {fs.fontSizeLabel}
        </div>
        {FONT_OPTIONS.map((opt) => (
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
            <span className="inline-flex h-6 w-6 items-center justify-center font-serif" style={{ fontSize: opt.sampleSize }} aria-hidden>
              {opt.sample}
            </span>
            <span className="flex-1">{fs[opt.key]}</span>
            {size === opt.value && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-[0.16em] text-selah-cream3">
          {fs.highContrastLabel}
        </div>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setHighContrast(!highContrast);
          }}
          className={cn("flex items-center justify-between gap-3", highContrast && "text-selah-gold")}
        >
          <span className="flex-1">
            {highContrast ? fs.highContrastOn : fs.highContrastOff}
          </span>
          <span
            aria-hidden
            className={cn(
              "inline-block h-4 w-7 rounded-full border transition-colors",
              highContrast ? "border-selah-gold bg-selah-gold/50" : "border-white/15 bg-white/5"
            )}
          >
            <span
              className={cn(
                "block h-3 w-3 translate-y-[1px] rounded-full bg-selah-cream transition-transform",
                highContrast ? "translate-x-[14px]" : "translate-x-[1px]"
              )}
            />
          </span>
        </DropdownMenuItem>

        {hasTts && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-[0.16em] text-selah-cream3">
              {fs.ttsLabel}
            </div>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setTtsAuto(!ttsAuto);
              }}
              className={cn("flex items-center justify-between gap-3", ttsAuto && "text-selah-gold")}
            >
              <span className="flex-1">
                {ttsAuto ? fs.ttsAutoOn : fs.ttsAutoOff}
              </span>
              <span
                aria-hidden
                className={cn(
                  "inline-block h-4 w-7 rounded-full border transition-colors",
                  ttsAuto ? "border-selah-gold bg-selah-gold/50" : "border-white/15 bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "block h-3 w-3 translate-y-[1px] rounded-full bg-selah-cream transition-transform",
                    ttsAuto ? "translate-x-[14px]" : "translate-x-[1px]"
                  )}
                />
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
