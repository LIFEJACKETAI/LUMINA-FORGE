// =====================================================================
// LuminaForge.ai — Middleware
// =====================================================================
// Refreshes the Supabase auth session on every request so SSR can see
// the latest user. Skipped entirely when Supabase env vars aren't set
// (sandbox/preview mode).
// =====================================================================

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !url.startsWith("https://") || url.includes("YOUR-PROJECT")) {
    return NextResponse.next();
  }

  // Clone the response so we can mutate cookies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Important: do not run any code between createServerClient and
  // getUser(). A simple mistake here can make it very hard to debug
  // issues with users being randomly logged out.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public assets
     * Feel free to modify this pattern to include more paths you want to
     * exclude from the middleware.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)",
  ],
};
