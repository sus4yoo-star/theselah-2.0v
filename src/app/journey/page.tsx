"use client";

import * as React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { ArrowLeft, Share2, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";
import { createClient } from "@/lib/supabase/client";
import type { ChatSession, Message } from "@/lib/types";
import { scoreEmotion, labelFor, type EmotionLabel } from "@/lib/emotion-detect";
import { buildJourneyCardSvg } from "@/lib/journey-card";
import { svgToPngBlob, downloadBlob } from "@/lib/share-card";
import { AmovFooter } from "@/components/amov-footer";

/**
 * Mood-journey page.
 *
 * Privacy: all sentiment scoring runs CLIENT-SIDE over messages already
 * fetched from Supabase. Nothing extra is logged or persisted.
 *
 * Share: one tap turns the user's stats into a 1080×1920 Instagram-story
 * image (same palette as the prayer cards) — Web Share with a file on
 * mobile (KakaoTalk / IG / Messages), download fallback on desktop.
 */

const RANGE_OPTIONS: { value: 7 | 30 | 90; ko: string; en: string }[] = [
  { value: 7, ko: "지난 7일", en: "Last 7 days" },
  { value: 30, ko: "지난 30일", en: "Last 30 days" },
  { value: 90, ko: "지난 90일", en: "Last 90 days" },
];

interface DayPoint {
  date: string;
  iso: string;
  valence: number;
  count: number;
  topLabel: EmotionLabel | null;
}

function buildSeries(messages: Message[], rangeDays: number, lang: string): DayPoint[] {
  const now = Date.now();
  const cutoff = now - rangeDays * 24 * 60 * 60 * 1000;
  const buckets = new Map<string, { sum: number; count: number; labels: Map<EmotionLabel, number>; iso: string }>();
  for (const m of messages) {
    if (m.role !== "user") continue;
    const ts = new Date(m.created_at).getTime();
    if (isNaN(ts) || ts < cutoff) continue;
    const d = new Date(ts);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const res = scoreEmotion(m.content, lang);
    if (res.confidence === 0) continue;
    let b = buckets.get(key);
    if (!b) {
      b = { sum: 0, count: 0, labels: new Map(), iso: d.toISOString() };
      buckets.set(key, b);
    }
    b.sum += res.valence;
    b.count++;
    if (res.label) b.labels.set(res.label, (b.labels.get(res.label) ?? 0) + 1);
  }
  const points: DayPoint[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const b = buckets.get(key);
    let topLabel: EmotionLabel | null = null;
    if (b && b.labels.size > 0) {
      let best = 0;
      for (const [lab, c] of b.labels) {
        if (c > best) {
          best = c;
          topLabel = lab;
        }
      }
    }
    points.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      iso: d.toISOString(),
      valence: b ? b.sum / b.count : 0,
      count: b?.count ?? 0,
      topLabel,
    });
  }
  return points;
}

