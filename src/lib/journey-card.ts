/**
 * Journey share card.
 *
 * Renders the user's mood-journey stats (lighter days / heavier days /
 * active days) into the same Instagram-story format the prayer cards
 * use — same palette, same ornaments, same brand block. So a SELAH
 * user's journey post sits visually alongside their prayer posts.
 *
 * Embeds a small sparkline of the actual daily valence series so the
 * card *looks like* a journey, not a stats dashboard.
 */

export interface JourneyCardPoint {
  /** -1..+1 daily valence, 0 when no message that day. */
  valence: number;
  /** Optional, used only for the date axis label spacing. */
  iso?: string;
}

interface JourneyCardOptions {
  variant: "selah" | "manna";
  brandLabel: string;          // SELAH / MANNA
  tagline?: string;
  title: string;               // "마음의 흐름"
  rangeLabel: string;          // "지난 30일"
  activeDays: number;
  positiveDays: number;
  hardDays: number;
  activeLabel: string;         // "기록한 날"
  positiveLabel: string;       // "평안한 날"
  hardLabel: string;           // "버거운 날"
  series: JourneyCardPoint[];
  topFeelings: { label: string; count: number }[]; // <=3
  footer?: string;
  topFeelingsTitle: string;    // "자주 다가온 마음"
  disclaimer?: string;
}

const PALETTES = {
  selah: { bg: "#07111f", bg2: "#0d1c30", bg3: "#142b48", gold: "#e3b975", cream: "#f3efe6", cream2: "#cdd8d2", pos: "#86efac", neg: "#fcd34d" },
  manna: { bg: "#03212a", bg2: "#0a333d", bg3: "#0f4854", gold: "#e3b975", cream: "#f3efe6", cream2: "#cdd8d2", pos: "#86efac", neg: "#fcd34d" },
};

const W = 1080;
const H = 1920;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* Build an area-path (negative below 0, positive above 0) for the
 * sparkline. The chart sits inside a 760x320 box. */
function sparklinePath(points: JourneyCardPoint[], x0: number, y0: number, w: number, h: number): { area: string; midY: number } {
  if (points.length === 0) return { area: "", midY: y0 + h / 2 };
  const midY = y0 + h / 2;
  const stepX = w / Math.max(1, points.length - 1);
  // Build smooth quadratic Bezier path through the centerline values.
  // Clamp valence to [-1, +1] and map to [midY+h/2, midY-h/2].
  const valToY = (v: number) => midY - Math.max(-1, Math.min(1, v)) * (h / 2 - 12);

  // Top line of the area
  const pts = points.map((p, i) => [x0 + i * stepX, valToY(p.valence)] as [number, number]);
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    d += ` Q ${cx.toFixed(1)} ${py.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  // Close into an area for the gradient fill
  const last = pts[pts.length - 1];
  const area = `${d} L ${last[0].toFixed(1)} ${midY.toFixed(1)} L ${pts[0][0].toFixed(1)} ${midY.toFixed(1)} Z`;
  return { area, midY };
}

function statCard(x: number, y: number, w: number, h: number, label: string, value: number, tone: "neutral" | "pos" | "neg", p: any): string {
  const valueColor =
    tone === "pos" ? "#bbf7d0" : tone === "neg" ? "#fde68a" : p.cream;
  const labelColor =
    tone === "pos" ? "#86efac" : tone === "neg" ? "#fcd34d" : p.cream2;
  const stroke =
    tone === "pos" ? "rgba(134,239,172,0.18)" : tone === "neg" ? "rgba(252,211,77,0.18)" : "rgba(255,255,255,0.08)";
  const fill =
    tone === "pos" ? "rgba(134,239,172,0.05)" : tone === "neg" ? "rgba(252,211,77,0.05)" : "rgba(255,255,255,0.02)";
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" ry="24"
          fill="${fill}" stroke="${stroke}" stroke-width="1"/>
    <text x="${x + w / 2}" y="${y + 56}"
          font-family="'Noto Sans KR', sans-serif" font-size="22"
          fill="${labelColor}" text-anchor="middle"
          letter-spacing="3" opacity="0.85">${esc(label)}</text>
    <text x="${x + w / 2}" y="${y + 130}"
          font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
          font-weight="600" font-size="76"
          fill="${valueColor}" text-anchor="middle">${value}</text>
  `;
}

