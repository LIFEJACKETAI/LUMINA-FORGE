"use client";

// =====================================================================
// LuminaForge.ai — SmoothScrollProvider (Lenis)
// =====================================================================
// Initializes Lenis for buttery, native-feeling scroll. Honors reduced
// motion preferences. Lenis is loaded dynamically so SSR is unaffected.
// =====================================================================

import { useEffect, type ReactNode } from "react";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Respect prefers-reduced-motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    (async () => {
      try {
        // Lenis is ESM-only — dynamic import keeps SSR happy + lets us
        // gracefully fall back to native scroll if the package is missing.
        const mod = await import("lenis");
        const Lenis = (mod as any).default ?? (mod as any).Lenis;
        if (!Lenis) return;
        const lenis = new Lenis({
          duration: 1.1,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        let raf = 0;
        const loop = (time: number) => {
          lenis.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        cleanup = () => {
          cancelAnimationFrame(raf);
          lenis.destroy();
        };
      } catch {
        // Lenis isn't installed in the sandbox — that's fine, fall back to
        // native smooth scrolling (CSS `scroll-behavior: smooth`).
      }
    })();

    return () => cleanup?.();
  }, []);

  return <>{children}</>;
}
