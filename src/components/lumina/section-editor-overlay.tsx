"use client";

// =====================================================================
// LuminaForge.ai — <SectionEditorOverlay />
// =====================================================================
// Enables per-section editing inside the live preview iframe.
//
// How it works:
//   1. The parent <ForgePreview> injects a small inline <script> into
//      the generated HTML before assigning it to the iframe's srcdoc.
//      The script (defined in `EDITOR_SCRIPT` below):
//        - Listens for mousemove to detect which section is hovered.
//        - Reports the section's id to the parent via postMessage.
//        - Adds an outline + a small floating "Edit" pill to the
//          hovered section so the user sees it's interactive.
//   2. This component listens for those postMessages and surfaces the
//      hovered section id, plus an edit modal.
//   3. When the user clicks a section, we open a small inline editor
//      where they can type a natural-language tweak.
//   4. On submit, we send the edit to /api/forge (iterate mode) with
//      an instruction like "Modify the section with id 'features'
//      so that: <user's instruction>" — the Code Alchemist returns
//      the refined HTML, the iframe re-renders.
//
// Editor mode is owned by the parent (so it can include it in the
// iframe srcdoc effect deps) and passed down here. This avoids two
// effects fighting over the iframe's srcdoc.
//
// =====================================================================

import { useEffect, useState, useCallback, useMemo, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X, SquareDashedMousePointer, Sparkles, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { useForge } from "@/store/forge";
import { MagneticButton } from "./magnetic-button";
import { cn } from "@/lib/utils";
import { SECTION_TEMPLATES, CATEGORY_LABELS, type SectionTemplate } from "@/lib/templates/section-templates";

export interface SectionEditorOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  editorMode: boolean;
  setEditorMode: (v: boolean | ((prev: boolean) => boolean)) => void;
}

// The script we inject runs inside the iframe and reports back via
// postMessage. It's plain JS to keep it independent of the parent's
// bundle and to avoid CORS/module issues.
export const EDITOR_SCRIPT = `
(function() {
  var lastId = null;
  var hoverEl = null;
  var pillEl = null;

  function sectionIdFor(el) {
    var node = el;
    while (node && node !== document.body) {
      if (node.tagName === 'SECTION' || node.tagName === 'HEADER' || node.tagName === 'FOOTER' || node.tagName === 'ARTICLE' || node.tagName === 'MAIN') {
        if (node.id) return node.id;
        var tagIndex = Array.prototype.indexOf.call(document.querySelectorAll(node.tagName), node);
        return node.tagName.toLowerCase() + '-' + tagIndex;
      }
      node = node.parentElement;
    }
    return null;
  }

  function findSection(id) {
    if (!id) return null;
    var direct = document.getElementById(id);
    if (direct) return direct;
    var match = id.match(/^(section|article|header|footer|main)-(\\d+)$/);
    if (match) {
      var tags = document.querySelectorAll(match[1]);
      return tags[parseInt(match[2], 10)] || null;
    }
    return null;
  }

  function clearHover() {
    if (hoverEl) hoverEl.style.outline = '';
    if (pillEl) { pillEl.remove(); pillEl = null; }
    lastId = null;
    hoverEl = null;
  }

  function showHover(el) {
    if (hoverEl === el) return;
    clearHover();
    el.style.outline = '2px dashed rgba(139, 92, 246, 0.85)';
    el.style.outlineOffset = '4px';
    el.style.cursor = 'pointer';
    hoverEl = el;

    pillEl = document.createElement('div');
    pillEl.textContent = 'Edit';
    pillEl.style.position = 'absolute';
    pillEl.style.background = 'linear-gradient(120deg, #6366F1 0%, #8B5CF6 45%, #22D3EE 100%)';
    pillEl.style.color = 'white';
    pillEl.style.padding = '4px 10px';
    pillEl.style.borderRadius = '9999px';
    pillEl.style.fontSize = '11px';
    pillEl.style.fontWeight = '600';
    pillEl.style.fontFamily = 'Inter, system-ui, sans-serif';
    pillEl.style.pointerEvents = 'none';
    pillEl.style.boxShadow = '0 8px 24px -8px rgba(139,92,246,0.55)';
    pillEl.style.zIndex = '2147483646';
    var rect = el.getBoundingClientRect();
    pillEl.style.left = (rect.left + window.scrollX + 8) + 'px';
    pillEl.style.top = (rect.top + window.scrollY + 8) + 'px';
    document.body.appendChild(pillEl);
  }

  document.addEventListener('mousemove', function(e) {
    var id = sectionIdFor(e.target);
    if (id && id !== lastId) {
      lastId = id;
      var sec = findSection(id);
      if (sec) {
        showHover(sec);
        window.parent.postMessage({ source: 'luminaforge-editor', sectionId: id, rect: sec.getBoundingClientRect() }, '*');
      }
    } else if (!id && lastId) {
      clearHover();
      window.parent.postMessage({ source: 'luminaforge-editor', sectionId: null }, '*');
    }
  }, true);

  document.addEventListener('click', function(e) {
    var id = sectionIdFor(e.target);
    if (id) {
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ source: 'luminaforge-editor', click: true, sectionId: id }, '*');
    }
  }, true);

  window.addEventListener('scroll', function() {
    if (hoverEl && pillEl) {
      var rect = hoverEl.getBoundingClientRect();
      pillEl.style.left = (rect.left + window.scrollX + 8) + 'px';
      pillEl.style.top = (rect.top + window.scrollY + 8) + 'px';
    }
  }, true);
})();
`;

