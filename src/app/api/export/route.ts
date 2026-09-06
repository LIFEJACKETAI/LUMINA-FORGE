// =====================================================================
// LuminaForge.ai — POST /api/export
// =====================================================================
// Two export formats:
//   format: "html"         → returns a ZIP containing the standalone HTML
//   format: "nextjs"       → returns a ZIP with a complete Next.js 15 project
//   format: "nextjs-preview" → returns the generated page.tsx as text
//
// All ZIP assembly happens server-side with JSZip (no client bundle bloat).
// =====================================================================

import { NextRequest } from "next/server";
import { buildHtmlZip, buildNextJsZip } from "@/lib/forge/export";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { html, projectName, format } = body as {
      html?: string;
      projectName?: string;
      format?: "html" | "nextjs" | "nextjs-preview";
    };

    if (!html) {
      return Response.json({ error: "No HTML provided" }, { status: 400 });
    }

    if (format === "nextjs-preview") {
      // Return the page.tsx source as text for the Code tab preview.
      const zip = await buildNextJsZip({ html, projectName: projectName ?? "luminaforge-export" });
      // Re-derive the page.tsx text inline (cheap to recompute).
      const pageSource = await derivePageTsx(html);
      return new Response(pageSource, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (format === "nextjs") {
      const buf = await buildNextJsZip({
        html,
        projectName: projectName ?? "luminaforge-export",
      });
      return new Response(buf, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${(projectName ?? "site").toLowerCase().replace(/[^a-z0-9-]/g, "-")}-nextjs.zip"`,
        },
      });
    }

    // Default: HTML ZIP.
    const buf = await buildHtmlZip(html, projectName ?? "site");
    return new Response(buf, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${(projectName ?? "site").toLowerCase().replace(/[^a-z0-9-]/g, "-")}.zip"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Export failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}

// Re-derive the page.tsx that the exporter writes to the ZIP so we can
// also surface it in the Code tab without unzipping.
async function derivePageTsx(html: string): Promise<string> {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const head = headMatch ? headMatch[1] : "";
  let body = bodyMatch ? bodyMatch[1] : html;
  body = body
    .replace(/<script\s+src="https:\/\/cdn\.tailwindcss\.com"[^>]*><\/script>/gi, "")
    .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/gi, "");
  const cleanedHead = head
    .replace(/<script\s+src="https:\/\/cdn\.tailwindcss\.com"[^>]*><\/script>/gi, "")
    .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/gi, "")
    .trim();

  return `"use client";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        ${cleanedHead.split("\n").map((l) => l.trim()).filter(Boolean).join("\n        ")}
      </Head>
      <main dangerouslySetInnerHTML={{ __html: ${JSON.stringify(body)} }} />
    </>
  );
}
`;
}
