"use client";

// =====================================================================
// LuminaForge.ai — <ForgeInspectorTabs />
// =====================================================================
// Right-hand inspector with four tabs:
//   Agents   : live streaming transcript of the colony at work
//   Iterate  : natural-language chat that triggers re-forge in place
//   Code     : view generated HTML / "Convert to Next.js" / download ZIP
//   History  : previous generations with scores + restore
// =====================================================================

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  MessageSquare,
  FileCode2,
  History,
  Send,
  Copy,
  Check,
  Download,
  FileArchive,
  Sparkles,
  RefreshCw,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useForge } from "@/store/forge";
import { AGENT_ORDER, AGENTS, type AgentId } from "@/lib/ai/agents";
import { MagneticButton } from "./magnetic-button";
import { cn } from "@/lib/utils";

type Tab = "agents" | "iterate" | "code" | "history";

const TABS: { id: Tab; label: string; icon: typeof Bot }[] = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "iterate", label: "Iterate", icon: MessageSquare },
  { id: "code", label: "Code", icon: FileCode2 },
  { id: "history", label: "History", icon: History },
];

export function ForgeInspectorTabs() {
  const [tab, setTab] = useState<Tab>("agents");
  return (
    <aside className="glass-panel rounded-4xl flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex p-2 gap-1 border-b border-slate-200/60">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium rounded-full transition-all",
              tab === t.id
                ? "bg-gradient-lumina text-white shadow-orb-sm"
                : "text-slate-600 hover:bg-white/70",
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto lf-scroll"
          >
            {tab === "agents" && <AgentsTab />}
            {tab === "iterate" && <IterateTab />}
            {tab === "code" && <CodeTab />}
            {tab === "history" && <HistoryTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}

// =====================================================================
// AGENTS TAB
// =====================================================================
function AgentsTab() {
  const store = useForge();
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-sm">Colony Activity</h3>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          {AGENT_ORDER.filter((id) => store.agents[id].status === "done").length}/
          {AGENT_ORDER.length} done
        </span>
      </div>

      {AGENT_ORDER.map((agentId) => {
        const agent = store.agents[agentId];
        const meta = AGENTS[agentId];
        return (
          <div
            key={agentId}
            className={cn(
              "rounded-2xl p-3 transition-all",
              agent.status === "running"
                ? "bg-violet-50 ring-1 ring-violet-200"
                : agent.status === "done"
                  ? "bg-emerald-50/40"
                  : "bg-slate-50/50",
            )}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full grid place-items-center text-white text-sm font-semibold",
                  agent.status === "running"
                    ? "bg-gradient-lumina animate-pulse-orb"
                    : agent.status === "done"
                      ? "bg-emerald-400"
                      : "bg-slate-300",
                )}
              >
                {meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{meta.name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {meta.model}
                </div>
              </div>
              {agent.status === "running" && (
                <RefreshCw className="w-3.5 h-3.5 text-violet-500 animate-spin" />
              )}
              {agent.status === "done" && (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>

            {agent.statusMessage && agent.status === "running" && (
              <p className="text-[11px] text-violet-600 italic ml-9 mb-1">
                {agent.statusMessage}
              </p>
            )}

            {agent.content && (
              <pre className="mt-1.5 text-[10.5px] leading-relaxed text-slate-600 font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto lf-scroll bg-white/40 rounded-xl p-2">
                {agent.content.slice(-1500)}
                {agent.status === "running" && (
                  <motion.span
                    className="inline-block w-1.5 h-3 bg-violet-500 ml-0.5 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </pre>
            )}
          </div>
        );
      })}

      {!store.previewHtml && store.phase === "idle" && (
        <p className="text-xs text-slate-400 text-center pt-4 leading-relaxed">
          The colony's transcripts will stream here in real time when you
          press Forge.
        </p>
      )}
    </div>
  );
}

// =====================================================================
// ITERATE TAB
// =====================================================================
function IterateTab() {
  const store = useForge();
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim() || !store.previewHtml) return;
    store.pushChatUser(input);
    forgeIterate(input);
    setInput("");
  }

  async function forgeIterate(instruction: string) {
    store.startForge();
    try {
      const res = await fetch("/api/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "iterate",
          instruction,
          previousHtml: store.previewHtml,
          projectId: store.projectId,
        }),
      });
      if (!res.ok || !res.body) throw new Error("Iterate failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let agentContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!chunk.startsWith("data:")) continue;
          const payload = chunk.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const event = JSON.parse(payload);
            if (event.type === "agent_start") store.onAgentStart(event.agentId, event.statusMessage);
            else if (event.type === "agent_delta") {
              store.onAgentDelta(event.agentId, event.delta);
              agentContent += event.delta;
            } else if (event.type === "agent_done") store.onAgentDone(event.agentId);
            else if (event.type === "scores") store.onScores({ seo: event.seo, perf: event.perf, a11y: event.a11y, review: event.review });
            else if (event.type === "html") {
              store.onHtml(event.html);
              store.pushChatAgent("Done — preview updated. " + (event.review ?? ""));
            } else if (event.type === "done") store.onComplete();
            else if (event.type === "error") {
              store.onError(event.agentId, event.message);
              toast.error(event.message);
            }
          } catch {}
        }
      }
      toast.success("Iteration applied.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Iterate failed";
      store.onError(null, msg);
      toast.error(msg);
    }
  }

  return (
    <div className="p-4 flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">Iterate</h3>
        {store.scores && (
          <span className="text-[10px] text-slate-500">
            SEO {store.scores.seo} · PERF {store.scores.perf} · A11Y {store.scores.a11y}
          </span>
        )}
      </div>

      {!store.previewHtml ? (
        <div className="flex-1 grid place-items-center text-center text-xs text-slate-400 leading-relaxed px-2">
          Forge a site first, then iterate on it with natural language —
          "make the hero bolder", "add a pricing section", etc.
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto lf-scroll space-y-2.5">
            {store.chat.length === 0 ? (
              <div className="text-xs text-slate-400 text-center pt-6 leading-relaxed">
                Ask the colony to refine the page. Try:<br />
                <span className="text-violet-600 italic">"Make the hero headline larger and add a subtle parallax orb."</span>
              </div>
            ) : (
              store.chat.map((turn, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                    turn.role === "user"
                      ? "ml-auto bg-gradient-lumina text-white"
                      : "bg-slate-100 text-slate-700",
                  )}
                >
                  {turn.content}
                </div>
              ))
            )}
            {store.phase === "agent_active" && (
              <div className="bg-slate-100 rounded-2xl px-3 py-2 text-xs text-slate-500 max-w-[85%] inline-flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {store.activeAgentId ? AGENTS[store.activeAgentId].name + " is working…" : "Thinking…"}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/60 pt-3 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask for a change…"
              rows={2}
              className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white/70 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <button
              onClick={send}
              disabled={!input.trim() || store.phase === "agent_active" || store.phase === "running"}
              className="w-10 grid place-items-center rounded-full bg-gradient-lumina text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// =====================================================================
// CODE TAB
// =====================================================================
function CodeTab() {
  const store = useForge();
  const [copied, setCopied] = useState(false);
  const [showNextJs, setShowNextJs] = useState(false);
  const [nextJsPreview, setNextJsPreview] = useState<string>("");
  const [downloadingNext, setDownloadingNext] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);

  async function copyHtml() {
    if (!store.previewHtml) return;
    await navigator.clipboard.writeText(store.previewHtml);
    setCopied(true);
    toast.success("HTML copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  }

  async function downloadHtml() {
    if (!store.previewHtml) return;
    setDownloadingHtml(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: store.previewHtml,
          projectName: store.projectName,
          format: "html",
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("HTML ZIP downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingHtml(false);
    }
  }

  async function downloadNextJs() {
    if (!store.previewHtml) return;
    setDownloadingNext(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: store.previewHtml,
          projectName: store.projectName,
          format: "nextjs",
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-nextjs.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Next.js project ZIP downloaded — deploy on Vercel!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingNext(false);
    }
  }

  async function previewNextJs() {
    if (!store.previewHtml) return;
    setShowNextJs((v) => !v);
    if (!nextJsPreview && store.previewHtml) {
      // Show the page.tsx that the exporter would generate.
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: store.previewHtml,
          projectName: store.projectName,
          format: "nextjs-preview",
        }),
      });
      if (res.ok) setNextJsPreview(await res.text());
    }
  }

  if (!store.previewHtml) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 leading-relaxed">
        No code yet. Forge a site to see the generated HTML and one-click
        Next.js export.
      </div>
    );
  }

  const display = showNextJs && nextJsPreview ? nextJsPreview : store.previewHtml;

  return (
    <div className="p-4 flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">
          {showNextJs ? "Next.js page.tsx" : "Generated HTML"}
        </h3>
        <button
          onClick={previewNextJs}
          className={cn(
            "text-[10px] px-2 py-1 rounded-full transition-colors",
            showNextJs ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-white/70",
          )}
        >
          {showNextJs ? "Show HTML" : "Show Next.js"}
        </button>
      </div>

      <pre className="flex-1 text-[10px] leading-relaxed font-mono bg-slate-900 text-slate-100 rounded-2xl p-3 overflow-auto lf-scroll">
        {display}
      </pre>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={copyHtml}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-white/70 border border-slate-200 hover:border-violet-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={downloadHtml}
          disabled={downloadingHtml}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-white/70 border border-slate-200 hover:border-violet-300 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {downloadingHtml ? "Zipping…" : "HTML ZIP"}
        </button>
      </div>

      <MagneticButton
        onClick={downloadNextJs}
        disabled={downloadingNext}
        className="w-full !py-3 !text-sm"
      >
        <FileArchive className="w-4 h-4" />
        {downloadingNext ? "Building Next.js…" : "Export full Next.js project"}
      </MagneticButton>
      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Includes package.json, tsconfig, Tailwind, App Router layout + page.
        Just <code className="text-violet-600">npm install</code> and deploy.
      </p>
    </div>
  );
}

