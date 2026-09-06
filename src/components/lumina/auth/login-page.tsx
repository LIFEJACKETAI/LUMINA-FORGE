"use client";

// =====================================================================
// LuminaForge.ai — <LoginPage />
// =====================================================================
// Premium magic-link login page. Single email field, friendly copy,
// status banner. Redirects to /forge after a successful sign-in.
// =====================================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Check, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MarketingNav } from "../marketing-shell";
import { Orb, GradientText, GlowCard } from "../orb";
import { MagneticButton } from "../magnetic-button";
import { useAuth } from "./auth-provider";

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { isConfigured, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const redirect = params.get("redirect") ?? "/forge";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    const result = await signInWithMagicLink(email.trim());
    setSending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not send magic link.");
      return;
    }
    setSent(true);
    toast.success("Magic link sent — check your inbox.");
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <MarketingNav />
      <main className="flex-1 pt-28 pb-12 px-6 grid place-items-center">
        <Orb size="xl" color="#8B5CF6" halo="#6366F1" className="top-[80px] left-[-200px] opacity-30 -z-10" />
        <Orb size="md" color="#22D3EE" halo="#8B5CF6" className="top-[40%] right-[-100px] opacity-30 -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <GlowCard className="!p-8 space-y-6">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-lumina grid place-items-center text-white shadow-orb-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h1 className="font-display font-bold text-2xl tracking-tight">
                  Sign in to <GradientText>LuminaForge</GradientText>
                </h1>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed text-pretty">
                Enter your email and we'll send you a magic link. No password
                to remember — just one tap and you're forging.
              </p>
            </div>

            {!isConfigured ? (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 leading-relaxed">
                <p className="font-semibold mb-1">Supabase isn't configured yet</p>
                <p>
                  Add your <code className="px-1.5 py-0.5 rounded bg-amber-100">NEXT_PUBLIC_SUPABASE_URL</code> and
                  <code className="px-1.5 py-0.5 rounded bg-amber-100 ml-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
                  <code className="px-1.5 py-0.5 rounded bg-amber-100 ml-1">.env.local</code> to enable magic-link sign-in.
                  You can still use LuminaForge in anonymous preview mode without signing in.
                </p>
                <Link
                  href="/forge"
                  className="inline-flex items-center gap-1 text-violet-700 hover:text-violet-900 font-medium mt-3"
                >
                  Continue in anonymous mode
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-sm text-emerald-700 leading-relaxed"
              >
                <Check className="w-5 h-5 mb-2" />
                <p className="font-semibold mb-1">Check your inbox</p>
                <p>
                  We sent a magic link to <strong>{email}</strong>. Click it
                  and you'll land back in the Forge Studio.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-full border border-slate-200 bg-white/70 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <MagneticButton
                  type="submit"
                  disabled={sending || !email.trim()}
                  className="w-full !py-3.5"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending magic link…
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send magic link
                    </>
                  )}
                </MagneticButton>
              </form>
            )}

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              By signing in, you agree to the LuminaForge Terms and Privacy Policy.
              <br />
              Free tier · Open source · No credit card.
            </p>
          </GlowCard>
        </motion.div>
      </main>
    </div>
  );
}
