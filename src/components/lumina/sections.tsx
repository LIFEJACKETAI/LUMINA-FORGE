"use client";

// =====================================================================
// LuminaForge.ai — Marketing Sections
// =====================================================================
// Process / Agents / Examples / Testimonials / Pricing / FAQ sections
// for the homepage. Each one carries the "roundabout" aesthetic.
// =====================================================================

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Compass,
  Code2,
  Gauge,
  Sparkles,
  ArrowUpRight,
  Check,
  Plus,
  Minus,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Orb, GradientText, GlowCard } from "./orb";
import { MagneticButton } from "./magnetic-button";

const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: EASE },
};

// =====================================================================
// SECTION 1 — Roundabout Process
// =====================================================================
const PROCESS_STEPS = [
  {
    icon: Compass,
    title: "Describe the Vibe",
    desc: "Type a few lines about the site you imagine — tone, audience, references. Drop a moodboard or a URL.",
    color: "from-indigo-400 to-violet-500",
  },
  {
    icon: Heart,
    title: "Vibe Interpreter",
    desc: "A sensitive agent reads your words and images, distilling them into a single shared essence.",
    color: "from-violet-400 to-fuchsia-500",
  },
  {
    icon: Code2,
    title: "Code Alchemist",
    desc: "A coding agent transmutes the spec into clean, self-contained HTML + Tailwind that renders instantly.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: Gauge,
    title: "Guardian + Keeper",
    desc: "Two more agents audit performance, accessibility, and SEO — then a final pass polishes the whole.",
    color: "from-emerald-400 to-teal-500",
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <Orb size="lg" color="#8B5CF6" halo="#6366F1" className="top-[10%] left-[-200px] opacity-30" />
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            The Roundabout
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
            A non-linear colony of <GradientText>five agents</GradientText>
          </h2>
          <p className="mt-5 text-slate-600 text-lg leading-relaxed">
            Forget rigid step-by-step pipelines. LuminaForge agents orbit a
            central forge, each contributing its specialty in a flowing,
            collaborative round.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              className="relative"
            >
              <GlowCard hover className="h-full">
                <div
                  className={`w-12 h-12 rounded-2xl grid place-items-center text-white mb-5 bg-gradient-to-br ${step.color} shadow-orb-sm`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-slate-400 mb-2">
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed text-pretty">
                  {step.desc}
                </p>
              </GlowCard>
              {/* Soft arrow between cards on large screens */}
              {i < PROCESS_STEPS.length - 1 && (
                <div className="hidden lg:grid absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 place-items-center text-violet-300">
                  <ArrowUpRight className="w-5 h-5 rotate-45" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// SECTION 2 — Agent Showcase (orbiting cards)
// =====================================================================
const AGENT_CARDS = [
  {
    emoji: "✶",
    name: "Vibe Interpreter",
    model: "nemotron-3-ultra · free",
    desc: "Reads the prompt + moodboards + reference URL, distills the essence.",
    hue: "from-indigo-400 to-violet-500",
  },
  {
    emoji: "◆",
    name: "Design Architect",
    model: "nemotron-3-ultra · free",
    desc: "Translates the vibe into a structured blueprint of sections, palette, copy.",
    hue: "from-violet-400 to-fuchsia-500",
  },
  {
    emoji: "✦",
    name: "Code Alchemist",
    model: "qwen3-coder · free",
    desc: "Transmutes the spec into self-contained HTML + Tailwind that renders instantly.",
    hue: "from-cyan-400 to-blue-500",
  },
  {
    emoji: "▲",
    name: "Performance Guardian",
    model: "qwen3-coder · free",
    desc: "Audits SEO, accessibility, Core Web Vitals — adds the meta, lazy-loads media.",
    hue: "from-emerald-400 to-teal-500",
  },
  {
    emoji: "✺",
    name: "Harmony Keeper",
    model: "nemotron-3-ultra · free",
    desc: "Final taste review — micro-refinements so the page sings as a whole.",
    hue: "from-amber-400 to-orange-500",
  },
];

export function AgentsSection() {
  return (
    <section id="agents" className="relative py-24 md:py-32 px-6 overflow-hidden bg-gradient-lumina-soft">
      <Orb size="xl" color="#22D3EE" halo="#8B5CF6" className="top-[40%] right-[-200px] opacity-30" />
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 mb-3">
            Meet the colony
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
            Five agents. One <GradientText>living workshop.</GradientText>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {AGENT_CARDS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="glass-panel p-6 h-full flex flex-col items-center text-center gap-3 hover:shadow-orb transition-shadow duration-300">
                <motion.div
                  className={`w-16 h-16 rounded-3xl grid place-items-center text-3xl text-white bg-gradient-to-br ${agent.hue} shadow-orb-sm`}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                >
                  {agent.emoji}
                </motion.div>
                <h3 className="font-display font-bold text-lg">{agent.name}</h3>
                <p className="text-xs font-mono text-slate-400 px-2 py-1 rounded-full bg-slate-100/70">
                  {agent.model}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{agent.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// SECTION 3 — Example Gallery
// =====================================================================
const EXAMPLES = [
  {
    prompt: "A dreamy portfolio for a generative-AI artist with a sense of wonder",
    emoji: "✶",
    color: "from-violet-400 via-fuchsia-400 to-pink-400",
  },
  {
    prompt: "A calm booking site for a coastal yoga studio with a soft sunrise palette",
    emoji: "❀",
    color: "from-amber-300 via-orange-300 to-rose-300",
  },
  {
    prompt: "A bold, futuristic launch page for an open-source database startup",
    emoji: "◆",
    color: "from-cyan-400 via-blue-400 to-indigo-400",
  },
  {
    prompt: "An editorial landing for a small-batch specialty coffee roaster",
    emoji: "❧",
    color: "from-emerald-400 via-teal-400 to-cyan-400",
  },
  {
    prompt: "A playful pricing page for an indie game studio's first launch",
    emoji: "✺",
    color: "from-pink-400 via-rose-400 to-orange-400",
  },
  {
    prompt: "A premium concierge page for a luxury skincare brand",
    emoji: "❖",
    color: "from-slate-400 via-violet-400 to-indigo-400",
  },
];

export function ExamplesSection() {
  return (
    <section id="examples" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <Orb size="lg" color="#6366F1" halo="#8B5CF6" className="bottom-[10%] left-[-150px] opacity-30" />
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">
            One prompt, infinite sites
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
            Tap a vibe to <GradientText>load the Forge</GradientText>
          </h2>
          <p className="mt-5 text-slate-600 text-lg leading-relaxed">
            Click any card to drop its prompt into the Forge Studio and start
            generating immediately.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMPLES.map((ex, i) => (
            <Link
              key={i}
              href={`/forge?prompt=${encodeURIComponent(ex.prompt)}`}
              className="block group relative overflow-hidden glass-panel rounded-4xl h-56 cursor-pointer hover:-translate-y-1.5 transition-transform duration-300"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="relative h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${ex.color} opacity-20 group-hover:opacity-35 transition-opacity duration-500 rounded-4xl`} />
                <Orb size="md" color="#8B5CF6" halo="#22D3EE" className="-bottom-20 -right-16 opacity-40 group-hover:opacity-60 transition-opacity" static />
                <div className="relative p-6 flex flex-col h-full">
                  <div className="text-3xl mb-3">{ex.emoji}</div>
                  <p className="text-sm text-slate-700 leading-relaxed text-pretty flex-1">
                    "{ex.prompt}"
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700">
                    Forge this
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// SECTION 4 — Testimonials
// =====================================================================
const TESTIMONIALS = [
  {
    quote:
      "I described a 'dreamy portfolio for a generative artist' and the colony produced something that genuinely felt like it knew me. The roundabout aesthetic is unreal.",
    name: "Maya R.",
    role: "AI artist",
    initial: "M",
  },
  {
    quote:
      "Bootstrap-friendly by design. I cloned it, plugged in my free OpenRouter key, and shipped a client landing page in an afternoon.",
    name: "Devansh K.",
    role: "Solo founder",
    initial: "D",
  },
  {
    quote:
      "The fact that this runs entirely on free open models and still feels more premium than the paid builders I've tried is honestly inspiring.",
    name: "Lina O.",
    role: "Frontend engineer",
    initial: "L",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            Loved by makers
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
            Quietly magical. <GradientText>Loudly useful.</GradientText>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
            >
              <GlowCard className="h-full flex flex-col gap-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed text-pretty flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-gradient-lumina grid place-items-center text-white font-bold">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// SECTION 5 — Pricing
// =====================================================================
const PRICING = [
  {
    name: "Free Tier",
    price: "$0",
    period: "forever",
    desc: "Bring your own free OpenRouter + Hugging Face keys. Run as many forges as your free quota allows.",
    features: [
      "Unlimited projects",
      "All 5 agents unlocked",
      "Live preview + export",
      "Next.js 15 export",
      "Self-host on Vercel",
      "Community Discord",
    ],
    cta: "Start Forging",
    href: "/forge",
    highlight: true,
  },
  {
    name: "Byo-Keys",
    price: "$0",
    period: "your keys, your cost",
    desc: "Same as Free — we never proxy your AI calls. Your keys live encrypted in your Supabase.",
    features: [
      "Bring-your-own OpenRouter key",
      "Bring-your-own HF token",
      "Bring-your-own Supabase",
      "Zero middleman fees",
      "Full source code",
    ],
    cta: "Configure Keys",
    href: "/settings",
    highlight: false,
  },
  {
    name: "Open Source",
    price: "MIT",
    period: "free forever",
    desc: "LuminaForge is open source. Fork it, learn from it, ship your own twist.",
    features: [
      "MIT licensed",
      "Educational comments everywhere",
      "Self-host on any Vercel free tier",
      "No vendor lock-in",
    ],
    cta: "View on GitHub",
    href: "https://github.com/luminaforge/luminaforge",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <Orb size="lg" color="#22D3EE" halo="#6366F1" className="top-[20%] right-[-150px] opacity-30" />
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600 mb-3">
            Bootstrap-friendly pricing
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
            Free, because <GradientText>open models win</GradientText>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {PRICING.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              className={`relative flex flex-col ${plan.highlight ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              <div
                className={`glass-panel p-8 rounded-4xl flex flex-col h-full ${
                  plan.highlight ? "shadow-orb ring-2 ring-violet-300/40" : ""
                }`}
              >
                {plan.highlight && (
                  <span className="absolute top-6 right-6 px-3 py-1 text-xs font-medium rounded-full bg-gradient-lumina text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display font-bold text-2xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-4xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">/ {plan.period}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 text-pretty">
                  {plan.desc}
                </p>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href={plan.href}>
                    <MagneticButton
                      variant={plan.highlight ? "primary" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </MagneticButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// SECTION 6 — FAQ
// =====================================================================
const FAQS = [
  {
    q: "Is LuminaForge really free?",
    a: "Yes — every AI call goes through OpenRouter's free-tier models and Hugging Face's free inference endpoints. You bring your own API keys (free to create) and we never proxy or charge for usage. The only cost is your own Supabase/Vercel free tier, which is more than enough for a side project.",
  },
  {
    q: "Why no OpenAI or Anthropic models?",
    a: "We believe the open-source ecosystem is moving faster than the frontier closed models for many practical tasks. By sticking to free open models, LuminaForge stays bootstrap-friendly and educational — anyone can fork it, run it, and learn how agentic AI works without spending a dollar.",
  },
  {
    q: "How does the multi-agent system actually work?",
    a: "Each Forge runs five agents sequentially: Vibe Interpreter (reads your prompt), Design Architect (creates a JSON spec), Code Alchemist (writes the HTML), Performance Guardian (audits SEO/perf/a11y), and Harmony Keeper (final refinements). Every step streams live text from the model so you can watch the colony think in real time.",
  },
  {
    q: "Can I export to Next.js?",
    a: "Yes. The Code tab has a one-click 'Export Next.js' button that uses JSZip to generate a complete, ready-to-deploy Next.js 15 project — App Router, Tailwind, TypeScript, and your generated page as a Server Component. Download the ZIP, `npm install`, push to Vercel, done.",
  },
  {
    q: "What's the roundabout aesthetic?",
    a: "Ultra-rounded organic forms (32–48px radii on everything), luminous orb motifs, soft layered glow shadows, gentle indigo→violet→cyan gradients, glassmorphism, and generous whitespace. It's the same aesthetic applied to both LuminaForge itself and the sites it generates.",
  },
  {
    q: "Can I use this commercially?",
    a: "LuminaForge is MIT licensed — fork it, ship from it, sell what you build. The generated sites are yours, full stop. Just be aware of the individual model licenses on OpenRouter (most free models permit commercial use, but check each model's card).",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 mb-3">
            FAQ
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-balance">
            Questions, <GradientText>answered.</GradientText>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
            >
              <GlowCard className="!p-0">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group"
                  aria-expanded={open === i}
                >
                  <span className="font-display font-semibold text-lg text-slate-800">
                    {faq.q}
                  </span>
                  <span
                    className={`w-8 h-8 grid place-items-center rounded-full bg-violet-100 text-violet-600 transition-transform ${
                      open === i ? "rotate-180" : ""
                    }`}
                  >
                    {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed text-pretty">
                    {faq.a}
                  </div>
                </motion.div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeUp}
          className="text-center mt-14"
        >
          <Link href="/forge">
            <MagneticButton size="lg" className="!px-8 !py-4 !text-base">
              <Sparkles className="w-5 h-5" />
              Forge your first site — free
            </MagneticButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
