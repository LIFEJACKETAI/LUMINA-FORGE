// =====================================================================
// LuminaForge.ai — GET /api/memory/stats
// =====================================================================
// Returns aggregated stats for the user's agent memories, used by the
// /memory timeline page to render the summary cards.
//
// Returns:
//   - total count
//   - count by category
//   - count by source
//   - first/last memory dates
//   - top 3 most recent memories (for the "latest insights" card)
// =====================================================================

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { anonymousId } = await getAuthenticatedUser();
    const userId = anonymousId ?? "local-user";

    const memories = await db.agentMemory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 500,
      select: {
        id: true,
        content: true,
        category: true,
        source: true,
        createdAt: true,
      },
    });

    if (memories.length === 0) {
      return Response.json({
        total: 0,
        byCategory: {},
        bySource: {},
        firstAt: null,
        lastAt: null,
        recent: [],
      });
    }

    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const m of memories) {
      const cat = m.category ?? "misc";
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
      bySource[m.source] = (bySource[m.source] ?? 0) + 1;
    }

    return Response.json({
      total: memories.length,
      byCategory,
      bySource,
      firstAt: memories[0].createdAt,
      lastAt: memories[memories.length - 1].createdAt,
      // Most recent 3 — show the newest first
      recent: [...memories].reverse().slice(0, 3),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to load stats" },
      { status: 500 },
    );
  }
}
