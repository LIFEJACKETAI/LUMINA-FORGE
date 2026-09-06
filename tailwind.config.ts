import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * LuminaForge.ai — Tailwind Configuration
 * ---------------------------------------------------------------
 * Custom design tokens for the "Roundabout" aesthetic:
 *  - Ultra-rounded radii (32–64px on organic forms)
 *  - Indigo / Violet / Cyan brand gradient
 *  - Luminous orb shadows for the soft glowing motifs
 *  - Animation keyframes re-exported from globals.css
 *  - Generous spacing scale tuned for whitespace-rich layouts
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Brand tokens — used directly across the UI for gradients/orbs
        lumina: {
          indigo: "#6366F1",
          violet: "#8B5CF6",
          cyan: "#22D3EE",
          ink: "#0F172A",
          paper: "#F8FAFC",
        },
      },
      borderRadius: {
        // Base shadcn scale
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // LuminaForge organic scale — the signature soft forms
        soft: "28px",
        organic: "36px",
        pill: "9999px",
        "2xl": "calc(var(--radius) + 10px)",
        "3xl": "32px",
        "4xl": "48px",
        "5xl": "64px",
      },
      boxShadow: {
        // Luminous orb shadows — the heart of the "magical" aesthetic
        "orb-sm":
          "0 4px 16px -2px rgba(99,102,241,0.28), 0 12px 32px -8px rgba(139,92,246,0.22)",
        orb:
          "0 0 0 1px rgba(255,255,255,0.2) inset, 0 8px 32px -4px rgba(99,102,241,0.35), 0 18px 64px -12px rgba(139,92,246,0.30), 0 32px 96px -20px rgba(34,211,238,0.22)",
        "orb-glow":
          "0 0 28px 4px rgba(139,92,246,0.45), 0 12px 48px -8px rgba(99,102,241,0.55)",
        glow: "0 0 40px -10px rgba(139, 92, 246, 0.55)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.6)",
        lift: "0 24px 64px -16px rgba(15, 23, 42, 0.16)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "lumina-gradient":
          "linear-gradient(120deg, #6366F1 0%, #8B5CF6 45%, #22D3EE 100%)",
        "lumina-soft":
          "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(34,211,238,0.08) 100%)",
        "lumina-radial":
          "radial-gradient(circle at 50% 30%, rgba(139,92,246,0.20), transparent 65%)",
      },
      animation: {
        float: "lf-float 7s ease-in-out infinite",
        "float-slow": "lf-float 11s ease-in-out infinite",
        orbit: "lf-orbit 22s linear infinite",
        "orbit-reverse": "lf-orbit-reverse 28s linear infinite",
        "pulse-orb": "lf-pulse-orb 3.5s ease-in-out infinite",
        shimmer: "lf-shimmer 2.4s linear infinite",
        "spin-slow": "lf-spin 30s linear infinite",
        rise: "lf-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        "lf-float": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-14px) translateX(6px)" },
        },
        "lf-orbit": {
          from: { transform: "rotate(0deg) translateX(var(--orbit-r)) rotate(0deg)" },
          to: { transform: "rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg)" },
        },
        "lf-pulse-orb": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow:
              "0 0 0 0 rgba(139,92,246,0.4), 0 8px 32px -4px rgba(99,102,241,0.4)",
          },
          "50%": {
            transform: "scale(1.04)",
            boxShadow:
              "0 0 0 16px rgba(139,92,246,0), 0 12px 48px -4px rgba(99,102,241,0.55)",
          },
        },
        "lf-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "lf-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
