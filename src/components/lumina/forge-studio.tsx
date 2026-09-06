"use client";

// =====================================================================
// LuminaForge.ai — <ForgeStudio />
// =====================================================================
// The full three-panel product surface. This component owns the Forge
// orchestration client: it sends the user's prompt + moodboards to
// the /api/forge Server-Sent-Events endpoint, consumes the agent
// deltas, and updates the Zustand store. The live preview is rendered
// inside a sandboxed iframe (using blob URLs + strict CSP) — we never
// use dangerouslySetInnerHTML on the parent page.
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  ImagePlus,
  Link2,
  X,
  Download,
  FileCode2,
  History,
  MessageSquare,
  Bot,
  Send,
  Copy,
  Check,
  Settings,
  ArrowLeft,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useForge, VIBE_CHIPS } from "@/store/forge";
import { AGENT_ORDER, AGENTS, type AgentId } from "@/lib/ai/agents";
import { MagneticButton } from "./magnetic-button";
import { RoundaboutLoader } from "./roundabout-loader";
import { Orb } from "./orb";
import { cn } from "@/lib/utils";
import { ForgeInspectorTabs } from "./forge-inspector";

export function ForgeStudio() {
  const router = useRouter();
  const params = useSearchParams();
  const store = useForge();

  // Read ?prompt= OR ?projectId= from URL.
  //   ?prompt=...     : used by the gallery cards — pre-fills the composer
  //   ?projectId=...  : used by My Forges — loads an existing project's
  //                    saved HTML, prompt, vibe tags, and history into the
  //                    studio so the user can keep iterating.
  useEffect(() => {
    const projectId = params.get("projectId");
    const p = params.get("prompt");
    if (projectId && !store.projectId) {
      (async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}`);
          if (!res.ok) return;
          const data = await res.json();
          const project = data.project;
          if (!project) return;
          store.loadFromProject({
            id: project.id,
            name: project.name,
            currentHtml: project.currentHtml ?? "",
            currentSpec: typeof project.currentSpec === "string" ? project.currentSpec : JSON.stringify(project.currentSpec ?? {}),
            lastPrompt: project.lastPrompt ?? "",
            lastRefUrl: project.lastRefUrl ?? "",
            vibeTags: project.vibeTags ?? [],
            scores: project.scores ?? null,
            versions: data.versions ?? [],
          });
        } catch {
          /* silent — the studio still works as a fresh session */
        }
      })();
    } else if (p && !store.prompt) {
      store.setPrompt(p);
    }
  }, [params]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient orb */}
      <Orb size="lg" color="#8B5CF6" halo="#6366F1" className="top-[-100px] right-[-200px] opacity-30 -z-10" static />

      <ForgeTopBar />

      <div className="pt-24 px-3 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr,360px] gap-3 h-[calc(100vh-110px)] min-h-[600px]">
          {/* Left — Composer */}
          <ForgeComposer />

          {/* Center — Preview */}
          <ForgePreview />

          {/* Right — Inspector */}
          <ForgeInspectorTabs />
        </div>
      </div>

      {/* Floating "Ask Agents" orb */}
      <AskAgentsOrb />
    </div>
  );
}

// =====================================================================
// TOP BAR
// =====================================================================
function ForgeTopBar() {
  const store = useForge();
  const [editing, setEditing] = useState(false);

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[min(1400px,calc(100%-1.5rem))]">
      <div className="glass-panel rounded-full px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-lumina grid place-items-center text-white shadow-orb-sm transition-transform group-hover:scale-110">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:inline">
              Lumina<span className="text-gradient-lumina">Forge</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {editing ? (
            <input
              autoFocus
              value={store.projectName}
              onChange={(e) => store.setProjectName(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              className="text-sm font-medium bg-transparent border-b border-violet-300 outline-none min-w-0 max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 truncate max-w-[200px] transition-colors"
              title="Click to rename"
            >
              {store.projectName}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/forges"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full hover:bg-white/70 text-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            My Forges
          </Link>
          <Link
            href="/settings"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full hover:bg-white/70 text-slate-700 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
          <button
            onClick={() => toast.info("Deploy to Vercel — coming soon. Use Export → Next.js ZIP for now.")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full hover:bg-white/70 text-slate-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Deploy
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-lumina grid place-items-center text-white text-sm font-bold">
            LF
          </div>
        </div>
      </div>
    </header>
  );
}

// =====================================================================
// COMPOSER (left panel)
// =====================================================================
function ForgeComposer() {
  const store = useForge();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        store.addImage(file.name, data.url);
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        // Fall back to a local data URL so the demo still works without the API.
        const reader = new FileReader();
        reader.onload = () => store.addImage(file.name, reader.result as string);
        reader.readAsDataURL(file);
        toast.info(`Using local image (no upload endpoint configured)`);
      }
    }
  }

  return (
    <aside className="glass-panel rounded-4xl p-5 flex flex-col gap-5 overflow-y-auto lf-scroll">
      <div>
        <h2 className="font-display font-bold text-lg mb-1.5">Composer</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Describe the vibe in plain language. The more sensory, the better.
        </p>
      </div>

      {/* Vibe description */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
          Vibe Description
        </label>
        <textarea
          value={store.prompt}
          onChange={(e) => store.setPrompt(e.target.value)}
          placeholder="A dreamy portfolio for a generative artist with a sense of wonder…"
          rows={6}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white/70 p-3.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all"
        />
      </div>

      {/* Quick vibe chips */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
          Quick Vibes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {VIBE_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => store.toggleChip(chip.label)}
              className={cn(
                "px-2.5 py-1.5 text-xs rounded-full border transition-all",
                store.selectedChips.includes(chip.label)
                  ? "bg-gradient-lumina text-white border-transparent shadow-orb-sm"
                  : "bg-white/70 text-slate-700 border-slate-200 hover:border-violet-300",
              )}
            >
              <span className="mr-1">{chip.emoji}</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference URL */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
          Reference URL
        </label>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={store.referenceUrl}
            onChange={(e) => store.setReferenceUrl(e.target.value)}
            placeholder="https://inspiring-site.com"
            className="w-full rounded-full border border-slate-200 bg-white/70 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>

      {/* Moodboard upload */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
          Moodboard / Sketch
        </label>
        <button
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleUpload(e.dataTransfer.files);
          }}
          className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 hover:bg-white/70 hover:border-violet-300 p-5 text-center transition-colors cursor-pointer"
        >
          <ImagePlus className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">
            Drag &amp; drop or click to upload
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Images are sent to the vision agent
          </p>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />

        {store.uploadedImages.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {store.uploadedImages.map((img) => (
              <div key={img.url} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => store.removeImage(img.url)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forge button */}
      <div className="pt-2 mt-auto sticky bottom-0 bg-gradient-to-t from-white via-white/90 to-transparent pb-1 -mx-5 px-5">
        <MagneticButton
          onClick={() => forge(store, "fresh")}
          disabled={store.phase === "running" || store.phase === "agent_active" || !store.prompt.trim()}
          className="w-full !py-4 !text-base"
        >
          <Wand2 className="w-5 h-5" />
          {store.phase === "running" || store.phase === "agent_active"
            ? "Forging…"
            : store.previewHtml
              ? "Re-Forge"
              : "Forge with Agents"}
        </MagneticButton>
        {!store.prompt.trim() && (
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Describe a vibe first to summon the colony.
          </p>
        )}
      </div>
    </aside>
  );
}

// =====================================================================
// PREVIEW (center panel)
// =====================================================================
function ForgePreview() {
  const store = useForge();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  // Recreate the iframe src whenever the preview HTML changes. We use
  // a blob URL + a sandboxed iframe so the rendered site cannot touch
  // the parent window's DOM. CSP is enforced inside the iframe's own
  // <head> by the Code Alchemist.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (!store.previewHtml) {
      iframe.srcdoc = "";
      return;
    }
    iframe.srcdoc = store.previewHtml;
  }, [store.previewHtml]);

  const showingLoader =
    store.phase === "running" || store.phase === "agent_active";

  return (
    <section className="glass-panel rounded-4xl p-3 flex flex-col overflow-hidden">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="ml-2 font-mono">preview.luminaforge.local</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDevice("desktop")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full transition-colors",
              device === "desktop" ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-white/70",
            )}
          >
            Desktop
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full transition-colors",
              device === "mobile" ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-white/70",
            )}
          >
            Mobile
          </button>
        </div>
      </div>

      {/* Iframe + overlay */}
      <div className="relative flex-1 bg-white rounded-3xl overflow-hidden border border-slate-100">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500",
            device === "mobile" ? "max-w-[390px] mx-auto my-0" : "",
          )}
        >
          <iframe
            ref={iframeRef}
            title="Generated site preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0 bg-white"
            aria-label="Live preview of generated website"
          />
        </div>

        {/* Empty state */}
        {!store.previewHtml && !showingLoader && (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div className="max-w-md space-y-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-lumina grid place-items-center text-white text-3xl shadow-orb"
              >
                ✦
              </motion.div>
              <h3 className="font-display font-bold text-2xl text-slate-800">
                Your Forge awaits
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Describe a vibe in the composer, drop a moodboard, then press
                <span className="font-semibold text-violet-700"> Forge with Agents</span>.
                The colony will appear here, orbiting a central forge, while it
                builds your site in real time.
              </p>
            </div>
          </div>
        )}

        {/* Generation overlay */}
        <AnimatePresence>
          {showingLoader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-lumina-soft backdrop-blur-sm grid place-items-center"
            >
              <RoundaboutLoader
                activeAgentId={store.activeAgentId}
                statusMessage={
                  store.activeAgentId
                    ? AGENTS[store.activeAgentId].statusMessage
                    : "Summoning the colony…"
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state — always visible when phase==="error" and no preview yet */}
        <AnimatePresence>
          {store.phase === "error" && store.error && !store.previewHtml && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid place-items-center p-8 bg-gradient-lumina-soft"
            >
              <div className="max-w-md text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 grid place-items-center text-rose-500 text-2xl">
                  ⚠
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800">
                  The colony needs a key
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-pretty">
                  {store.error}
                </p>
                <Link href="/settings">
                  <MagneticButton size="sm">
                    <Settings className="w-4 h-4" />
                    Add your free OpenRouter key
                  </MagneticButton>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// =====================================================================
// FORGE — kick off a full agent run
// =====================================================================
async function forge(
  store: ReturnType<typeof useForge.getState>,
  mode: "fresh" | "iterate",
  instruction?: string,
) {
  if (mode === "fresh") {
    store.startForge();
  } else {
    // For iterate we still set the agent state via the same hooks.
    store.startForge();
  }

  try {
    const body =
      mode === "fresh"
        ? JSON.stringify({
            prompt: store.prompt,
            referenceUrl: store.referenceUrl,
            imageUrls: store.uploadedImages.map((i) => i.url),
            vibeChips: store.selectedChips,
            previousHtml: store.previewHtml,
            projectName: store.projectName,
            projectId: store.projectId,
          })
        : JSON.stringify({
            mode: "iterate",
            instruction,
            previousHtml: store.previewHtml,
          });

    const res = await fetch("/api/forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) {
      // The API returns JSON (with an `error` field) on non-stream errors.
      let errMsg = `Forge failed (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson?.error) errMsg = errJson.error;
      } catch {
        const errText = await res.text().catch(() => "");
        if (errText) errMsg = `Forge failed (${res.status}): ${errText.slice(0, 200)}`;
      }
      throw new Error(errMsg);
    }
    if (!res.body) throw new Error("No response stream");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines.
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        if (!chunk.startsWith("data:")) continue;
        const payload = chunk.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload);
          handleForgeEvent(store, event, mode, instruction);
        } catch {
          /* skip malformed */
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown forge error";
    store.onError(null, msg);
    toast.error(msg);
  }
}

