// =====================================================================
// LuminaForge.ai — Agent Registry
// =====================================================================
// The five agents that orchestrate every Forge. Each agent has a fixed
// role, a fixed model, and a fixed poetic status message that the UI
// surfaces while the agent is "thinking".
//
// Models are strictly the FREE tier of OpenRouter / Hugging Face —
// see `OPENROUTER_API_KEY` and `HF_TOKEN` in `.env.example`.
// =====================================================================

export type AgentId =
  | "vibe-interpreter"
  | "design-architect"
  | "code-alchemist"
  | "performance-guardian"
  | "harmony-keeper";

export interface AgentMeta {
  id: AgentId;
  name: string;
  emoji: string;          // Single character label for the orb
  hue: string;            // Tailwind-friendly gradient stops
  model: string;
  fallbackModel?: string;
  role: string;
  statusMessage: string;  // Poetic line shown while running
  /** Approximate orbit position (degrees) on the roundabout ring. */
  orbitAngle: number;
}

export const AGENTS: Record<AgentId, AgentMeta> = {
  "vibe-interpreter": {
    id: "vibe-interpreter",
    name: "Vibe Interpreter",
    emoji: "✶",
    hue: "from-indigo-400 to-violet-500",
    model: "nvidia/nemotron-3-ultra:free",
    role: "Reads the prompt, moodboards, and reference URL — distills a single shared vibe.",
    statusMessage: "Listening to the texture of your words…",
    orbitAngle: 0,
  },
  "design-architect": {
    id: "design-architect",
    name: "Design Architect",
    emoji: "◆",
    hue: "from-violet-400 to-fuchsia-500",
    model: "nvidia/nemotron-3-ultra:free",
    role: "Translates the vibe into a structured spec: layout, sections, copy, palette.",
    statusMessage: "Drafting the blueprint of your dreams…",
    orbitAngle: 72,
  },
  "code-alchemist": {
    id: "code-alchemist",
    name: "Code Alchemist",
    emoji: "✦",
    hue: "from-cyan-400 to-blue-500",
    model: "qwen/qwen3-coder:free",
    fallbackModel: "cohere/command-r-plus:free",
    role: "Transmutes the spec into clean, self-contained HTML + Tailwind.",
    statusMessage: "Transmuting ideas into living markup…",
    orbitAngle: 144,
  },
  "performance-guardian": {
    id: "performance-guardian",
    name: "Performance Guardian",
    emoji: "▲",
    hue: "from-emerald-400 to-teal-500",
    model: "qwen/qwen3-coder:free",
    role: "Audits performance & SEO: meta tags, lazy media, semantic structure.",
    statusMessage: "Polishing the facets for speed and reach…",
    orbitAngle: 216,
  },
  "harmony-keeper": {
    id: "harmony-keeper",
    name: "Harmony Keeper",
    emoji: "✺",
    hue: "from-amber-400 to-orange-500",
    model: "nvidia/nemotron-3-ultra:free",
    role: "Final review — micro-refinements so the page sings as a whole.",
    statusMessage: "Tuning the resonance of the final chord…",
    orbitAngle: 288,
  },
};

export const AGENT_ORDER: AgentId[] = [
  "vibe-interpreter",
  "design-architect",
  "code-alchemist",
  "performance-guardian",
  "harmony-keeper",
];
