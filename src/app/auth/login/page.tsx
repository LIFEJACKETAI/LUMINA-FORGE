// =====================================================================
// LuminaForge.ai — /auth/login
// =====================================================================
// Magic-link sign-in page. Sends a one-time link to the user's email;
// clicking it lands them on /auth/callback which sets the session.
// Falls back to a friendly message when Supabase isn't configured.
// =====================================================================

import { LoginPage } from "@/components/lumina/auth/login-page";

export default function Page() {
  return <LoginPage />;
}
