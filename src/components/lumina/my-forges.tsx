"use client";

// =====================================================================
// LuminaForge.ai — <MyForges />
// =====================================================================
// The user's dashboard of past forges. Server-fetches /api/projects on
// mount, renders a searchable grid. Each card has a tiny sandboxed
// iframe thumbnail rendered from the saved HTML — the same aesthetic
// as the Forge Studio's live preview.
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  Sparkles,
  Wand2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { MarketingNav, MarketingFooter } from "./marketing-shell";
import { Orb, GradientText, GlowCard } from "./orb";
import { MagneticButton } from "./magnetic-button";
import { cn } from "@/lib/utils";

interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  lastPrompt?: string;
  vibeTags: string[];
  scores: { seo: number | null; perf: number | null; a11y: number | null };
  createdAt: string;
  updatedAt: string;
}

interface ProjectDetail extends ProjectListItem {
  currentHtml: string;
}

export function MyForges() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setProjects(data.projects ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load Forges");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // For each project that has saved HTML, fetch the full record (which
  // includes currentHtml) so we can render a tiny iframe thumbnail.
  useEffect(() => {
    projects.forEach((p) => {
      if (thumbnails[p.id] !== undefined) return;
      fetch(`/api/projects/${p.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { project?: ProjectDetail } | null) => {
          if (data?.project?.currentHtml) {
            setThumbnails((prev) => ({ ...prev, [p.id]: data.project.currentHtml }));
          } else {
            setThumbnails((prev) => ({ ...prev, [p.id]: "" }));
          }
        })
        .catch(() => setThumbnails((prev) => ({ ...prev, [p.id]: "" })));
    });
  }, [projects]);

  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.lastPrompt ?? "").toLowerCase().includes(q) ||
        (p.vibeTags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [projects, query]);

  async function deleteProject(id: string) {
    if (!confirm("Delete this Forge permanently?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProjects((p) => p.filter((x) => x.id !== id));
      toast.success("Forge deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <MarketingNav />

      <main className="flex-1 pt-28 pb-12 px-6">
        <Orb size="lg" color="#8B5CF6" halo="#6366F1" className="top-[60px] left-[-200px] opacity-30 -z-10" />
        <Orb size="md" color="#22D3EE" halo="#8B5CF6" className="top-[40%] right-[-100px] opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
              <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
                My <GradientText>Forges</GradientText>
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                Every site the colony has crafted for you. Tap any card to
                open it back in the Forge Studio and keep iterating.
              </p>
            </div>
            <Link href="/forge">
              <MagneticButton size="lg">
                <Plus className="w-5 h-5" />
                New Forge
              </MagneticButton>
            </Link>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, prompt, or vibe tag…"
              className="w-full glass-panel rounded-full pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </motion.div>

          {/* Empty states */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-4xl p-5 h-72 animate-pulse"
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState hasQuery={!!query.trim()} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {filtered.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    whileHover={{ y: -6 }}
                  >
                    <GlowCard className="!p-4 h-full flex flex-col gap-3 hover:shadow-orb transition-shadow">
                      {/* Thumbnail */}
                      <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/60">
                        {thumbnails[project.id] !== undefined && thumbnails[project.id] ? (
                          <iframe
                            title={`Thumbnail ${project.name}`}
                            srcDoc={thumbnails[project.id]}
                            sandbox="allow-scripts"
                            className="w-full h-full border-0 pointer-events-none"
                            style={{ transform: "scale(0.6)", transformOrigin: "top left", width: "166.66%", height: "166.66%" }}
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-slate-300">
                            <Sparkles className="w-8 h-8" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                          <Link href={`/forge?projectId=${project.id}`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-medium shadow">
                              <Wand2 className="w-3 h-3" />
                              Open in Studio
                            </span>
                          </Link>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-full bg-black/30 text-white hover:bg-rose-500 transition-colors"
                          aria-label="Delete Forge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Meta */}
                      <div className="flex-1 flex flex-col gap-2">
                        <h3 className="font-display font-bold text-base leading-tight truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {project.lastPrompt ?? "No prompt recorded"}
                        </p>
                        {project.vibeTags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.vibeTags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] rounded-full bg-violet-50 text-violet-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer scores + date */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                        {project.scores.seo != null && (
                          <div className="flex gap-1">
                            <MiniScore label="S" value={project.scores.seo} />
                            <MiniScore label="P" value={project.scores.perf} />
                            <MiniScore label="A" value={project.scores.a11y} />
                          </div>
                        )}
                      </div>
                    </GlowCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  const color =
    value >= 85 ? "text-emerald-600 bg-emerald-50" :
    value >= 70 ? "text-amber-600 bg-amber-50" :
    "text-rose-600 bg-rose-50";
  return (
    <span className={cn("px-1.5 py-0.5 rounded-full font-mono font-semibold", color)}>
      {label}{value}
    </span>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <GlowCard className="!p-12 text-center max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-20 h-20 mx-auto rounded-full bg-gradient-lumina grid place-items-center text-white text-3xl shadow-orb mb-5"
      >
        ✦
      </motion.div>
      <h3 className="font-display font-bold text-2xl mb-2">
        {hasQuery ? "No Forges match your search" : "No Forges yet"}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {hasQuery
          ? "Try a different keyword, or clear the search to see all your forges."
          : "Your Forge Studio awaits. Describe a vibe, drop a moodboard, and let the colony craft something beautiful."}
      </p>
      <Link href="/forge">
        <MagneticButton size="lg">
          <Wand2 className="w-5 h-5" />
          Forge your first site
        </MagneticButton>
      </Link>
    </GlowCard>
  );
}
