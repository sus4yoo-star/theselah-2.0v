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
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
