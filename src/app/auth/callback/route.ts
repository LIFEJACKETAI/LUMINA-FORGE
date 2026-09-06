// =====================================================================
// LuminaForge.ai — /auth/callback
// =====================================================================
// The redirect target after the user clicks the magic link in their
// email. Exchanges the code for a session, then bounces to /forge (or
// the original ?redirect= URL).
// =====================================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.redirect(new URL("/auth/login?error=no-supabase-config", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const redirect = req.nextUrl.searchParams.get("redirect") ?? "/forge";
  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no-code", req.url));
  }

  // Build a server client bound to this response's cookies.
  const res = NextResponse.redirect(new URL(redirect, req.url));
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, req.url),
      );
    }
  } catch (err) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent((err as Error).message)}`, req.url),
    );
  }

  return res;
}
