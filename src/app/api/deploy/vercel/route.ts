// =====================================================================
// LuminaForge.ai — POST /api/deploy/vercel
// =====================================================================
// Deploys the current generated HTML to Vercel as a standalone
// static-site project. Uses the Vercel REST API:
//   1. Create or reuse a project
//   2. Create a deployment with the HTML file inlined
//   3. Stream phase events back to the client so the modal shows
//      live progress + the final URL.
//
// Requires VERCEL_TOKEN in env. Optional VERCEL_TEAM_ID for team deploys.
// =====================================================================

import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERCEL_API = "https://api.vercel.com/v2";

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function slug(s: string): string {
  return (s || "site").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "site";
}

export async function POST(req: NextRequest) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return Response.json(
      {
        error:
          "No VERCEL_TOKEN set. Add a Vercel access token (https://vercel.com/account/tokens) to .env.local to enable deploys.",
      },
      { status: 401 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { html, projectName, projectId } = body as {
    html?: string;
    projectName?: string;
    projectId?: string;
  };
  if (!html) {
    return Response.json({ error: "No HTML to deploy" }, { status: 400 });
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const teamQuery = teamId ? `?teamId=${teamId}` : "";
  const projectSlug = slug(projectName ?? "luminaforge-site");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: any) => {
        try {
          controller.enqueue(encoder.encode(sse(e)));
        } catch {}
      };
      const safeClose = () => {
        try {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {}
      };

      try {
        send({ type: "phase", phase: "preparing" });

        // --- 1. Create the project (idempotent — re-use if it exists) ---
        send({ type: "phase", phase: "creating" });
        let projectRes = await fetch(`${VERCEL_API}/projects${teamQuery}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: projectSlug }),
        });
        let project;
        if (projectRes.status === 409) {
          // Project already exists — fetch it by name.
          projectRes = await fetch(
            `${VERCEL_API}/projects/${projectSlug}${teamQuery}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
        if (!projectRes.ok) {
          const errText = await projectRes.text().catch(() => "");
          send({ type: "error", message: `Could not create Vercel project: ${errText.slice(0, 200)}` });
          safeClose();
          return;
        }
        project = await projectRes.json();

        // --- 2. Build the deployment payload ---
        // We deploy the HTML as an "index.html" file in the root.
        // Vercel automatically detects static sites when there's an
        // index.html in the root. The Tailwind CDN script tag works
        // at runtime, so no build step is required.
        send({ type: "phase", phase: "uploading" });

        const files = [
          {
            file: "index.html",
            data: html,
          },
          {
            file: "vercel.json",
            data: JSON.stringify({
              version: 2,
              cleanUrls: true,
              trailingSlash: false,
            }),
          },
        ];

        const deploymentPayload = {
          name: projectSlug,
          files,
          projectSettings: {
            framework: null,
            buildCommand: null,
            outputDirectory: null,
            installCommand: null,
            devCommand: null,
          },
          target: "production",
        };

        // --- 3. Create the deployment ---
        send({ type: "phase", phase: "deploying" });
        const deployRes = await fetch(`${VERCEL_API}/deployments${teamQuery}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deploymentPayload),
        });

        if (!deployRes.ok) {
          const errText = await deployRes.text().catch(() => "");
          send({ type: "error", message: `Vercel deployment failed: ${errText.slice(0, 200)}` });
          safeClose();
          return;
        }

        const deployment = await deployRes.json();
        const deploymentUrl =
          deployment?.url && !deployment.url.startsWith("http")
            ? `https://${deployment.url}`
            : deployment?.url || `https://${projectSlug}.vercel.app`;

        send({ type: "url", url: deploymentUrl });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown deploy error",
        });
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
    },
  });
}
