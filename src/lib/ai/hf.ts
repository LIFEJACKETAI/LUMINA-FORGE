// =====================================================================
// LuminaForge.ai — Hugging Face Inference Client
// =====================================================================
// Free-tier image generation. We use FLUX.1-schnell (the fastest free
// FLUX endpoint on HF) — perfect for hero/illustration assets inside
// the generated sites. Falls back to a deterministic gradient placeholder
// if the HF endpoint is unavailable (rate-limited / cold start).
// =====================================================================

const HF_BASE = "https://api-inference.huggingface.co/models";

export interface HFImageOptions {
  apiKey: string;
  /** A short, vivid prompt (style hints prepended automatically). */
  prompt: string;
  /** Optional seed for reproducibility. */
  seed?: number;
  /** Defaults to "black-forest-labs/FLUX.1-schnell". */
  model?: string;
}

/**
 * Generate an image via the HF Inference API and return a data URL.
 * The model is cold-started on first call — we wait with retries.
 */
export async function generateImage(
  opts: HFImageOptions,
): Promise<{ dataUrl: string; ok: true } | { ok: false; error: string }> {
  const model = opts.model ?? "black-forest-labs/FLUX.1-schnell";
  const url = `${HF_BASE}/${model}`;

  const fullPrompt = `${opts.prompt}, ultra-detailed, soft cinematic lighting, dreamy atmosphere, high quality, artstation trending`;

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            seed: opts.seed ?? Math.floor(Math.random() * 1_000_000),
            width: 1024,
            height: 768,
            num_inference_steps: 4,
          },
        }),
      });

      if (res.status === 503) {
        // Model still cold-starting — back off and retry.
        await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return {
          ok: false,
          error: `HF ${res.status}: ${errText.slice(0, 160)}`,
        };
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.startsWith("image/")) {
        // Some endpoints return JSON errors with 200 — bail.
        const errText = await res.text().catch(() => "");
        return { ok: false, error: `HF non-image body: ${errText.slice(0, 160)}` };
      }

      const buf = Buffer.from(await res.arrayBuffer());
      const b64 = buf.toString("base64");
      return { ok: true, dataUrl: `data:${contentType};base64,${b64}` };
    } catch (err) {
      if (attempt === 3) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Unknown HF error",
        };
      }
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  return { ok: false, error: "Exceeded HF retry budget" };
}
