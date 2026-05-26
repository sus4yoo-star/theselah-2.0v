/**
 * Shared helpers for talking to the Anthropic Messages API.
 *
 * SELAH runs on Claude. We centralise the model id, API version, and
 * the data-URL → image-block helper so the route handler stays small
 * and so the model can be overridden per environment via ANTHROPIC_MODEL
 * (e.g. set to "claude-opus-4-7" for the deepest pastoral responses).
 */

export const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Default model. Claude Sonnet 4.6 is a strong, affordable default for
 * warm, specific, multilingual pastoral support. Override via the
 * ANTHROPIC_MODEL env var when you want to go deeper (e.g. "claude-opus-4-7").
 *
 * Note: from the 4.6 generation onward the dateless id IS the canonical
 * model id — it is not an evergreen alias.
 */
export function defaultModel(): string {
  const m = String(process.env.ANTHROPIC_MODEL || "").trim();
  return m || "claude-sonnet-4-6";
}

export interface ParsedDataUrl {
  mediaType: string;
  data: string;
}

/**
 * Splits a browser data-URL ("data:image/jpeg;base64,XXXX") into the
 * media type and the raw base64 payload that Anthropic expects in an
 * image content block. Returns null if it is not a usable base64 image.
 */
export function splitDataUrl(dataUrl: string): ParsedDataUrl | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(
    String(dataUrl || "")
  );
  if (!m) return null;
  let mediaType = m[1].toLowerCase();
  // Anthropic accepts jpeg, png, gif, webp. Normalise common variants.
  if (mediaType === "image/jpg") mediaType = "image/jpeg";
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(mediaType)) return null;
  const data = m[2].trim();
  if (!data) return null;
  return { mediaType, data };
}
