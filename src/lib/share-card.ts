/**
 * Share-card image generator (v2).
 *
 * What changed from v1:
 *  - Aspect ratio is now 1080×1920 (9:16) — Instagram Story / Reels /
 *    TikTok native. Square crops still look fine because the main copy
 *    sits inside a centered safe area.
 *  - Dynamic font sizing: short prayers stay big and breathy, long
 *    prayers shrink gracefully instead of clipping off the page.
 *  - Safe areas at top (220px) and bottom (220px) keep the brand,
 *    body, and footer clear of Instagram's story UI.
 *  - Subtle gradient halo, hairline frame, ornamental dot motif for a
 *    more reverent, less "infographic" look.
 *  - No reference is appended to prayer cards — prayers stand alone.
 *
 * Two card shapes:
 *  - "prayer"   → body text only, italic serif, centered
 *  - "scripture"→ verse + small gold "— ref" line beneath
 */

export type CardVariant = "selah" | "manna";
export type CardShape = "prayer" | "scripture";

interface CardOptions {
  variant: CardVariant;
  shape?: CardShape;
  brandLabel: string;
  tagline?: string;
  body: string;
  reference?: string;
  footer?: string;
}

interface Palette {
  bg: string;
  bg2: string;
  bg3: string;
  gold: string;
  goldSoft: string;
  cream: string;
  cream2: string;
}

const PALETTES: Record<CardVariant, Palette> = {
  selah: {
    bg:       "#07111f",
    bg2:      "#0d1c30",
    bg3:      "#142b48",
    gold:     "#e3b975",
    goldSoft: "#d4a04a",
    cream:    "#f3efe6",
    cream2:   "#cdd8d2",
  },
  manna: {
    bg:       "#03212a",
    bg2:      "#0a333d",
    bg3:      "#0f4854",
    gold:     "#e3b975",
    goldSoft: "#d4a04a",
    cream:    "#f3efe6",
    cream2:   "#cdd8d2",
  },
};

const W = 1080;
const H = 1920;
const SAFE_TOP = 220;
const SAFE_BOTTOM = 220;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxUnits: number, maxLines = 999): string[] {
  const unitOf = (s: string) => {
    let n = 0;
    for (const ch of s) {
      n += /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(ch) ? 2 : 1;
    }
    return n;
  };
  const out: string[] = [];
  for (const para of text.split(/\n+/)) {
    if (!para.trim()) {
      out.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let line = "";
    let units = 0;
    for (const w of words) {
      const wU = unitOf(w) + (line ? 1 : 0);
      if (units + wU > maxUnits) {
        if (line) out.push(line);
        if (unitOf(w) > maxUnits) {
          let chunk = "";
          let cU = 0;
          for (const ch of w) {
            const u = unitOf(ch);
            if (cU + u > maxUnits) {
              out.push(chunk);
              chunk = ch;
              cU = u;
            } else {
              chunk += ch;
              cU += u;
            }
          }
          line = chunk;
          units = cU;
        } else {
          line = w;
          units = unitOf(w);
        }
      } else {
        line += (line ? " " : "") + w;
        units += wU;
      }
    }
    if (line) out.push(line);
    if (out.length >= maxLines) break;
  }
  return out.slice(0, maxLines);
}

const BODY_MAX_H = H - SAFE_TOP - 200 - 120 - SAFE_BOTTOM;

const SIZING_STEPS = [
  { fontSize: 60, lineHeight: 88, wrapUnits: 22 },
  { fontSize: 54, lineHeight: 80, wrapUnits: 24 },
  { fontSize: 48, lineHeight: 72, wrapUnits: 27 },
  { fontSize: 42, lineHeight: 64, wrapUnits: 30 },
  { fontSize: 36, lineHeight: 56, wrapUnits: 34 },
  { fontSize: 32, lineHeight: 50, wrapUnits: 38 },
  { fontSize: 28, lineHeight: 44, wrapUnits: 42 },
];

interface FitResult {
  fontSize: number;
  lineHeight: number;
  lines: string[];
}

function fitBody(text: string): FitResult {
  for (const step of SIZING_STEPS) {
    const lines = wrapText(text, step.wrapUnits);
    const totalH = lines.length * step.lineHeight;
    if (totalH <= BODY_MAX_H) {
      return { fontSize: step.fontSize, lineHeight: step.lineHeight, lines };
    }
  }
  const step = SIZING_STEPS[SIZING_STEPS.length - 1];
  const maxLines = Math.floor(BODY_MAX_H / step.lineHeight);
  const lines = wrapText(text, step.wrapUnits, maxLines);
  if (lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] =
      last.length > 2 ? last.slice(0, -1) + "…" : last + "…";
  }
  return { fontSize: step.fontSize, lineHeight: step.lineHeight, lines };
}

