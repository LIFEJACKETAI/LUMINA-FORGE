"use client";

// =====================================================================
// LuminaForge.ai — Hero section
// =====================================================================
// The signature landing hero. Floating orbs, gradient headline,
// CTA to the Forge. Mobile-first, animated on mount.
// =====================================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wand2, Zap } from "lucide-react";
import { Orb, GradientText } from "./orb";
import { MagneticButton } from "./magnetic-button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative min-h-[100svh] pt-28 pb-16 px-6 overflow-hidden noise-overlay">
      {/* Ambient orbs */}
      <Orb size="xl" color="#8B5CF6" halo="#6366F1" className="top-[-180px] left-[-200px] opacity-50" />
      <Orb size="lg" color="#22D3EE" halo="#8B5CF6" className="bottom-[-160px] right-[-120px] opacity-40" speed={0.7} />
      <Orb size="md" color="#6366F1" halo="#8B5CF6" className="top-[40%] right-[10%] opacity-50" speed={1.3} />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr,1fr] gap-12 items-center min-h-[80vh]">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: EASE }}
          className="relative z-10 space-y-7 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Open models · Free tier · No OpenAI · No Anthropic
          </div>

          <h1 className="font-display font-extrabold text-balance text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            Describe the <GradientText>Vibe.</GradientText>
            <br />
            We Forge the <GradientText>Reality.</GradientText>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 text-pretty leading-relaxed">
            A colony of AI agents reads your prompt, studies your moodboard,
            and forges a beautiful, production-ready website — clean HTML +
            Tailwind for instant preview, with one-click export to Next.js 15.
            Powered entirely by free, open-source models.
          </p>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link href="/forge">
              <MagneticButton size="lg" className="!px-8 !py-4 !text-base">
                <Wand2 className="w-5 h-5" />
                Start Forging — Free
              </MagneticButton>
            </Link>
            <Link href="/#examples">
              <MagneticButton variant="ghost" size="lg" className="!px-8 !py-4 !text-base">
                See Examples
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-slate-500 pt-2">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-violet-500" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-500" /> Open-source models
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" /> Vercel-ready
            </span>
          </div>
        </motion.div>

        {/* Right — the floating forge emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          className="relative h-[460px] md:h-[540px] lg:h-[600px]"
        >
          <FloatingForgeEmblem />
        </motion.div>
      </div>

      {/* Trust bar */}
      <TrustBar />
    </section>
  );
}

function FloatingForgeEmblem() {
  const rings = [220, 320, 420];
  return (
    <div className="absolute inset-0 grid place-items-center">
      {/* Concentric soft rings */}
      {rings.map((r, i) => (
        <motion.div
          key={r}
          aria-hidden
          className="absolute rounded-full border border-violet-200/40"
          style={{ width: r, height: r }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{
            duration: 22 + i * 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Dashed orbit */}
      <motion.div
        aria-hidden
        className="absolute w-[460px] h-[460px] rounded-full"
        style={{ border: "1.5px dashed rgba(139, 92, 246, 0.30)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Orbiting orbs */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * 2 * Math.PI;
        const r = 200;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const labels = ["✶", "◆", "✦", "▲", "✺"];
        return (
          <motion.div
            key={i}
            className="absolute w-14 h-14 rounded-full grid place-items-center text-white text-lg shadow-orb-sm"
            style={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6, #22D3EE)",
              x,
              y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, delay: i * 0.3, repeat: Infinity }}
          >
            {labels[i]}
          </motion.div>
        );
      })}

      {/* Core */}
      <motion.div
        className="relative z-10 w-36 h-36 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #C7D2FE 25%, #6366F1 55%, #1E1B4B 100%)",
          boxShadow:
            "0 0 48px 12px rgba(139, 92, 246, 0.55), 0 0 120px 36px rgba(99, 102, 241, 0.35)",
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 grid place-items-center text-white font-display text-2xl font-bold">
          LF
        </div>
      </motion.div>
    </div>
  );
}

function TrustBar() {
  const items = [
    "Next.js 15",
    "Tailwind CSS",
    "Supabase",
    "OpenRouter",
    "Hugging Face",
    "Framer Motion",
    "Vercel",
  ];
  return (
    <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-200/60">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-400 mb-5">
        Built on the open, free-tier stack
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-500 font-medium">
        {items.map((item) => (
          <span key={item} className="text-sm hover:text-slate-700 transition-colors">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
