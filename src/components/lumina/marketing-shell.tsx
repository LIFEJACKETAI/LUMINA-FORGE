"use client";

// =====================================================================
// LuminaForge.ai — Marketing Site Shell
// =====================================================================
// The shared top navigation + footer for marketing pages. Lightweight,
// persistent, and unmistakably "roundabout" with floating glass nav.
// =====================================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Github } from "lucide-react";
import { MagneticButton } from "./magnetic-button";
import { UserMenu } from "./auth/user-menu";

export function MarketingNav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1180px,calc(100%-2rem))]"
    >
      <div className="glass-panel rounded-full px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="LuminaForge home">
          <div
            className="w-9 h-9 rounded-full bg-gradient-lumina grid place-items-center text-white shadow-orb-sm transition-transform group-hover:scale-110"
            aria-hidden
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Lumina<span className="text-gradient-lumina">Forge</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
          <Link href="/#process" className="hover:text-slate-900 transition-colors">
            Process
          </Link>
          <Link href="/#agents" className="hover:text-slate-900 transition-colors">
            Agents
          </Link>
          <Link href="/#examples" className="hover:text-slate-900 transition-colors">
            Gallery
          </Link>
          <Link href="/#pricing" className="hover:text-slate-900 transition-colors">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-slate-900 transition-colors">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/luminaforge/luminaforge"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-grid w-10 h-10 place-items-center rounded-full hover:bg-white/70 text-slate-700 transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="w-5 h-5" />
          </a>
          <Link href="/forge">
            <MagneticButton size="sm" className="!px-5 !py-2.5">
              Open the Forge
            </MagneticButton>
          </Link>
          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-4xl p-10 md:p-14">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-lumina grid place-items-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-lg">
                  Lumina<span className="text-gradient-lumina">Forge</span>
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-md text-pretty leading-relaxed">
                An agentic AI website generator powered entirely by free,
                open-source models via OpenRouter and Hugging Face. Describe a
                vibe — let a colony of agents forge the reality.
              </p>
              <p className="text-xs text-slate-400">
                Open source · MIT · Built with love on free-tier tools.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-semibold text-slate-800 mb-2">Product</p>
              <Link href="/forge" className="block text-slate-600 hover:text-slate-900 transition-colors">
                Forge Studio
              </Link>
              <Link href="/forges" className="block text-slate-600 hover:text-slate-900 transition-colors">
                My Forges
              </Link>
              <Link href="/settings" className="block text-slate-600 hover:text-slate-900 transition-colors">
                Settings
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-semibold text-slate-800 mb-2">Resources</p>
              <a
                href="https://openrouter.ai/models"
                target="_blank"
                rel="noreferrer"
                className="block text-slate-600 hover:text-slate-900 transition-colors"
              >
                OpenRouter Models
              </a>
              <a
                href="https://huggingface.co"
                target="_blank"
                rel="noreferrer"
                className="block text-slate-600 hover:text-slate-900 transition-colors"
              >
                Hugging Face
              </a>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="block text-slate-600 hover:text-slate-900 transition-colors"
              >
                Supabase
              </a>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
          © {new Date().getFullYear()} LuminaForge.ai — Forge on, friend.
        </p>
      </div>
    </footer>
  );
}
