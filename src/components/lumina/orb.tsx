"use client";

// =====================================================================
// LuminaForge.ai — <Orb />
// =====================================================================
// The signature luminous orb motif. A blurred radial-gradient ball
// that floats gently behind content. Use as decoration, never as a
// primary surface (it has no semantic content of its own).
//
// Variants:
//   - "sm"  : 120px, soft glow
//   - "md"  : 280px, the default hero ambient orb
//   - "lg"  : 480px, page-section ambient
//   - "xl"  : 720px, page-level ambient
//
// Colors accept any CSS color string. We default to the brand violet
// for the warm magical feel.
// =====================================================================

import { cn } from "@/lib/utils";
import { motion, type MotionProps } from "framer-motion";
import type { CSSProperties } from "react";

type OrbSize = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<OrbSize, number> = {
  sm: 120,
  md: 280,
  lg: 480,
  xl: 720,
};

export interface OrbProps extends MotionProps {
  size?: OrbSize;
  /** Primary color — the warm core of the orb. */
  color?: string;
  /** Optional secondary hue for the outer halo. */
  halo?: string;
  className?: string;
  style?: CSSProperties;
  /** Float speed multiplier — higher = faster. */
  speed?: number;
  /** Disable the float animation (static orb). */
  static?: boolean;
}

export function Orb({
  size = "md",
  color = "#8B5CF6",
  halo,
  className,
  style,
  speed = 1,
  static: isStatic = false,
  ...rest
}: OrbProps) {
  const px = SIZE_PX[size];
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      style={{
        width: px,
        height: px,
        borderRadius: "9999px",
        background: `radial-gradient(circle at 35% 35%, ${color} 0%, ${halo ?? color}88 40%, transparent 70%)`,
        filter: `blur(${Math.max(8, px / 24)}px)`,
        opacity: 0.7,
        ...style,
      }}
      animate={
        isStatic
          ? undefined
          : {
              y: [0, -16, 0],
              x: [0, 6, 0],
              scale: [1, 1.04, 1],
            }
      }
      transition={{
        duration: 7 / speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------------
// <GradientText> — apply the brand gradient to inline text.
// ---------------------------------------------------------------------
export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-gradient-lumina", className)}>{children}</span>
  );
}

// ---------------------------------------------------------------------
// <GlowCard> — the workhorse ultra-rounded glass panel.
// ---------------------------------------------------------------------
export function GlowCard({
  children,
  className,
  hover = false,
  radius = "r-organic",
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  radius?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel p-6 transition-all duration-300",
        radius,
        hover && "hover:-translate-y-1 hover:shadow-orb",
        className,
      )}
    >
      {children}
    </div>
  );
}
