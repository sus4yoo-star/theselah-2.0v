"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Without this file, Next.js falls back to its
 * default minimal "Application error: a server-side exception has
 * occurred" white page — useless to senior users and a dead-end.
 *
 * With this file:
 *  - users see a calm, on-brand recovery screen
 *  - they can try again with one tap, or return home
 *  - the browser console gets the real error so you can debug
 *  - the Netlify Function logs still receive the original throw
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real cause to the browser console — Netlify only
    // shows the digest hash on the user's screen.
    // eslint-disable-next-line no-console
    console.error("[SELAH] unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#07111f] px-6 text-center text-[#f3efe6]">
      <div className="max-w-sm">
        <h1 className="mb-3 font-serif text-2xl font-medium text-[#e3b975]">
          잠시 문제가 생겼어요
        </h1>
        <p className="mb-6 text-[15px] leading-relaxed text-[#cdd8d2]">
          페이지를 불러오는 중에 오류가 발생했습니다. 한 번 더 시도해 주세요.
          계속 같은 화면이 보인다면 잠시 후 다시 방문해 주세요.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-[#e3b975] px-5 py-3 text-[14px] font-semibold text-[#07111f] transition hover:brightness-110 active:scale-[0.98]"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="rounded-2xl border border-[#e3b975]/30 px-5 py-3 text-[14px] text-[#e3b975] transition hover:bg-[#e3b975]/[0.08]"
          >
            처음으로
          </a>
        </div>

        {error?.digest && (
          <p className="mt-5 text-[11px] tracking-wider text-[#7f9690]">
            Ref: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
