// =====================================================================
// LuminaForge.ai — POST /api/hf-image
// =====================================================================
// Generates a single hero/illustration image via Hugging Face's free
// inference API (FLUX.1-schnell by default). Returns a data URL the
// caller can embed directly into the generated HTML.
//
// Body: { prompt, seed?, model? }
// =====================================================================

import { NextRequest } from "next/server";
import { generateImage } from "@/lib/ai/hf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = process.env.HF_TOKEN ?? "";
    if (!token) {
      return Response.json(
        { error: "No HF_TOKEN set. Add your free Hugging Face token to .env.local." },
        { status: 401 },
      );
    }
    const result = await generateImage({
      apiKey: token,
      prompt: body.prompt,
      seed: body.seed,
      model: body.model,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 502 });
    }
    return Response.json({ dataUrl: result.dataUrl });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Image generation failed" },
      { status: 500 },
    );
  }
}
