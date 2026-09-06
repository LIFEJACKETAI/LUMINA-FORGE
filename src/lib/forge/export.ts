// =====================================================================
// LuminaForge.ai — Next.js Project Exporter
// =====================================================================
// Converts the generated self-contained HTML into a clean Next.js 15
// project ZIP using JSZip. We parse the HTML, extract the body, split
// out the inline <style> blocks + Tailwind config, and emit a
// ready-to-deploy App-Router project that lives in /app/page.tsx.
// =====================================================================

import JSZip from "jszip";

export interface NextJsExportInput {
  html: string;
  projectName: string;
}

/** Light, dependency-free HTML body + head splitter. */
function splitHtml(html: string) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);

  const head = headMatch ? headMatch[1] : "";
  const body = bodyMatch ? bodyMatch[1] : "";

  // Extract inline <style> blocks.
  const styleBlocks: string[] = [];
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = styleRe.exec(head + body)) !== null) {
    styleBlocks.push(m[1].trim());
  }

  // Strip <script src="tailwind..."> — we'll move it to the package.json deps.
  const cleanedBody = body
    .replace(/<script\s+src="https:\/\/cdn\.tailwindcss\.com"[^>]*><\/script>/gi, "")
    .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/gi, "");

  const cleanedHead = head
    .replace(/<script\s+src="https:\/\/cdn\.tailwindcss\.com"[^>]*><\/script>/gi, "")
    .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/gi, "");

  return {
    title: titleMatch ? titleMatch[1].trim() : "LuminaForge Export",
    description: descMatch ? descMatch[1].trim() : "",
    head: cleanedHead.trim(),
    body: cleanedBody.trim(),
    styles: styleBlocks.join("\n\n"),
  };
}

/** Build the package.json for the exported Next.js project. */
function packageJson(projectName: string) {
  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "^15.0.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        tailwindcss: "^3.4.0",
        typescript: "^5",
      },
    },
    null,
    2,
  );
}

function tsConfig() {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "es2020",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2,
  );
}

function tailwindConfig() {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lumina: {
          indigo: "#6366F1",
          violet: "#8B5CF6",
          cyan: "#22D3EE",
          ink: "#0F172A",
          paper: "#F8FAFC",
        },
      },
      borderRadius: { soft: "28px", organic: "36px" },
      boxShadow: {
        "orb-sm": "0 4px 16px -2px rgba(99,102,241,0.28), 0 12px 32px -8px rgba(139,92,246,0.22)",
        orb: "0 8px 32px -4px rgba(99,102,241,0.35), 0 18px 64px -12px rgba(139,92,246,0.30), 0 32px 96px -20px rgba(34,211,238,0.22)",
      },
    },
  },
  plugins: [],
};
`;
}

function nextConfig() {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
`;
}

function postcssConfig() {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

function globalsCss(styles: string) {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background: #F8FAFC;
    color: #0F172A;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5 {
    font-family: "Space Grotesk", Inter, system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
}

${styles}
`;
}

function appLayout(title: string, description: string) {
  return `import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable + " " + spaceGrotesk.variable}>
        {children}
      </body>
    </html>
  );
}
`;
}

function appPage(head: string, body: string) {
  // Wrap the original body. Move any meta/link tags from <head> into the
  // Next.js <head> via the metadata API where possible; inline the rest.
  return `"use client";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        ${head.split("\n").map((l) => l.trim()).filter(Boolean).join("\n        ")}
      </Head>
      <main dangerouslySetInnerHTML={{ __html: ${JSON.stringify(body)} }} />
    </>
  );
}
`;
}

function readme(projectName: string) {
  return `# ${projectName}

Generated by **LuminaForge.ai** — an agentic AI website generator.

## Getting started
\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000 in your browser.

## Deploy
Push to GitHub and import into Vercel — that's it.
`;
}

/** Build the ZIP and return as a Buffer the caller can stream to the client. */
export async function buildNextJsZip({
  html,
  projectName,
}: NextJsExportInput): Promise<Buffer> {
  const parts = splitHtml(html);
  const safeName = (projectName || "luminaforge-export").replace(/[^a-z0-9-]/gi, "-").toLowerCase();

  const zip = new JSZip();

  const root = zip.folder(safeName) ?? zip;

  root.file("package.json", packageJson(projectName));
  root.file("tsconfig.json", tsConfig());
  root.file("next.config.mjs", nextConfig());
  root.file("postcss.config.mjs", postcssConfig());
  root.file("tailwind.config.js", tailwindConfig());
  root.file("README.md", readme(projectName));
  root.file(".gitignore", "node_modules\n.next\n.env.local\n");
  root.file(".env.example", "# No secrets required — this site is fully static.\n");

  const app = root.folder("app");
  if (app) {
    app.file("layout.tsx", appLayout(parts.title, parts.description));
    app.file("page.tsx", appPage(parts.head, parts.body));
    app.file("globals.css", globalsCss(parts.styles));
  }

  return zip.generateAsync({ type: "nodebuffer" }) as Promise<Buffer>;
}

/** Build a tiny single-file ZIP containing just the standalone HTML. */
export async function buildHtmlZip(html: string, name: string): Promise<Buffer> {
  const zip = new JSZip();
  const safeName = (name || "site").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  zip.file(`${safeName}.html`, html);
  zip.file("README.md", `# ${name}\n\nGenerated by LuminaForge.ai`);
  return zip.generateAsync({ type: "nodebuffer" }) as Promise<Buffer>;
}
