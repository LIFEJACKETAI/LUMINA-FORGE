"use client";

// =====================================================================
// LuminaForge.ai — <RoundaboutLoader />
// =====================================================================
// The signature generation overlay. Five agent orbs orbit a central
// glowing forge. Each orb lights up as its agent runs, and a poetic
// status message rotates below. This is what users stare at while the
// colony works — it must feel hypnotic, alive, and unmistakably
// "LuminaForge."
// =====================================================================

import { motion } from "framer-motion";
import { AGENT_ORDER, AGENTS, type AgentId } from "@/lib/ai/agents";
import { cn } from "@/lib/utils";
import { Orb } from "./orb";

export interface RoundaboutLoaderProps {
  activeAgentId: AgentId | null;
  statusMessage?: string;
  className?: string;
  /** Compact variant for the Inspector tab. */
  compact?: boolean;
}

const RING_RADIUS = 130; // px from center
const RING_RADIUS_COMPACT = 80;

export function RoundaboutLoader({
  activeAgentId,
  statusMessage,
  className,
  compact = false,
}: RoundaboutLoaderProps) {
  const radius = compact ? RING_RADIUS_COMPACT : RING_RADIUS;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none",
        className,
      )}
      aria-live="polite"
    >
      {/* Ambient orbs behind everything */}
      <Orb
        size={compact ? "md" : "lg"}
        color="#8B5CF6"
        halo="#6366F1"
        className="-z-10 opacity-50"
        static
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      <div
        className="relative"
        style={{
          width: radius * 2 + 80,
          height: radius * 2 + 80,
        }}
      >
        {/* The slowly-rotating dashed orbit ring */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            borderRadius: "9999px",
            border: "1.5px dashed rgba(139, 92, 246, 0.25)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        {/* Conic halo around the core */}
        <div
          aria-hidden
          className="absolute halo-conic"
          style={{
            inset: `${radius * 0.55}px`,
            borderRadius: "9999px",
            opacity: 0.7,
          }}
        />

        {/* The central forge core */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            width: compact ? 56 : 84,
            height: compact ? 56 : 84,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #C7D2FE 30%, #6366F1 60%, #1E1B4B 100%)",
            boxShadow:
              "0 0 32px 8px rgba(139, 92, 246, 0.55), 0 0 80px 20px rgba(99, 102, 241, 0.35)",
          }}
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 32px 8px rgba(139, 92, 246, 0.55), 0 0 80px 20px rgba(99, 102, 241, 0.35)",
              "0 0 48px 12px rgba(34, 211, 238, 0.65), 0 0 120px 32px rgba(139, 92, 246, 0.45)",
              "0 0 32px 8px rgba(139, 92, 246, 0.55), 0 0 80px 20px rgba(99, 102, 241, 0.35)",
            ],
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Five agent orbs */}
        {AGENT_ORDER.map((agentId, i) => {
          const agent = AGENTS[agentId];
          const angle = (i / AGENT_ORDER.length) * 2 * Math.PI - Math.PI / 2;
          // Round to 1 decimal to avoid SSR/client hydration mismatches.
          const x = Math.round(Math.cos(angle) * radius * 10) / 10;
          const y = Math.round(Math.sin(angle) * radius * 10) / 10;
          const isActive = activeAgentId === agentId;

          return (
            <motion.div
              key={agentId}
              className={cn(
                "absolute left-1/2 top-1/2 flex items-center justify-center",
                "rounded-full text-white font-semibold",
                "transition-all duration-500",
              )}
              style={{
                width: compact ? 36 : 52,
                height: compact ? 36 : 52,
                x,
                y,
                translateX: "-50%",
                translateY: "-50%",
                background: isActive
                  ? `linear-gradient(135deg, ${agent.hue.includes("indigo") ? "#6366F1, #8B5CF6" : agent.hue.includes("violet") ? "#8B5CF6, #C026D3" : agent.hue.includes("cyan") ? "#22D3EE, #3B82F6" : agent.hue.includes("emerald") ? "#10B981, #14B8A6" : "#F59E0B, #F97316"})`
                  : "rgba(226, 232, 240, 0.6)",
                boxShadow: isActive
                  ? "0 0 24px 4px rgba(139, 92, 246, 0.55), 0 0 48px 8px rgba(34, 211, 238, 0.35)"
                  : "0 2px 8px rgba(15, 23, 42, 0.10)",
                border: isActive ? "2px solid white" : "1px solid rgba(255, 255, 255, 0.6)",
              }}
              animate={
                isActive
                  ? { scale: [1, 1.15, 1], opacity: [1, 1, 1] }
                  : { scale: 1, opacity: 0.7 }
              }
              transition={{ duration: 1.2, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
            >
              <span className={compact ? "text-sm" : "text-lg"}>{agent.emoji}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Status line */}
      {statusMessage && (
        <motion.p
          key={statusMessage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-6 text-center font-display tracking-tight text-slate-700",
            compact ? "text-xs" : "text-base",
          )}
        >
          <span className="text-gradient-lumina font-semibold">{statusMessage}</span>
        </motion.p>
      )}
    </div>
  );
}
