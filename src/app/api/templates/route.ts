// =====================================================================
// LuminaForge.ai — GET /api/templates
// =====================================================================
// Returns the list of pre-built section templates. Templates live in
// src/lib/templates/section-templates.ts — they're server-side
// (not bundled to the client) and fetched by the Templates modal.
// =====================================================================

import { SECTION_TEMPLATES, TEMPLATE_CATEGORIES, CATEGORY_LABELS } from "@/lib/templates/section-templates";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    templates: SECTION_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      category: t.category,
      description: t.description,
      tags: t.tags,
      useHint: t.useHint,
      html: t.html,
    })),
    categories: TEMPLATE_CATEGORIES,
    categoryLabels: CATEGORY_LABELS,
  });
}