export default function JourneyPage() {
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [, setSessions] = React.useState<ChatSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sharing, setSharing] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const [range, setRange] = React.useState<7 | 30 | 90>(30);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setLoading(false);
          return;
        }
        const [sessRes, msgsRes] = await Promise.all([
          supabase.from("chat_sessions").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: true }),
          supabase.from("chat_messages").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: true }),
        ]);
        if (cancelled) return;
        setSessions((sessRes.data as ChatSession[]) || []);
        setMessages((msgsRes.data as Message[]) || []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const points = React.useMemo(() => buildSeries(messages, range, lang), [messages, range, lang]);

  const positiveDays = points.filter((p) => p.valence > 0.15).length;
  const negativeDays = points.filter((p) => p.valence < -0.15).length;
  const totalActive = points.filter((p) => p.count > 0).length;

  /* Top feelings across the window — for the share card */
  const topFeelings = React.useMemo(() => {
    const counts = new Map<EmotionLabel, number>();
    for (const m of messages) {
      if (m.role !== "user") continue;
      const ts = new Date(m.created_at).getTime();
      if (ts < Date.now() - range * 24 * 60 * 60 * 1000) continue;
      const r = scoreEmotion(m.content, lang);
      if (r.label) counts.set(r.label, (counts.get(r.label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label: labelFor(label, lang), count }));
  }, [messages, range, lang]);

  const handleShareImage = async () => {
    if (sharing || messages.length === 0) return;
    setSharing(true);
    try {
      const rangeLabel =
        lang === "ko"
          ? range === 7 ? "지난 7일" : range === 30 ? "지난 30일" : "지난 90일"
          : range === 7 ? "Last 7 days" : range === 30 ? "Last 30 days" : "Last 90 days";

      const svg = buildJourneyCardSvg({
        variant: "selah",
        brandLabel: "SELAH",
        tagline: "Pause before you respond",
        title: fs.journeyTitle,
        rangeLabel,
        activeDays: totalActive,
        positiveDays,
        hardDays: negativeDays,
        activeLabel: fs.journeyActiveDays,
        positiveLabel: fs.journeyPositive,
        hardLabel: fs.journeyHard,
        series: points.map((pt) => ({ valence: pt.valence })),
        topFeelings,
        topFeelingsTitle: fs.journeyRecent,
        disclaimer: fs.journeyDisclaimer,
        footer: "selah.theamov.com",
      });
      const blob = await svgToPngBlob(svg);
      const file = new File([blob], `selah-journey-${Date.now()}.png`, { type: "image/png" });
      const shareData: any = { files: [file] };
      const canFileShare =
        typeof navigator.share === "function" &&
        typeof (navigator as any).canShare === "function" &&
        (navigator as any).canShare(shareData);
      if (canFileShare) {
        try {
          await (navigator as any).share(shareData);
        } catch {
          downloadBlob(blob, `selah-journey-${Date.now()}.png`);
        }
      } else {
        downloadBlob(blob, `selah-journey-${Date.now()}.png`);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch (e) {
      console.error("[SELAH] journey share failed:", e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="selah-aurora selah-scroll min-h-dvh overflow-y-auto pb-12">
      <header
        className="sticky top-0 z-10 border-b border-white/[0.06] bg-selah-bg/85 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3">
          <Link
            href="/chat"
            className="rounded-lg p-2 text-selah-cream2 hover:bg-white/[0.04] hover:text-selah-cream"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-serif text-lg text-selah-cream">
            {fs.journeyTitle}
          </h1>
          <button
            type="button"
            onClick={handleShareImage}
            disabled={sharing || messages.length === 0}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-selah-gold/30 px-3 py-1.5 text-[12px] font-medium text-selah-gold transition hover:bg-selah-gold/[0.08] disabled:opacity-50"
          >
            {sharing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : shared ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
            {sharing ? fs.journalExporting : shared ? fs.imageSaved : fs.saveAsImage}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pt-6">
        <div className="mb-5 flex gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                range === opt.value
                  ? "border-selah-gold/45 bg-selah-gold/[0.08] text-selah-gold"
                  : "border-white/10 text-selah-cream2 hover:text-selah-cream"
              }`}
            >
              {lang === "ko" ? opt.ko : opt.en}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-selah-gold/70" />
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-selah-bg1/40 px-6 py-12 text-center">
            <p className="text-[15px] leading-relaxed text-selah-cream2">
              {fs.journeyEmpty}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/[0.06] bg-selah-bg1/50 px-3 py-3 text-center">
                <div className="text-[11px] uppercase tracking-[0.14em] text-selah-cream3">{fs.journeyActiveDays}</div>
                <div className="mt-1 font-serif text-2xl text-selah-cream">{totalActive}</div>
              </div>
              <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-3 text-center">
                <div className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/70">{fs.journeyPositive}</div>
                <div className="mt-1 font-serif text-2xl text-emerald-100">{positiveDays}</div>
              </div>
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] px-3 py-3 text-center">
                <div className="text-[11px] uppercase tracking-[0.14em] text-amber-200/70">{fs.journeyHard}</div>
                <div className="mt-1 font-serif text-2xl text-amber-100">{negativeDays}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-selah-bg1/50 p-3">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={points} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#86efac" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#86efac" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#cdd8d2", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} interval="preserveStartEnd" minTickGap={28} />
                    <YAxis domain={[-1, 1]} tick={{ fill: "#cdd8d2", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => (v > 0.3 ? "🙂" : v < -0.3 ? "😔" : "·")} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                    <Tooltip
                      cursor={{ stroke: "rgba(227,185,117,0.25)" }}
                      contentStyle={{ background: "#0d1c30", border: "1px solid rgba(227,185,117,0.3)", borderRadius: 12, color: "#f3efe6", fontSize: 12 }}
                      formatter={(value: number, _name, payload) => {
                        const p = payload?.payload as DayPoint | undefined;
                        const lab = p?.topLabel ? labelFor(p.topLabel, lang) : "";
                        return [`${value.toFixed(2)} ${lab}`, fs.journeyValence];
                      }}
                    />
                    <Area type="monotone" dataKey="valence" stroke="#e3b975" strokeWidth={2} fill="url(#posGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 px-2 text-[11px] text-selah-cream3">{fs.journeyDisclaimer}</p>
            </div>

            <h2 className="mt-7 mb-3 font-serif text-[15px] text-selah-cream">{fs.journeyRecent}</h2>
            <div className="space-y-1.5">
              {points.slice().reverse().filter((p) => p.topLabel).slice(0, 7).map((p) => (
                <div key={p.iso} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-selah-bg1/40 px-4 py-2.5">
                  <span className="text-[13px] text-selah-cream2">{p.date}</span>
                  <span className="text-[13px] text-selah-gold">{labelFor(p.topLabel, lang)}</span>
                </div>
              ))}
              {points.filter((p) => p.topLabel).length === 0 && (
                <p className="px-2 text-[13px] text-selah-cream3">{fs.journeyNoLabels}</p>
              )}
            </div>
          </>
        )}

        <AmovFooter />
      </div>
    </main>
  );
}
