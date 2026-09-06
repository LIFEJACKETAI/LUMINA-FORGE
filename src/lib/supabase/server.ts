// =====================================================================
// LuminaForge.ai — Supabase Server Client
// =====================================================================
// Server-side Supabase client that reads the session from Next cookies.
// Used by Server Components, Route Handlers, and Server Actions.
//
// Graceful fallback: if NEXT_PUBLIC_SUPABASE_URL or ANON_KEY are not set,
// every call returns null and the app continues to work in "anonymous
// preview mode" using Prisma + SQLite.
// =====================================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anon && url.startsWith("https://") && !url.includes("YOUR-PROJECT"));
}

/**
 * Create a server-side Supabase client bound to the request cookies.
 * Returns null if Supabase isn't configured (sandbox/preview mode).
 */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies can't be set there.
            // The middleware will refresh the session on the next request.
          }
        },
      },
    },
  );
}

/**
 * Returns the authenticated user, or null if:
 *   - Supabase isn't configured (sandbox mode)
 *   - The user is not signed in
 *
 * Use this in any Server Component or Route Handler to gate access.
 */
export async function getAuthenticatedUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { user: null, isAnonymous: true, anonymousId: "local-user" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAnonymous: true, anonymousId: "local-user" };
  // Stable anonymous ID for the authed user — used as the Prisma userId.
  return { user, isAnonymous: false, anonymousId: user.id };
}
