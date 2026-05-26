"use client";

import { useEffect, useState } from "react";

/**
 * SSR-friendly splash overlay.
 *
 * Renders an opaque, full-screen layer with the SELAH symbol on first paint
 * — replacing the blank white flash that Next.js shows before hydration.
 * After mount, fades out gracefully. Pointer-events: none after fade so it
 * never blocks taps. CSS-only animation so no JS frame work is required
 * before the splash is visible.
 */
export function Splash() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    // Give Next.js a beat to finish hydrating before we start the fade.
    const fadeT = setTimeout(() => setPhase("fading"), 380);
    const removeT = setTimeout(() => setPhase("gone"), 1100);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(removeT);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: "#07111f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 720ms ease",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", width: 168, height: 120 }}>
        <span
          style={{
            position: "absolute",
            inset: "-10% -10% -10% -10%",
            borderRadius: "9999px",
            background: "rgba(227,185,117,0.10)",
            filter: "blur(28px)",
            animation: "selahSplashAura 2.4s ease-in-out infinite",
          }}
        />
        <img
          src="/symbol-transparent.png"
          alt=""
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 0 26px rgba(212,175,55,0.4))",
            animation: "selahSplashBreathe 2.4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Inline keyframes so the splash works even before any CSS bundle
          finishes downloading. */}
      <style>{`
        @keyframes selahSplashBreathe {
          0%, 100% { opacity: 0.55; transform: scale(0.98); }
          50%      { opacity: 1;    transform: scale(1.02); }
        }
        @keyframes selahSplashAura {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50%      { opacity: 0.9; transform: scale(1.10); }
        }
      `}</style>
    </div>
  );
}
