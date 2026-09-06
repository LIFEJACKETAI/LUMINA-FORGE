"use client";

// =====================================================================
// LuminaForge.ai — AuthProvider
// =====================================================================
// Client-side context that surfaces the signed-in user (or null) and
// exposes signIn / signOut helpers. Gracefully no-ops when Supabase
// isn't configured — the app continues to work in anonymous mode.
// =====================================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabaseBrowser, isSupabaseConfiguredClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  isConfigured: boolean;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isConfigured: false,
  loading: true,
  signInWithMagicLink: async () => ({ ok: false, error: "Not configured" }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Compute once — Supabase config never changes during a session.
  const isConfigured = isSupabaseConfiguredClient();
  const [user, setUser] = useState<User | null>(null);
  // If Supabase isn't configured we're never loading. Otherwise start in
  // loading and resolve after the first getUser() callback fires.
  const [loading, setLoading] = useState<boolean>(isConfigured);

  useEffect(() => {
    if (!isConfigured) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    // getUser + onAuthStateChange both call setState INSIDE async callbacks
    // — that's an allowed pattern (not a synchronous setState in effect).
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [isConfigured]);

  async function signInWithMagicLink(email: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { ok: false, error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider
      value={{ user, isConfigured, loading, signInWithMagicLink, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
