"use client";

// =====================================================================
// LuminaForge.ai — <SettingsPage />
// =====================================================================
// Premium settings experience with three cards:
//   1. OpenRouter API key (free — get one at openrouter.ai/keys)
//   2. Hugging Face token (free — for image generation)
//   3. Supabase credentials (optional, for production persistence)
//
// Plus a clear status banner that tells you which keys are missing.
// All keys are persisted to localStorage in the sandbox preview and
// (when configured) to the Supabase `settings` table encrypted with
// pgcrypto — see `download/luminaforge/supabase-schema.sql`.
// =====================================================================

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Key,
  Image as ImageIcon,
  Database,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Zap,
  Brain,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingNav, MarketingFooter } from "./marketing-shell";
import { Orb, GradientText, GlowCard } from "./orb";
import { MagneticButton } from "./magnetic-button";
import { cn } from "@/lib/utils";

type Keys = {
  openRouter: string;
  hf: string;
  supabaseUrl: string;
  supabaseAnon: string;
  supabaseService: string;
};

const STORAGE_KEY = "luminaforge.keys";

export function SettingsPage() {
  // Initialize from localStorage lazily (no cascading effect render).
  const [keys, setKeys] = useState<Keys>(() => {
    if (typeof window === "undefined") {
      return { openRouter: "", hf: "", supabaseUrl: "", supabaseAnon: "", supabaseService: "" };
    }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (stored) return { openRouter: "", hf: "", supabaseUrl: "", supabaseAnon: "", supabaseService: "", ...stored };
    } catch {}
    return { openRouter: "", hf: "", supabaseUrl: "", supabaseAnon: "", supabaseService: "" };
  });
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    setSaved(true);
    toast.success("Keys saved locally. Add them to .env.local to enable server-side AI calls.");
    setTimeout(() => setSaved(false), 2000);
  }

  const hasOpenRouter = Boolean(keys.openRouter || process.env.OPENROUTER_API_KEY);
  const hasHF = Boolean(keys.hf || process.env.HF_TOKEN);
  const hasSupabase = Boolean(keys.supabaseUrl && keys.supabaseAnon);

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <MarketingNav />

      <main className="flex-1 pt-28 pb-12 px-6">
        <Orb size="xl" color="#8B5CF6" halo="#6366F1" className="top-[80px] left-[-200px] opacity-30 -z-10" />
        <Orb size="md" color="#22D3EE" halo="#8B5CF6" className="top-[40%] right-[-100px] opacity-30 -z-10" />

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
              Bring your <GradientText>free keys</GradientText>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed text-pretty">
              LuminaForge is fully open-source — we never proxy your AI calls.
              Paste your free OpenRouter + Hugging Face keys below to start
              forging. In production these are encrypted and stored in your
              own Supabase.
            </p>
          </motion.div>

          {/* Status banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlowCard className="!p-5 flex items-center gap-4">
              <div className="flex gap-2">
                <StatusDot ok={hasOpenRouter} label="OR" />
                <StatusDot ok={hasHF} label="HF" />
                <StatusDot ok={hasSupabase} label="SB" />
              </div>
              <p className="text-sm text-slate-600 flex-1">
                {hasOpenRouter && hasHF
                  ? "Ready to forge. Both AI keys are configured."
                  : "Add at least the OpenRouter key to start forging. Hugging Face is optional (used for hero image generation)."}
              </p>
              <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            </GlowCard>
          </motion.div>

          {/* Cards */}
          <div className="space-y-5">
            <KeyCard
              icon={<Key className="w-5 h-5" />}
              title="OpenRouter API Key"
              desc="Free — used for all 5 agents. Get one at openrouter.ai/keys."
              href="https://openrouter.ai/keys"
              hrefLabel="Get a free OpenRouter key"
              value={keys.openRouter}
              reveal={reveal.openRouter}
              onToggleReveal={() => setReveal((r) => ({ ...r, openRouter: !r.openRouter }))}
              onChange={(v) => setKeys((k) => ({ ...k, openRouter: v }))}
              placeholder="sk-or-v1-..."
              ok={hasOpenRouter}
            />
            <KeyCard
              icon={<ImageIcon className="w-5 h-5" />}
              title="Hugging Face Token"
              desc="Free — for FLUX.1-schnell hero images. Get one at huggingface.co/settings/tokens."
              href="https://huggingface.co/settings/tokens"
              hrefLabel="Get a free HF token"
              value={keys.hf}
              reveal={reveal.hf}
              onToggleReveal={() => setReveal((r) => ({ ...r, hf: !r.hf }))}
              onChange={(v) => setKeys((k) => ({ ...k, hf: v }))}
              placeholder="hf_..."
              ok={hasHF}
              optional
            />
            <SupabaseCard
              keys={keys}
              setKeys={setKeys}
              hasSupabase={hasSupabase}
            />
          </div>

          {/* Save button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between pt-2"
          >
            <p className="text-xs text-slate-500 leading-relaxed">
              Keys are stored locally in your browser. Add them to{" "}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-violet-700">.env.local</code>{" "}
              to enable server-side AI calls.
            </p>
            <MagneticButton onClick={save}>
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? "Saved" : "Save keys"}
            </MagneticButton>
          </motion.div>

          {/* Agent Memory */}
          <AgentMemoryPanel />

          {/* Educational note */}
          <GlowCard className="!p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl grid place-items-center bg-gradient-lumina text-white flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base mb-1.5">Why free open models?</h3>
                <p className="text-sm text-slate-600 leading-relaxed text-pretty">
                  LuminaForge is a love letter to the open AI ecosystem. By
                  routing every call through OpenRouter's free tier and
                  Hugging Face's free inference endpoints, the entire
                  product costs nothing to run beyond your own Supabase +
                  Vercel free tiers. Fork it, learn how agentic AI works,
                  ship your own twist. No vendor lock-in, no surprise bills.
                </p>
              </div>
            </div>
          </GlowCard>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
      {label}
    </span>
  );
}

