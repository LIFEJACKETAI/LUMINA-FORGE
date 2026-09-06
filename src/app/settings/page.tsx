// =====================================================================
// LuminaForge.ai — /settings
// =====================================================================
// Where users enter their free OpenRouter + Hugging Face keys and
// (optionally) Supabase credentials. In production these are encrypted
// and stored in the `settings` table (see supabase-schema.sql). In the
// sandbox preview we keep them in localStorage so the app is fully
// runnable with zero external setup.
// =====================================================================

import { SettingsPage } from "@/components/lumina/settings-page";

export default function Page() {
  return <SettingsPage />;
}
