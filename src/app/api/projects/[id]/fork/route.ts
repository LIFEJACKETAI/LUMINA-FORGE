// =====================================================================
// LuminaForge.ai — POST /api/projects/[id]/fork
// =====================================================================
// Clones an existing project (its prompt, spec, HTML, vibe tags, and
// scores) into a new project owned by the current user. The new
// project gets a "(Forked)" suffix on the name so it's easy to spot.
//
// Returns the new project's id so the client can immediately navigate
// to /forge?projectId=NEW_ID.
// =====================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: sourceId } = await params;
  try {
    const { anonymousId } = await getAuthenticatedUser();
    const userId = anonymousId ?? "local-user";

    // Ensure the user exists.
    await db.user.upsert({
      where: { id: userId },
      update: { email: "founder@luminaforge.local", name: "Lumina Founder" },
      create: { id: userId, email: "founder@luminaforge.local", name: "Lumina Founder" },
    });

    // Load the source project (any user — forks are public).
    const source = await db.project.findUnique({ where: { id: sourceId } });
    if (!source) {
      return Response.json({ error: "Source project not found" }, { status: 404 });
    }

    // Create the forked project.
    const forked = await db.project.create({
      data: {
        userId,
        name: `${source.name} (Forked)`,
        description: source.description,
        currentHtml: source.currentHtml,
        currentSpec: source.currentSpec,
        lastPrompt: source.lastPrompt,
        lastRefUrl: source.lastRefUrl,
        vibeTags: source.vibeTags,
        // Scores are reset on the fork — the user is iterating fresh.
        seoScore: source.seoScore,
        perfScore: source.perfScore,
        a11yScore: source.a11yScore,
      },
    });

    // Also clone the latest Generation row as v1 of the new project so
    // the History tab has something to show right away.
    const latestGen = await db.generation.findFirst({
      where: { projectId: source.id },
      orderBy: { version: "desc" },
    });
    if (latestGen) {
      await db.generation.create({
        data: {
          projectId: forked.id,
          prompt: latestGen.prompt,
          referenceUrl: latestGen.referenceUrl,
          html: latestGen.html,
          spec: latestGen.spec,
          transcript: latestGen.transcript,
          version: 1,
          seoScore: latestGen.seoScore,
          perfScore: latestGen.perfScore,
          a11yScore: latestGen.a11yScore,
        },
      });
    }

    return Response.json({
      project: {
        id: forked.id,
        name: forked.name,
      },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to fork project" },
      { status: 500 },
    );
  }
}
