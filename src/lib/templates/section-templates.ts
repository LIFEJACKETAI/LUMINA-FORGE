// =====================================================================
// LuminaForge.ai — Section Template Library
// =====================================================================
// Pre-built HTML/Tailwind section blocks following the "Roundabout"
// aesthetic. Users can browse these from the Templates modal in the
// Forge Studio and insert a "use template X" instruction directly
// into their prompt. The Code Alchemist then uses these as starting
// blocks when generating.
//
// Each template:
//   - Follows the shared aesthetic (32-48px radii, orb motifs, indigo-
//     violet-cyan gradients, glassmorphism, generous whitespace)
//   - Is self-contained and copy-pasteable
//   - Has a category, name, description, emoji, and tags
//   - Includes a "useHint" — the natural-language instruction users
//     inject into the prompt
// =====================================================================

export interface SectionTemplate {
  id: string;
  name: string;
  emoji: string;
  category: "hero" | "features" | "pricing" | "faq" | "testimonials" | "cta" | "gallery" | "footer";
  description: string;
  tags: string[];
  /** The instruction text the user can inject into their prompt. */
  useHint: string;
  /** The full HTML preview that users can see in the modal. */
  html: string;
}

// Note: HTML templates below use Tailwind classes loaded via CDN
// (the iframe preview already loads Tailwind), so the previews
// render correctly in the Templates modal too.

const SHARED_STYLE_HINT = `Use the "Roundabout" aesthetic: ultra-rounded organic forms (32-48px radii), luminous orb motifs, soft layered glow shadows, indigo→violet→cyan gradients (#6366F1 → #8B5CF6 → #22D3EE), glassmorphism panels with backdrop-blur, generous whitespace, Inter body + Space Grotesk headings.`;

