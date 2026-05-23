"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const STORAGE_KEY = "selah_add_to_home_prompt_closed_at";
const DISMISS_DAYS = 7;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function recentlyDismissed() {
  if (typeof window === "undefined") return true;
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) return false;
  const closedAt = Number(value);
  if (Number.isNaN(closedAt)) return false;
  return Date.now() - closedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export default function AddToHomePrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const ios = useMemo(() => isIOS(), []);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const timer = window.setTimeout(() => {
      if (ios) setVisible(true);
    }, 1200);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      window.setTimeout(() => setVisible(true), 800);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, [ios]);

  const close = () => {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") close();
    setDeferredPrompt(null);
  };

  if (!visible || isStandalone()) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 sm:flex sm:justify-center">
      <div className="w-full max-w-md rounded-3xl border border-[#d8b86a]/30 bg-[#071b36]/95 p-5 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <img src="/icon-192.png" alt="SELAH" className="h-12 w-12 rounded-2xl shadow-lg" />
          <div className="flex-1">
            <p className="text-base font-semibold text-[#f1d27a]">SELAH를 홈 화면에 추가해보세요</p>
            <p className="mt-1 text-sm leading-6 text-white/80">
              앱처럼 바로 열고, 더 편하게 말씀과 위로를 만날 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="rounded-full px-2 text-2xl leading-none text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>

        {ios ? (
          <div className="mt-4 rounded-2xl bg-white/8 p-4 text-sm leading-7 text-white/85">
            <p>iPhone에서는 아래 순서로 추가하세요.</p>
            <p className="mt-1 text-[#f1d27a]">Safari 공유 버튼 → 홈 화면에 추가 → 추가</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={install}
            disabled={!deferredPrompt}
            className="mt-4 w-full rounded-2xl bg-[#d8b86a] px-4 py-3 text-sm font-bold text-[#071b36] shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            홈 화면에 추가하기
          </button>
        )}
      </div>
    </div>
  );
}
