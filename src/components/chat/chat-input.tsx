"use client";

import * as React from "react";
import { SendHorizonal, ImagePlus, X, Mic, MicOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";
import { cn } from "@/lib/utils";

const MAX_DIM = 1280; // px — downscale large screenshots
const JPEG_Q = 0.82;
const MAX_BYTES = 3.6 * 1024 * 1024; // safety cap on the encoded data URL

/** Resize/compress an image file into a JPEG data URL. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const r = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_Q));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Best-effort BCP-47 tag for the speech recognition request. Web Speech
 * API expects e.g. "ko-KR" / "en-US" — not just "ko" / "en".
 */
function speechLangTag(lang: string): string {
  const map: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
    zh: "zh-CN",
    "zh-TW": "zh-TW",
    es: "es-ES",
    pt: "pt-BR",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    ru: "ru-RU",
    th: "th-TH",
    vi: "vi-VN",
    id: "id-ID",
    hi: "hi-IN",
    ar: "ar-SA",
    tr: "tr-TR",
  };
  return map[lang] || "en-US";
}

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string, image?: string) => void;
  disabled?: boolean;
}) {
  const { t, lang } = useLanguage();
  const fs = getFeatureStrings(lang);
  const [value, setValue] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [listening, setListening] = React.useState(false);
  const [voiceSupported, setVoiceSupported] = React.useState(false);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const recognitionRef = React.useRef<any>(null);

  // Feature-detect the Web Speech API once on mount.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(Boolean(SR));
  }, []);

  const resize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, []);

  // Recompute textarea height when the global font-size variable changes
  // (the dropdown control mutates the CSS variable on document.documentElement).
  React.useEffect(() => {
    resize();
  }, [value, resize]);

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl.length > MAX_BYTES) {
        setErr(t.photoTooLarge);
      } else {
        setImage(dataUrl);
      }
    } catch {
      setErr(t.photoTooLarge);
    } finally {
      setBusy(false);
    }
  };

  const stopListening = React.useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErr(fs.voiceUnsupported);
      return;
    }
    if (listening) {
      stopListening();
      return;
    }
    setErr(null);
    try {
      const rec = new SR();
      rec.lang = speechLangTag(lang);
      rec.continuous = false;
      rec.interimResults = true;
      // Track the text that existed BEFORE this dictation session so
      // interim results don't clobber what the user already typed.
      const baseline = value;

      rec.onresult = (event: any) => {
        let finalChunk = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript ?? "";
          if (res.isFinal) finalChunk += transcript;
          else interim += transcript;
        }
        const sep = baseline && !baseline.endsWith(" ") ? " " : "";
        const combined = baseline + sep + finalChunk + interim;
        setValue(combined);
      };
      rec.onerror = (e: any) => {
        if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
          setErr(fs.voiceError);
        } else if (e?.error && e.error !== "no-speech" && e.error !== "aborted") {
          setErr(fs.voiceError);
        }
        setListening(false);
      };
      rec.onend = () => setListening(false);

      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setErr(fs.voiceError);
      setListening(false);
    }
  };

  const submit = () => {
    const text = value.trim();
    if (disabled || busy) return;
    if (!text && !image) return;
    if (listening) stopListening();
    onSend(text, image || undefined);
    setValue("");
    setImage(null);
    setErr(null);
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.height = "auto";
    });
  };

  return (
    <div className="border-t border-selah-gold/15 bg-selah-bg1/80 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      {image && (
        <div className="mx-auto mb-2 flex w-full max-w-2xl">
          <div className="relative">
            <img
              src={image}
              alt=""
              className="h-20 w-20 rounded-xl border border-selah-gold/25 object-cover"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label="remove"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-selah-gold/30 bg-selah-bg1 text-selah-cream2 hover:text-selah-cream"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {(err || listening) && (
        <p
          className={cn(
            "mx-auto mb-2 w-full max-w-2xl text-[12px]",
            err ? "text-red-300" : "text-selah-gold"
          )}
        >
          {err || fs.voiceListening}
        </p>
      )}

      <div className="mx-auto flex w-full max-w-2xl items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={pickFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || busy}
          title={t.attach}
          aria-label={t.attach}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-selah-gold/25 text-selah-gold transition-all",
            "hover:bg-selah-gold/[0.12] active:scale-95",
            "disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          <ImagePlus className="h-[19px] w-[19px]" />
        </button>

        {voiceSupported && (
          <button
            type="button"
            onClick={startListening}
            disabled={disabled || busy}
            title={fs.voiceStart}
            aria-label={fs.voiceStart}
            aria-pressed={listening}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95",
              listening
                ? "border-selah-gold bg-selah-gold/20 text-selah-gold animate-pulse"
                : "border-selah-gold/25 text-selah-gold hover:bg-selah-gold/[0.12]",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            {listening ? (
              <MicOff className="h-[19px] w-[19px]" />
            ) : (
              <Mic className="h-[19px] w-[19px]" />
            )}
          </button>
        )}

        <Textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder={t.placeholder}
          disabled={disabled}
          // Picks up the user's chosen size from the global CSS variable
          // (set by the font-size dropdown in the chat header). Falls back
          // to 16px when no preference has been applied yet.
          style={{ fontSize: "var(--chat-font-size, 16px)" }}
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="min-h-[48px] flex-1 rounded-3xl"
        />

        <button
          type="button"
          onClick={submit}
          disabled={disabled || busy || (!value.trim() && !image)}
          aria-label={t.send}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all",
            "bg-selah-gold text-selah-bg hover:brightness-110 active:scale-95",
            "disabled:cursor-not-allowed disabled:opacity-30"
          )}
        >
          <SendHorizonal className="h-[18px] w-[18px]" />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-selah-cream3/50">
        {t.hint}
      </p>
    </div>
  );
}
