// =====================================================================
// LuminaForge.ai — Marketing Homepage (/)
// =====================================================================
// The hero of the entire app. Floating orbs, gradient headline, the
// "roundabout" process, agent showcase, example gallery, testimonials,
// pricing, FAQ. Every CTA routes to /forge.
// =====================================================================

import { MarketingNav, MarketingFooter } from "@/components/lumina/marketing-shell";
import { Hero } from "@/components/lumina/hero";
import {
  ProcessSection,
  AgentsSection,
  ExamplesSection,
  TestimonialsSection,
  PricingSection,
  FaqSection,
} from "@/components/lumina/sections";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <ProcessSection />
        <AgentsSection />
        <ExamplesSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