function handleForgeEvent(
  store: ReturnType<typeof useForge.getState>,
  event: any,
  mode: "fresh" | "iterate",
  instruction?: string,
) {
  switch (event.type) {
    case "agent_start":
      store.onAgentStart(event.agentId, event.statusMessage);
      break;
    case "agent_delta":
      store.onAgentDelta(event.agentId, event.delta);
      break;
    case "agent_done":
      store.onAgentDone(event.agentId);
      break;
    case "vibe":
      store.onVibe(event.vibe);
      break;
    case "spec":
      store.onSpec(event.spec);
      break;
    case "scores":
      store.onScores({ seo: event.seo, perf: event.perf, a11y: event.a11y, review: event.review });
      break;
    case "html":
      store.onHtml(event.html);
      break;
    case "saved":
      // Backend tells us the new project + version ids.
      if (event.projectId) store.setProject(event.projectId, store.projectName);
      if (event.versionId) {
        store.addVersion(event.versionId, mode === "fresh" ? store.prompt : instruction ?? "", store.scores ?? undefined);
      }
      break;
    case "error":
      store.onError(event.agentId, event.message);
      toast.error(event.message);
      break;
    case "done":
      store.onComplete();
      if (mode === "fresh") {
        toast.success("Your Forge is ready.");
      } else {
        toast.success("Iteration applied.");
      }
      break;
  }
}

// =====================================================================
// ASK AGENTS ORB (floating helper)
// =====================================================================
function AskAgentsOrb() {
  const store = useForge();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    store.pushChatUser(input);
    forge(store, "iterate", input);
    setInput("");
    setOpen(false);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full bg-gradient-lumina grid place-items-center text-white shadow-orb"
        aria-label="Ask Agents"
      >
        <Bot className="w-6 h-6" />
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: "rgba(139, 92, 246, 0.5)" }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-40 w-80 glass-panel rounded-4xl p-5"
          >
            <h3 className="font-display font-bold mb-2">Ask the colony</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Whisper a tweak. The Code Alchemist will re-tune the live preview
              in place.
            </p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Make the hero more bold. Add a pricing section. Switch palette to sunset…"
              rows={3}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-xs rounded-full hover:bg-white/70 text-slate-600"
              >
                Cancel
              </button>
              <MagneticButton onClick={send} size="sm" disabled={!input.trim()}>
                <Send className="w-3.5 h-3.5" />
                Send
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
