// =====================================================================
// LuminaForge.ai — /api/memory/[id]
// =====================================================================
// PATCH   /api/memory/:id   → edit memory content / category
// DELETE  /api/memory/:id   → delete one memory
// =====================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { anonymousId } = await getAuthenticatedUser();
    const userId = anonymousId ?? "local-user";
    const body = await req.json();
    // Make sure the memory belongs to the user before editing.
    const existing = await db.agentMemory.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const updated = await db.agentMemory.update({
      where: { id },
      data: {
        content: body.content?.slice(0, 200) ?? existing.content,
        category: body.category ?? existing.category,
        weight: typeof body.weight === "number" ? body.weight : existing.weight,
      },
    });
    return Response.json({ memory: updated });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to update memory" },
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
    const { anonymousId } = await getAuthenticatedUser();
    const userId = anonymousId ?? "local-user";
    const existing = await db.agentMemory.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await db.agentMemory.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to delete memory" },
      { status: 500 },
    );
  }
}
