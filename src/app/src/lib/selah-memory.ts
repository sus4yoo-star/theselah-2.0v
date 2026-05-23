import type { LangCode } from "./types";

export interface SelahMemory {
  recurring_struggles: string[];
  recent_emotions: string[];
  prayer_topics: string[];
  faith_state: string;
  relationship_themes: string[];
  important_context: string[];
  last_summary: string;
  updated_at?: string;
}

export const EMPTY_MEMORY: SelahMemory = {
  recurring_struggles: [],
  recent_emotions: [],
  prayer_topics: [],
  faith_state: "",
  relationship_themes: [],
  important_context: [],
  last_summary: "",
};

function cleanArray(value: unknown, max = 6): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .slice(0, max);
}

export function normalizeMemory(raw: any): SelahMemory {
  if (!raw) return { ...EMPTY_MEMORY };
  return {
    recurring_struggles: cleanArray(raw.recurring_struggles),
    recent_emotions: cleanArray(raw.recent_emotions),
    prayer_topics: cleanArray(raw.prayer_topics),
    faith_state: String(raw.faith_state || "").trim().slice(0, 180),
    relationship_themes: cleanArray(raw.relationship_themes),
    important_context: cleanArray(raw.important_context, 8),
    last_summary: String(raw.last_summary || "").trim().slice(0, 600),
    updated_at: raw.updated_at,
  };
}

export function memoryIsEmpty(memory?: SelahMemory | null): boolean {
  if (!memory) return true;
  return (
    memory.recurring_struggles.length === 0 &&
    memory.recent_emotions.length === 0 &&
    memory.prayer_topics.length === 0 &&
    !memory.faith_state &&
    memory.relationship_themes.length === 0 &&
    memory.important_context.length === 0 &&
    !memory.last_summary
  );
}

export function renderMemoryForPrompt(memory?: SelahMemory | null): string {
  if (memoryIsEmpty(memory)) {
    return "No long-term conversation memory is available yet.";
  }

  const m = normalizeMemory(memory);
  const lines: string[] = [];

  if (m.recurring_struggles.length) {
    lines.push(`Recurring struggles: ${m.recurring_struggles.join("; ")}`);
  }
  if (m.recent_emotions.length) {
    lines.push(`Recent emotions: ${m.recent_emotions.join("; ")}`);
  }
  if (m.faith_state) {
    lines.push(`Faith state: ${m.faith_state}`);
  }
  if (m.relationship_themes.length) {
    lines.push(`Relationship themes: ${m.relationship_themes.join("; ")}`);
  }
  if (m.prayer_topics.length) {
    lines.push(`Prayer topics: ${m.prayer_topics.join("; ")}`);
  }
  if (m.important_context.length) {
    lines.push(`Important context: ${m.important_context.join("; ")}`);
  }
  if (m.last_summary) {
    lines.push(`Recent summary: ${m.last_summary}`);
  }

  return lines.join("\n") || "No long-term conversation memory is available yet.";
}

export async function loadUserMemory(supabase: any, userId: string): Promise<SelahMemory> {
  try {
    const { data, error } = await supabase
      .from("user_memories")
      .select("memory, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return { ...EMPTY_MEMORY };
    return normalizeMemory({ ...(data.memory || {}), updated_at: data.updated_at });
  } catch {
    // The table may not exist yet. SELAH must still work.
    return { ...EMPTY_MEMORY };
  }
}

function safeJsonParse(text: string): any | null {
  try {
    let cleaned = String(text || "")
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();
    // The assistant turn is prefilled with "{", so the model continues
    // from there — re-attach the opening brace if it is missing.
    if (cleaned && !cleaned.startsWith("{")) cleaned = "{" + cleaned;
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function updateUserMemory({
  supabase,
  userId,
  apiKey,
  model,
  lang,
  previousMemory,
  userText,
  assistantText,
}: {
  supabase: any;
  userId: string;
  apiKey: string;
  model: string;
  lang: LangCode;
  previousMemory: SelahMemory;
  userText: string;
  assistantText: string;
}): Promise<void> {
  try {
    if (!userText.trim() || !assistantText.trim()) return;

    const prompt = `You update SELAH's long-term pastoral conversation memory.

Return ONLY compact JSON with this exact shape:
{
  "recurring_struggles": string[],
  "recent_emotions": string[],
  "prayer_topics": string[],
  "faith_state": string,
  "relationship_themes": string[],
  "important_context": string[],
  "last_summary": string
}

Rules:
- Preserve truly useful previous memory.
- Add only durable, pastorally useful context that helps future conversations feel remembered.
- Do NOT store random details, secrets, credentials, addresses, payment info, or anything unnecessary.
- Do NOT diagnose medical/mental conditions.
- Keep arrays short. Max 6 items, important_context max 8.
- Use the user's language when possible.
- last_summary: 1-3 sentences summarizing the latest meaningful movement.
- If the latest turn is casual or technical, keep memory mostly unchanged.

Previous memory:
${JSON.stringify(normalizeMemory(previousMemory), null, 2)}

Latest user message (${lang}):
${userText}

Latest assistant response:
${assistantText}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        temperature: 0.2,
        system:
          "You are a careful memory updater for a Christian support app. Return only valid JSON. Be conservative and privacy-preserving.",
        messages: [
          { role: "user", content: prompt },
          // Prefill forces the model to emit pure JSON, no preamble.
          { role: "assistant", content: "{" },
        ],
      }),
    });

    if (!res.ok) return;
    const json = await res.json();
    const content = Array.isArray(json?.content)
      ? json.content
          .filter((b: any) => b?.type === "text")
          .map((b: any) => b.text)
          .join("")
      : "";
    const parsed = safeJsonParse(content);
    if (!parsed) return;

    const nextMemory = normalizeMemory(parsed);

    await supabase.from("user_memories").upsert(
      {
        user_id: userId,
        memory: nextMemory,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {
    // Memory must never break chat.
  }
}
