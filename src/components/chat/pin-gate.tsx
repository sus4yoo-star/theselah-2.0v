"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFeatureStrings } from "@/lib/feature-strings";

/**
 * Optional client-side 4-digit PIN lock for /chat.
 *
 * Privacy-only — this does NOT replace authentication. The PIN is
 * stored hashed (FNV-1a, lightweight) in localStorage. Its purpose is
 * to keep a casual onlooker (family member sharing the device) from
 * seeing the user's private prayers without typing the PIN.
 *
 * Lifecycle:
 *  - If no PIN is set → renders children directly.
 *  - If PIN is set → render an entry screen; on correct PIN, mark the
 *    tab as unlocked and render children. The "unlocked" flag is per
 *    sessionStorage so it auto-resets when the tab closes.
 */

const PIN_HASH_KEY = "selah_pin_hash";
const UNLOCKED_KEY = "selah_pin_unlocked";

function fnv1a(input: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16);
}

export function isPinSet(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(PIN_HASH_KEY));
  } catch {
    return false;
  }
}

export function setPin(pin: string): boolean {
  if (!/^\d{4}$/.test(pin)) return false;
  try {
    localStorage.setItem(PIN_HASH_KEY, fnv1a(pin));
    sessionStorage.setItem(UNLOCKED_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function clearPin() {
  try {
    localStorage.removeItem(PIN_HASH_KEY);
    sessionStorage.removeItem(UNLOCKED_KEY);
  } catch {
    /* ignore */
  }
}

export function verifyPin(pin: string): boolean {
  try {
    const stored = localStorage.getItem(PIN_HASH_KEY);
    if (!stored) return true;
    const ok = stored === fnv1a(pin);
    if (ok) sessionStorage.setItem(UNLOCKED_KEY, "1");
    return ok;
  } catch {
    return false;
  }
}

export function PinGate({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const fs = getFeatureStrings(lang);

  const [needsPin, setNeedsPin] = React.useState(false);
  const [unlocked, setUnlocked] = React.useState(false);
  const [pin, setPinValue] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!isPinSet()) {
      setNeedsPin(false);
      setUnlocked(true);
      return;
    }
    if (sessionStorage.getItem(UNLOCKED_KEY) === "1") {
      setUnlocked(true);
      return;
    }
    setNeedsPin(true);
  }, []);

  const submit = (val: string) => {
    if (!/^\d{4}$/.test(val)) {
      setErr(fs.pinLockDigits);
      return;
    }
    if (verifyPin(val)) {
      setUnlocked(true);
      setNeedsPin(false);
      setErr("");
    } else {
      setErr(fs.pinLockWrong);
      setPinValue("");
    }
  };

  if (unlocked) return <>{children}</>;
  if (!needsPin) return null; // still resolving

  return (
    <main className="flex min-h-dvh items-center justify-center bg-selah-bg px-6">
      <div className="w-full max-w-xs rounded-3xl border border-selah-gold/20 bg-selah-bg1/80 p-7 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-selah-gold/30 bg-selah-gold/[0.08] text-selah-gold">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="mb-1 font-serif text-lg font-medium text-selah-cream">
          {fs.pinLockTitle}
        </h2>
        <p className="mb-5 text-[13px] text-selah-cream3">{fs.pinLockEnter}</p>

        <input
          type="tel"
          inputMode="numeric"
          autoFocus
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPinValue(v);
            setErr("");
            if (v.length === 4) submit(v);
          }}
          className="mx-auto w-full max-w-[10rem] rounded-2xl border border-selah-gold/25 bg-selah-bg px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-selah-cream outline-none focus:border-selah-gold/60"
          aria-label={fs.pinLockTitle}
        />

        {err && (
          <p className="mt-3 text-[13px] text-red-300">{err}</p>
        )}
      </div>
    </main>
  );
}
