"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Bell, BellOff, Loader2, Check, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";
import {
  pushSupported,
  notificationPermission,
  requestPermission,
  subscribePush,
  unsubscribePush,
} from "@/lib/push-client";
import { AmovFooter } from "@/components/amov-footer";
import { NotificationHelpCard } from "@/components/chat/notification-help-card";

interface RemRow {
  enabled: boolean;
  hh_mm: string;
  timezone: string;
  message: string | null;
  lang: string;
}

const DEFAULT_TZ =
  typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul"
    : "Asia/Seoul";

export default function RemindersPage() {
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);

  const [supported, setSupported] = React.useState(true);
  const [perm, setPerm] = React.useState<NotificationPermission>("default");
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [savedNote, setSavedNote] = React.useState<string | null>(null);
  const [errNote, setErrNote] = React.useState<string | null>(null);

  const [enabled, setEnabled] = React.useState(false);
  const [hhmm, setHhmm] = React.useState("08:00");
  const [tz, setTz] = React.useState(DEFAULT_TZ);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setSupported(pushSupported());
    setPerm(notificationPermission());

    (async () => {
      try {
        const res = await fetch("/api/reminders", { credentials: "include" });
        if (res.ok) {
          const j = await res.json();
          const r: RemRow | null = j.reminder;
          if (r) {
            setEnabled(r.enabled);
            setHhmm(r.hh_mm || "08:00");
            setTz(r.timezone || DEFAULT_TZ);
            setMessage(r.message || "");
          }
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const flash = (kind: "ok" | "err", text: string) => {
    if (kind === "ok") {
      setSavedNote(text);
      setErrNote(null);
      setTimeout(() => setSavedNote(null), 2200);
    } else {
      setErrNote(text);
      setSavedNote(null);
      setTimeout(() => setErrNote(null), 3500);
    }
  };

  const saveServer = async (next: { enabled: boolean }) => {
    const body = {
      enabled: next.enabled,
      hh_mm: hhmm,
      timezone: tz,
      message: message.trim() || null,
      lang,
    };
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("save-failed");
  };

  const handleEnable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!supported) {
        flash("err", fs.reminderUnsupported);
        return;
      }
      const p = await requestPermission();
      setPerm(p);
      if (p !== "granted") {
        flash("err", fs.reminderPermissionDenied);
        return;
      }
      const sub = await subscribePush();
      if (!sub.ok) {
        flash(
          "err",
          sub.reason === "no-vapid"
            ? "서버 키가 설정되지 않았어요."
            : fs.reminderPermissionDenied
        );
        return;
      }
      await saveServer({ enabled: true });
      setEnabled(true);
      flash("ok", fs.reminderSaved);
    } catch {
      flash("err", fs.reminderPermissionDenied);
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await unsubscribePush();
      await saveServer({ enabled: false });
      setEnabled(false);
      flash("ok", "꺼졌어요.");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const handleSavePref = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await saveServer({ enabled });
      flash("ok", fs.reminderSaved);
    } catch {
      flash("err", "저장에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        flash("ok", fs.reminderTestSent);
      } else {
        flash("err", fs.reminderPermissionDenied);
      }
    } catch {
      flash("err", fs.reminderPermissionDenied);
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="selah-aurora selah-scroll min-h-dvh overflow-y-auto pb-12">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-selah-bg/85 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3">
          <Link
            href="/chat"
            className="rounded-lg p-2 text-selah-cream2 hover:bg-white/[0.04] hover:text-selah-cream"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-serif text-lg text-selah-cream">
            {fs.reminderTitle}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-5 pt-6">
        {!supported && (
          <NotificationHelpCard
            reason="unsupported-other"
            brand="SELAH"
            lang={lang}
          />
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-selah-gold/70" />
          </div>
        ) : (
          <>
            {/* Enable / disable */}
            <div className="mb-4 rounded-2xl border border-selah-gold/15 bg-selah-bg1/40 px-5 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-selah-gold/30 bg-selah-gold/[0.08] text-selah-gold">
                  {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-selah-cream">
                    {enabled ? fs.reminderDisable : fs.reminderEnable}
                  </p>
                  <p className="text-[12px] text-selah-cream3">
                    {enabled ? `${hhmm} · ${tz}` : "·"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy || !supported}
                  onClick={enabled ? handleDisable : handleEnable}
                  className={
                    enabled
                      ? "rounded-full border border-white/15 px-4 py-2 text-[13px] text-selah-cream2 hover:bg-white/5 disabled:opacity-50"
                      : "rounded-full bg-selah-gold px-4 py-2 text-[13px] font-semibold text-selah-bg hover:brightness-110 disabled:opacity-50"
                  }
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : enabled ? fs.reminderDisable : fs.reminderEnable}
                </button>
              </div>
            </div>

            {/* Time + message */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/[0.06] bg-selah-bg1/40 px-5 py-4">
                <label className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-selah-cream3">
                  {fs.reminderTime}
                </label>
                <input
                  type="time"
                  value={hhmm}
                  onChange={(e) => setHhmm(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-selah-bg/40 px-4 py-3 text-[16px] text-selah-cream outline-none focus:border-selah-gold/45"
                />
                <p className="mt-1 text-[11px] text-selah-cream3">
                  {tz}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-selah-bg1/40 px-5 py-4">
                <label className="mb-2 block text-[12px] uppercase tracking-[0.14em] text-selah-cream3">
                  {fs.reminderMessage}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                  placeholder={
                    lang === "ko"
                      ? fs.reminderDefaultMsgSelah
                      : fs.reminderDefaultMsgSelah
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-selah-bg/40 px-4 py-3 text-[14px] leading-relaxed text-selah-cream placeholder:text-selah-cream3/50 outline-none focus:border-selah-gold/45"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={handleSavePref}
                className="rounded-2xl bg-selah-gold px-5 py-2.5 text-[14px] font-semibold text-selah-bg hover:brightness-110 disabled:opacity-50"
              >
                {fs.guideDone}
              </button>
              {enabled && (
                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTest}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-selah-gold/30 px-5 py-2.5 text-[14px] text-selah-gold hover:bg-selah-gold/[0.08] disabled:opacity-50"
                >
                  {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
                  {fs.reminderTestSend}
                </button>
              )}
            </div>

            {savedNote && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-300/[0.06] px-4 py-2.5 text-[13px] text-emerald-100">
                <Check className="h-3.5 w-3.5" />
                {savedNote}
              </div>
            )}
            {errNote && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] px-4 py-2.5 text-[13px] text-amber-100">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {errNote}
              </div>
            )}

            {perm === "denied" && (
              <NotificationHelpCard
                reason="denied"
                brand="SELAH"
                lang={lang}
              />
            )}
          </>
        )}

        <AmovFooter />
      </div>
    </main>
  );
}
