"use client";

import * as React from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Share, Plus, Lock, Settings } from "lucide-react";

/**
 * Helper card that appears when the user's notification permission is
 * blocked OR when the browser doesn't support push.
 *
 * Browsers do NOT let a webpage open the OS/browser notification
 * settings programmatically (a hard security boundary). The best we
 * can do is give crisp, environment-specific instructions so the user
 * isn't left stranded. We detect:
 *
 *   - iOS Safari (not installed)  → must "Add to Home Screen" first
 *   - iOS PWA (standalone)        → Settings → Notifications → [app]
 *   - Android Chrome              → site info (🔒) → permissions
 *   - Desktop Chrome/Edge         → site settings via 🔒 in URL bar
 *   - everything else             → generic guidance
 *
 * `reason` lets us pick the right copy when the issue is something
 * other than a flat-out "denied" (e.g. unsupported, no-vapid).
 */
export function NotificationHelpCard({
  reason,
  brand,
  lang,
}: {
  reason: "denied" | "unsupported-ios" | "unsupported-other" | "vapid-missing";
  brand: "SELAH" | "MANNA";
  lang: string;
}) {
  const [open, setOpen] = React.useState(true);

  const env = React.useMemo(() => detectEnv(), []);
  const ko = lang === "ko";

  // For iOS Safari (no PWA), the only path is to install. Override
  // whatever the caller passed in — denied state doesn't apply yet.
  const effectiveReason: typeof reason =
    env === "ios-safari" ? "unsupported-ios" : reason;

  const title = (() => {
    if (effectiveReason === "vapid-missing")
      return ko ? "서버 키가 아직 설정되지 않았어요" : "Server keys not configured yet";
    if (effectiveReason === "unsupported-ios")
      return ko ? "iPhone에서는 한 단계만 더!" : "Just one more step on iPhone";
    if (effectiveReason === "unsupported-other")
      return ko ? "이 브라우저는 푸시 알림을 지원하지 않아요" : "This browser doesn't support push notifications";
    return ko ? "알림이 차단되어 있어요" : "Notifications are blocked";
  })();

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-amber-300/25 bg-amber-300/[0.04]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 px-4 py-3 text-left text-amber-100"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
        <span className="flex-1 text-[13px] font-medium">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-amber-200/70" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-200/70" />
        )}
      </button>

      {open && (
        <div className="border-t border-amber-300/15 px-4 py-4 text-[13px] leading-relaxed text-amber-50/90">
          {effectiveReason === "vapid-missing" && (
            <p>
              {ko
                ? "관리자에게 알려주세요: Netlify 환경변수에 VAPID 키가 누락되어 있어 푸시를 보낼 수 없는 상태예요. (운영자: PRAYER_REMINDERS_SETUP.md 3단계 참고)"
                : "Please notify the admin: Netlify environment variables are missing VAPID keys. (Operator: see PRAYER_REMINDERS_SETUP.md step 3.)"}
            </p>
          )}

          {effectiveReason === "unsupported-ios" && <IosInstallSteps ko={ko} brand={brand} />}

          {effectiveReason === "unsupported-other" && (
            <p>
              {ko
                ? "Chrome, Edge, Firefox, 또는 Safari 최신 버전에서 다시 시도해 주세요. 모바일은 브라우저보다 홈 화면에 설치한 PWA에서 더 안정적으로 동작해요."
                : "Try again on the latest Chrome, Edge, Firefox, or Safari. On mobile, installing as a PWA works more reliably than the browser."}
            </p>
          )}

          {effectiveReason === "denied" && env === "ios-pwa" && <IosPwaUnblockSteps ko={ko} brand={brand} />}
          {effectiveReason === "denied" && env === "android-chrome" && <AndroidChromeSteps ko={ko} />}
          {effectiveReason === "denied" && env === "desktop" && <DesktopSteps ko={ko} />}
          {effectiveReason === "denied" && env === "unknown" && <GenericDeniedSteps ko={ko} />}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── */

type EnvKind = "ios-safari" | "ios-pwa" | "android-chrome" | "desktop" | "unknown";

function detectEnv(): EnvKind {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  // iPadOS 13+ reports as Mac; check touch points for Safari iPads
  const isIPadOS =
    !isIOS &&
    /Macintosh/.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  const isAndroid = /Android/.test(ua);
  const standalone =
    window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches;

  if (isIOS || isIPadOS) {
    return standalone ? "ios-pwa" : "ios-safari";
  }
  if (isAndroid) return "android-chrome";
  if (typeof window.matchMedia === "function") return "desktop";
  return "unknown";
}

/* ── Step components ───────────────────────────────────────────── */

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10 text-[11px] font-semibold text-amber-100">
        {n}
      </span>
      <div className="flex-1 text-[13px] leading-relaxed">{children}</div>
    </div>
  );
}

