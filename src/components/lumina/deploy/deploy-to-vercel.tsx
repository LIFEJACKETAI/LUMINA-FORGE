"use client";

// =====================================================================
// LuminaForge.ai — <DeployToVercelButton />
// =====================================================================
// The "Deploy" pill in the Forge top bar. Calls /api/deploy/vercel
// which uses the Vercel API to create a project + deploy the current
// HTML. Surfaces a premium modal with progress states and the final
// live URL.
//
// Falls back gracefully when VERCEL_TOKEN isn't configured — the
// button still works but informs the user to add their token to .env.
// =====================================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, ExternalLink, Loader2, Check, AlertTriangle, Rocket } from "lucide-react";
import { toast } from "sonner";
import { MagneticButton } from "../magnetic-button";
import { useForge } from "@/store/forge";
import { cn } from "@/lib/utils";

type DeployState =
  | { phase: "idle" }
  | { phase: "preparing" }
  | { phase: "creating" }
  | { phase: "uploading" }
  | { phase: "deploying" }
  | { phase: "done"; url: string }
  | { phase: "error"; message: string };

const PHASE_LABELS: Record<DeployState["phase"], string> = {
  idle: "Idle",
  preparing: "Preparing your site…",
  creating: "Creating Vercel project…",
  uploading: "Uploading files…",
  deploying: "Deploying…",
  done: "Live!",
  error: "Failed",
};

export function DeployToVercelButton() {
  const store = useForge();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DeployState>({ phase: "idle" });

  async function deploy() {
    if (!store.previewHtml) {
      toast.error("Forge a site first, then deploy it.");
      return;
    }
    setState({ phase: "preparing" });
    setOpen(true);

    // Drive the UI through the phases while we wait for the API. The
    // server reports each step inside the SSE stream.
    try {
      const res = await fetch("/api/deploy/vercel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: store.previewHtml,
          projectName: store.projectName,
          projectId: store.projectId,
        }),
      });
      if (!res.ok || !res.body) {
        let msg = `Deploy failed (${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson?.error) msg = errJson.error;
        } catch {}
        setState({ phase: "error", message: msg });
        toast.error(msg);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalUrl = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!chunk.startsWith("data:")) continue;
          const payload = chunk.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const event = JSON.parse(payload);
            if (event.type === "phase") setState({ phase: event.phase } as DeployState);
            else if (event.type === "url") {
              finalUrl = event.url;
              setState({ phase: "done", url: event.url });
              toast.success("Deployed to Vercel!");
            } else if (event.type === "error") {
              setState({ phase: "error", message: event.message });
              toast.error(event.message);
            }
          } catch {}
        }
      }
      if (!finalUrl && state.phase !== "done") {
        setState({ phase: "error", message: "No URL returned from Vercel." });
      }
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Deploy failed",
      });
      toast.error(err instanceof Error ? err.message : "Deploy failed");
    }
  }

  return (
    <>
      <button
        onClick={deploy}
        disabled={!store.previewHtml}
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full hover:bg-white/70 text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={store.previewHtml ? "Deploy to Vercel" : "Forge a site first"}
      >
        <Rocket className="w-3.5 h-3.5" />
        Deploy
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-6 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => state.phase === "done" && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md glass-panel rounded-4xl p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 grid place-items-center text-white shadow-orb-sm">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Deploy to Vercel</h3>
                    <p className="text-xs text-slate-500">
                      {store.projectName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/70 text-slate-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress states */}
              {state.phase !== "done" && state.phase !== "error" && (
                <div className="space-y-2.5 py-2">
                  {(["preparing", "creating", "uploading", "deploying"] as const).map((phase) => {
                    const active = state.phase === phase;
                    const passed = PHASE_ORDER.indexOf(state.phase as any) > PHASE_ORDER.indexOf(phase);
                    return (
                      <div
                        key={phase}
                        className={cn(
                          "flex items-center gap-2.5 text-sm transition-colors",
                          active ? "text-violet-700" : passed ? "text-emerald-700" : "text-slate-400",
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 grid place-items-center rounded-full text-[10px]",
                            active
                              ? "bg-violet-100 text-violet-700"
                              : passed
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-400",
                          )}
                        >
                          {active ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : passed ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <span>{PHASE_ORDER.indexOf(phase) + 1}</span>
                          )}
                        </div>
                        <span>{PHASE_LABELS[phase]}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Done */}
              {state.phase === "done" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 py-2"
                >
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-emerald-800 text-sm">Your site is live!</p>
                      <p className="text-xs text-emerald-700 truncate">{state.url}</p>
                    </div>
                  </div>
                  <a
                    href={state.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <MagneticButton className="w-full !py-3">
                      <ExternalLink className="w-4 h-4" />
                      Open live site
                    </MagneticButton>
                  </a>
                </motion.div>
              )}

              {/* Error */}
              {state.phase === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 py-2"
                >
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-rose-800 text-sm mb-1">Deploy failed</p>
                      <p className="text-xs text-rose-700 leading-relaxed text-pretty">
                        {state.message}
                      </p>
                      <p className="text-xs text-rose-600 mt-2">
                        Tip: Add your <code className="px-1 py-0.5 rounded bg-rose-100">VERCEL_TOKEN</code> to{" "}
                        <code className="px-1 py-0.5 rounded bg-rose-100">.env.local</code> and restart.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const PHASE_ORDER: DeployState["phase"][] = ["idle", "preparing", "creating", "uploading", "deploying", "done"];
