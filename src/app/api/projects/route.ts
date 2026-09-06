// =====================================================================
// LuminaForge.ai — /api/projects
// =====================================================================
// GET    /api/projects              → list all (single-user preview mode)
// POST   /api/projects              → create a new project
// =====================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db.project.findMany({
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
    // Ensure the local user exists (sandbox single-user mode).
    await db.user.upsert({
      where: { id: "local-user" },
      update: { email: "founder@luminaforge.local", name: "Lumina Founder" },
      create: { id: "local-user", email: "founder@luminaforge.local", name: "Lumina Founder" },
    });
    const project = await db.project.create({
      data: {
        userId: "local-user",
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
