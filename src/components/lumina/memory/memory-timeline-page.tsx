"use client";

// =====================================================================
// LuminaForge.ai — <MemoryTimelinePage />
// =====================================================================
// The /memory page — visualizes how the colony's understanding of the
// user's taste has evolved over time. Sections:
//
//  1. Hero header with gradient title + summary
//  2. Stats strip (total memories, by category, days active)
//  3. Category breakdown bars
//  4. Source attribution (auto-extracted vs user-added)
//  5. Vertical timeline — chronological, grouped by day, with the
//     source + category badge on each item
//  6. "Latest insights" featured card at the top
//  7. Empty state if no memories
// =====================================================================

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Clock,
  Sparkles,
  Search,
  Trash2,
  Pencil,
  Plus,
  Check,
  X,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingNav, MarketingFooter } from "../marketing-shell";
import { Orb, GradientText, GlowCard } from "../orb";
import { MagneticButton } from "../magnetic-button";
import { cn } from "@/lib/utils";

interface Memory {
  id: string;
  content: string;
  category: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
  firstAt: string | null;
  lastAt: string | null;
  recent: Memory[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  color: { bg: "bg-pink-100", text: "text-pink-700", bar: "bg-pink-400" },
  typography: { bg: "bg-indigo-100", text: "text-indigo-700", bar: "bg-indigo-400" },
  layout: { bg: "bg-cyan-100", text: "text-cyan-700", bar: "bg-cyan-400" },
  tone: { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-400" },
  content: { bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-400" },
  misc: { bg: "bg-slate-100", text: "text-slate-700", bar: "bg-slate-400" },
};

const CATEGORY_LABELS: Record<string, string> = {
  color: "Color",
  typography: "Typography",
  layout: "Layout",
  tone: "Tone",
  content: "Content",
  misc: "Miscellaneous",
};

function dayKey(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (60 * 60 * 1000));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

export function MemoryTimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [memRes, statsRes] = await Promise.all([
          fetch("/api/memory"),
          fetch("/api/memory/stats"),
        ]);
        if (memRes.ok) {
          const data = await memRes.json();
          setMemories(data.memories ?? []);
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group memories by day for the vertical timeline.
  const grouped = useMemo(() => {
    const filtered = memories.filter((m) => {
      if (activeCat !== "all" && (m.category ?? "misc") !== activeCat) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return m.content.toLowerCase().includes(q);
      }
      return true;
    });
    // Group by day (newest first).
    const groups: Record<string, Memory[]> = {};
    for (const m of filtered) {
      const key = dayKey(m.createdAt);
      (groups[key] ??= []).push(m);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [memories, activeCat, query]);

  const daysActive = stats?.firstAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(stats.firstAt).getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  async function deleteMemory(id: string) {
    try {
      const res = await fetch(`/api/memory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMemories((m) => m.filter((x) => x.id !== id));
      toast.success("Memory removed");
      // Refresh stats
      const statsRes = await fetch("/api/memory/stats");
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <MarketingNav />

      <main className="flex-1 pt-28 pb-12 px-6">
        <Orb size="xl" color="#8B5CF6" halo="#6366F1" className="top-[80px] left-[-200px] opacity-25 -z-10" />
        <Orb size="md" color="#22D3EE" halo="#8B5CF6" className="top-[60%] right-[-100px] opacity-25 -z-10" />

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to settings
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-500 grid place-items-center text-white shadow-orb-sm">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
                  Agent <GradientText>Memory</GradientText> Timeline
                </h1>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  How the colony's understanding of your taste has evolved.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats strip */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : stats && stats.total > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard
                icon={<Brain className="w-5 h-5" />}
                value={stats.total}
                label="Memories"
                gradient="from-violet-400 to-fuchsia-500"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                value={Object.keys(stats.byCategory).length}
                label="Categories"
                gradient="from-cyan-400 to-blue-500"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5" />}
                value={daysActive}
                label="Days active"
                gradient="from-emerald-400 to-teal-500"
              />
              <StatCard
                icon={<Sparkles className="w-5 h-5" />}
                value={stats.bySource["harmony-keeper"] ?? 0}
                label="Auto-extracted"
                gradient="from-amber-400 to-orange-500"
              />
            </motion.div>
          ) : null}

          {/* Latest insights featured card */}
          {!loading && stats && stats.recent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <GlowCard className="!p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-lumina grid place-items-center text-white shadow-orb-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Latest insights</h3>
                    <p className="text-sm text-slate-500">
                      The most recent memories the colony has learned.
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.recent.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-3xl p-4 bg-white/60 border border-slate-200/60 hover:border-violet-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide",
                            CATEGORY_COLORS[m.category ?? "misc"]?.bg ?? CATEGORY_COLORS.misc.bg,
                            CATEGORY_COLORS[m.category ?? "misc"]?.text ?? CATEGORY_COLORS.misc.text,
                          )}
                        >
                          {m.category ?? "misc"}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatRelative(m.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed text-pretty">
                        {m.content}
                      </p>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </motion.div>
          )}

          {/* Category breakdown */}
          {!loading && stats && stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlowCard className="!p-6">
                <h3 className="font-display font-bold text-lg mb-4">By category</h3>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const pct = Math.round((count / stats.total) * 100);
                      const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.misc;
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <span className="text-xs font-semibold w-24 text-slate-600">
                            {CATEGORY_LABELS[cat] ?? cat}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={cn("h-full rounded-full", colors.bar)}
                            />
                          </div>
                          <span className="text-xs font-mono text-slate-500 w-12 text-right">
                            {count} · {pct}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </GlowCard>
            </motion.div>
          )}

          {/* Filter bar */}
          {!loading && stats && stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search memories…"
                  className="w-full glass-panel rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto lf-scroll pb-1 sm:pb-0">
                <CategoryPill
                  active={activeCat === "all"}
                  onClick={() => setActiveCat("all")}
                  label="All"
                />
                {Object.keys(stats.byCategory).map((cat) => (
                  <CategoryPill
                    key={cat}
                    active={activeCat === cat}
                    onClick={() => setActiveCat(cat)}
                    label={CATEGORY_LABELS[cat] ?? cat}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Vertical timeline */}
          {!loading ? (
            stats && stats.total > 0 ? (
              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-cyan-200 to-transparent" />

                <AnimatePresence initial={false}>
                  {grouped.map(([day, dayMemories], groupIdx) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: groupIdx * 0.05 }}
                      className="mb-8"
                    >
                      {/* Day header */}
                      <div className="flex items-center gap-3 mb-4 -ml-8">
                        <div className="w-6 h-6 rounded-full bg-gradient-lumina grid place-items-center text-white text-[10px] shadow-orb-sm flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                        </div>
                        <h3 className="font-display font-bold text-sm text-slate-700">
                          {formatDate(day)}
                        </h3>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">
                          {dayMemories.length} memor{dayMemories.length === 1 ? "y" : "ies"}
                        </span>
                      </div>

                      {/* Memory items */}
                      <div className="space-y-2">
                        {dayMemories.map((m, idx) => (
                          <TimelineItem
                            key={m.id}
                            memory={m}
                            onDelete={() => deleteMemory(m.id)}
                            delay={groupIdx * 0.05 + idx * 0.02}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState />
            )
          ) : null}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  gradient,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  gradient: string;
}) {
  return (
    <GlowCard className="!p-5">
      <div className={cn("w-10 h-10 rounded-2xl grid place-items-center text-white shadow-orb-sm mb-3 bg-gradient-to-br", gradient)}>
        {icon}
      </div>
      <div className="font-display text-3xl font-extrabold tracking-tight">{value}</div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </GlowCard>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors",
        active ? "bg-gradient-lumina text-white" : "bg-white/70 text-slate-600 hover:bg-white",
      )}
    >
      {label}
    </button>
  );
}

function TimelineItem({
  memory,
  onDelete,
  delay,
}: {
  memory: Memory;
  onDelete: () => void;
  delay: number;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(memory.content);
  const [saving, setSaving] = useState(false);

  const colors = CATEGORY_COLORS[memory.category ?? "misc"] ?? CATEGORY_COLORS.misc;

  async function saveEdit() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/memory/${memory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Memory updated");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="group relative -ml-5 flex items-start gap-3 p-4 rounded-3xl bg-white/60 border border-slate-200/60 hover:border-violet-200 hover:bg-white/80 transition-colors"
    >
      {/* Connector dot */}
      <div className={cn("absolute left-0 top-5 -translate-x-1/2 w-3 h-3 rounded-full ring-4 ring-white", colors.bar)} />

      {/* Category badge */}
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide flex-shrink-0 mt-0.5", colors.bg, colors.text)}>
        {memory.category ?? "misc"}
      </span>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full resize-none rounded-2xl border border-violet-200 bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving || !content.trim()}
                className="px-3 py-1 text-xs rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setContent(memory.content); }}
                className="px-3 py-1 text-xs rounded-full hover:bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-700 leading-relaxed text-pretty">{memory.content}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatRelative(memory.createdAt)}
              </span>
              {memory.source === "harmony-keeper" && (
                <span className="text-[9px] font-mono text-violet-600 inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  harmony-keeper
                </span>
              )}
              {memory.source === "user" && (
                <span className="text-[9px] font-mono text-cyan-600 inline-flex items-center gap-1">
                  <Pencil className="w-2.5 h-2.5" />
                  you
                </span>
              )}
              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(true)}
                  className="w-6 h-6 grid place-items-center rounded-full hover:bg-white text-slate-500"
                  aria-label="Edit"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={onDelete}
                  className="w-6 h-6 grid place-items-center rounded-full hover:bg-rose-50 text-rose-500"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <GlowCard className="!p-12 text-center max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 grid place-items-center text-white text-3xl shadow-orb mb-5"
      >
        <Brain className="w-10 h-10" />
      </motion.div>
      <h3 className="font-display font-bold text-2xl mb-2">No memories yet</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6 text-pretty">
        The colony starts with a blank canvas. Forge your first site and the
        Harmony Keeper will start collecting style preferences — or add one
        manually in Settings.
      </p>
      <Link href="/forge">
        <MagneticButton size="lg">
          <Sparkles className="w-5 h-5" />
          Forge your first site
        </MagneticButton>
      </Link>
    </GlowCard>
  );
}
