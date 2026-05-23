"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Share,
  Plus,
  MoreVertical,
  Smartphone,
  ArrowRight,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Platform = "ios" | "android";

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const IOS_STEPS: Step[] = [
  {
    icon: <Compass className="h-5 w-5" />,
    title: "Safari에서 열기",
    desc: "이 페이지를 Safari 브라우저에서 열어주세요. (크롬에서는 추가가 안 돼요.)",
  },
  {
    icon: <Share className="h-5 w-5" />,
    title: "하단 공유 버튼 누르기",
    desc: "화면 아래쪽 가운데에 있는 ⬆️ 모양의 공유 버튼을 눌러주세요.",
  },
  {
    icon: <Plus className="h-5 w-5" />,
    title: "‘홈 화면에 추가’ 선택",
    desc: "메뉴를 아래로 내려서 ‘홈 화면에 추가’를 찾아 눌러주세요.",
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: "오른쪽 위 ‘추가’ 누르기",
    desc: "‘추가’를 누르면 홈 화면에 SELAH 앱 아이콘이 생깁니다.",
  },
];

const ANDROID_STEPS: Step[] = [
  {
    icon: <Compass className="h-5 w-5" />,
    title: "Chrome에서 열기",
    desc: "이 페이지를 크롬(Chrome) 브라우저에서 열어주세요.",
  },
  {
    icon: <MoreVertical className="h-5 w-5" />,
    title: "오른쪽 위 ⋮ 메뉴 누르기",
    desc: "화면 오른쪽 위에 있는 점 세 개(⋮) 메뉴를 눌러주세요.",
  },
  {
    icon: <Plus className="h-5 w-5" />,
    title: "‘홈 화면에 추가’ 또는 ‘앱 설치’ 선택",
    desc: "메뉴에서 ‘홈 화면에 추가’ 또는 ‘앱 설치’를 눌러주세요.",
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: "‘추가’ 또는 ‘설치’ 누르기",
    desc: "확인을 누르면 홈 화면에 SELAH 앱 아이콘이 생깁니다.",
  },
];

export default function InstallPage() {
  const [platform, setPlatform] = useState<Platform>("ios");

  // Auto-select the visitor's device, but let them switch freely.
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isAndroid) setPlatform("android");
    else if (isIOS) setPlatform("ios");
  }, []);

  const steps = platform === "ios" ? IOS_STEPS : ANDROID_STEPS;

  return (
    <main className="selah-aurora selah-scroll flex min-h-dvh flex-col items-center overflow-y-auto px-6 pb-12 pt-[max(48px,calc(env(safe-area-inset-top)+24px))]">
      <div className="flex w-full max-w-md flex-col items-center">
        {/* Logo + breathing aura */}
        <div className="relative mb-5 flex h-24 w-32 items-center justify-center animate-fade-in">
          <span
            className="absolute left-1/2 top-1/2 h-32 w-32 animate-breathe rounded-full bg-selah-gold/10 blur-2xl"
            aria-hidden
          />
          <img
            src="/symbol-transparent.png"
            alt="SELAH"
            className="relative h-24 w-32 object-contain drop-shadow-[0_0_22px_rgba(212,175,55,0.38)]"
          />
        </div>

        <h1
          className="mb-1.5 text-center font-display text-3xl font-semibold tracking-[0.18em] text-selah-gold animate-rise"
          style={{ animationDelay: "0.05s" }}
        >
          SELAH
        </h1>
        <p
          className="mb-4 text-center text-[13px] tracking-[0.08em] text-selah-cream3 animate-rise"
          style={{ animationDelay: "0.08s" }}
        >
          크리스천을 위한 마음 동행
        </p>
        <p
          className="mb-1 text-center text-[17px] font-medium text-selah-cream animate-rise"
          style={{ animationDelay: "0.1s" }}
        >
          SELAH를 앱처럼 사용하세요
        </p>
        <p
          className="mb-8 max-w-xs text-center text-[13px] leading-relaxed text-selah-cream3 animate-rise"
          style={{ animationDelay: "0.16s" }}
        >
          홈 화면에 추가하면 앱처럼 한 번에 열 수 있어요. 설치는 필요 없습니다.
        </p>

        {/* Device tabs */}
        <div
          className="mb-6 grid w-full grid-cols-2 gap-1.5 rounded-2xl border border-selah-gold/15 bg-selah-bg1/60 p-1.5 animate-rise"
          style={{ animationDelay: "0.22s" }}
        >
          <button
            onClick={() => setPlatform("ios")}
            aria-pressed={platform === "ios"}
            className={`rounded-xl px-4 py-2.5 text-[14px] font-medium transition-all ${
              platform === "ios"
                ? "bg-selah-gold text-selah-bg shadow-[0_6px_20px_rgba(212,175,55,0.18)]"
                : "text-selah-cream2 hover:bg-white/5 hover:text-selah-cream"
            }`}
          >
            iPhone 안내
          </button>
          <button
            onClick={() => setPlatform("android")}
            aria-pressed={platform === "android"}
            className={`rounded-xl px-4 py-2.5 text-[14px] font-medium transition-all ${
              platform === "android"
                ? "bg-selah-gold text-selah-bg shadow-[0_6px_20px_rgba(212,175,55,0.18)]"
                : "text-selah-cream2 hover:bg-white/5 hover:text-selah-cream"
            }`}
          >
            Galaxy 안내
          </button>
        </div>

        {/* Step cards */}
        <div
          key={platform}
          className="flex w-full flex-col gap-3 animate-rise"
          style={{ animationDelay: "0.05s" }}
        >
          {steps.map((step, i) => (
            <div
              key={`${platform}-${i}`}
              className="flex items-start gap-4 rounded-2xl border border-selah-gold/15 bg-selah-bg1/70 px-5 py-4"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-selah-gold/30 bg-selah-gold/[0.08] text-selah-gold">
                {step.icon}
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-selah-gold text-[11px] font-bold text-selah-bg">
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[15px] font-semibold text-selah-cream">
                  {step.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-selah-cream2">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Open SELAH */}
        <Button
          asChild
          size="lg"
          className="mt-8 w-full max-w-xs animate-rise"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/">
            SELAH 열기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <p
          className="mt-6 max-w-xs text-center text-xs leading-relaxed text-selah-cream3 animate-rise"
          style={{ animationDelay: "0.36s" }}
        >
          잘 안 되시나요? 위 탭에서 다른 기기 안내를 확인해 보세요.
        </p>
      </div>
    </main>
  );
}