export const SECTION_TEMPLATES: SectionTemplate[] = [
  // -----------------------------------------------------------------
  // HERO TEMPLATES
  // -----------------------------------------------------------------
  {
    id: "hero-centered-orb",
    name: "Centered Orb Hero",
    emoji: "✶",
    category: "hero",
    description: "A centered headline + subhead + dual CTAs over a luminous floating orb. The signature LuminaForge hero.",
    tags: ["centered", "orb", "gradient"],
    useHint: `Use a centered hero with a giant gradient headline, a single sentence subhead, two pill CTAs (primary gradient + ghost), and a large floating violet orb behind the text. ${SHARED_STYLE_HINT}`,
    html: `<section class="relative px-6 py-32 overflow-hidden">
  <div class="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-40" style="background: radial-gradient(circle, #8B5CF6 0%, transparent 70%); filter: blur(60px);"></div>
  <div class="relative max-w-4xl mx-auto text-center space-y-6">
    <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-white/60 text-xs text-slate-700">✶ New · v1.0</span>
    <h1 class="font-['Space_Grotesk',sans-serif] font-extrabold text-5xl md:text-7xl leading-[1.05] tracking-tight text-balance">
      Your headline
      <span class="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">here</span>
    </h1>
    <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">A short, evocative subhead that explains the value in one breath.</p>
    <div class="flex flex-wrap gap-3 justify-center pt-2">
      <button class="px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white font-medium shadow-orb">Get Started</button>
      <button class="px-7 py-3.5 rounded-full bg-white/70 backdrop-blur border border-white/60 text-slate-800 font-medium">Learn more</button>
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-split-orb",
    name: "Split Orb Hero",
    emoji: "✦",
    category: "hero",
    description: "Two-column hero with copy on the left and a floating orb composition on the right.",
    tags: ["split", "orb", "two-column"],
    useHint: `Use a split-screen hero — copy + dual CTAs on the left, a floating orb composition (concentric rings + orbiting dots + central glow core) on the right. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
  <div class="space-y-6">
    <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-white/60 text-xs text-slate-700">✦ Open source</span>
    <h1 class="font-['Space_Grotesk',sans-serif] font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight">
      Build something <span class="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">beautiful</span>
    </h1>
    <p class="text-lg text-slate-600 leading-relaxed">A two-line description that captures the essence of what you offer.</p>
    <div class="flex gap-3 pt-2">
      <button class="px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white font-medium shadow-orb">Start now</button>
      <button class="px-7 py-3.5 rounded-full bg-white/70 border border-white/60 text-slate-800 font-medium">View demo</button>
    </div>
  </div>
  <div class="relative h-[400px] grid place-items-center">
    <div class="absolute w-[320px] h-[320px] rounded-full border border-violet-200/40" style="animation: spin 22s linear infinite;"></div>
    <div class="absolute w-[220px] h-[220px] rounded-full border border-cyan-200/40" style="animation: spin 16s linear infinite reverse;"></div>
    <div class="relative w-32 h-32 rounded-full" style="background: radial-gradient(circle at 35% 30%, #FFFFFF 0%, #C7D2FE 25%, #6366F1 55%, #1E1B4B 100%); box-shadow: 0 0 48px 12px rgba(139, 92, 246, 0.55);"></div>
  </div>
</section>`,
  },

  // -----------------------------------------------------------------
  // FEATURES TEMPLATES
  // -----------------------------------------------------------------
  {
    id: "features-3-card",
    name: "3-Card Features",
    emoji: "◆",
    category: "features",
    description: "Three glassmorphism cards with gradient icon tiles — the classic, calm feature grid.",
    tags: ["features", "3-column", "glassmorphism"],
    useHint: `Use a 3-column features grid with glassmorphism cards. Each card has a 12x12 rounded-2xl gradient icon tile, a bold heading, and a short description. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-24">
  <div class="max-w-7xl mx-auto">
    <h2 class="font-['Space_Grotesk',sans-serif] font-extrabold text-3xl md:text-4xl text-center mb-12 tracking-tight">
      Built for the <span class="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">modern era</span>
    </h2>
    <div class="grid md:grid-cols-3 gap-6">
      <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60 hover:-translate-y-1 hover:shadow-orb transition-all duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 grid place-items-center text-white mb-5 shadow-orb-sm">⚡</div>
        <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Feature One</h3>
        <p class="text-slate-600 leading-relaxed">A short, concrete description of what this feature does and why it matters.</p>
      </article>
      <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60 hover:-translate-y-1 hover:shadow-orb transition-all duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-500 grid place-items-center text-white mb-5 shadow-orb-sm">◆</div>
        <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Feature Two</h3>
        <p class="text-slate-600 leading-relaxed">A short, concrete description of what this feature does and why it matters.</p>
      </article>
      <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60 hover:-translate-y-1 hover:shadow-orb transition-all duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white mb-5 shadow-orb-sm">▲</div>
        <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Feature Three</h3>
        <p class="text-slate-600 leading-relaxed">A short, concrete description of what this feature does and why it matters.</p>
      </article>
    </div>
  </div>
</section>`,
  },
  {
    id: "features-stat-strip",
    name: "Stat Strip",
    emoji: "▲",
    category: "features",
    description: "A horizontal strip of 4 large stats with gradient numbers — perfect for credibility.",
    tags: ["stats", "social proof"],
    useHint: `Use a horizontal 4-stat strip with big gradient numbers and short labels under each. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-20">
  <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    <div>
      <div class="font-['Space_Grotesk',sans-serif] text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">10K+</div>
      <p class="text-sm text-slate-500 mt-1">Active users</p>
    </div>
    <div>
      <div class="font-['Space_Grotesk',sans-serif] text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">99.9%</div>
      <p class="text-sm text-slate-500 mt-1">Uptime</p>
    </div>
    <div>
      <div class="font-['Space_Grotesk',sans-serif] text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">4ms</div>
      <p class="text-sm text-slate-500 mt-1">Avg latency</p>
    </div>
    <div>
      <div class="font-['Space_Grotesk',sans-serif] text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">MIT</div>
      <p class="text-sm text-slate-500 mt-1">Open source</p>
    </div>
  </div>
</section>`,
  },

  // -----------------------------------------------------------------
  // PRICING
  // -----------------------------------------------------------------
  {
    id: "pricing-single-card",
    name: "Single Pricing Card",
    emoji: "❖",
    category: "pricing",
    description: "One centered pricing card with everything included — the bootstrap-friendly choice.",
    tags: ["pricing", "single", "free"],
    useHint: `Use a single centered pricing card (the "free forever" model) with a checkmark feature list and one big CTA. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-24">
  <div class="max-w-md mx-auto bg-white/70 backdrop-blur p-10 rounded-4xl border border-white/60 shadow-orb text-center">
    <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-2xl mb-2">Free Tier</h3>
    <div class="flex items-baseline justify-center gap-2 mb-1">
      <span class="font-['Space_Grotesk',sans-serif] text-5xl font-extrabold">$0</span>
      <span class="text-slate-500">/ forever</span>
    </div>
    <p class="text-slate-600 mb-6">Everything you need to start. No credit card.</p>
    <ul class="space-y-2 text-left max-w-xs mx-auto mb-8">
      <li class="flex items-start gap-2 text-sm"><span class="text-emerald-500">✓</span> Unlimited projects</li>
      <li class="flex items-start gap-2 text-sm"><span class="text-emerald-500">✓</span> All features unlocked</li>
      <li class="flex items-start gap-2 text-sm"><span class="text-emerald-500">✓</span> Community support</li>
    </ul>
    <button class="w-full px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white font-medium shadow-orb">Get Started</button>
  </div>
</section>`,
  },
  {
    id: "pricing-3-tier",
    name: "3-Tier Pricing",
    emoji: "❖",
    category: "pricing",
    description: "Three pricing tiers with the middle one highlighted as 'Most Popular'.",
    tags: ["pricing", "3-tier", "comparison"],
    useHint: `Use a 3-tier pricing grid with the middle tier highlighted ("Most Popular" badge, gradient ring, slightly elevated). Each tier has a checkmark feature list. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-24">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
    <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60">
      <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Starter</h3>
      <div class="flex items-baseline gap-2 mb-1"><span class="font-['Space_Grotesk',sans-serif] text-4xl font-extrabold">$0</span><span class="text-slate-500 text-sm">/mo</span></div>
      <p class="text-sm text-slate-600 mb-6">For hobby projects.</p>
      <ul class="space-y-2 mb-8 text-sm">
        <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> 3 projects</li>
        <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Community support</li>
      </ul>
      <button class="w-full py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:border-violet-300">Choose</button>
    </article>
    <article class="relative bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60 shadow-orb ring-2 ring-violet-300/40 lg:-my-4">
      <span class="absolute top-6 right-6 px-3 py-1 text-[10px] font-medium rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white">Most Popular</span>
      <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Pro</h3>
      <div class="flex items-baseline gap-2 mb-1"><span class="font-['Space_Grotesk',sans-serif] text-4xl font-extrabold">$19</span><span class="text-slate-500 text-sm">/mo</span></div>
      <p class="text-sm text-slate-600 mb-6">For growing teams.</p>
      <ul class="space-y-2 mb-8 text-sm">
        <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Unlimited projects</li>
        <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Priority support</li>
        <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Custom domains</li>
      </ul>
      <button class="w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white font-medium shadow-orb">Choose Pro</button>
    </article>
    <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60">
      <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Enterprise</h3>
      <div class="flex items-baseline gap-2 mb-1"><span class="font-['Space_Grotesk',sans-serif] text-4xl font-extrabold">Custom</span></div>
      <p class="text-sm text-slate-600 mb-6">For large orgs.</p>
      <ul class="space-y-2 mb-8 text-sm">
        <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> SSO + audit logs</li>
        <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Dedicated support</li>
      </ul>
      <button class="w-full py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:border-violet-300">Contact us</button>
    </article>
  </div>
</section>`,
  },

  // -----------------------------------------------------------------
  // FAQ
  // -----------------------------------------------------------------
  {
    id: "faq-accordion",
    name: "FAQ Accordion",
    emoji: "?",
    category: "faq",
    description: "Single-column accordion of common questions — clean, focused.",
    tags: ["faq", "accordion"],
    useHint: `Use a single-column FAQ accordion with plus/minus indicators and smooth open/close transitions. Max 6 questions. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-24">
  <div class="max-w-2xl mx-auto space-y-3">
    <h2 class="font-['Space_Grotesk',sans-serif] font-extrabold text-3xl text-center mb-10 tracking-tight">Questions, answered</h2>
    <details class="group bg-white/70 backdrop-blur rounded-3xl border border-white/60 p-5">
      <summary class="cursor-pointer font-semibold text-lg list-none flex justify-between items-center">Is it really free? <span class="text-violet-500 group-open:rotate-45 transition-transform">+</span></summary>
      <p class="mt-3 text-slate-600 leading-relaxed text-pretty">Yes — every AI call goes through free-tier open models.</p>
    </details>
    <details class="group bg-white/70 backdrop-blur rounded-3xl border border-white/60 p-5">
      <summary class="cursor-pointer font-semibold text-lg list-none flex justify-between items-center">Can I use it commercially? <span class="text-violet-500 group-open:rotate-45 transition-transform">+</span></summary>
      <p class="mt-3 text-slate-600 leading-relaxed text-pretty">Yes — LuminaForge is MIT licensed.</p>
    </details>
  </div>
</section>`,
  },

  // -----------------------------------------------------------------
  // TESTIMONIALS
  // -----------------------------------------------------------------
  {
    id: "testimonials-3-card",
    name: "3-Card Testimonials",
    emoji: "★",
    category: "testimonials",
    description: "Three glassmorphism cards with quote, 5-star rating, and avatar — perfect social proof.",
    tags: ["testimonials", "social proof"],
    useHint: `Use a 3-column testimonials grid with glassmorphism cards. Each card has 5 star icons, a short quote, and an avatar + name + role. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-24">
  <div class="max-w-7xl mx-auto">
    <h2 class="font-['Space_Grotesk',sans-serif] font-extrabold text-3xl md:text-4xl text-center mb-12 tracking-tight">Loved by makers</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <article class="bg-white/70 backdrop-blur p-6 rounded-4xl border border-white/60 flex flex-col gap-4">
        <div class="flex gap-1 text-amber-400">★★★★★</div>
        <p class="text-slate-700 leading-relaxed flex-1">"This product changed how my team ships. The roundabout aesthetic is unreal."</p>
        <div class="flex items-center gap-3 pt-2 border-t border-slate-200/60">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 grid place-items-center text-white font-bold">M</div>
          <div><div class="font-semibold text-sm">Maya R.</div><div class="text-xs text-slate-500">AI artist</div></div>
        </div>
      </article>
      <article class="bg-white/70 backdrop-blur p-6 rounded-4xl border border-white/60 flex flex-col gap-4">
        <div class="flex gap-1 text-amber-400">★★★★★</div>
        <p class="text-slate-700 leading-relaxed flex-1">"Bootstrap-friendly by design. I cloned it and shipped a client site in an afternoon."</p>
        <div class="flex items-center gap-3 pt-2 border-t border-slate-200/60">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white font-bold">D</div>
          <div><div class="font-semibold text-sm">Devansh K.</div><div class="text-xs text-slate-500">Founder</div></div>
        </div>
      </article>
      <article class="bg-white/70 backdrop-blur p-6 rounded-4xl border border-white/60 flex flex-col gap-4">
        <div class="flex gap-1 text-amber-400">★★★★★</div>
        <p class="text-slate-700 leading-relaxed flex-1">"More premium than paid builders I've tried. Inspiring that it's all open source."</p>
        <div class="flex items-center gap-3 pt-2 border-t border-slate-200/60">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 grid place-items-center text-white font-bold">L</div>
          <div><div class="font-semibold text-sm">Lina O.</div><div class="text-xs text-slate-500">Engineer</div></div>
        </div>
      </article>
    </div>
  </div>
</section>`,
  },

  // -----------------------------------------------------------------
  // CTA
  // -----------------------------------------------------------------
  {
    id: "cta-gradient-panel",
    name: "Gradient CTA Panel",
    emoji: "→",
    category: "cta",
    description: "A bold gradient panel with a single CTA — perfect for closing a page.",
    tags: ["cta", "gradient"],
    useHint: `Use a full-width gradient CTA panel at the bottom with a centered headline, short subtext, and one big pill CTA. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-20">
  <div class="max-w-4xl mx-auto rounded-5xl p-12 text-center text-white relative overflow-hidden" style="background: linear-gradient(120deg, #6366F1 0%, #8B5CF6 45%, #22D3EE 100%); box-shadow: 0 32px 96px -20px rgba(99,102,241,0.45);">
    <div class="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-30" style="background: radial-gradient(circle, white 0%, transparent 70%); filter: blur(40px);"></div>
    <h2 class="relative font-['Space_Grotesk',sans-serif] font-extrabold text-3xl md:text-5xl mb-4 tracking-tight text-balance">Ready to ship faster?</h2>
    <p class="relative text-white/90 text-lg mb-8 max-w-xl mx-auto">Clone the repo, run one command, and you're live.</p>
    <button class="relative px-8 py-4 rounded-full bg-white text-violet-700 font-semibold shadow-orb">Get Started — Free</button>
  </div>
</section>`,
  },

  // -----------------------------------------------------------------
  // GALLERY
  // -----------------------------------------------------------------
  {
    id: "gallery-3-grid",
    name: "3-Image Gallery",
    emoji: "❀",
    category: "gallery",
    description: "Three rounded image cards with hover lift — perfect for portfolios or product shots.",
    tags: ["gallery", "images"],
    useHint: `Use a 3-column image gallery with rounded-4xl image cards that lift on hover. Use picsum.photos placeholder images. ${SHARED_STYLE_HINT}`,
    html: `<section class="px-6 py-24">
  <div class="max-w-7xl mx-auto">
    <h2 class="font-['Space_Grotesk',sans-serif] font-extrabold text-3xl md:text-4xl text-center mb-12 tracking-tight">Recent work</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="aspect-[4/3] rounded-4xl overflow-hidden bg-slate-100 hover:-translate-y-1 transition-transform">
        <img src="https://picsum.photos/seed/one/600/450" loading="lazy" decoding="async" alt="Work 1" class="w-full h-full object-cover" />
      </div>
      <div class="aspect-[4/3] rounded-4xl overflow-hidden bg-slate-100 hover:-translate-y-1 transition-transform">
        <img src="https://picsum.photos/seed/two/600/450" loading="lazy" decoding="async" alt="Work 2" class="w-full h-full object-cover" />
      </div>
      <div class="aspect-[4/3] rounded-4xl overflow-hidden bg-slate-100 hover:-translate-y-1 transition-transform">
        <img src="https://picsum.photos/seed/three/600/450" loading="lazy" decoding="async" alt="Work 3" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</section>`,
  },

  // -----------------------------------------------------------------
  // FOOTER
  // -----------------------------------------------------------------
  {
    id: "footer-rounded-panel",
    name: "Rounded Footer Panel",
    emoji: "❧",
    category: "footer",
    description: "A single glassmorphism panel containing the footer — clean, branded, minimal.",
    tags: ["footer", "branding"],
    useHint: `Use a single rounded-4xl glassmorphism footer panel containing the brand on the left, three columns of links, and a copyright line at the bottom. ${SHARED_STYLE_HINT}`,
    html: `<footer class="px-6 py-12">
  <div class="max-w-7xl mx-auto bg-white/70 backdrop-blur rounded-5xl p-10 border border-white/60">
    <div class="grid md:grid-cols-4 gap-8">
      <div class="md:col-span-1">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 grid place-items-center text-white font-bold">A</div>
          <span class="font-['Space_Grotesk',sans-serif] font-bold text-lg">Aurora</span>
        </div>
        <p class="text-sm text-slate-500 mt-3 leading-relaxed">Open source · MIT · Built with love.</p>
      </div>
      <div class="text-sm space-y-2">
        <p class="font-semibold mb-2">Product</p>
        <a href="#" class="block text-slate-600 hover:text-slate-900">Features</a>
        <a href="#" class="block text-slate-600 hover:text-slate-900">Pricing</a>
      </div>
      <div class="text-sm space-y-2">
        <p class="font-semibold mb-2">Company</p>
        <a href="#" class="block text-slate-600 hover:text-slate-900">About</a>
        <a href="#" class="block text-slate-600 hover:text-slate-900">Blog</a>
      </div>
      <div class="text-sm space-y-2">
        <p class="font-semibold mb-2">Legal</p>
        <a href="#" class="block text-slate-600 hover:text-slate-900">Terms</a>
        <a href="#" class="block text-slate-600 hover:text-slate-900">Privacy</a>
      </div>
    </div>
    <div class="text-center text-xs text-slate-400 mt-8 pt-6 border-t border-slate-200/60">© 2025 Aurora · MIT</div>
  </div>
</footer>`,
  },
];

// Group templates by category for the UI.
export const TEMPLATE_CATEGORIES = [
  "hero",
  "features",
  "pricing",
  "testimonials",
  "faq",
  "cta",
  "gallery",
  "footer",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  hero: "Hero",
  features: "Features",
  pricing: "Pricing",
  testimonials: "Testimonials",
  faq: "FAQ",
  cta: "Call to Action",
  gallery: "Gallery",
  footer: "Footer",
};
