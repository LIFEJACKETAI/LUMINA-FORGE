// =====================================================================
// LuminaForge.ai — Forge Store (Zustand)
// =====================================================================
// Single client-side store for the Forge Studio. Holds the composer
// inputs, the live preview HTML, the agent transcript, scores, and
// generation state. The store is intentionally small — long-lived
// persistence lives in Prisma/Supabase via the API routes.
// =====================================================================

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { AgentId } from "@/lib/ai/agents";

export type ForgePhase =
  | "idle"
  | "running"
  | "agent_active"
  | "complete"
  | "error";

export interface AgentStreamState {
  agentId: AgentId;
  status: "pending" | "running" | "done" | "error";
  statusMessage: string;
  /** Accumulated text from the agent — streamed live. */
  content: string;
}

export interface ScoreCard {
  seo: number;
  perf: number;
  a11y: number;
  review?: string;
}

export interface ChatTurn {
  role: "user" | "agent";
  content: string;
  ts: string;
}

export interface VibeChip {
  label: string;
  emoji: string;
}

export const VIBE_CHIPS: VibeChip[] = [
  { label: "Futuristic", emoji: "✦" },
  { label: "Calm & Minimal", emoji: "❍" },
  { label: "Playful", emoji: "✺" },
  { label: "Editorial", emoji: "❧" },
  { label: "Bold & Brave", emoji: "✸" },
  { label: "Premium", emoji: "❖" },
  { label: "Organic", emoji: "❀" },
  { label: "Techy", emoji: "◆" },
];

interface ForgeStore {
  // ---- Composer state ----
  prompt: string;
  referenceUrl: string;
  selectedChips: string[];
  uploadedImages: { name: string; url: string }[];

  // ---- Live generation state ----
  phase: ForgePhase;
  activeAgentId: AgentId | null;
  agents: Record<AgentId, AgentStreamState>;
  previewHtml: string;
  vibeJson: string;
  specJson: string;
  scores: ScoreCard | null;
  error: string | null;

  // ---- Iterate chat history ----
  chat: ChatTurn[];

  // ---- Current project linkage (server-side project id) ----
  projectId: string | null;
  projectName: string;
  versions: { id: string; createdAt: string; prompt: string; scores?: ScoreCard }[];

  // ---- Actions ----
  setPrompt: (s: string) => void;
  setReferenceUrl: (s: string) => void;
  toggleChip: (label: string) => void;
  addImage: (name: string, url: string) => void;
  removeImage: (url: string) => void;

  startForge: () => void;
  onAgentStart: (agentId: AgentId, msg: string) => void;
  onAgentDelta: (agentId: AgentId, delta: string) => void;
  onAgentDone: (agentId: AgentId) => void;
  onVibe: (s: string) => void;
  onSpec: (s: string) => void;
  onHtml: (s: string) => void;
  onScores: (s: ScoreCard) => void;
  onError: (agentId: AgentId | null, msg: string) => void;
  onComplete: () => void;

  // ---- Iterate chat ----
  pushChatUser: (content: string) => void;
  pushChatAgent: (content: string) => void;

  // ---- Project linkage ----
  setProject: (id: string, name: string) => void;
  setProjectName: (name: string) => void;
  addVersion: (id: string, prompt: string, scores?: ScoreCard) => void;
  loadFromProject: (data: {
    id: string;
    name: string;
    currentHtml: string;
    currentSpec: string;
    lastPrompt: string;
    lastRefUrl: string;
    vibeTags: string[];
    scores: ScoreCard | null;
    versions: { id: string; createdAt: string; prompt: string; scores?: ScoreCard }[];
  }) => void;

  reset: () => void;
}

const emptyAgents = (): Record<AgentId, AgentStreamState> => ({
  "vibe-interpreter": { agentId: "vibe-interpreter", status: "pending", statusMessage: "", content: "" },
  "design-architect": { agentId: "design-architect", status: "pending", statusMessage: "", content: "" },
  "code-alchemist": { agentId: "code-alchemist", status: "pending", statusMessage: "", content: "" },
  "performance-guardian": { agentId: "performance-guardian", status: "pending", statusMessage: "", content: "" },
  "harmony-keeper": { agentId: "harmony-keeper", status: "pending", statusMessage: "", content: "" },
});