// =====================================================================
// HISTORY TAB
// =====================================================================
function HistoryTab() {
  const store = useForge();

  async function loadHistory() {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const data = await res.json();
      toast.info(`Loaded ${data.projects?.length ?? 0} past forges.`);
    } catch {
      /* silent — the panel just shows current versions */
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm">History</h3>
        {store.scores && (
          <div className="flex gap-1.5 text-[10px]">
            <ScorePill label="SEO" value={store.scores.seo} />
            <ScorePill label="PERF" value={store.scores.perf} />
            <ScorePill label="A11Y" value={store.scores.a11y} />
          </div>
        )}
      </div>

      {store.versions.length === 0 ? (
        <div className="text-center pt-8 text-xs text-slate-400 leading-relaxed">
          Your previous generations for this Forge will appear here, with
          scores and one-click restore.
        </div>
      ) : (
        <div className="space-y-2.5">
          {store.versions.map((v, i) => (
            <div
              key={v.id}
              className="glass-panel rounded-2xl p-3 hover:shadow-orb-sm transition-shadow cursor-pointer"
              onClick={() => toast.info("Restore is wired to the API — open in My Forges to load.")}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">v{store.versions.length - i}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(v.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">{v.prompt}</p>
              {v.scores && (
                <div className="flex gap-1.5 mt-1.5 text-[9px]">
                  <ScorePill label="SEO" value={v.scores.seo} small />
                  <ScorePill label="PERF" value={v.scores.perf} small />
                  <ScorePill label="A11Y" value={v.scores.a11y} small />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <LinkToForges />
    </div>
  );
}

function LinkToForges() {
  return (
    <a
      href="/forges"
      className="block text-center text-[11px] text-violet-600 hover:text-violet-700 pt-2"
    >
      View all past Forges →
    </a>
  );
}

function ScorePill({
  label,
  value,
  small = false,
}: {
  label: string;
  value: number;
  small?: boolean;
}) {
  const color =
    value >= 85 ? "text-emerald-600 bg-emerald-50" :
    value >= 70 ? "text-amber-600 bg-amber-50" :
    "text-rose-600 bg-rose-50";
  return (
    <span className={cn("rounded-full font-mono font-semibold", color, small ? "px-1.5 py-0.5" : "px-2 py-0.5")}>
      {label} {value}
    </span>
  );
}
