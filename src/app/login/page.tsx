"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { LanguageSelector } from "@/components/language-selector";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function LoginInner() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/chat";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const validate = useCallback(() => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.invalidEmail);
      return false;
    }
    if (password.length < 6) {
      setError(t.passwordMin);
      return false;
    }
    return true;
  }, [email, password, t]);

  const handleGoogle = useCallback(async () => {
    setError(null);
    if (!configured) {
      setError(t.authConfigMissing);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next
          )}`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  }, [configured, next, t]);

  const handleKakao = useCallback(async () => {
    setError(null);
    if (!configured) {
      setError(t.authConfigMissing);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          scopes: "profile_nickname",
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next
          )}`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  }, [configured, next, t]);

  const handleEmail = useCallback(async () => {
    setError(null);
    setSuccess(null);
    if (!configured) {
      setError(t.authConfigMissing);
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() || null, language: lang },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        // No email-verification flow: log the user in immediately.
        if (!data.session) {
          const { error: signInErr } =
            await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            setError(signInErr.message);
            setLoading(false);
            return;
          }
        }
        setSuccess(t.signup + " ✓");
        router.replace(next);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSuccess(t.login + " ✓");
      router.replace(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  }, [configured, mode, validate, email, password, name, lang, next, router, t]);

  return (
    <main className="selah-aurora flex min-h-dvh flex-col items-center justify-center overflow-y-auto px-5 py-10 selah-scroll">
      <div className="w-full max-w-[26rem] rounded-3xl border border-selah-gold/15 bg-selah-bg/60 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-rise">
        <div className="mb-5 flex items-center justify-between">
          <Logo href="/" showSub={false} />
          <LanguageSelector compact />
        </div>

        <h1 className="mb-1.5 text-lg font-medium leading-snug text-selah-cream">
          {t.authTitle}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-selah-cream2">
          {t.authDesc}
        </p>

        <Button
          variant="outline"
          className="mb-2.5 w-full"
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1A6.2 6.2 0 0 1 12 5.8a5.6 5.6 0 0 1 3.96 1.55l2.7-2.6A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.77 0 9.6-4.06 9.6-9.78 0-.66-.07-1.16-.16-1.66H12z"
            />
          </svg>
          {t.google}
        </Button>

        <button
          type="button"
          onClick={handleKakao}
          disabled={loading}
          className="mb-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] text-[14px] font-medium text-[#191919] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 256 256" aria-hidden>
            <path
              fill="#191919"
              d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434.689.405 1.49.434 2.184.151.703-.281 25.354-16.563 39.658-26.005 7.336 1.063 14.99 1.62 22.057 1.62 57.438 0 104-36.713 104-82S185.438 36 128 36z"
            />
          </svg>
          {t.kakao}
        </button>

        <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-selah-cream3">
          <span className="h-px flex-1 bg-white/10" />
          <span>{t.email}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-2.5">
          {mode === "signup" && (
            <Input
              type="text"
              placeholder={t.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}
          <Input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleEmail();
            }}
          />
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Button
          className="mt-5 w-full"
          onClick={handleEmail}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? mode === "signup"
              ? t.signingUp
              : t.loggingIn
            : mode === "signup"
            ? t.signup
            : t.login}
        </Button>

        <p className="mt-5 text-center text-[13px] text-selah-cream3">
          {mode === "login" ? t.needAccount : t.haveAccount}{" "}
          <button
            type="button"
            className="font-medium text-selah-gold underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setSuccess(null);
            }}
          >
            {mode === "login" ? t.toSignup : t.toLogin}
          </button>
        </p>

        {!configured && (
          <p className="mt-4 rounded-lg border border-selah-gold/15 bg-selah-bg2/60 px-3 py-2 text-center text-[12px] leading-relaxed text-selah-cream3">
            {t.authConfigMissing}
          </p>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="selah-aurora flex min-h-dvh items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-selah-gold" />
        </main>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