export const useForge = create<ForgeStore>()(
  subscribeWithSelector((set, get) => ({
    prompt: "",
    referenceUrl: "",
    selectedChips: [],
    uploadedImages: [],

    phase: "idle",
    activeAgentId: null,
    agents: emptyAgents(),
    previewHtml: "",
    vibeJson: "",
    specJson: "",
    scores: null,
    error: null,

    chat: [],

    projectId: null,
    projectName: "Untitled Forge",
    versions: [],

    setPrompt: (s) => set({ prompt: s }),
    setReferenceUrl: (s) => set({ referenceUrl: s }),
    toggleChip: (label) =>
      set((st) => ({
        selectedChips: st.selectedChips.includes(label)
          ? st.selectedChips.filter((c) => c !== label)
          : [...st.selectedChips, label],
      })),
    addImage: (name, url) =>
      set((st) => ({ uploadedImages: [...st.uploadedImages, { name, url }] })),
    removeImage: (url) =>
      set((st) => ({
        uploadedImages: st.uploadedImages.filter((i) => i.url !== url),
      })),

    startForge: () =>
      set({
        phase: "running",
        agents: emptyAgents(),
        activeAgentId: null,
        previewHtml: "",
        vibeJson: "",
        specJson: "",
        scores: null,
        error: null,
      }),

    onAgentStart: (agentId, msg) =>
      set((st) => ({
        phase: "agent_active",
        activeAgentId: agentId,
        agents: {
          ...st.agents,
          [agentId]: {
            ...st.agents[agentId],
            status: "running",
            statusMessage: msg,
            content: "",
          },
        },
      })),

    onAgentDelta: (agentId, delta) =>
      set((st) => ({
        agents: {
          ...st.agents,
          [agentId]: {
            ...st.agents[agentId],
            content: st.agents[agentId].content + delta,
          },
        },
      })),

    onAgentDone: (agentId) =>
      set((st) => ({
        agents: {
          ...st.agents,
          [agentId]: { ...st.agents[agentId], status: "done" },
        },
        activeAgentId: null,
      })),

    onVibe: (s) => set({ vibeJson: s }),
    onSpec: (s) => set({ specJson: s }),
    onHtml: (s) => set({ previewHtml: s }),
    onScores: (s) => set({ scores: s }),
    onError: (agentId, msg) =>
      set((st) => ({
        error: msg,
        phase: "error",
        activeAgentId: null,
        agents: agentId
          ? { ...st.agents, [agentId]: { ...st.agents[agentId], status: "error" } }
          : st.agents,
      })),
    onComplete: () => set({ phase: "complete", activeAgentId: null }),

    pushChatUser: (content) =>
      set((st) => ({
        chat: [...st.chat, { role: "user", content, ts: new Date().toISOString() }],
      })),
    pushChatAgent: (content) =>
      set((st) => ({
        chat: [...st.chat, { role: "agent", content, ts: new Date().toISOString() }],
      })),

    setProject: (id, name) => set({ projectId: id, projectName: name }),
    setProjectName: (name) => set({ projectName: name }),
    addVersion: (id, prompt, scores) =>
      set((st) => ({
        versions: [
          { id, createdAt: new Date().toISOString(), prompt, scores },
          ...st.versions,
        ],
      })),
    loadFromProject: ({
      id,
      name,
      currentHtml,
      currentSpec,
      lastPrompt,
      lastRefUrl,
      vibeTags,
      scores,
      versions,
    }) =>
      set({
        projectId: id,
        projectName: name,
        previewHtml: currentHtml,
        specJson: currentSpec,
        prompt: lastPrompt,
        referenceUrl: lastRefUrl,
        selectedChips: vibeTags,
        scores,
        versions,
        phase: currentHtml ? "complete" : "idle",
      }),

    reset: () =>
      set({
        prompt: "",
        referenceUrl: "",
        selectedChips: [],
        uploadedImages: [],
        phase: "idle",
        activeAgentId: null,
        agents: emptyAgents(),
        previewHtml: "",
        vibeJson: "",
        specJson: "",
        scores: null,
        error: null,
        chat: [],
      }),
  })),
);