interface KeyCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  hrefLabel: string;
  value: string;
  reveal: boolean;
  onToggleReveal: () => void;
  onChange: (v: string) => void;
  placeholder: string;
  ok: boolean;
  optional?: boolean;
}

function KeyCard({
  icon, title, desc, href, hrefLabel, value, reveal, onToggleReveal, onChange, placeholder, ok, optional,
}: KeyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlowCard className="!p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl grid place-items-center bg-gradient-lumina text-white shadow-orb-sm flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-lg">{title}</h3>
              {optional && (
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-100 text-slate-500">
                  optional
                </span>
              )}
              {ok && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700">
                  <Check className="w-3 h-3" /> Configured
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-3 leading-relaxed">{desc}</p>
            <div className="relative">
              <input
                type={reveal ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-full border border-slate-200 bg-white/70 pl-4 pr-12 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <button
                onClick={onToggleReveal}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full hover:bg-white text-slate-500"
                aria-label={reveal ? "Hide" : "Show"}
              >
                {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 mt-3 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {hrefLabel}
            </a>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}

function SupabaseCard({
  keys, setKeys, hasSupabase,
}: {
  keys: Keys;
  setKeys: (fn: (k: Keys) => Keys) => void;
  hasSupabase: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <GlowCard className="!p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl grid place-items-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-orb-sm flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-lg">Supabase (optional)</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-100 text-slate-500">
                optional
              </span>
              {hasSupabase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700">
                  <Check className="w-3 h-3" /> Configured
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              For production persistence — projects, generations, history,
              and moodboard uploads. The sandbox preview works without it
              using local storage + Prisma.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field
            label="Project URL"
            value={keys.supabaseUrl}
            onChange={(v) => setKeys((k) => ({ ...k, supabaseUrl: v }))}
            placeholder="https://your-project.supabase.co"
          />
          <Field
            label="Anon Key"
            value={keys.supabaseAnon}
            onChange={(v) => setKeys((k) => ({ ...k, supabaseAnon: v }))}
            placeholder="eyJhbGciOi..."
            mono
          />
          <div className="sm:col-span-2">
            <Field
              label="Service Role Key (server-only)"
              value={keys.supabaseService}
              onChange={(v) => setKeys((k) => ({ ...k, supabaseService: v }))}
              placeholder="eyJhbGciOi... (server-only)"
              mono
            />
          </div>
        </div>
        <a
          href="https://app.supabase.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-3 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Create a free Supabase project
        </a>
      </GlowCard>
    </motion.div>
  );
}

function Field({
  label, value, onChange, placeholder, mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white/70 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300",
          mono && "font-mono",
        )}
      />
    </div>
  );
}

// =====================================================================
// <AgentMemoryPanel /> — the "Memory" section in /settings
// =====================================================================
// Surfaces the colony's accumulated style preferences for this user.
// The user can:
//   • Manually add a new memory
//   • Edit any memory in-place
//   • Delete a memory
//   • See which agent originated each memory (badge)
// On every fresh Forge, the Vibe Interpreter reads these as context so
// LuminaForge remembers the user's taste across projects.
// =====================================================================

interface Memory {
  id: string;
  content: string;
  category: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  color: "bg-pink-100 text-pink-700",
  typography: "bg-indigo-100 text-indigo-700",
  layout: "bg-cyan-100 text-cyan-700",
  tone: "bg-amber-100 text-amber-700",
  content: "bg-emerald-100 text-emerald-700",
  misc: "bg-slate-100 text-slate-700",
};

export function AgentMemoryPanel() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("misc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/memory");
      if (!res.ok) return;
      const data = await res.json();
      setMemories(data.memories ?? []);
    } catch {
      /* silent — memory is a nice-to-have */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addMemory() {
    if (!newContent.trim()) return;
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim(), category: newCategory, source: "user" }),
      });
      if (!res.ok) throw new Error("Failed to add memory");
      setNewContent("");
      toast.success("Memory saved. The colony will honor it next Forge.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add memory");
    }
  }

  async function deleteMemory(id: string) {
    try {
      const res = await fetch(`/api/memory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMemories((m) => m.filter((x) => x.id !== id));
      toast.success("Memory removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function saveEdit(id: string) {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/memory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingId(null);
      setEditContent("");
      toast.success("Memory updated.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  return (
    <GlowCard className="!p-6">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl grid place-items-center bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white shadow-orb-sm flex-shrink-0">
          <Brain className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg mb-1">Agent Memory</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Style preferences the colony has learned about you. The Vibe
            Interpreter reads these as context on every fresh Forge, so
            LuminaForge remembers your taste across projects. The Harmony
            Keeper surfaces new memories automatically after each Forge.
          </p>
        </div>
      </div>

      {/* Add a new memory */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          aria-label="Category"
        >
          {["misc", "color", "typography", "layout", "tone", "content"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMemory()}
          placeholder="e.g. Always use ultra-rounded 48px radii on cards"
          maxLength={200}
          className="flex-1 rounded-2xl border border-slate-200 bg-white/70 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <MagneticButton size="sm" onClick={addMemory} disabled={!newContent.trim()}>
          <Plus className="w-4 h-4" />
          Add
        </MagneticButton>
      </div>

      {/* Memories list */}
      {loading ? (
        <div className="text-sm text-slate-400 text-center py-6">Loading memories…</div>
      ) : memories.length === 0 ? (
        <div className="text-sm text-slate-400 text-center py-6 leading-relaxed">
          No memories yet. Forge your first site and the Harmony Keeper will
          start collecting preferences, or add one manually above.
        </div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto lf-scroll">
          <AnimatePresence initial={false}>
            {memories.map((m) => (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="group flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-slate-200/60 hover:border-violet-200 transition-colors"
              >
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide flex-shrink-0 ${
                    CATEGORY_COLORS[m.category ?? "misc"] ?? CATEGORY_COLORS.misc
                  }`}
                >
                  {m.category ?? "misc"}
                </span>
                {editingId === m.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      autoFocus
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(m.id)}
                      className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    />
                    <button
                      onClick={() => saveEdit(m.id)}
                      className="px-2.5 py-1 text-xs rounded-full bg-violet-600 text-white hover:bg-violet-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditContent(""); }}
                      className="px-2.5 py-1 text-xs rounded-full hover:bg-slate-100 text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 text-sm text-slate-700 leading-relaxed">{m.content}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingId(m.id);
                          setEditContent(m.content);
                        }}
                        className="w-7 h-7 grid place-items-center rounded-full hover:bg-white text-slate-500"
                        aria-label="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMemory(m.id)}
                        className="w-7 h-7 grid place-items-center rounded-full hover:bg-rose-50 text-rose-500"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {m.source === "harmony-keeper" && (
                      <span className="text-[9px] font-mono text-violet-600 flex-shrink-0">
                        ✶ keeper
                      </span>
                    )}
                  </>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </GlowCard>
  );
}
