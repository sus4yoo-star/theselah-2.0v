import { NextRequest } from "next/server";
import { buildSystemPrompt, classifyIntent } from "@/lib/prompt";
import { normalizeLang, detectLangFromText } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { loadUserMemory, updateUserMemory } from "@/lib/selah-memory";
import {
  ANTHROPIC_VERSION,
  defaultModel,
  splitDataUrl,
} from "@/lib/anthropic";
import type { LangCode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface InMsg {
  role: "user" | "assistant";
  content: string;
}

interface Body {
  messages: InMsg[];
  lang?: string;
  bibleMode?: boolean;
  /** Optional data-URL of an image attached to the latest user turn. */
  image?: string;
  /** Current chat session id, used for future memory features. */
  sessionId?: string | null;
}

function lastUserText(messages: InMsg[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content || "";
  }
  return "";
}

export async function POST(req: NextRequest) {
  // Only signed-in users may reach the model — protects the API key.
  let supabase: any;
  let userId = "";
  try {
    supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Please sign in to continue." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    userId = user.id;
  } catch {
    return new Response(
      JSON.stringify({ error: "Authentication check failed." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY is not configured. Add it in your environment variables.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
  if (messages.length === 0) {
    return new Response("No messages", { status: 400 });
  }

  const userText = lastUserText(messages);
  // Prefer the explicit UI language, but respect the language actually
  // written if it clearly differs.
  const uiLang = normalizeLang(body.lang);
  const detected = detectLangFromText(userText);
  const lang: LangCode = (detected || uiLang) as LangCode;

  const image =
    typeof body.image === "string" && body.image.startsWith("data:image/")
      ? body.image
      : "";
  const hasImage = Boolean(image);

  const bibleMode = Boolean(body.bibleMode);
  let intent = classifyIntent(userText);
  // A screenshot (often a KakaoTalk/messenger conversation) without a
  // clear Bible/general request is almost always an emotional situation.
  if (hasImage && intent === "general") intent = "emotional";
  const memory = await loadUserMemory(supabase, userId);
  const system = buildSystemPrompt({ lang, bibleMode, intent, hasImage, memory });

  const model = defaultModel();

  // Find the latest user turn (the one that may carry an image).
  let lastUserIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      lastUserIdx = i;
      break;
    }
  }

  // Anthropic requires the conversation to begin with a user turn and to
  // alternate cleanly. Drop any leading assistant messages from the slice
  // and collapse accidental consecutive same-role turns.
  let firstUser = messages.findIndex((m) => m.role === "user");
  if (firstUser < 0) firstUser = messages.length;
  const trimmed = messages.slice(firstUser);
  const offset = firstUser;

  const claudeMessages: any[] = [];
  trimmed.forEach((m, idx) => {
    const absoluteIdx = idx + offset;
    const text = String(m.content || "").trim();

    let content: any;
    if (hasImage && absoluteIdx === lastUserIdx) {
      const parsed = splitDataUrl(image);
      const blocks: any[] = [];
      if (parsed) {
        blocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: parsed.mediaType,
            data: parsed.data,
          },
        });
      }
      blocks.push({
        type: "text",
        text: text || "Please look carefully at the attached image and respond.",
      });
      content = blocks;
    } else {
      content = text || "…";
    }

    const prev = claudeMessages[claudeMessages.length - 1];
    if (prev && prev.role === m.role) {
      // Merge a stray same-role turn so alternation stays valid.
      if (typeof prev.content === "string" && typeof content === "string") {
        prev.content = `${prev.content}\n\n${content}`;
      } else {
        const a = Array.isArray(prev.content)
          ? prev.content
          : [{ type: "text", text: String(prev.content) }];
        const b = Array.isArray(content)
          ? content
          : [{ type: "text", text: String(content) }];
        prev.content = [...a, ...b];
      }
      return;
    }
    claudeMessages.push({ role: m.role, content });
  });

  if (claudeMessages.length === 0 || claudeMessages[0].role !== "user") {
    return new Response("No messages", { status: 400 });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      stream: true,
      // Warm and varied without drifting; Anthropic caps temperature at 1.
      temperature: 0.8,
      max_tokens: 1800,
      system,
      messages: claudeMessages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    let detail = "";
    try {
      const j = await upstream.json();
      detail = j?.error?.message || "";
    } catch {
      /* ignore */
    }
    const status =
      upstream.status === 401 || upstream.status === 403 ? 401 : 502;
    return new Response(
      JSON.stringify({
        error:
          status === 401
            ? "Anthropic authentication failed. Check ANTHROPIC_API_KEY."
            : `Anthropic request failed${detail ? `: ${detail}` : "."}`,
      }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Transform Anthropic's SSE stream into a clean text stream of content
  // deltas. The client renders the typing animation and parses the
  // structured XML once complete.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      let assistantText = "";
      let finalized = false;

      const finalize = async () => {
        if (finalized) return;
        finalized = true;
        if (assistantText.trim()) {
          await updateUserMemory({
            supabase,
            userId,
            apiKey,
            model,
            lang,
            previousMemory: memory,
            userText,
            assistantText,
          });
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const raw of lines) {
            const line = raw.trim();
            // Anthropic SSE: lines are "event: <name>" and "data: <json>".
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const type = json?.type;

              if (type === "content_block_delta") {
                const delta = json?.delta;
                if (delta?.type === "text_delta" && delta.text) {
                  assistantText += delta.text;
                  controller.enqueue(encoder.encode(delta.text));
                }
              } else if (type === "message_stop") {
                await finalize();
                controller.close();
                return;
              } else if (type === "error") {
                // Surface a short, safe note instead of a silent stop —
                // otherwise the UI shows a blank assistant bubble.
                const msg = json?.error?.message
                  ? ` (${json.error.message})`
                  : "";
                if (!assistantText) {
                  controller.enqueue(
                    encoder.encode(
                      `<direction>잠시 문제가 생겼어요. 곧 다시 시도해 주세요.${msg}</direction>`
                    )
                  );
                }
                await finalize();
                controller.close();
                return;
              }
            } catch {
              /* skip malformed chunk */
            }
          }
        }
      } catch {
        /* upstream closed */
      } finally {
        await finalize();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "X-Selah-Intent": intent,
      "X-Selah-Lang": lang,
      "X-Selah-Model": model,
    },
  });
}
