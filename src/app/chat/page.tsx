"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatApp } from "@/components/chat/chat-app";
import { Loader2 } from "lucide-react";
import type { ChatSession, Profile } from "@/lib/types";

/**
 * Client-side /chat with an auth guard.
 *
 * In the static (Capacitor) build there is no server to do the auth
 * check, so we do it here: read the session on the client, and if the
 * user isn't signed in, send them to /login. While we resolve the
 * session we show a quiet loading state so there's no flash of the chat
 * UI for signed-out users.
 *
 * Initial sessions + profile, which the old server component fetched and
 * passed as props, are now fetched client-side right here.
 */
export default function ChatPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [userId, setUserId] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();

        // Two-step probe, same tolerance as the old server component:
        // getUser() is authoritative; fall back to the cookie session
        // if it briefly returns null right after login.
        let user = (await supabase.auth.getUser()).data.user;
        if (!user) {
          const { data } = await supabase.auth.getSession();
          user = data.session?.user ?? null;
        }

        if (!user) {
          router.replace("/login?next=/chat");
          return;
        }

        if (cancelled) return;
        setUserId(user.id);
        setUserEmail(user.email ?? "");

        const [sRes, pRes] = await Promise.all([
          supabase
            .from("chat_sessions")
            .select("*")
            .order("updated_at", { ascending: false }),
          supabase.from("profiles").select("*").eq("id", user.id).single(),
        ]);

        if (cancelled) return;
        setSessions((sRes.data as ChatSession[]) || []);
        setProfile((pRes.data as Profile) || null);
        setReady(true);
      } catch {
        if (!cancelled) router.replace("/login?next=/chat");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="selah-aurora flex min-h-dvh items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-selah-gold/70" />
      </main>
    );
  }

  return (
    <ChatApp
      userId={userId}
      userEmail={userEmail}
      initialSessions={sessions}
      profile={profile}
    />
  );
}