function IosInstallSteps({ ko, brand }: { ko: boolean; brand: string }) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-amber-100/70">
        {ko
          ? `iOS는 ${brand}를 홈 화면에 추가한 뒤에만 알림을 받을 수 있어요 (Apple 정책).`
          : `On iOS, push notifications work only after installing ${brand} to the Home Screen (Apple's policy).`}
      </p>
      <Step n={1}>
        <span className="inline-flex items-center gap-1.5">
          {ko ? "Safari 하단의 공유 버튼" : "Tap the Share button at the bottom of Safari"}
          <Share className="h-3.5 w-3.5" />
        </span>
      </Step>
      <Step n={2}>
        <span className="inline-flex items-center gap-1.5">
          {ko ? "「홈 화면에 추가」 선택" : "Select 'Add to Home Screen'"}
          <Plus className="h-3.5 w-3.5" />
        </span>
      </Step>
      <Step n={3}>
        {ko
          ? `홈 화면에 생긴 ${brand} 아이콘으로 다시 들어와 알림을 허용해 주세요.`
          : `Open ${brand} from the new icon on your Home Screen and allow notifications.`}
      </Step>
    </div>
  );
}

function IosPwaUnblockSteps({ ko, brand }: { ko: boolean; brand: string }) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-amber-100/70">
        {ko
          ? "iPhone 설정 앱에서 한 번만 풀어주시면 돼요."
          : "Toggle the permission back on from the Settings app."}
      </p>
      <Step n={1}>
        <span className="inline-flex items-center gap-1.5">
          {ko ? "아이폰 「설정」 앱 열기" : "Open the iPhone Settings app"}
          <Settings className="h-3.5 w-3.5" />
        </span>
      </Step>
      <Step n={2}>
        {ko ? "「알림」 메뉴 진입" : "Tap 'Notifications'"}
      </Step>
      <Step n={3}>
        {ko
          ? `목록에서 ${brand} 선택 → 「알림 허용」을 켜기`
          : `Find ${brand} in the list → enable 'Allow Notifications'`}
      </Step>
      <Step n={4}>
        {ko
          ? `${brand} 앱으로 돌아와 이 페이지를 새로고침하고 「리마인더 켜기」를 다시 눌러주세요.`
          : `Return to ${brand}, refresh, and tap 'Enable reminders' again.`}
      </Step>
    </div>
  );
}

function AndroidChromeSteps({ ko }: { ko: boolean }) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-amber-100/70">
        {ko
          ? "주소창 옆 자물쇠 아이콘으로 한 번에 풀 수 있어요."
          : "You can unblock from the lock icon next to the URL."}
      </p>
      <Step n={1}>
        <span className="inline-flex items-center gap-1.5">
          {ko
            ? "주소창 왼쪽의 자물쇠/튜닝 아이콘 누르기"
            : "Tap the lock / tune icon to the left of the URL bar"}
          <Lock className="h-3.5 w-3.5" />
        </span>
      </Step>
      <Step n={2}>
        {ko
          ? "「권한」 또는 「사이트 설정」 → 「알림」"
          : "'Permissions' or 'Site settings' → 'Notifications'"}
      </Step>
      <Step n={3}>
        {ko
          ? "「허용」으로 변경 (또는 「차단됨」 토글 해제)"
          : "Switch to 'Allow' (or turn off 'Blocked')"}
      </Step>
      <Step n={4}>
        {ko ? "이 페이지를 새로고침하고 다시 시도해 주세요." : "Refresh this page and try again."}
      </Step>
    </div>
  );
}

function DesktopSteps({ ko }: { ko: boolean }) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-amber-100/70">
        {ko
          ? "주소창 왼쪽 자물쇠 아이콘에서 알림을 다시 켤 수 있어요."
          : "Re-enable notifications from the lock icon in the URL bar."}
      </p>
      <Step n={1}>
        <span className="inline-flex items-center gap-1.5">
          {ko
            ? "주소창 왼쪽 자물쇠 (🔒) 아이콘 클릭"
            : "Click the lock (🔒) icon to the left of the URL"}
          <Lock className="h-3.5 w-3.5" />
        </span>
      </Step>
      <Step n={2}>
        {ko ? "「사이트 설정」 선택" : "Choose 'Site settings'"}
      </Step>
      <Step n={3}>
        {ko ? "「알림」 항목을 「허용」으로 변경" : "Change 'Notifications' to 'Allow'"}
      </Step>
      <Step n={4}>
        {ko ? "탭을 새로고침하고 「리마인더 켜기」를 다시 클릭하세요." : "Refresh the tab and click 'Enable reminders' again."}
      </Step>
    </div>
  );
}

function GenericDeniedSteps({ ko }: { ko: boolean }) {
  return (
    <div>
      <Step n={1}>
        {ko
          ? "현재 브라우저의 사이트 설정에서 이 사이트의 알림을 「허용」으로 변경해 주세요."
          : "In your browser's site settings, change notifications for this site to 'Allow'."}
      </Step>
      <Step n={2}>
        {ko ? "페이지를 새로고침하고 다시 시도해 주세요." : "Refresh the page and try again."}
      </Step>
    </div>
  );
}
