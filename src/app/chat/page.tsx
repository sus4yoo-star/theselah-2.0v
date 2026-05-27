import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatApp } from "@/components/chat/chat-app";
import type { ChatSession, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  // Resolve the user defensively: if Supabase isn't configured (or the
  // request fails) we send the visitor to /login instead of throwing a
  // server-side exception. redirect() must stay OUTSIDE the try/catch
  // because it works by throwing a special control-flow signal.
  let userId: string | null = null;
  let userEmail = "";
  let sessions: ChatSession[] = [];
  let profile: Profile | null = null;

  try {
    const supabase = await createClient();

    // Resolve the user with a tolerant two-step probe.
    //
    // We try `getUser()` first — it's authoritative because it actually
    // verifies the JWT against Supabase. But there is a small window
    // immediately after login where the auth-token cookie is present
    // but the JWT verification hasn't propagated yet (or the network
    // call hiccups). In that window `getUser()` returns null even
    // though the session in the cookie is perfectly valid. Without a
    // fallback that's exactly the moment we'd redirect the user back
    // to /login — the "have to log in twice" bug.
    //
    // So if `getUser()` comes up empty, we read the local session
    // straight from the cookie via `getSession()`. If a session exists
    // there we trust it for this request. The next navigation will go
    // through middleware which re-verifies properly.
    let user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        user = data.session.user;
      }
    }

    if (user) {
      userId = user.id;
      userEmail = user.email ?? "";

      const [sRes, pRes] = await Promise.all([
        supabase
          .from("chat_sessions")
          .select("*")
          .order("updated_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      sessions = (sRes.data as ChatSession[]) || [];
      profile = (pRes.data as Profile) || null;
    }
  } catch {
    userId = null;
  }

  if (!userId) {
    redirect("/login?next=/chat");
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
