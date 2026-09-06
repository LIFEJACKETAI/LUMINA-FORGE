"use client";

// =====================================================================
// LuminaForge.ai — <MagneticButton />
// =====================================================================
// A premium button that subtly attracts toward the cursor on hover —
// the kind of micro-interaction that makes a UI feel "alive". Falls
// back to a regular styled button on touch devices (where magnetic
// effects feel wrong).
// =====================================================================

import { useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-lumina text-white shadow-orb-sm hover:shadow-orb border-0",
  ghost:
    "bg-white/70 backdrop-blur text-slate-800 border border-white/60 hover:bg-white",
  outline:
    "bg-transparent text-slate-800 border border-slate-200 hover:border-violet-300 hover:bg-violet-50/40",
};

export interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  magnetic?: boolean;
}

const SIZES = {
  sm: "px-4 py-2 text-sm rounded-full",
  md: "px-6 py-3 text-base rounded-full",
  lg: "px-8 py-4 text-lg rounded-full",
};

export function MagneticButton({
  variant = "primary",
  size = "md",
  className,
  children,
  magnetic = true,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    mx.set(relX * 0.25);
    my.set(relY * 0.25);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-medium",
        "transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}
