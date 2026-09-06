// =====================================================================
// LuminaForge.ai — /api/projects
// =====================================================================
// GET    /api/projects              → list all (single-user preview mode
//                                     or filtered by authed user)
// POST   /api/projects              → create a new project
// =====================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { anonymousId } = await getAuthenticatedUser();
    const projects = await db.project.findMany({
      where: { userId: anonymousId ?? "local-user" },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    return Response.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        lastPrompt: p.lastPrompt,
        vibeTags: p.vibeTags ? p.vibeTags.split(",") : [],
        scores: { seo: p.seoScore, perf: p.perfScore, a11y: p.a11yScore },
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to list projects" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anonymousId } = await getAuthenticatedUser();
    // Ensure the user exists in the local Prisma DB.
    await db.user.upsert({
      where: { id: anonymousId ?? "local-user" },
      update: { email: "founder@luminaforge.local", name: "Lumina Founder" },
      create: { id: anonymousId ?? "local-user", email: "founder@luminaforge.local", name: "Lumina Founder" },
    });
    const project = await db.project.create({
      data: {
        userId: anonymousId ?? "local-user",
        name: body.name ?? "Untitled Forge",
        description: body.description,
        lastPrompt: body.prompt,
        lastRefUrl: body.referenceUrl,
        vibeTags: (body.vibeChips ?? []).join(","),
      },
    });
    return Response.json({ project });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to create project" },
      { status: 500 },
    );
  }
}
