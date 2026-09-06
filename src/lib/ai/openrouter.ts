// =====================================================================
// LuminaForge.ai — OpenRouter Client
// =====================================================================
// Thin wrapper around the OpenRouter chat completions endpoint
// (https://openrouter.ai/api/v1/chat/completions) that:
//   1. Lets the caller pass any free model id.
//   2. Streams back SSE chunks (when stream=true).
//   3. Provides a `complete()` helper for non-streaming calls.
//
// We intentionally avoid the OpenRouter SDK — using `fetch` keeps the
// bundle tiny, is fully Edge-runtime compatible, and lets us plug in
// per-request headers (HTTP-Referer + X-Title are required by OR's
// free-tier models).
// =====================================================================

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterOptions {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  /** Optional — surfaced in OpenRouter dashboard for analytics. */
  referer?: string;
  title?: string;
}

/** OpenRouter endpoint — public, no auth required at the network layer. */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Stream a chat completion as an async generator of text deltas.
 * Yields plain string chunks (not raw SSE lines) for easy consumption.
 *
 * Usage:
 *   for await (const delta of streamChat({ apiKey, model, messages })) {
 *     setLocalOutput(prev => prev + delta);
 *   }
 */
export async function* streamChat(
  opts: OpenRouterOptions,
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
      "HTTP-Referer": opts.referer ?? "https://luminaforge.ai",
      "X-Title": opts.title ?? "LuminaForge",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 4096,
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter stream failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by double-newlines.
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);

        if (!line) continue;
        if (line.startsWith(":")) continue;          // SSE keepalive comment
        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield delta as string;
        } catch {
          // Ignore malformed lines — the provider may emit partial chunks.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Non-streaming chat completion — returns the full text in one shot. */
export async function complete(opts: OpenRouterOptions): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
      "HTTP-Referer": opts.referer ?? "https://luminaforge.ai",
      "X-Title": opts.title ?? "LuminaForge",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 4096,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter complete failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "") as string;
}
