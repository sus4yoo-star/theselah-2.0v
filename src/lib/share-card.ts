/**
 * Generates a square SVG share card from prayer / reflection text.
 *
 * Zero external dependencies — we build the SVG markup as a string,
 * convert to a data: URL, then download or share it. Works in any
 * modern browser. The result is 1080×1080, ready for Instagram Square
 * or Story (which crops/pads anyway).
 *
 * Two variants:
 *  - "selah"  → deep navy + gold (#07111f bg, #e3b975 accent)
 *  - "manna"  → deep teal + gold (#03212a bg, #e3b975 accent)
 */

export type CardVariant = "selah" | "manna";

interface CardOptions {
  variant: CardVariant;
  brandLabel: string;   // "SELAH" or "MANNA"
  tagline?: string;     // small line under brand
  body: string;         // prayer / reflection text
  reference?: string;   // optional scripture ref (Selah only)
  footer?: string;      // e.g. "powered by AMOV"
}

const PALETTES: Record<CardVariant, { bg: string; bg2: string; gold: string; cream: string; cream2: string }> = {
  selah: {
    bg:    "#07111f",
    bg2:   "#0d1c30",
    gold:  "#e3b975",
    cream: "#f3efe6",
    cream2:"#cdd8d2",
  },
  manna: {
    bg:    "#03212a",
    bg2:   "#0a333d",
    gold:  "#e3b975",
    cream: "#f3efe6",
    cream2:"#cdd8d2",
  },
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Greedy line wrap by visual width (approximated). SVG text isn't
 * auto-wrapped, so we split into <tspan> rows. Korean characters are
 * roughly twice as wide as Latin so we count CJK chars at 2.
 */
function wrapText(text: string, maxUnits: number): string[] {
  const paragraphs = text.split(/\n+/);
  const out: string[] = [];
  for (const para of paragraphs) {
    if (!para.trim()) {
      out.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let line = "";
    let units = 0;
    const unitOf = (s: string) => {
      let n = 0;
      for (const ch of s) {
        n += /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(ch) ? 2 : 1;
      }
      return n;
    };
    for (const w of words) {
      const wU = unitOf(w) + (line ? 1 : 0);
      if (units + wU > maxUnits) {
        if (line) out.push(line);
        // word longer than line — hard-break by char
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
  }
  return out;
}

export function buildCardSvg(opts: CardOptions): string {
  const p = PALETTES[opts.variant];
  const W = 1080;
  const H = 1080;

  // Body text wrapping: ~30 visual units per line at 44px font for legibility.
  const bodyLines = wrapText(opts.body.trim(), 30).slice(0, 14);
  const lineHeight = 64;
  const bodyTop = 320;

  const refBlock = opts.reference
    ? `<text x="540" y="${bodyTop + bodyLines.length * lineHeight + 60}" font-family="serif" font-size="32" fill="${p.gold}" text-anchor="middle">— ${escapeXml(opts.reference)}</text>`
    : "";

  const tag = opts.tagline
    ? `<text x="540" y="200" font-family="serif" font-size="28" fill="${p.cream2}" text-anchor="middle" letter-spacing="4">${escapeXml(opts.tagline)}</text>`
    : "";

  const footer = opts.footer
    ? `<text x="540" y="1020" font-family="sans-serif" font-size="22" fill="${p.cream2}" opacity="0.5" text-anchor="middle" letter-spacing="3">${escapeXml(opts.footer)}</text>`
    : "";

  const bodyTspans = bodyLines
    .map(
      (line, i) =>
        `<tspan x="540" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line) || "&#160;"}</tspan>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="aura" cx="50%" cy="0%" r="80%">
      <stop offset="0%"  stop-color="${p.bg2}" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="${p.bg}"  stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${p.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#aura)"/>

  <line x1="120" x2="960" y1="240" y2="240" stroke="${p.gold}" stroke-opacity="0.25" stroke-width="1"/>

  <text x="540" y="140" font-family="serif" font-size="64" font-weight="600" fill="${p.gold}" text-anchor="middle" letter-spacing="14">${escapeXml(opts.brandLabel)}</text>
  ${tag}

  <text x="540" y="${bodyTop}" font-family="serif" font-style="italic" font-size="44" fill="${p.cream}" text-anchor="middle">
    ${bodyTspans}
  </text>

  ${refBlock}
  ${footer}
</svg>`;
}

/**
 * Triggers a download of the SVG card as a PNG via a hidden <canvas>
 * step. SVG → blob URL → <img> onload → drawImage → toBlob → download.
 *
 * Returns the resulting Blob so the caller can also fire the Web Share
 * API with it on mobile.
 */
export async function svgToPngBlob(svg: string, size = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("canvas not available"));
      }
      ctx.drawImage(img, 0, 0, size, size);
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
