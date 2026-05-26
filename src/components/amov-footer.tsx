"use client";

/**
 * AmovFooter — a small, restrained credit line used across SELAH.
 *
 * Tone note: SELAH frames itself as a sacred ministry, not a product.
 * The footer is therefore intentionally quiet — small typography, low
 * opacity, no logo, no link emphasis. It is a whisper, not a banner.
 *
 * The `variant` prop adjusts spacing for two contexts:
 *  - "page": standalone marketing/legal pages (home, install, login,
 *    privacy, terms, business). Padded above so it sits at the page foot.
 *  - "inline": placed inside an already-padded card (e.g. login card).
 */
export function AmovFooter({
  variant = "page",
}: {
  variant?: "page" | "inline";
}) {
  const wrap =
    variant === "inline"
      ? "mt-6 text-center"
      : "mt-10 mb-2 w-full text-center";

  return (
    <p
      className={`${wrap} text-[11px] tracking-[0.18em] text-selah-cream3/55 select-none`}
      aria-label="Powered by AMOV"
    >
      <span className="opacity-80">Powered by</span>{" "}
      <span className="font-medium text-selah-gold/70">AMOV</span>
    </p>
  );
}
