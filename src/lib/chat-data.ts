"use client";

import { createClient } from "@/lib/supabase/client";
import type { ChatSession, Message, LangCode, Role } from "@/lib/types";

export async function listSessions(): Promise<ChatSession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as ChatSession[]) || [];
}

export async function createSession(
  userId: string,
  title: string
): Promise<ChatSession> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, title })
    .select("*")
    .single();
  if (error) throw error;
  return data as ChatSession;
}

export async function renameSession(id: string, title: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSession(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function listMessages(sessionId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as Message[]) || [];
}

export async function saveMessage(
  sessionId: string,
  role: Role,
  content: string,
  language: LangCode
): Promise<Message> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ session_id: sessionId, role, content, language })
    .select("*")
    .single();
  if (error) throw error;
  return data as Message;
}
