// Quick script: insert a demo project with sample HTML so the My Forges
// dashboard and Code tab can be exercised without a real OpenRouter call.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aurora — Open Source Database</title>
  <meta name="description" content="A bold, futuristic launch page for an open-source database startup." />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: { lumina: { indigo: '#6366F1', violet: '#8B5CF6', cyan: '#22D3EE', ink: '#0F172A' } },
          borderRadius: { soft: '28px', organic: '36px' },
          boxShadow: { 'orb': '0 8px 32px -4px rgba(99,102,241,0.35), 0 18px 64px -12px rgba(139,92,246,0.30), 0 32px 96px -20px rgba(34,211,238,0.22)' },
        },
      },
    };
  </script>
  <style>
    @keyframes lf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
    .animate-float { animation: lf-float 7s ease-in-out infinite; }
  </style>
</head>
<body class="bg-[#F8FAFC] text-[#0F172A] font-['Inter',system-ui,sans-serif]">
  <header class="px-6 py-5">
    <nav class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 grid place-items-center text-white font-bold shadow-orb">A</div>
        <span class="font-['Space_Grotesk',sans-serif] font-bold text-xl tracking-tight">Aurora</span>
      </div>
      <div class="hidden md:flex gap-7 text-sm text-slate-600">
        <a href="#features" class="hover:text-slate-900">Features</a>
        <a href="#pricing" class="hover:text-slate-900">Pricing</a>
        <a href="#docs" class="hover:text-slate-900">Docs</a>
        <a href="#github" class="hover:text-slate-900">GitHub</a>
      </div>
      <button class="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white text-sm font-medium shadow-orb hover:scale-105 transition-transform">Get Started</button>
    </nav>
  </header>

  <main>
    <section class="relative px-6 pt-20 pb-32 overflow-hidden">
      <div class="absolute top-[-180px] left-[-200px] w-[480px] h-[480px] rounded-full opacity-50" style="background: radial-gradient(circle, #8B5CF6 0%, transparent 70%); filter: blur(40px);"></div>
      <div class="absolute bottom-[-160px] right-[-120px] w-[420px] h-[420px] rounded-full opacity-40 animate-float" style="background: radial-gradient(circle, #22D3EE 0%, transparent 70%); filter: blur(40px);"></div>
      <div class="relative max-w-4xl mx-auto text-center space-y-7">
        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-white/60 text-xs text-slate-700 font-medium">✦ Open source · MIT · v1.0</span>
        <h1 class="font-['Space_Grotesk',sans-serif] font-extrabold text-5xl md:text-7xl leading-[1.05] tracking-tight text-balance">
          The database that
          <span class="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">thinks in queries</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto text-pretty leading-relaxed">
          Aurora is the open-source database built for AI-native workloads. Edge-fast, ACID-safe, and free to self-host. Ship faster with a query planner that learns.
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <button class="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white font-medium shadow-orb hover:scale-105 transition-transform">Get Started — Free</button>
          <button class="px-8 py-4 rounded-full bg-white/70 backdrop-blur border border-white/60 text-slate-800 font-medium hover:border-violet-300 transition-colors">View on GitHub</button>
        </div>
      </div>
    </section>

    <section id="features" class="px-6 py-24">
      <div class="max-w-7xl mx-auto">
        <h2 class="font-['Space_Grotesk',sans-serif] font-extrabold text-4xl md:text-5xl text-center mb-16 tracking-tight">
          Built for the <span class="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">AI era</span>
        </h2>
        <div class="grid md:grid-cols-3 gap-6">
          <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60 hover:-translate-y-1 hover:shadow-orb transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 grid place-items-center text-white mb-5 shadow-orb">⚡</div>
            <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Edge-native</h3>
            <p class="text-slate-600 leading-relaxed">Reads in 4ms at the edge. Writes are WAL-replicated to 14 regions automatically.</p>
          </article>
          <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60 hover:-translate-y-1 hover:shadow-orb transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-500 grid place-items-center text-white mb-5 shadow-orb">◆</div>
            <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Adaptive Planner</h3>
            <p class="text-slate-600 leading-relaxed">A query planner that learns from your workload. Slow queries melt away overnight.</p>
          </article>
          <article class="bg-white/70 backdrop-blur p-8 rounded-4xl border border-white/60 hover:-translate-y-1 hover:shadow-orb transition-all duration-300">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white mb-5 shadow-orb">▲</div>
            <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-xl mb-2">Open Source</h3>
            <p class="text-slate-600 leading-relaxed">MIT licensed. No vendor lock-in. Self-host on a single binary or use our free cloud tier.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="pricing" class="px-6 py-24">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="font-['Space_Grotesk',sans-serif] font-extrabold text-4xl md:text-5xl mb-16 tracking-tight">
          Free, forever
        </h2>
        <div class="bg-white/70 backdrop-blur p-10 rounded-4xl border border-white/60 shadow-orb">
          <h3 class="font-['Space_Grotesk',sans-serif] font-bold text-2xl mb-2">Open Source</h3>
          <div class="flex items-baseline justify-center gap-2 mb-1">
            <span class="font-['Space_Grotesk',sans-serif] text-5xl font-extrabold">$0</span>
            <span class="text-slate-500">forever</span>
          </div>
          <p class="text-slate-600 mb-6">Self-host with a single binary. Or use our cloud — free up to 5GB.</p>
          <ul class="space-y-2 text-left max-w-sm mx-auto mb-8">
            <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Unlimited databases</li>
            <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Edge replication</li>
            <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Adaptive query planner</li>
            <li class="flex items-start gap-2"><span class="text-emerald-500">✓</span> Community support</li>
          </ul>
          <button class="w-full px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 text-white font-medium shadow-orb hover:scale-105 transition-transform">Get Started</button>
        </div>
      </div>
    </section>

    <section class="px-6 py-24">
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <h2 class="font-['Space_Grotesk',sans-serif] font-extrabold text-3xl md:text-4xl tracking-tight">
          Ready to ship faster?
        </h2>
        <p class="text-slate-600 text-lg">Clone the repo, run one command, and you're live.</p>
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-slate-900 text-white font-mono text-sm">
          <span class="text-emerald-400">$</span> curl -sSL aurora.dev/install | sh
        </div>
      </div>
    </section>
  </main>

  <footer class="px-6 py-10 border-t border-slate-200/60">
    <div class="max-w-7xl mx-auto text-center text-sm text-slate-500">
      <p>© 2025 Aurora Database · Open source · MIT</p>
    </div>
  </footer>
