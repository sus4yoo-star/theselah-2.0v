"use client";

/**
 * Back-compat shim. The provider lives in view-settings-provider.tsx now
 * (which also handles high contrast and TTS auto-play). We keep these
 * exports so any old imports keep working without code churn.
 */
export {
  ViewSettingsProvider as FontSizeProvider,
  useFontSize,
  useViewSettings,
  type FontSize,
} from "@/components/view-settings-provider";
