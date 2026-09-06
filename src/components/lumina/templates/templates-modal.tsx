"use client";

// =====================================================================
// LuminaForge.ai — <TemplatesModal />
// =====================================================================
// Modal that lets the user browse pre-built section templates and
// insert a "use template X" instruction directly into their prompt.
// Each template is shown as a card with:
//   - emoji + name + category badge
//   - short description
//   - a small live preview (rendered in a sandboxed iframe)
//   - "Insert into prompt" button that appends the template's
//     `useHint` to the composer's vibe textarea
// =====================================================================

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, X, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useForge } from "@/store/forge";
import { MagneticButton } from "../magnetic-button";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  tags: string[];
  useHint: string;
  html: string;
}

interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
}

export function TemplatesModal({ open, onClose }: TemplatesModalProps) {
  const store = useForge();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) return;
        const data = await res.json();
        setTemplates(data.templates ?? []);
        setCategories(data.categories ?? []);
        setCategoryLabels(data.categoryLabels ?? {});
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = useMemo(() => {
    let result = templates;
    if (activeCat !== "all") {
      result = result.filter((t) => t.category === activeCat);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [templates, activeCat, query]);

  function insertTemplate(t: Template) {
    const newPrompt = store.prompt
      ? `${store.prompt}\n\n${t.useHint}`
      : t.useHint;
    store.setPrompt(newPrompt);
    toast.success(`Inserted "${t.name}" into your prompt`);
    onClose();
  }

  const selected = templates.find((t) => t.id === selectedId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center p-6 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl h-[80vh] glass-panel rounded-4xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-lumina grid place-items-center text-white shadow-orb-sm">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Section Templates</h3>
                  <p className="text-xs text-slate-500">
                    Pick a pre-built block. We'll inject a "use template X" instruction into your prompt.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/70 text-slate-500"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter bar */}
            <div className="px-5 py-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center border-b border-slate-200/60">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates…"
                  className="w-full rounded-full border border-slate-200 bg-white/70 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto lf-scroll pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveCat("all")}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors",
                    activeCat === "all" ? "bg-gradient-lumina text-white" : "bg-white/70 text-slate-600 hover:bg-white",
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors",
                      activeCat === cat ? "bg-gradient-lumina text-white" : "bg-white/70 text-slate-600 hover:bg-white",
                    )}
                  >
                    {categoryLabels[cat] ?? cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Body: grid + preview panel */}
            <div className="flex-1 grid lg:grid-cols-[1fr,360px] overflow-hidden">
              {/* Grid */}
              <div className="overflow-y-auto lf-scroll p-4">
                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-10">
                    No templates match your search.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {filtered.map((t) => (
                      <motion.button
                        key={t.id}
                        layout
                        onClick={() => setSelectedId(t.id)}
                        onDoubleClick={() => insertTemplate(t)}
                        className={cn(
                          "group text-left p-4 rounded-3xl border transition-all",
                          selectedId === t.id
                            ? "border-violet-400 bg-violet-50/40 shadow-orb-sm"
                            : "border-slate-200/60 bg-white/60 hover:border-violet-200 hover:-translate-y-0.5",
                        )}
                      >
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-lumina grid place-items-center text-white text-lg flex-shrink-0">
                            {t.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display font-bold text-sm truncate">{t.name}</h4>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              {categoryLabels[t.category] ?? t.category}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 text-pretty">
                          {t.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-slate-100 text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview panel */}
              <div className="border-l border-slate-200/60 hidden lg:flex flex-col overflow-hidden">
                {selected ? (
                  <>
                    <div className="p-4 border-b border-slate-200/60">
                      <div className="flex items-start gap-2.5 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-lumina grid place-items-center text-white text-xl">
                          {selected.emoji}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display font-bold text-base">{selected.name}</h4>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            {categoryLabels[selected.category] ?? selected.category}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed text-pretty">
                        {selected.description}
                      </p>
                    </div>
                    <div className="flex-1 bg-slate-50 m-3 rounded-3xl overflow-hidden border border-slate-200/60">
                      <iframe
                        title={`Template preview ${selected.name}`}
                        srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"><style>body{background:#F8FAFC;color:#0F172A;font-family:Inter,system-ui,sans-serif;}</style></head><body>${selected.html}</body></html>`}
                        sandbox="allow-scripts"
                        className="w-full h-full border-0 pointer-events-none"
                        style={{ transform: "scale(0.7)", transformOrigin: "top left", width: "142.857%", height: "142.857%" }}
                      />
                    </div>
                    <div className="p-4 border-t border-slate-200/60">
                      <MagneticButton className="w-full" onClick={() => insertTemplate(selected)}>
                        <Plus className="w-4 h-4" />
                        Insert into prompt
                      </MagneticButton>
                      <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Double-click any template for instant insert
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 grid place-items-center p-8 text-center">
                    <div>
                      <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 grid place-items-center text-slate-300 text-2xl mb-3">
                        ◆
                      </div>
                      <p className="text-sm text-slate-500">
                        Pick a template on the left to preview it here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
