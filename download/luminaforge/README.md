# LuminaForge.ai

> **Describe the Vibe. We Forge the Reality.**
>
> An agentic AI website generator powered entirely by free, open-source models via OpenRouter and Hugging Face. A colony of five AI agents reads your prompt, studies your moodboard, and forges a beautiful, production-ready website — clean HTML + Tailwind for instant preview, with one-click export to Next.js 15.

![LuminaForge aesthetic](https://img.shields.io/badge/aesthetic-roundabout-8B5CF6) ![License](https://img.shields.io/badge/license-MIT-22D3EE) ![Models](https://img.shields.io/badge/models-free_open-6366F1)

---

## ✶ The Vibe

LuminaForge ships with a single, non-negotiable aesthetic — the **"Roundabout"**:
- **Ultra-rounded organic forms** (32–64px radii on everything)
- **Luminous orb motifs** floating behind content
- **Soft layered glow shadows** with multiple low-opacity color halos
- **Indigo #6366F1 → Violet #8B5CF6 → Cyan #22D3EE** brand gradient
- **Glassmorphism panels** with subtle backdrop blur
- **Generous whitespace** + bold display typography (Space Grotesk)

The same aesthetic is applied to both LuminaForge itself and the sites it generates — the colony writes HTML that carries the same soul.

---

## ◆ The Five Agents

Every Forge runs a sequential colony of five agents. Their transcripts stream live into the Forge Studio so you can watch the AI think in real time.

| # | Agent | Model | Role |
|---|-------|-------|------|
| 1 | **Vibe Interpreter** | `nvidia/nemotron-3-ultra:free` | Reads your prompt + moodboards + reference URL, distills the essence into a JSON vibe object |
| 2 | **Design Architect** | `nvidia/nemotron-3-ultra:free` | Translates the vibe into a structured blueprint: sections, palette, copy, layout hints |
| 3 | **Code Alchemist** | `qwen/qwen3-coder:free` (with `cohere/command-r-plus:free` fallback) | Transmutes the spec into self-contained HTML + Tailwind CDN |
| 4 | **Performance Guardian** | `qwen/qwen3-coder:free` | Audits SEO/perf/a11y, adds meta tags, lazy-loads media, fixes hierarchy |
| 5 | **Harmony Keeper** | `nvidia/nemotron-3-ultra:free` | Final taste review — micro-refinements so the page sings as a whole |

All five models are free-tier on OpenRouter. Hugging Face FLUX.1-schnell is used (optionally) for hero image generation.

---

## ▲ Quick start (5 minutes)

### 1. Clone & install

```bash
git clone https://github.com/luminaforge/luminaforge.git
cd luminaforge
bun install   # or: npm install / pnpm install
```

### 2. Get your free API keys

| Key | Where to get it | Used for |
|-----|-----------------|----------|
| OpenRouter API Key | [openrouter.ai/keys](https://openrouter.ai/keys) | All 5 agents |
| Hugging Face Token | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Optional — hero image generation |
| Supabase (optional) | [app.supabase.com](https://app.supabase.com) | Production persistence (moodboards, projects, history) |

All three are **100% free** — you don't need a credit card for any of them.

### 3. Configure environment

Copy the example and fill in your keys:

```bash
cp .env.example .env.local
```

```env
# .env.local
OPENROUTER_API_KEY=sk-or-v1-...
HF_TOKEN=hf_...
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE=YOUR_SERVICE_ROLE
LUMINA_ENCRYPTION_SECRET=any-long-random-string-at-least-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

**For local dev (Prisma + SQLite — zero setup):**

```bash
bun run db:push
```

**For production (Supabase Postgres):**

1. Create a free Supabase project
2. Open the SQL editor and paste in `download/luminaforge/supabase-schema.sql`
3. Run it — this creates every table, RLS policy, storage bucket, and trigger you need

### 5. Run it

```bash
bun run dev
```

Open `http://localhost:3000` in your browser. Visit `/settings` to verify your keys are detected, then head to `/forge` and start forging.

### (Optional) Seed a demo project

If you want to see LuminaForge with a sample Forge already loaded (without making a real OpenRouter call yet), run:

```bash
bun run seed:demo
```

This inserts an "Aurora — Open Source DB" project with complete generated HTML, scores, and history. Visit `/forges` to see it in your dashboard, then click it to open in the Forge Studio.

### (Optional) Seed demo memories

To see the Agent Memory Timeline page with sample content:

```bash
bun run seed:memories
```

This inserts 12 demo memories spread across the past week. Visit `/memory` to see the timeline visualization.

---

## ✺ What you get

### Marketing homepage (`/`)
- Hero with floating orbs and orbiting agent ring
- "Roundabout Process" section explaining the colony
- Agent showcase with hoverable cards
- Example gallery (clicking loads the prompt straight into the Forge Studio)
- Testimonials, pricing (free tier prominent), FAQ

### Forge Studio (`/forge`) — the heart of the product
Three-panel layout with a persistent top bar:
- **Left — Composer:** vibe textarea (with **voice input** 🎤 via Web Speech API), moodboard drag-and-drop, reference URL, quick vibe chips, prominent "Forge with Agents" button
- **Center — Live Preview:** sandboxed iframe with a beautiful "Roundabout" overlay during generation (agent orbs orbit a glowing forge core with live status messages). Includes **per-section editing** — toggle the "Edit sections" pill in the top-left to highlight + click any section and ask the colony to re-tune just that section.
- **Right — Inspector tabs:**
  - **Agents** — live streaming transcripts of every agent
  - **Iterate** — natural-language chat that re-tunes the preview in place
  - **Code** — view the generated HTML / converted Next.js `page.tsx` + Copy / Download HTML ZIP / Export full Next.js project ZIP
  - **History** — previous generations for this project with score pills

### Auth (`/auth/login`)
- **Magic-link sign-in** via Supabase Auth
- Send a one-time link to the user's email; clicking it lands them on `/forge`
- Falls back gracefully to anonymous preview mode when Supabase isn't configured
- User menu in the top-right shows avatar dropdown with email + sign-out

### Deploy to Vercel
- Click the **Deploy** pill in the Forge top bar
- Uses the [Vercel REST API](https://vercel.com/docs/rest-api) to create a project and deploy the generated HTML as a static site
- Premium modal shows live progress through 4 phases (preparing → creating → uploading → deploying) and the final live URL
- Falls back gracefully with a helpful error message when `VERCEL_TOKEN` isn't set

### Settings page (`/settings`)
Premium key-management UI. OpenRouter, Hugging Face, and Supabase credentials with show/hide toggles, status indicators, and direct links to the free key signup pages.

### My Forges (`/forges`)
Searchable grid of all your past projects. Each card has a tiny sandboxed iframe thumbnail rendered from the saved HTML, plus score pills, a one-click "Open in Studio" link to keep iterating, and a **Fork** button (the GitFork icon) to clone any vibe as a new project.

### Section Templates
Click **"Browse section templates"** in the Composer to open a premium modal with 10+ pre-built blocks (Centered Orb Hero, Split Orb Hero, 3-Card Features, Stat Strip, Single Pricing Card, 3-Tier Pricing, FAQ Accordion, 3-Card Testimonials, Gradient CTA Panel, 3-Image Gallery, Rounded Footer Panel) — each follows the "Roundabout" aesthetic and includes a live iframe preview. Double-click any template (or use the "Insert into prompt" button) to inject a "use template X" instruction into the vibe textarea.

### Agent Memory
A new **Memory** panel in `/settings` shows the colony's accumulated style preferences. The Vibe Interpreter reads these as context on every fresh Forge, so LuminaForge remembers your taste across projects. The Harmony Keeper automatically surfaces new memories after each Forge — you can also manually add, edit, or delete memories in the panel.

### Voice Input (Composer + Iterate)
Tap the microphone button next to the vibe description (or in the Iterate tab) to speak your prompt/tweak instead of typing. Uses the browser's built-in Web Speech API — no extra dependencies. Auto-hides on browsers that don't support speech recognition.

### Agent Memory Timeline (`/memory`)
A dedicated page that visualizes how the colony's understanding of your taste has evolved. Includes:
- **Stats strip** — total memories, categories used, days active, auto-extracted count
- **Latest insights** featured card with the 3 most recent memories
- **By category** breakdown with animated progress bars
- **Vertical timeline** — chronological, grouped by day, with category badges + source attribution (✶ harmony-keeper vs ✎ you) on each item
- Search + category filter pills
- Inline edit + delete on every memory

### Per-section Templates (Swap from the section editor)
When you toggle "Edit sections" in the preview and click a section, the Edit modal now has a **"Swap for template"** button next to "Re-tune". Click it to open a category-filtered template picker (pre-filtered to the section's likely category — e.g. clicking a "features" section pre-filters to Features templates). Click any template → the Code Alchemist replaces just that section with the template block, keeping everything else intact.

### Built-in Video Demo Recorder
A "Record" pill in the Forge top bar opens a premium modal that lets you record the Forge Studio using the browser's `getDisplayMedia` API + `MediaRecorder`. Features:
- Optional microphone narration toggle (mic audio mixed with system audio)
- Live elapsed timer while recording
- Auto-downloads the .webm when you stop
- Preview the recording inside the modal before discarding or downloading
- Perfect for bootstrapping YouTube tutorials — record your Forge and ship a demo in one click

---

## ❖ Architecture

```
src/
├── app/
│   ├── page.tsx                      # Marketing homepage
│   ├── forge/page.tsx                # Forge Studio
│   ├── settings/page.tsx             # Settings
│   ├── forges/page.tsx                # My Forges dashboard
│   ├── layout.tsx                    # Root layout (fonts, Toaster, Lenis)
│   ├── globals.css                   # Design tokens + keyframes + utilities
│   └── api/
│       ├── forge/route.ts            # SSE streaming endpoint — runs the colony
│       ├── upload/route.ts           # Moodboard upload (Supabase Storage or data URL)
│       ├── export/route.ts           # HTML ZIP / Next.js ZIP / Next.js page preview
│       ├── projects/route.ts         # List + create projects
│       ├── projects/[id]/route.ts    # Get / update / delete one project
│       └── hf-image/route.ts         # Hugging Face FLUX.1-schnell image generation
├── components/
│   ├── lumina/
│   │   ├── orb.tsx                   # <Orb> <GradientText> <GlowCard>
│   │   ├── magnetic-button.tsx       # Cursor-magnetic button
│   │   ├── roundabout-loader.tsx     # The signature generation overlay
│   │   ├── smooth-scroll.tsx         # Lenis provider
│   │   ├── marketing-shell.tsx       # Marketing nav + footer
│   │   ├── hero.tsx                  # Homepage hero
│   │   ├── sections.tsx              # Process / Agents / Gallery / Testimonials / Pricing / FAQ
│   │   ├── forge-studio.tsx          # The 3-panel product surface
│   │   ├── forge-inspector.tsx       # Agents / Iterate / Code / History tabs
│   │   ├── settings-page.tsx         # Settings UI
│   │   └── my-forges.tsx             # My Forges dashboard
│   └── ui/                           # shadcn/ui components (heavily customized)
├── lib/
│   ├── ai/
│   │   ├── agents.ts                 # 5-agent registry
│   │   ├── prompts.ts                # System prompts (with the shared aesthetic contract)
│   │   ├── openrouter.ts             # Streaming chat completions client
│   │   ├── hf.ts                     # Hugging Face Inference client
│   │   └── orchestrator.ts           # Sequential pipeline + iterate-only path
│   ├── forge/
│   │   └── export.ts                 # HTML → Next.js ZIP via JSZip
│   ├── db.ts                         # Prisma client
│   └── utils.ts                      # shadcn cn() helper
├── store/
│   └── forge.ts                      # Zustand store (composer + live generation state)
└── prisma/
    └── schema.prisma                 # Local SQLite schema (mirrors Supabase)
```

---

## ◆ How the multi-agent system works (educational notes)

LuminaForge is designed to be **forked and studied**. Here's how the colony actually flows:

### 1. Sequential, not parallel
Agents run strictly in order. Each agent's output is fed as input to the next:
```
prompt + images + URL
   ↓
[Vibe Interpreter] → JSON vibe
   ↓
[Design Architect] → JSON spec (sections, palette, copy)
   ↓
[Code Alchemist] → complete HTML + Tailwind document
   ↓
[Performance Guardian] → refined HTML + SCORES line
   ↓
[Harmony Keeper] → final micro-refined HTML
```

### 2. Streaming everywhere
Every agent call uses OpenRouter's SSE streaming endpoint. The Forge Studio consumes these events and renders them live in three places simultaneously:
- The **roundabout overlay** lights up each agent orb as its turn arrives
- The **Agents tab** shows streaming text deltas in real time
- The **status message** below the loader updates with each agent's poetic status line

### 3. Robust extraction
LLMs often wrap JSON in markdown fences or add commentary. Each agent's output runs through `extractJson()` and `extractHtml()` helpers in `orchestrator.ts` — these strip fences and pull out only the structured payload, so a single weird token from the model doesn't break the pipeline.

### 4. Fallback models
If the primary `qwen/qwen3-coder:free` is unavailable, the Code Alchemist automatically falls back to `cohere/command-r-plus:free`. This makes the colony resilient to provider cold-starts.

### 5. Iterate-only path
When you chat in the Iterate tab, LuminaForge skips the Vibe Interpreter + Design Architect and sends your instruction straight to the Code Alchemist with the current HTML. This is dramatically faster than a full re-forge and feels like a real conversation with your page.

### 6. Sandboxed preview (security)
The generated HTML is rendered inside a sandboxed iframe with `sandbox="allow-scripts allow-same-origin"` and a strict Content Security Policy baked into the generated `<head>` by the Code Alchemist. We never use `dangerouslySetInnerHTML` on the parent page.

### 7. Production persistence
In production every Forge is persisted to Supabase:
- The current HTML, spec, scores → `projects` table
- The full transcript + scores → `generations` table (one row per agent run)
- Uploaded moodboards → `moodboards` storage bucket (with RLS so only the owner can read)
- Per-user API keys → `settings` table (encrypted with pgcrypto)

In the sandbox preview, the same domain model is mirrored into Prisma + SQLite so the app is fully runnable with zero external setup.

---

## ❖ Tech stack

| Layer | Choice | Why |
|-------|-------|-----|
| Framework | Next.js 16 (App Router, RSC, Server Actions) | Industry standard, Edge-ready |
| Language | TypeScript 5 (strict) | Type-safe agents |
| Styling | Tailwind CSS 4 + shadcn/ui (customized) | Rapid + consistent |
| Animation | Framer Motion 11+ + Lenis | 60fps buttery motion |
| Database | Prisma (local) → Supabase Postgres (prod) | One schema, two runtimes |
| Auth | Supabase Auth (magic link + OAuth) | Free tier covers most side projects |
| Storage | Supabase Storage | Same provider as the database |
| AI — chat | OpenRouter free models (Nemotron, Qwen3-Coder) | Strictly no OpenAI / Anthropic |
| AI — vision | `minimax/minimax-m3:free` | Moodboard understanding |
| AI — images | Hugging Face FLUX.1-schnell | Free inference endpoints |
| State | Zustand | Tiny, no boilerplate |
| ZIP | JSZip | Edge-compatible |
| Toasts | Sonner | Beautiful, accessible |
| Smooth scroll | Lenis | The "Apple-ish" feel |

---

## ▲ Deploy to Vercel

1. Push your project to GitHub
2. Import the repo into Vercel
3. Add your environment variables (from `.env.example`) in the Vercel project settings
4. **Framework preset:** Next.js (auto-detected)
5. **Build command:** `bun run build` (or `npm run build`)
6. **Install command:** `bun install` (or `npm install`)
7. Deploy — done.

The included `vercel.json` is already configured for Next.js. Supabase stays on its free tier, OpenRouter on its free tier, Hugging Face on its free tier. Total monthly cost: $0.

---

## ✺ Educational notes for the bootstrap channel

If you're watching/teaching the bootstrap-channel version of this project, here are the most important lessons baked into the code:

1. **Streaming is non-negotiable for agentic UX.** Without SSE, the user stares at a spinner for 60+ seconds. With streaming, every agent feels alive. See `/api/forge/route.ts` + `src/lib/ai/openrouter.ts`.

2. **The "aesthetic contract" pattern.** All five system prompts in `src/lib/ai/prompts.ts` share a single `SHARED_AESTHETIC` constant. This means every model call carries the same brand contract — the colony is consistent without any post-hoc CSS layer.

3. **Robust extraction beats perfect prompts.** Models *will* wrap output in markdown fences, *will* add commentary, *will* hallucinate tags. `extractJson()` and `extractHtml()` in `orchestrator.ts` are the unsung heroes of this codebase.

4. **Sandboxed iframes + CSP > dangerouslySetInnerHTML.** Render untrusted generated HTML inside a `sandbox="allow-scripts"` iframe with its own `<meta http-equiv="Content-Security-Policy">` in the generated `<head>`. The parent page stays safe.

5. **One schema, two runtimes.** The Prisma schema mirrors the Supabase SQL exactly. Local dev is instant (SQLite, no signup). Production persistence is one paste away (run `supabase-schema.sql` in the Supabase SQL editor).

6. **Fallback models win trust.** Free-tier endpoints cold-start and rate-limit. The Code Alchemist's automatic fallback to a second free model means the colony rarely fails in front of the user.

7. **Magnetic buttons + orbs = delight.** The `<MagneticButton>` and `<Orb>` components cost almost nothing to add but they're what make the app feel "expensive". The lesson: small motion details compound.

---

## ❖ Roadmap

- **Real Supabase Auth** (magic link + GitHub OAuth) wired into the Settings page
- **Real Deploy to Vercel** button using the Vercel API (currently shows a toast)
- **Per-section iterate** (click a section in the preview, ask for changes)
- **Voice prompt** (whisper your vibe into the composer)
- **Agent memory** (let the colony remember your style preferences across forges)
- **Realtime collaboration** via Supabase realtime (multiple users in one Forge)

---

## ✶ License

MIT. Fork it, ship from it, sell what you build. The generated sites are yours, full stop. Just be aware of the individual model licenses on OpenRouter — most free models permit commercial use, but check each model's card.

---

## ❖ Credits

Built with love on the free-tier stack. The "Roundabout" aesthetic is a love letter to the open AI ecosystem — may the colony orbit forever.

**Forge on, friend.**
