"use client";

// =====================================================================
// LuminaForge.ai — <UserMenu />
// =====================================================================
// Top-right avatar/login widget. Shows either:
//   • A "Sign in" pill linking to /auth/login (when not configured or
//     not signed in)
//   • A user avatar dropdown with email + sign-out (when signed in)
// =====================================================================

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon, Sparkles } from "lucide-react";
import { useAuth } from "./auth-provider";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, isConfigured, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-slate-200/60 animate-pulse" />
    );
  }

  if (!isConfigured || !user) {
    return (
      <Link
        href="/auth/login"
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full hover:bg-white/70 text-slate-700 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Sign in
      </Link>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();
  const email = user.email ?? "";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-gradient-lumina grid place-items-center text-white text-sm font-bold shadow-orb-sm hover:scale-105 transition-transform"
        aria-label="User menu"
      >
        {initial}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 glass-panel rounded-3xl p-3 z-50"
          >
            <div className="flex items-center gap-2.5 p-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-gradient-lumina grid place-items-center text-white text-sm font-bold">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                <p className="text-sm font-medium truncate">{email}</p>
              </div>
            </div>
            <Link
              href="/forges"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-white/70 rounded-2xl transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              My Forges
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