export function buildCardSvg(opts: CardOptions): string {
  const p = PALETTES[opts.variant];
  const shape = opts.shape ?? "prayer";
  const body = opts.body.trim();

  const fit = fitBody(body);
  const bodyTotalH = fit.lines.length * fit.lineHeight;

  const brandBlockBottom = SAFE_TOP + 200;
  const footerBlockTop = H - SAFE_BOTTOM - 120;
  const bodyZoneH = footerBlockTop - brandBlockBottom;
  const bodyStartY = brandBlockBottom + (bodyZoneH - bodyTotalH) / 2 + fit.fontSize * 0.85;

  const bodyTspans = fit.lines
    .map(
      (line, i) =>
        `<tspan x="${W / 2}" dy="${i === 0 ? 0 : fit.lineHeight}">${
          escapeXml(line) || "&#160;"
        }</tspan>`
    )
    .join("");

  const brandLetters = escapeXml(opts.brandLabel.split("").join(" "));

  const refBlock =
    shape === "scripture" && opts.reference
      ? `
  <text x="${W / 2}" y="${bodyStartY + bodyTotalH + 80}"
        font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
        font-size="34" fill="${p.gold}" text-anchor="middle"
        letter-spacing="3">— ${escapeXml(opts.reference)}</text>`
      : "";

  const taglineBlock = opts.tagline
    ? `
  <text x="${W / 2}" y="${SAFE_TOP + 140}"
        font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
        font-size="30" fill="${p.cream2}" text-anchor="middle"
        letter-spacing="4" opacity="0.7">${escapeXml(opts.tagline)}</text>`
    : "";

  const footerBlock = opts.footer
    ? `
  <text x="${W / 2}" y="${H - SAFE_BOTTOM - 30}"
        font-family="'Noto Sans KR', sans-serif"
        font-size="22" fill="${p.cream2}" text-anchor="middle"
        letter-spacing="6" opacity="0.42">${escapeXml(opts.footer)}</text>`
    : "";

  const topOrnamentY = SAFE_TOP + 180;
  const botOrnamentY = footerBlockTop + 30;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="halo" cx="50%" cy="38%" r="78%">
      <stop offset="0%"  stop-color="${p.bg3}" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="${p.bg2}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${p.bg}" stop-opacity="0.35"/>
      <stop offset="35%"  stop-color="${p.bg}" stop-opacity="0"/>
      <stop offset="65%"  stop-color="${p.bg}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="0.45"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${p.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>

  <rect x="60" y="60" width="${W - 120}" height="${H - 120}"
        fill="none" stroke="${p.gold}" stroke-opacity="0.10" stroke-width="1"/>

  <text x="${W / 2}" y="${SAFE_TOP + 90}"
        font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
        font-size="80" font-weight="600" fill="${p.gold}"
        text-anchor="middle">${brandLetters}</text>
  ${taglineBlock}

  <line x1="${W / 2 - 130}" y1="${topOrnamentY}" x2="${W / 2 - 22}" y2="${topOrnamentY}"
        stroke="${p.gold}" stroke-opacity="0.35" stroke-width="1"/>
  <line x1="${W / 2 + 22}" y1="${topOrnamentY}" x2="${W / 2 + 130}" y2="${topOrnamentY}"
        stroke="${p.gold}" stroke-opacity="0.35" stroke-width="1"/>
  <circle cx="${W / 2}" cy="${topOrnamentY}" r="3.5" fill="${p.gold}" fill-opacity="0.55"/>

  <text x="${W / 2}" y="${bodyStartY}"
        font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
        font-style="italic"
        font-size="${fit.fontSize}" fill="${p.cream}"
        text-anchor="middle">${bodyTspans}</text>
  ${refBlock}

  <line x1="${W / 2 - 130}" y1="${botOrnamentY}" x2="${W / 2 - 22}" y2="${botOrnamentY}"
        stroke="${p.gold}" stroke-opacity="0.25" stroke-width="1"/>
  <line x1="${W / 2 + 22}" y1="${botOrnamentY}" x2="${W / 2 + 130}" y2="${botOrnamentY}"
        stroke="${p.gold}" stroke-opacity="0.25" stroke-width="1"/>
  <circle cx="${W / 2}" cy="${botOrnamentY}" r="3" fill="${p.gold}" fill-opacity="0.4"/>
  ${footerBlock}
</svg>`;
}

export async function svgToPngBlob(
  svg: string,
  width = W,
  height = H
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("canvas not available"));
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("toBlob failed"));
          resolve(blob);
        },
        "image/png",
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("svg decode failed"));
    };
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
