import type { LangCode } from "./types";
import { cleanVerseText } from "./bible";

export interface ParsedScripture {
  text: string;
  ref: string;
  application: string;
}

export interface ParsedAI {
  emotion: string;
  scripture: ParsedScripture | null;
  direction: string;
  hope: string;
  prayer: string;

  /**
   * Backward compatibility for older saved messages.
   * Old structure was: analysis / wisdom / comfort / verse.
   */
  analysis: string;
  wisdom: string;
  comfort: string;
  verse: ParsedScripture | null;

  /** Raw text when the model did not use the tag structure. */
  raw: string;
  structured: boolean;
}

function tag(src: string, name: string): string {
  const m = src.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? m[1].trim() : "";
}

function stripOuterTags(src: string): string {
  return String(src || "")
    .replace(/<\/?(text|reference|application)>/gi, "")
    .trim();
}

/**
 * Supports the new prompt structure:
 *
 * <scripture>
 *   <text>...</text>
 *   <reference>...</reference>
 *   <application>...</application>
 * </scripture>
 *
 * Also supports the older structure:
 *
 * <verse>[VTEXT]...[/VTEXT][VREF]...[/VREF][VPRIN]...[/VPRIN]</verse>
 */
export function parseAI(raw: string, lang: LangCode): ParsedAI {
  const text = String(raw || "");

  const emotion = tag(text, "emotion");

  const scriptureBlock = tag(text, "scripture");
  let scripture: ParsedScripture | null = null;

  if (scriptureBlock) {
    const verseText = cleanVerseText(lang, stripOuterTags(tag(scriptureBlock, "text")));
    const reference = stripOuterTags(tag(scriptureBlock, "reference"));
    const application = stripOuterTags(tag(scriptureBlock, "application"));

    if (verseText && reference) {
      scripture = {
        text: verseText,
        ref: reference,
        application,
      };
    }
  }

  const direction = tag(text, "direction");
  const hope = tag(text, "hope");
  const prayer = tag(text, "prayer");

  /**
   * Backward compatibility:
   * Keeps old saved conversations visible even if they used the older tags.
   */
  const analysis = tag(text, "analysis");
  const wisdom = tag(text, "wisdom");
  const comfort = tag(text, "comfort");

  const oldVerseBlock = tag(text, "verse");
  let oldVerse: ParsedScripture | null = null;

  if (oldVerseBlock) {
    const vtMatch = oldVerseBlock.match(/\[VTEXT\]([\s\S]*?)\[\/VTEXT\]/i);
    const vrMatch = oldVerseBlock.match(/\[VREF\]([\s\S]*?)\[\/VREF\]/i);
    const vpMatch = oldVerseBlock.match(/\[VPRIN\]([\s\S]*?)\[\/VPRIN\]/i);

    const vt = cleanVerseText(lang, vtMatch ? vtMatch[1].trim() : "");
    const vr = vrMatch ? vrMatch[1].trim() : "";
    const vp = vpMatch ? vpMatch[1].trim() : "";

    if (vt && vr) {
      oldVerse = {
        text: vt,
        ref: vr,
        application: vp,
      };
    }
  }

  const finalScripture = scripture || oldVerse;
  const structured = Boolean(
    emotion ||
      finalScripture ||
      direction ||
      hope ||
      prayer ||
      analysis ||
      wisdom ||
      comfort
  );

  return {
    emotion,
    scripture: finalScripture,
    direction,
    hope,
    prayer,
    analysis,
    wisdom,
    comfort,
    verse: finalScripture,
    raw: text.trim(),
    structured,
  };
}

/**
 * Strips XML/markup so the streaming text reads naturally while the
 * model is still emitting tags. Used only for the live typing view.
 */
export function stripTagsForLive(buffer: string): string {
  return buffer
    .replace(
      /<\/?(emotion|scripture|text|reference|application|direction|hope|prayer|analysis|wisdom|comfort|verse)>/gi,
      "\n"
    )
    .replace(/\[\/?(VTEXT|VREF|VPRIN)\]/gi, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
