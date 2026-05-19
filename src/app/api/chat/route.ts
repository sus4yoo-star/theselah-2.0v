import { NextRequest } from "next/server";
import { buildSystemPrompt, classifyIntent } from "@/lib/prompt";
import { normalizeLang, detectLangFromText } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { loadUserMemory, updateUserMemory } from "@/lib/selah-memory";
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

/**
 * Parse a `data:image/...;base64,...` URL into the shape the Anthropic
 * Messages API expects. Returns null if it is not a usable image.
 */
function parseDataUrl(
  dataUrl: string
): { media_type: string; data: string } | null {
  const m = /^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/i.exec(
    dataUrl.trim()
  );
  if (!m) return null;
  return { media_type: m[1].toLowerCase(), data: m[2] };
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

  let messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
  // The Anthropic API requires the conversation to start with a user
  // turn. Drop any leading assistant turns defensively.
  while (messages.length && messages[0].role !== "user") {
    messages = messages.slice(1);
  }
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
  const imgPart = image ? parseDataUrl(image) : null;
  const hasImage = Boolean(imgPart);

  const bibleMode = Boolean(body.bibleMode);
  let intent = classifyIntent(userText);
  // A screenshot (often a KakaoTalk/messenger conversation) without a
  // clear Bible/general request is almost always an emotional situation.
  if (hasImage && intent === "general") intent = "emotional";
  const memory = await loadUserMemory(supabase, userId);
  const system = buildSystemPrompt({ lang, bibleMode, intent, hasImage, memory });

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  // Build the upstream messages. The latest user turn carries the image
  // as a vision content block when present.
  let lastUserIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      lastUserIdx = i;
      break;
    }
  }
  const chatMessages = messages.map((m, i) => {
    if (hasImage && imgPart && i === lastUserIdx) {
      return {
        role: m.role,
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: imgPart.media_type,
              data: imgPart.data,
            },
          },
          {
            type: "text",
            text:
              String(m.content || "") ||
              "Please look at the attached image and respond.",
          },
        ],
      };
    }
    return { role: m.role, content: String(m.content || "") };
  });

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      stream: true,
      // Anthropic uses a top-level `system` field — the system prompt is
      // NOT a message. Keep temperature moderate so the pastoral voice is
      // warm and varied without drifting.
      system,
      temperature: 0.8,
      max_tokens: 1800,
      messages: chatMessages,
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
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const type = json?.type;

              if (
                type === "content_block_delta" &&
                json?.delta?.type === "text_delta" &&
                typeof json.delta.text === "string"
              ) {
                assistantText += json.delta.text;
                controller.enqueue(encoder.encode(json.delta.text));
              } else if (type === "message_stop") {
                await finalize();
                controller.close();
                return;
              } else if (type === "error") {
                // Surface upstream stream errors instead of hanging.
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
    },
  });
}
