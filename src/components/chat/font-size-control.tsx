"use client";

/**
 * Back-compat shim — the actual control lives in ViewSettingsMenu now,
 * which bundles font size + high contrast + TTS auto into one header
 * dropdown. Re-exported under the old name so legacy imports still work.
 */
export { ViewSettingsMenu as FontSizeControl } from "@/components/chat/view-settings-menu";
