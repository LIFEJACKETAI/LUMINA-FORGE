// =====================================================================
// LuminaForge.ai — /api/memory
// =====================================================================
// GET    /api/memory          → list user's accumulated style memories
// POST   /api/memory          → create a new memory (manually or via agent)
// =====================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { anonymousId } = await getAuthenticatedUser();
    const memories = await db.agentMemory.findMany({
      where: { userId: anonymousId ?? "local-user" },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    return Response.json({ memories });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to list memories" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { anonymousId } = await getAuthenticatedUser();
    const userId = anonymousId ?? "local-user";
    const body = await req.json();
    if (!body.content || typeof body.content !== "string") {
      return Response.json({ error: "content is required" }, { status: 400 });
    }
    // Cap content length so the prompt doesn't blow up.
    const content = body.content.slice(0, 200);
    const memory = await db.agentMemory.create({
      data: {
        userId,
        content,
        category: body.category ?? "misc",
        source: body.source ?? "user",
        weight: typeof body.weight === "number" ? body.weight : 1,
      },
    });
    return Response.json({ memory });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to create memory" },
      { status: 500 },
    );
  }
}
