# ***LUMINA-FORGE BUILD PROMPT 060926***

You are a world-class full-stack architect, product designer, and educator with impeccable taste. You are the love child of a staff engineer at Vercel, a motion artist from Apple, and an AI-native creative director who runs a popular YouTube/channel teaching people how to bootstrap real products for little or no money using only open-source and free-tier tools. Your work is always production-grade, delightful, educational, and meticulously commented so viewers can learn from it.  
Build the complete, fully functional, production-ready full-stack application for LuminaForge.ai — an agentic AI website generator that lets users describe a vibe, drop a reference URL, upload sketches or moodboards, and receive a beautiful, high-performance website. The output is clean, self-contained HTML \+ Tailwind (for instant live preview in a sandboxed iframe) plus an export option that converts it into clean Next.js 15 \+ Tailwind code. All AI logic must use strictly free/open models via OpenRouter and Hugging Face. No OpenAI, no Anthropic, no frontier paid models. This project must be 100% bootstrap-friendly and deployable on Vercel with free-tier Supabase.  
Core Vibe ("Roundabout Style")  
The entire experience must feel premium, intelligent, effortless, and quietly magical. Use extremely generous whitespace, sophisticated typography, and very organic ultra-rounded forms (minimum 32–48px border-radius on cards, buttons, panels, modals — everything must feel soft and approachable). Heavy use of luminous orb motifs, soft layered glow shadows, gentle gradients (indigo \#6366F1 → violet \#8B5CF6 → cyan \#22D3EE), subtle glassmorphism, and flowing curved transitions. The interface should feel like a living creative workshop where intelligent agents orbit and collaborate in a non-linear "roundabout." Optimistic, empowering, human, and futuristic. Every micro-interaction should spark delight while remaining refined and trustworthy. The sites the AI generates must also follow this exact rounded, orb-filled, magical aesthetic.  
Exact Design System & Tech Stack (strictly open-source/free)  
Colors: Off-white background (\#F8FAFC–\#FFFFFF), crisp white surfaces, deep slate text (\#0F172A), primary gradient indigo-violet-cyan.  
Typography: Headings — bold modern sans (Space Grotesk/Satoshi approximations via system \+ font-weight 700–900). Body — Inter/system sans. Generous scale and line height.  
Framework: Next.js 15 (App Router, Server Actions, React Server Components), TypeScript, Tailwind CSS, Framer Motion 11+, shadcn/ui components (heavily customized to ultra-rounded organic style), lucide-react icons, Sonner for toasts, Lenis for smooth scroll.  
Database & Backend: Supabase (Postgres for projects, generations, history; Supabase Auth for login; Supabase Storage for moodboard uploads). Provide the complete SQL schema as the first file.  
AI Layer: OpenRouter (official SDK or fetch to https://openrouter.ai/api/v1). Default models must be free ones only:  
Orchestration & Planning: nvidia/nemotron-3-ultra:free  
Code & Agentic Generation: qwen/qwen3-coder:free (primary) with fallback to cohere/north-mini-code:free or poolside/laguna-m.1:free  
Vision (moodboard/sketch understanding): minimax/minimax-m3:free  
Image generation (hero images, illustrations): Hugging Face Inference API (use FLUX.1-schnell or SDXL via free inference endpoints).  
State: Zustand \+ Supabase realtime where it adds value.  
Preview: Sandboxed iframe that renders fully self-contained HTML \+ Tailwind via CDN \+ inline scripts. Use secure blob URLs \+ strict CSP. Never use dangerouslySetInnerHTML on the parent.  
Deployment: Fully Vercel-ready. Include vercel.json if needed.  
Application Structure (fully live — no mocks, no placeholders)  
Marketing Homepage (/) — Gorgeous landing page with hero ("Describe the Vibe. We Forge the Reality."), trust bar, non-linear Roundabout Process section, agent showcase (circular orbiting cards), example gallery (clicking loads the prompt into the studio), testimonials, pricing (free tier prominent), and FAQ. All CTAs open or navigate to the Forge Studio. Use the exact "roundabout" aesthetic.  
Forge Studio (/forge) — The core product. Elegant persistent top bar (logo, editable project name, My Forges, Export, Deploy to Vercel mock, user avatar). Three-panel layout with curved organic dividers:  
Left Composer: Large textarea for vibe description, drag-and-drop moodboard/upload area (saved to Supabase Storage), reference URL input, quick vibe chips, prominent "Forge with Agents" button.

Center Live Preview: Responsive iframe showing the generated site instantly. During generation, overlay a beautiful animated "roundabout" where agent orbs orbit a central glowing forge with poetic status messages that update in real time from the actual API responses.  
Right Inspector (tabs: Agents, Iterate, Code, History):

Agents tab: Visual roundabout of active agents with live streaming text from OpenRouter calls.  
Iterate tab: Natural language chat that triggers new agent rounds and updates the preview.  
Code tab: View of the generated HTML \+ option to see "Converted to Next.js components". Buttons for Copy, Download ZIP, Export full Next.js project.

History: Previous generations for the project with thumbnails (stored in Supabase).  
Real Multi-Agent Generation Flow (live API calls): When the user clicks Forge:  
Upload any images to Supabase Storage and get public URLs.  
Run a sequential agent chain using OpenRouter:

Vibe Interpreter (Nemotron-3-Ultra:free) — analyzes prompt \+ images.  
Design Architect — creates detailed structured JSON spec (layout, colors, copy, components, vibe match).  
Code Alchemist (Qwen3-Coder:free) — generates complete self-contained HTML using Tailwind CDN that perfectly embodies the "roundabout" rounded magical style.

Performance Guardian — optimizes HTML, adds Lighthouse-friendly attributes, meta tags.  
Harmony Keeper — final review and small refinements.

Stream responses where possible and update the UI live.  
After generation, save the prompt, JSON spec, HTML, and metadata to Supabase.  
For image assets in generated sites: optionally call Hugging Face FLUX to create custom hero/illustration images and embed them.

Additional Required Features (all live):  
Beautiful settings page (/settings) for entering OpenRouter API key (stored encrypted in Supabase) and Supabase credentials.

Supabase Auth (email \+ magic link or social via free providers).  
"My Forges" dashboard with searchable grid of projects.

Export options: Download HTML ZIP, or "Convert to Next.js" which generates a complete ready-to-deploy Next.js project ZIP (use JSZip).

Performance/SEO score indicators that update after iterations.  
Floating orb "Ask Agents" button for contextual help.

All generated sites must be responsive, accessible, and visually stunning in the same rounded magical style as the main app.

Output Requirements: Output in this exact order with clear separation:  
Complete Supabase Postgres schema (SQL) with all tables, RLS policies, and comments explaining each table.

.env.example with all required variables (SUPABASE\_URL, SUPABASE\_ANON\_KEY, SUPABASE\_SERVICE\_ROLE, OPENROUTER\_API\_KEY, HF\_TOKEN).  
tailwind.config.ts with all custom radii, colors, shadows, and orb glow animations.  
Any global CSS (including keyframe orb animations and rounded utilities).  
Well-organized folder structure with clean, heavily commented components, Server Actions, and hooks.

Main pages (page.tsx, forge/page.tsx, etc.).  
Comprehensive README.md with setup instructions, how to add your free OpenRouter key, Supabase setup steps, Vercel deployment steps, and educational notes on how the multi-agent system works (perfect for your bootstrap channel).

Every line of code must be production-quality, delightful, and educational. Prioritize smoothness (60fps), accessibility, mobile experience, and emotional resonance. The final product should feel better than most paid AI website builders while costing users almost nothing to run.

Think like you are shipping v1 of a breakthrough open-source-friendly AI creative tool that your audience can clone and learn from. Beauty, technical excellence, the unmistakable magical roundabout soul, and real functionality with free models are non-negotiable.

Begin building now. Surprise me.  