/** Inject the editor script right before </body> (or append at end). */
export function injectEditorScript(html: string): string {
  const script = `<script>${EDITOR_SCRIPT}</script>`;
  const lower = html.toLowerCase();
  const bodyEnd = lower.lastIndexOf("</body>");
  if (bodyEnd !== -1) {
    return html.slice(0, bodyEnd) + script + html.slice(bodyEnd);
  }
  return html + script;
}

export function SectionEditorOverlay({
  iframeRef,
  editorMode,
  setEditorMode,
}: SectionEditorOverlayProps) {
  const store = useForge();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editInstruction, setEditInstruction] = useState("");
  const [pending, setPending] = useState(false);
  // Swap-for-template state
  const [swapMode, setSwapMode] = useState(false);
  const [swapCat, setSwapCat] = useState<string>("all");

  // Listen for postMessages from the iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || e.data.source !== "luminaforge-editor") return;
      if (e.data.click && e.data.sectionId) {
        setHoveredSection(e.data.sectionId);
        setEditing(true);
        return;
      }
      setHoveredSection(e.data.sectionId);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const submitEdit = useCallback(async () => {
    if (!editInstruction.trim() || !hoveredSection) return;
    setPending(true);
    setEditing(false);
    const instruction = `Modify the section with id "${hoveredSection}". Apply ONLY the following change to that section and keep everything else intact. ${editInstruction.trim()}`;
    store.pushChatUser(`[${hoveredSection}] ${editInstruction.trim()}`);
    setEditInstruction("");
    // Trigger the iterate path.
    const { forge: runForge } = await import("./forge-studio");
    await runForge(store, "iterate", instruction);
    setPending(false);
  }, [editInstruction, hoveredSection, store]);

  /**
   * Guess the template category from a section id (e.g. "features"
   * → "features", "section-2" → "all" since we can't tell, "hero" →
   * "hero"). Used by the Swap-for-template UI to pre-filter templates
   * to the most likely match.
   */
  const guessedCategory = useMemo(() => {
    if (!hoveredSection) return "all";
    const id = hoveredSection.toLowerCase();
    // Direct match: section id is "features", "hero", etc.
    if (id in CATEGORY_LABELS) return id;
    // Substring match: "hero-section" → "hero"
    for (const cat of Object.keys(CATEGORY_LABELS)) {
      if (id.includes(cat)) return cat;
    }
    return "all";
  }, [hoveredSection]);

  // Filter the templates by the active swap category.
  const swapFiltered = useMemo(() => {
    if (swapCat === "all") return SECTION_TEMPLATES;
    return SECTION_TEMPLATES.filter((t) => t.category === swapCat);
  }, [swapCat]);

  const submitSwap = useCallback(
    async (template: SectionTemplate) => {
      if (!hoveredSection) return;
      setPending(true);
      setEditing(false);
      setSwapMode(false);
      const instruction = `Replace the section with id "${hoveredSection}" with a new section using this template: "${template.name}". ${template.useHint} Keep the rest of the page unchanged. Only the section with id "${hoveredSection}" should be replaced.`;
      store.pushChatUser(`[${hoveredSection}] Swap for: ${template.name}`);
      const { forge: runForge } = await import("./forge-studio");
      await runForge(store, "iterate", instruction);
      setPending(false);
    },
    [hoveredSection, store],
  );

  // When opening the edit modal, default the swap category to the guessed one.
  useEffect(() => {
    if (editing) setSwapCat(guessedCategory);
  }, [editing, guessedCategory]);

  // No editor overlay when there's no preview or generation is active.
  if (!store.previewHtml) return null;

  return (
    <>
      {/* Editor-mode toggle pill in the top-left of the preview */}
      <button
        onClick={() => setEditorMode((v) => !v)}
        className={cn(
          "absolute top-2 left-2 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full transition-all",
          editorMode
            ? "bg-gradient-lumina text-white shadow-orb-sm"
            : "bg-white/80 text-slate-700 hover:bg-white border border-slate-200",
        )}
        title="Toggle section editing mode"
      >
        <SquareDashedMousePointer className="w-3 h-3" />
        {editorMode ? "Section editing on" : "Edit sections"}
      </button>

      {/* Hovered-section label badge */}
      <AnimatePresence>
        {editorMode && hoveredSection && !editing && !pending && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 glass-panel rounded-full text-[11px] text-slate-700"
          >
            <span className="text-violet-700 font-mono">#{hoveredSection}</span>
            <span className="mx-1.5 text-slate-400">·</span>
            <span>Click to edit</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending state */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 glass-panel rounded-full text-[11px] text-violet-700 inline-flex items-center gap-2"
          >
            <Sparkles className="w-3 h-3 animate-pulse" />
            Re-tuning <span className="font-mono">#{hoveredSection}</span>…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 grid place-items-center p-6 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setEditing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "glass-panel rounded-4xl p-6 flex flex-col",
                swapMode ? "w-full max-w-3xl max-h-[80vh]" : "w-full max-w-md",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-lumina grid place-items-center text-white">
                    {swapMode ? <LayoutGrid className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base">
                      {swapMode ? "Swap section for template" : "Edit section"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">#{hoveredSection}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditing(false); setSwapMode(false); }}
                  className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/70 text-slate-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {swapMode ? (
                <>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Pick a template to swap into this section. The Code
                    Alchemist will replace <span className="font-mono">#{hoveredSection}</span>{" "}
                    with the chosen block — everything else on the page stays intact.
                  </p>

                  {/* Category filter */}
                  <div className="flex gap-1.5 overflow-x-auto lf-scroll pb-1 mb-3">
                    <button
                      onClick={() => setSwapCat("all")}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors",
                        swapCat === "all" ? "bg-gradient-lumina text-white" : "bg-white/70 text-slate-600 hover:bg-white",
                      )}
                    >
                      All
                    </button>
                    {Object.keys(CATEGORY_LABELS).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSwapCat(cat)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors",
                          swapCat === cat ? "bg-gradient-lumina text-white" : "bg-white/70 text-slate-600 hover:bg-white",
                        )}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>

                  {/* Templates list */}
                  <div className="flex-1 overflow-y-auto lf-scroll grid sm:grid-cols-2 gap-2.5 mb-3">
                    {swapFiltered.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6 col-span-2">
                        No templates in this category.
                      </p>
                    ) : (
                      swapFiltered.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => submitSwap(t)}
                          className="text-left p-3 rounded-3xl border border-slate-200/60 bg-white/60 hover:border-violet-300 hover:-translate-y-0.5 transition-all"
                        >
                          <div className="flex items-start gap-2 mb-1.5">
                            <div className="w-8 h-8 rounded-2xl bg-gradient-lumina grid place-items-center text-white text-base flex-shrink-0">
                              {t.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-bold text-sm truncate">{t.name}</h4>
                              <p className="text-[9px] uppercase tracking-wider text-slate-400">
                                {CATEGORY_LABELS[t.category] ?? t.category}
                              </p>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 text-pretty">
                            {t.description}
                          </p>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => setSwapMode(false)}
                      className="px-3 py-1.5 text-xs rounded-full hover:bg-white/70 text-slate-600"
                    >
                      ← Back to whisper
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Whisper a change for this section. The Code Alchemist will
                    re-tune only this part — keep everything else intact.
                  </p>
                  <textarea
                    autoFocus
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        submitEdit();
                      }
                    }}
                    placeholder="e.g. Make the headline larger and add a subtle parallax orb. Swap the color to sunset."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setSwapMode(true)}
                      className="px-3 py-1.5 text-xs rounded-full bg-white/70 border border-slate-200 hover:border-violet-300 text-slate-700 inline-flex items-center gap-1.5"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Swap for template
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-1.5 text-xs rounded-full hover:bg-white/70 text-slate-600"
                    >
                      Cancel
                    </button>
                    <MagneticButton
                      size="sm"
                      onClick={submitEdit}
                      disabled={!editInstruction.trim()}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Re-tune
                    </MagneticButton>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
