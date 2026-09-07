// =====================================================================
// LuminaForge.ai — OpenRouter Client
// =====================================================================
// Thin wrapper around the OpenRouter chat completions endpoint
// (https://openrouter.ai/api/v1/chat/completions) that:
//   1. Lets the caller pass any free model id.
//   2. Streams back SSE chunks (when stream=true).
//   3. Provides a `complete()` helper for non-streaming calls.
//   4. Implements exponential backoff + jitter for 429 rate-limits
//      (free-tier OR enforces stricter caps).
//
// We intentionally avoid the OpenRouter SDK — using `fetch` keeps the
// bundle tiny, is fully Edge-runtime compatible, and lets us plug in
// per-request headers (HTTP-Referer + X-Title are required by OR's
// free-tier models).
// =====================================================================

/** Jitter function: adds randomness to delay to prevent thundering herd. */
function jitter(ms: number): number {
  return ms + Math.random() * ms;
}

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

/** Max retry attempts for 429 rate-limits. */
const MAX_RETRIES = 5;
/** Base backoff in ms — 500ms, 1s, 2s, 4s, 8s (with jitter). */
const BACKOFF_BASE = 500;

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
  let attempt = 0;
  let success = false;

  while (!success && attempt < MAX_RETRIES) {
    attempt++;
    try {
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

      if (res.status === 429) {
        // Rate-limited — exponential backoff with jitter.
        const backoff = jitter(BACKOFF_BASE * Math.pow(2, attempt - 1));
        await new Promise((r) => setTimeout(r, backoff));
        continue; // retry
      }

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `OpenRouter stream failed (${res.status}): ${text.slice(0, 200)}`,
        );
      }

      success = true;
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
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw err;
      }
      // Transient error — back off and retry.
      const backoff = jitter(BACKOFF_BASE * Math.pow(2, attempt - 1));
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  // Exhausted retries — throw the last error.
  throw new Error(`OpenRouter stream failed after ${MAX_RETRIES} retries`);
}

/** Non-streaming chat completion — returns the full text in one shot. */
export async function complete(opts: OpenRouterOptions): Promise<string> {
  let attempt = 0;
  let success = false;
  let lastError: Error | null = null;

  while (!success && attempt < MAX_RETRIES) {
    attempt++;
    try {
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

      if (res.status === 429) {
        const backoff = jitter(BACKOFF_BASE * Math.pow(2, attempt - 1));
        await new Promise((r) => setTimeout(r, backoff));
        continue; // retry
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `OpenRouter complete failed (${res.status}): ${text.slice(0, 200)}`,
        );
      }
      success = true;
      const json = await res.json();
      return (json.choices?.[0]?.message?.content ?? "") as string;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt >= MAX_RETRIES) {
        throw lastError;
      }
      const backoff = jitter(BACKOFF_BASE * Math.pow(2, attempt - 1));
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  throw lastError ?? new Error("OpenRouter complete failed after retries");
}
