// Seed the AgentMemory table with 10 demo memories spread across the
// past few days, so the timeline page has content to render.
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const userId = "local-user";
const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const memories = [
  { content: "Prefers ultra-rounded organic forms with 48px radii on cards", category: "layout", source: "harmony-keeper", ago: 7 * day },
  { content: "Likes indigo-violet-cyan gradient accents", category: "color", source: "harmony-keeper", ago: 7 * day },
  { content: "Dislikes cluttered hero sections", category: "layout", source: "harmony-keeper", ago: 6 * day },
  { content: "Prefers Inter body + Space Grotesk headings", category: "typography", source: "harmony-keeper", ago: 6 * day },
  { content: "Likes luminous orb motifs behind content", category: "color", source: "user", ago: 5 * day },
  { content: "Prefers generous whitespace and calm pacing", category: "layout", source: "harmony-keeper", ago: 4 * day },
  { content: "Wants subtle micro-animations only — never distracting", category: "tone", source: "harmony-keeper", ago: 4 * day },
  { content: "Dislikes lorem ipsum — write actual short copy", category: "content", source: "user", ago: 3 * day },
  { content: "Prefers pill-shaped CTAs over rectangular buttons", category: "layout", source: "harmony-keeper", ago: 2 * day },
  { content: "Likes at least one gradient accent in the hero", category: "color", source: "harmony-keeper", ago: 1 * day },
  { content: "Wants mobile-first responsive at 375px minimum", category: "layout", source: "user", ago: 12 * 60 * 60 * 1000 },
  { content: "Prefers semantic HTML with proper heading hierarchy", category: "content", source: "harmony-keeper", ago: 6 * 60 * 60 * 1000 },
];

async function main() {
  // Ensure the user exists.
  await db.user.upsert({
    where: { id: userId },
    update: { email: "founder@luminaforge.local", name: "Lumina Founder" },
    create: { id: userId, email: "founder@luminaforge.local", name: "Lumina Founder" },
  });

  // Clear existing demo memories (keep user-added ones).
  await db.agentMemory.deleteMany({ where: { userId, source: "harmony-keeper" } });

  for (const m of memories) {
    await db.agentMemory.create({
      data: {
        userId,
        content: m.content,
        category: m.category,
        source: m.source,
        createdAt: new Date(now - m.ago),
        updatedAt: new Date(now - m.ago),
      },
    });
  }

  console.log(`Seeded ${memories.length} demo memories`);
}

main().catch(console.error).finally(() => db.$disconnect());
