// =====================================================================
// LuminaForge.ai — Forge Studio (/forge)
// =====================================================================
// The core product. Three-panel layout:
//   • Left:  Composer (prompt, moodboard, URL, vibe chips, Forge button)
//   • Center: Live Preview (sandboxed iframe) + roundabout overlay
//   • Right: Inspector (Agents / Iterate / Code / History tabs)
//
// Reads prompt from ?prompt= to deep-link from the example gallery.
// =====================================================================

import { Suspense } from "react";
import { ForgeStudio } from "@/components/lumina/forge-studio";

export default function ForgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ForgeStudio />
    </Suspense>
  );
}