export function buildJourneyCardSvg(opts: JourneyCardOptions): string {
  const p = PALETTES[opts.variant];
  const SAFE_TOP = 220;
  const SAFE_BOTTOM = 220;

  // Brand
  const brandY = SAFE_TOP + 90;
  const brandLetters = esc(opts.brandLabel.split("").join(" "));

  // Title block (inside the safe area)
  const titleY = brandY + 110;
  const rangeY = titleY + 56;

  // Stat row
  const statY = rangeY + 70;
  const statW = 260;
  const statH = 170;
  const gap = 30;
  const statsTotalW = statW * 3 + gap * 2;
  const statX0 = (W - statsTotalW) / 2;

  const statsSvg = [
    statCard(statX0, statY, statW, statH, opts.activeLabel, opts.activeDays, "neutral", p),
    statCard(statX0 + (statW + gap), statY, statW, statH, opts.positiveLabel, opts.positiveDays, "pos", p),
    statCard(statX0 + (statW + gap) * 2, statY, statW, statH, opts.hardLabel, opts.hardDays, "neg", p),
  ].join("");

  // Sparkline
  const sparkX = 160;
  const sparkY = statY + statH + 90;
  const sparkW = W - 320;
  const sparkH = 320;
  const spark = sparklinePath(opts.series, sparkX, sparkY, sparkW, sparkH);
  const sparkLine =
    opts.series.length > 0
      ? `
    <defs>
      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.pos}" stop-opacity="0.45"/>
        <stop offset="50%" stop-color="${p.gold}" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="${p.neg}" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
    <rect x="${sparkX - 20}" y="${sparkY - 20}" width="${sparkW + 40}" height="${sparkH + 40}"
          rx="28" ry="28" fill="rgba(255,255,255,0.02)" stroke="rgba(227,185,117,0.12)" stroke-width="1"/>
    <line x1="${sparkX}" y1="${spark.midY}" x2="${sparkX + sparkW}" y2="${spark.midY}"
          stroke="rgba(255,255,255,0.10)" stroke-dasharray="3 6"/>
    <path d="${spark.area}" fill="url(#sparkGrad)" stroke="${p.gold}" stroke-width="2.5"
          stroke-linejoin="round" stroke-linecap="round"/>
  `
      : "";

  // Top feelings list
  const feelingsStartY = sparkY + sparkH + 130;
  const feelingsTitleSvg = `
    <text x="${W / 2}" y="${feelingsStartY}"
          font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
          font-size="32" fill="${p.cream2}" text-anchor="middle"
          letter-spacing="4" opacity="0.7">${esc(opts.topFeelingsTitle)}</text>
  `;
  const feelingsSvg = opts.topFeelings.slice(0, 3).map((f, i) => {
    const y = feelingsStartY + 70 + i * 60;
    return `
      <text x="${W / 2}" y="${y}"
            font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
            font-style="italic" font-size="36" fill="${p.gold}"
            text-anchor="middle">${esc(f.label)}</text>
    `;
  }).join("");

  // Footer + disclaimer
  const disclaimerY = H - SAFE_BOTTOM - 70;
  const footerY = H - SAFE_BOTTOM - 30;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="halo" cx="50%" cy="32%" r="80%">
      <stop offset="0%"  stop-color="${p.bg3}" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="${p.bg2}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="1"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${p.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}"
        fill="none" stroke="${p.gold}" stroke-opacity="0.10" stroke-width="1"/>

  <!-- Brand -->
  <text x="${W / 2}" y="${brandY}"
        font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
        font-size="72" font-weight="600" fill="${p.gold}"
        text-anchor="middle">${brandLetters}</text>

  <text x="${W / 2}" y="${titleY}"
        font-family="'Cormorant Garamond', 'Noto Serif KR', serif"
        font-style="italic" font-size="58" fill="${p.cream}" text-anchor="middle">${esc(opts.title)}</text>
  <text x="${W / 2}" y="${rangeY}"
        font-family="'Noto Sans KR', sans-serif"
        font-size="26" fill="${p.cream2}" text-anchor="middle"
        letter-spacing="3" opacity="0.7">${esc(opts.rangeLabel)}</text>

  ${statsSvg}
  ${sparkLine}
  ${feelingsTitleSvg}
  ${feelingsSvg}

  ${opts.disclaimer ? `
  <text x="${W / 2}" y="${disclaimerY}"
        font-family="'Noto Sans KR', sans-serif" font-size="20"
        fill="${p.cream2}" text-anchor="middle" opacity="0.55">${esc(opts.disclaimer)}</text>` : ""}
  ${opts.footer ? `
  <text x="${W / 2}" y="${footerY}"
        font-family="'Noto Sans KR', sans-serif" font-size="22"
        fill="${p.cream2}" text-anchor="middle"
        letter-spacing="6" opacity="0.42">${esc(opts.footer)}</text>` : ""}
</svg>`;
}
