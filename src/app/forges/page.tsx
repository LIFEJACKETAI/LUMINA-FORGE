// =====================================================================
// LuminaForge.ai — /forges
// =====================================================================
// Searchable grid of past projects. Each card shows the project name,
// last prompt, vibe tags, score pills, and a thumbnail (rendered from
// the saved HTML inside a tiny sandboxed iframe).
// =====================================================================

import { Suspense } from "react";
import { MyForges } from "@/components/lumina/my-forges";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MyForges />
    </Suspense>
  );
}
