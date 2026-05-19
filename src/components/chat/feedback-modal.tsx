"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const APP_ID = "selah";

// Self-contained copy (no i18n.ts changes needed) — moved out of the donate modal.
type FbCopy = {
  menu: string;
  title: string;
  sub: string;
  placeholder: string;
  send: string;
  sending: string;
  thanks: string;
  error: string;
};

function fbCopy(lang: string): FbCopy {
  const map: Record<string, FbCopy> = {
    ko: {
      menu: "문의하기",
      title: "셀라는 어떠셨나요?",
      sub: "더 따뜻한 동행이 될 수 있도록, 칭찬이나 개선점을 들려주세요 😊",
      placeholder: "마음에 드신 점이나 아쉬운 점을 자유롭게 적어주세요…",
      send: "보내기",
      sending: "보내는 중…",
      thanks: "소중한 마음 고맙습니다 🌿 더 따뜻한 셀라가 되겠습니다.",
      error: "잠시 후 다시 시도해 주세요.",
    },
    en: {
      menu: "Feedback",
      title: "How was SELAH for you?",
      sub: "Help us become a warmer companion — share a kind word or what could be better 😊",
      placeholder: "Tell us what you liked or what we could improve…",
      send: "Send",
      sending: "Sending…",
      thanks: "Thank you for sharing 🌿 We'll keep growing warmer.",
      error: "Please try again in a moment.",
    },
    th: {
      menu: "ส่งความคิดเห็น",
      title: "SELAH เป็นอย่างไรบ้าง?",
      sub: "ช่วยให้เราอบอุ่นยิ่งขึ้น บอกคำชมหรือสิ่งที่ควรปรับปรุงได้เลย 😊",
      placeholder: "บอกสิ่งที่คุณชอบหรือสิ่งที่เราควรปรับปรุง…",
      send: "ส่ง",
      sending: "กำลังส่ง…",
      thanks: "ขอบคุณที่แบ่งปัน 🌿 เราจะอบอุ่นยิ่งขึ้น",
      error: "โปรดลองอีกครั้งในอีกสักครู่",
    },
    es: {
      menu: "Comentarios",
      title: "¿Cómo te fue con SELAH?",
      sub: "Ayúdanos a ser una compañía más cálida: comparte un elogio o algo a mejorar 😊",
      placeholder: "Cuéntanos qué te gustó o qué podríamos mejorar…",
      send: "Enviar",
      sending: "Enviando…",
      thanks: "Gracias por compartir 🌿 Seguiremos creciendo con calidez.",
      error: "Inténtalo de nuevo en un momento.",
    },
    pt: {
      menu: "Comentários",
      title: "Como foi o SELAH para você?",
      sub: "Ajude-nos a ser uma companhia mais acolhedora: deixe um elogio ou o que melhorar 😊",
      placeholder: "Conte o que você gostou ou o que podemos melhorar…",
      send: "Enviar",
      sending: "Enviando…",
      thanks: "Obrigado por compartilhar 🌿 Vamos ficar ainda mais acolhedores.",
      error: "Tente novamente em instantes.",
    },
    hi: {
      menu: "प्रतिक्रिया",
      title: "SELAH आपको कैसा लगा?",
      sub: "हमें और गर्मजोश बनने में मदद करें — तारीफ़ या सुधार बताइए 😊",
      placeholder: "जो अच्छा लगा या जो बेहतर हो सकता है, लिखें…",
      send: "भेजें",
      sending: "भेजा जा रहा है…",
      thanks: "साझा करने के लिए धन्यवाद 🌿 हम और गर्मजोश बनेंगे।",
      error: "कृपया थोड़ी देर बाद पुनः प्रयास करें।",
    },
    zh: {
      menu: "反馈",
      title: "SELAH 用得还好吗？",
      sub: "帮助我们成为更温暖的陪伴——说说赞美或可改进之处 😊",
      placeholder: "告诉我们你喜欢的或可以改进的地方…",
      send: "发送",
      sending: "发送中…",
      thanks: "谢谢你的分享 🌿 我们会更温暖。",
      error: "请稍后再试。",
    },
  };
  return map[lang] || map.en;
}

/** Localized label for the account-menu entry. */
export function feedbackLabel(lang: string): string {
  return fbCopy(lang).menu;
}

export function FeedbackModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const [fbText, setFbText] = React.useState("");
  const [fbStatus, setFbStatus] = React.useState<
    "idle" | "sending" | "done" | "error"
  >("idle");
  const fb = fbCopy(lang);

  const sendFeedback = async () => {
    const message = fbText.trim();
    if (!message || fbStatus === "sending") return;
    if (!isSupabaseConfigured()) {
      setFbStatus("error");
      return;
    }
    setFbStatus("sending");
    try {
      const supabase = createClient();
      let email = "";
      try {
        const { data } = await supabase.auth.getUser();
        email = data.user?.email || "";
      } catch {
        /* not logged in — fine */
      }
      const { error } = await supabase.from("app_feedback").insert({
        app: APP_ID,
        lang,
        email,
        message: message.slice(0, 4000),
      });
      if (error) {
        setFbStatus("error");
        return;
      }
      setFbText("");
      setFbStatus("done");
    } catch {
      setFbStatus("error");
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset transient state whenever the modal is reopened.
  React.useEffect(() => {
    if (open) {
      setFbText("");
      setFbStatus("idle");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-selah-gold/20 bg-selah-bg1 shadow-[0_30px_90px_rgba(0,0,0,0.55)] animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-selah-cream3 transition-colors hover:bg-white/5 hover:text-selah-cream"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pb-7 pt-9 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-selah-gold/25 bg-selah-gold/[0.08] text-2xl">
            💬
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold tracking-wide text-selah-gold">
            {fb.title}
          </h2>
          <p className="mx-auto mb-6 max-w-xs text-[14px] leading-relaxed text-selah-cream2">
            {fb.sub}
          </p>

          {fbStatus === "done" ? (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-3 text-[13px] leading-relaxed text-emerald-200">
              {fb.thanks}
            </p>
          ) : (
            <div className="text-left">
              <textarea
                value={fbText}
                onChange={(e) => {
                  setFbText(e.target.value);
                  if (fbStatus === "error") setFbStatus("idle");
                }}
                rows={4}
                maxLength={4000}
                placeholder={fb.placeholder}
                className="w-full resize-none rounded-xl border border-white/10 bg-selah-bg/70 px-3 py-2.5 text-[13px] leading-relaxed text-selah-cream placeholder:text-selah-cream3/60 outline-none transition-colors focus:border-selah-gold/40"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-selah-cream3">
                  {fbStatus === "error" ? fb.error : ""}
                </span>
                <button
                  onClick={sendFeedback}
                  disabled={!fbText.trim() || fbStatus === "sending"}
                  className={cn(
                    "rounded-xl px-4 py-2 text-[13px] font-medium transition-colors",
                    !fbText.trim() || fbStatus === "sending"
                      ? "cursor-not-allowed border border-white/10 text-selah-cream3"
                      : "bg-selah-gold text-selah-bg hover:opacity-90"
                  )}
                >
                  {fbStatus === "sending" ? fb.sending : fb.send}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
