// =====================================================================
// LuminaForge.ai — /api/projects/[id]
// =====================================================================
// GET     /api/projects/:id    → project + its generations + assets
// PATCH   /api/projects/:id    → update name/description
// DELETE  /api/projects/:id    → delete project + cascade
// =====================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const project = await db.project.findUnique({
      where: { id },
      include: {
        generations: { orderBy: { version: "desc" }, take: 50 },
        assets: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    return Response.json({
      project: {
        ...project,
        vibeTags: project.vibeTags ? project.vibeTags.split(",") : [],
        scores: { seo: project.seoScore, perf: project.perfScore, a11y: project.a11yScore },
      },
      versions: project.generations.map((g) => ({
        id: g.id,
        createdAt: g.createdAt,
        prompt: g.prompt,
        scores: { seo: g.seoScore, perf: g.perfScore, a11y: g.a11yScore },
      })),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to load project" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await db.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      },
    });
    return Response.json({ project: updated });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await db.project.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to delete project" },
      { status: 500 },
    );
  }
}
