"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  size = "md",
  showSub = true,
  subLabel,
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  showSub?: boolean;
  subLabel?: string;
}) {
  const dim =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const name =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";

  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 outline-none"
      aria-label="SELAH home"
    >
      <img
        src="/symbol-transparent.png"
        alt=""
        className={cn(
          "shrink-0 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.28)] transition-transform group-hover:scale-105",
          dim
        )}
      />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display font-semibold tracking-[0.2em] text-selah-gold",
            name
          )}
        >
          SELAH
        </span>
        {showSub && subLabel ? (
          <span className="block text-[11px] tracking-wide text-selah-cream3">
            {subLabel}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
