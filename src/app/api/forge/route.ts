// =====================================================================
// LuminaForge.ai — POST /api/forge
// =====================================================================
// Server-Sent-Events endpoint that runs the 5-agent colony (or the
// iterate-only path) and streams structured events back to the Forge
// Studio. After completion, persists the result to the local Prisma
// database (in production: Supabase).
//
// Body schema (JSON):
//   Fresh forge:    { prompt, referenceUrl?, imageUrls?, vibeChips?, previousHtml?, projectName?, projectId? }
//   Iterate forge:  { mode: "iterate", instruction, previousHtml, projectId? }
//
// API key: we read OPENROUTER_API_KEY from env OR from the user's
// per-project settings table (in production). For this preview build
// the env var is sufficient.
// =====================================================================

import { NextRequest } from "next/server";
import { runForge, runIteration } from "@/lib/ai/orchestrator";
import { AGENTS } from "@/lib/ai/agents";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";        // streaming + Buffer needs Node
export const dynamic = "force-dynamic";

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "";

  // Parse + validate the body.
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const isIterate = body.mode === "iterate";
  if (!apiKey && !isIterate) {
    return new Response(
      JSON.stringify({
        error:
          "No OPENROUTER_API_KEY set. Add it to your .env.local or visit /settings to enter your free OpenRouter key.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // -----------------------------------------------------------------
  // Set up the SSE stream
  // -----------------------------------------------------------------
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const closed = { value: false };
      const send = (event: any) => {
        if (closed.value) return;
        try {
          controller.enqueue(encoder.encode(sse(event)));
        } catch {
          closed.value = true;
        }
      };
      const safeClose = () => {
        if (closed.value) return;
        closed.value = true;
        try {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {}
      };

      try {
        if (isIterate) {
          // -------- Iterate-only path --------
          if (!body.previousHtml) {
            send({ type: "error", message: "Nothing to iterate on." });
            safeClose();
            return;
          }
          let finalHtml = body.previousHtml;
          let scores: { seo: number; perf: number; a11y: number } | null = null;
          let review = "";

          for await (const event of runIteration({
            apiKey,
            instruction: body.instruction,
            previousHtml: body.previousHtml,
            previousSpec: body.previousSpec,
          })) {
            send(event);
            if (event.type === "html") finalHtml = event.html;
            if (event.type === "scores") {
              scores = { seo: event.seo, perf: event.perf, a11y: event.a11y };
              review = event.review ?? "";
            }
          }

          // Persist the iterate as a new Generation row if a project exists.
          if (body.projectId) {
            try {
              const project = await db.project.findUnique({ where: { id: body.projectId } });
              if (project) {
                const versionCount = await db.generation.count({ where: { projectId: project.id } });
                const gen = await db.generation.create({
                  data: {
                    projectId: project.id,
                    prompt: body.instruction,
                    html: finalHtml,
                    spec: project.currentSpec ?? undefined,
                    transcript: JSON.stringify({ instruction: body.instruction, review }),
                    version: versionCount + 1,
                    seoScore: scores?.seo,
                    perfScore: scores?.perf,
                    a11yScore: scores?.a11y,
                  },
                });
                await db.project.update({
                  where: { id: project.id },
                  data: {
                    currentHtml: finalHtml,
                    seoScore: scores?.seo,
                    perfScore: scores?.perf,
                    a11yScore: scores?.a11y,
                  },
                });
                send({ type: "saved", projectId: project.id, versionId: gen.id });
              }
            } catch (dbErr) {
              console.error("[forge] db persist failed:", dbErr);
            }
          }
        } else {
          // -------- Full fresh Forge path --------
          let finalHtml = "";
          let finalSpec = "";
          let scores: { seo: number; perf: number; a11y: number } | null = null;
          let review = "";

          for await (const event of runForge({
            apiKey,
            prompt: body.prompt,
            referenceUrl: body.referenceUrl,
            imageUrls: body.imageUrls,
            hfToken: process.env.HF_TOKEN,
            previousHtml: body.previousHtml,
          })) {
            send(event);
            if (event.type === "html") finalHtml = event.html;
            if (event.type === "spec") finalSpec = event.spec;
            if (event.type === "scores") {
              scores = { seo: event.seo, perf: event.perf, a11y: event.a11y };
              review = event.review ?? "";
            }
          }

          // Persist to the database. We upsert the project by id (if passed)
          // or create a new one. Always create a Generation row.
          try {
            const projectName = body.projectName || "Untitled Forge";
            // Use the authenticated user when available, fall back to
            // anonymous "local-user" for sandbox/preview mode.
            const { anonymousId } = await getAuthenticatedUser();
            const userId = anonymousId ?? "local-user";
            await db.user.upsert({
              where: { id: userId },
              update: { email: "founder@luminaforge.local", name: "Lumina Founder" },
              create: { id: userId, email: "founder@luminaforge.local", name: "Lumina Founder" },
            });
            const existing = body.projectId
              ? await db.project.findUnique({ where: { id: body.projectId } })
              : null;
            const project = existing
              ? await db.project.update({
                  where: { id: existing.id },
                  data: {
                    name: projectName,
                    currentHtml: finalHtml,
                    currentSpec: finalSpec,
                    lastPrompt: body.prompt,
                    lastRefUrl: body.referenceUrl,
                    vibeTags: (body.vibeChips ?? []).join(","),
                    seoScore: scores?.seo,
                    perfScore: scores?.perf,
                    a11yScore: scores?.a11y,
                  },
                })
              : await db.project.create({
                  data: {
                    userId, // authenticated user, or "local-user" fallback
                    name: projectName,
                    currentHtml: finalHtml,
                    currentSpec: finalSpec,
                    lastPrompt: body.prompt,
                    lastRefUrl: body.referenceUrl,
                    vibeTags: (body.vibeChips ?? []).join(","),
                    seoScore: scores?.seo,
                    perfScore: scores?.perf,
                    a11yScore: scores?.a11y,
                  },
                });

            const versionCount = await db.generation.count({ where: { projectId: project.id } });
            const gen = await db.generation.create({
              data: {
                projectId: project.id,
                prompt: body.prompt,
                referenceUrl: body.referenceUrl,
                html: finalHtml,
                spec: finalSpec,
                transcript: JSON.stringify({ review }),
                version: versionCount + 1,
                seoScore: scores?.seo,
                perfScore: scores?.perf,
                a11yScore: scores?.a11y,
              },
            });

            send({ type: "saved", projectId: project.id, versionId: gen.id });
          } catch (dbErr) {
            console.error("[forge] db persist failed:", dbErr);
            // Non-fatal — the user still gets the HTML live in the preview.
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Forge failed";
        send({ type: "error", message: msg });
      } finally {
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