</body>
</html>`;

async function main() {
  // Ensure the local user exists.
  await db.user.upsert({
    where: { id: "local-user" },
    update: { email: "founder@luminaforge.local", name: "Lumina Founder" },
    create: { id: "local-user", email: "founder@luminaforge.local", name: "Lumina Founder" },
  });

  // Upsert a demo project.
  const project = await db.project.upsert({
    where: { id: "demo-aurora-project" },
    update: {
      name: "Aurora — Open Source DB",
      currentHtml: SAMPLE_HTML,
      lastPrompt: "A bold, futuristic launch page for an open-source database startup with deep indigo gradients and luminous orb motifs",
      lastRefUrl: "https://supabase.com",
      vibeTags: "Futuristic,Bold & Brave,Techy",
      seoScore: 88,
      perfScore: 92,
      a11yScore: 84,
    },
    create: {
      id: "demo-aurora-project",
      userId: "local-user",
      name: "Aurora — Open Source DB",
      currentHtml: SAMPLE_HTML,
      lastPrompt: "A bold, futuristic launch page for an open-source database startup with deep indigo gradients and luminous orb motifs",
      lastRefUrl: "https://supabase.com",
      vibeTags: "Futuristic,Bold & Brave,Techy",
      seoScore: 88,
      perfScore: 92,
      a11yScore: 84,
    },
  });

  // Add a generation row.
  const existing = await db.generation.count({ where: { projectId: project.id } });
  if (existing === 0) {
    await db.generation.create({
      data: {
        projectId: project.id,
        prompt: project.lastPrompt ?? "",
        html: SAMPLE_HTML,
        spec: JSON.stringify({ siteName: "Aurora" }),
        transcript: JSON.stringify({}),
        version: 1,
        seoScore: 88,
        perfScore: 92,
        a11yScore: 84,
      },
    });
  }

  console.log("Demo project created:", project.id);
}

main().catch(console.error).finally(() => db.$disconnect());
