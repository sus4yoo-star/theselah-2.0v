"use client";

import { useEffect, useState } from "react";
import { X, Share, Plus, Download } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const HIDE_KEY = "selah_install_prompt_hidden_until";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPrompt() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const hiddenUntil = Number(localStorage.getItem(HIDE_KEY) || 0);
    if (hiddenUntil > Date.now()) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /android/.test(ua);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari only
      window.navigator.standalone === true;

    setIsIOS(ios);
    setIsAndroid(android);

    if (standalone) return;

    // Slight delay so it feels like a gentle invitation, not a popup slam.
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    if (ios || android) {
      showTimer = setTimeout(() => setVisible(true), 1500);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleClose = () => {
    localStorage.setItem(HIDE_KEY, String(Date.now() + SEVEN_DAYS));
    setVisible(false);
  };

  if (!visible || (!isIOS && !isAndroid)) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[9999] mx-auto max-w-md animate-rise rounded-3xl border border-selah-gold/25 bg-selah-bg1/95 p-5 text-selah-cream shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <button
        onClick={handleClose}
        className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full text-selah-cream3 transition-colors hover:bg-white/5 hover:text-selah-cream"
        aria-label={t.installLater}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-7">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-selah-gold/25 bg-selah-gold/[0.08]">
          <img
            src="/symbol-transparent.png"
            alt=""
            className="h-7 w-7 object-contain"
          />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-selah-gold">
            {t.installTitle}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-selah-cream2">
            {t.installDesc}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {isAndroid && deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-selah-gold px-4 py-3 text-[14px] font-semibold text-selah-bg transition hover:brightness-110 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            {t.installButton}
          </button>
        ) : null}

        {isAndroid && !deferredPrompt ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 text-[13px] leading-relaxed text-selah-cream2">
            <Plus className="h-4 w-4 shrink-0 text-selah-gold" />
            <span>{t.installAndroid}</span>
          </div>
        ) : null}

        {isIOS ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 text-[13px] leading-relaxed text-selah-cream2">
            <Share className="h-4 w-4 shrink-0 text-selah-gold" />
            <span>{t.installIOS}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
