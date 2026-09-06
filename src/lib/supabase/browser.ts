"use client";

// =====================================================================
// LuminaForge.ai — Supabase Browser Client
// =====================================================================
// Client-side Supabase client (singleton) used inside React components.
// Falls back to null when env vars aren't configured.
// =====================================================================

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let cachedNull = false;

export function isSupabaseConfiguredClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anon && url.startsWith("https://") && !url.includes("YOUR-PROJECT"));
}

export function getSupabaseBrowser(): SupabaseClient | null {
  if (cached) return cached;
  if (cachedNull) return null;
  if (!isSupabaseConfiguredClient()) {
    cachedNull = true;
    return null;
  }
  cached = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return cached;
}
