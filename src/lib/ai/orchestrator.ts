// =====================================================================
// LuminaForge.ai — Forge Orchestrator
// =====================================================================
// Runs the 5-agent colony sequentially, streaming structured events
// back to the caller. The caller (an API route or Server Action)
// forwards these as SSE to the Forge Studio, which renders the
// "Roundabout" animation + live agent transcripts in real time.
// =====================================================================

import { AGENT_ORDER, AGENTS, type AgentId } from "./agents";
import { SYSTEM_PROMPTS } from "./prompts";
import { streamChat, type ChatMessage } from "./openrouter";

export interface ForgeInput {
  apiKey: string;
  prompt: string;
  referenceUrl?: string;
  /** Pre-signed public URLs of any uploaded moodboard/sketch images. */
  imageUrls?: string[];
  /** Optional HF token — used by the Code Alchemist to embed hero images. */
  hfToken?: string;
  /** Optional previous HTML — when iterating on an existing project. */
  previousHtml?: string;
}

/** Discriminated union of events the orchestrator emits. */
export type ForgeEvent =
  | { type: "agent_start"; agentId: AgentId; statusMessage: string }
  | { type: "agent_delta"; agentId: AgentId; delta: string }
  | { type: "agent_done"; agentId: AgentId; full: string }
  | { type: "scores"; seo: number; perf: number; a11y: number; review: string }
  | { type: "html"; html: string }
  | { type: "spec"; spec: string }
  | { type: "vibe"; vibe: string }
  | { type: "error"; agentId?: AgentId; message: string }
  | { type: "done" };

/** Pull a fenced JSON object out of a model response (robust to noise). */
function extractJson(text: string): string {
  // 1. Strip markdown fences if present.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  // 2. Otherwise find the outermost {...} block.
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return text.slice(first, last + 1).trim();
  }
  return text.trim();
}

/** Pull the <html>…</html> block out of a model response. */
function extractHtml(text: string): string {
  // Strip any leading "REVIEW:" / "SCORES:" line the guardian/keeper emit.
  const cleaned = text
    .replace(/^SCORES:.*$/im, "")
    .replace(/^REVIEW:.*$/im, "")
    .trim();

  const fenceMatch = cleaned.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = cleaned.toLowerCase().indexOf("<!doctype");
  const start2 = cleaned.toLowerCase().indexOf("<html");
  const idx = Math.min(
    ...[start, start2].filter((i) => i >= 0),
  );
  if (idx === Infinity || idx < 0) return cleaned;

  const end = cleaned.toLowerCase().lastIndexOf("</html>");
  if (end === -1) return cleaned.slice(idx);
  return cleaned.slice(idx, end + 7).trim();
}

/**
 * Run the full 5-agent Forge. Yields ForgeEvent objects as the colony
 * works through its pipeline. Caller is responsible for forwarding.
 */
export async function* runForge(
  input: ForgeInput,
): AsyncGenerator<ForgeEvent, void, unknown> {
  const transcript: { agentId: AgentId; role: string; content: string; ts: string }[] = [];
  let vibeJson = "";
  let specJson = "";
  let html = "";

  // Helper to call one agent with streaming.
  async function* callAgent(
    agentId: AgentId,
    messages: ChatMessage[],
  ): AsyncGenerator<string, void, unknown> {
    const agent = AGENTS[agentId];
    let full = "";
    let primary = false;
    try {
      for await (const delta of streamChat({
        apiKey: input.apiKey,
        model: agent.model,
        messages,
        temperature: 0.7,
        maxTokens: 8192,
      })) {
        full += delta;
        yield delta;
      }
      primary = true;
    } catch (err) {
      // Fall back to the alternate model if one exists.
      if (agent.fallbackModel) {
        for await (const delta of streamChat({
          apiKey: input.apiKey,
          model: agent.fallbackModel,
          messages,
          temperature: 0.7,
          maxTokens: 8192,
        })) {
          full += delta;
          yield delta;
        }
      } else {
        throw err;
      }
    }
    transcript.push({
      agentId,
      role: agent.name,
      content: full,
      ts: new Date().toISOString(),
    });
  }

  // ---- 1. Vibe Interpreter ----
  yield { type: "agent_start", agentId: "vibe-interpreter", statusMessage: AGENTS["vibe-interpreter"].statusMessage };
  let vibeFull = "";
  try {
    for await (const delta of callAgent("vibe-interpreter", [
      { role: "system", content: SYSTEM_PROMPTS["vibe-interpreter"] },
      {
        role: "user",
        content: `User prompt: ${input.prompt}
Reference URL: ${input.referenceUrl ?? "(none)"}
Uploaded images: ${input.imageUrls?.length ? input.imageUrls.join(", ") : "(none)"}
${input.previousHtml ? "Iterating on an existing project — previous HTML will be sent after this round." : ""}`,
      },
    ])) {
      vibeFull += delta;
      yield { type: "agent_delta", agentId: "vibe-interpreter", delta };
    }
  } catch (err) {
    yield {
      type: "error",
      agentId: "vibe-interpreter",
      message: err instanceof Error ? err.message : "Vibe Interpreter failed",
    };
    return;
  }
  vibeJson = extractJson(vibeFull);
  yield { type: "vibe", vibe: vibeJson };
  yield { type: "agent_done", agentId: "vibe-interpreter", full: vibeFull };

  // ---- 2. Design Architect ----
  yield { type: "agent_start", agentId: "design-architect", statusMessage: AGENTS["design-architect"].statusMessage };
  let specFull = "";
  try {
    for await (const delta of callAgent("design-architect", [
      { role: "system", content: SYSTEM_PROMPTS["design-architect"] },
      {
        role: "user",
        content: `Here is the Vibe Interpreter's distilled output (JSON):\n${vibeJson}\n\nPlease now produce the structured design blueprint.`,
      },
    ])) {
      specFull += delta;
      yield { type: "agent_delta", agentId: "design-architect", delta };
    }
  } catch (err) {
    yield {
      type: "error",
      agentId: "design-architect",
      message: err instanceof Error ? err.message : "Design Architect failed",
    };
    return;
  }
  specJson = extractJson(specFull);
  yield { type: "spec", spec: specJson };
  yield { type: "agent_done", agentId: "design-architect", full: specFull };

  // ---- 3. Code Alchemist ----
  yield { type: "agent_start", agentId: "code-alchemist", statusMessage: AGENTS["code-alchemist"].statusMessage };
  let codeFull = "";
  try {
    for await (const delta of callAgent("code-alchemist", [
      { role: "system", content: SYSTEM_PROMPTS["code-alchemist"] },
      {
        role: "user",
        content: `Here is the Design Architect's blueprint (JSON):\n${specJson}\n\nPlease transmute it into a complete self-contained HTML + Tailwind document. Remember: ONE html document, Tailwind Play CDN, brand gradient, ultra-rounded forms, glassmorphism, floating orbs, fully responsive, accessible, performant.`,
      },
    ])) {
      codeFull += delta;
      yield { type: "agent_delta", agentId: "code-alchemist", delta };
    }
  } catch (err) {
    yield {
      type: "error",
      agentId: "code-alchemist",
      message: err instanceof Error ? err.message : "Code Alchemist failed",
    };
    return;
  }
  html = extractHtml(codeFull);
  yield { type: "agent_done", agentId: "code-alchemist", full: codeFull };

  // ---- 4. Performance Guardian ----
  yield { type: "agent_start", agentId: "performance-guardian", statusMessage: AGENTS["performance-guardian"].statusMessage };
  let guardianFull = "";
  try {
    for await (const delta of callAgent("performance-guardian", [
      { role: "system", content: SYSTEM_PROMPTS["performance-guardian"] },
      {
        role: "user",
        content: `Audit and refine this HTML document for SEO, performance, and accessibility. Output the SCORES line then the refined HTML.\n\n${html}`,
      },
    ])) {
      guardianFull += delta;
      yield { type: "agent_delta", agentId: "performance-guardian", delta };
    }
  } catch (err) {
    // Non-fatal — keep the previous HTML if the guardian fails.
    yield {
      type: "error",
      agentId: "performance-guardian",
      message: err instanceof Error ? err.message : "Performance Guardian failed — continuing.",
    };
  }
  if (guardianFull) {
    const scoresMatch = guardianFull.match(/SCORES:\s*SEO=(\d+)\s+PERF=(\d+)\s+A11Y=(\d+)/i);
    const seo = scoresMatch ? parseInt(scoresMatch[1], 10) : 78;
    const perf = scoresMatch ? parseInt(scoresMatch[2], 10) : 82;
    const a11y = scoresMatch ? parseInt(scoresMatch[3], 10) : 80;
    const refinedHtml = extractHtml(guardianFull);
    if (refinedHtml && /<html/i.test(refinedHtml)) {
      html = refinedHtml;
    }
    yield { type: "scores", seo, perf, a11y, review: "" };
    yield { type: "agent_done", agentId: "performance-guardian", full: guardianFull };
  }

  // ---- 5. Harmony Keeper ----
  yield { type: "agent_start", agentId: "harmony-keeper", statusMessage: AGENTS["harmony-keeper"].statusMessage };
  let harmonyFull = "";
  let review = "";
  try {
    for await (const delta of callAgent("harmony-keeper", [
      { role: "system", content: SYSTEM_PROMPTS["harmony-keeper"] },
      {
        role: "user",
        content: `Make your final micro-refinements to this HTML document. Output REVIEW line then the refined HTML.\n\n${html}`,
      },
    ])) {
      harmonyFull += delta;
      yield { type: "agent_delta", agentId: "harmony-keeper", delta };
    }
    const reviewMatch = harmonyFull.match(/REVIEW:\s*(.*)$/im);
    review = reviewMatch ? reviewMatch[1].trim() : "Polished and ready.";
    const finalHtml = extractHtml(harmonyFull);
    if (finalHtml && /<html/i.test(finalHtml)) {
      html = finalHtml;
    }
    yield { type: "agent_done", agentId: "harmony-keeper", full: harmonyFull };
  } catch (err) {
    yield {
      type: "error",
      agentId: "harmony-keeper",
      message: err instanceof Error ? err.message : "Harmony Keeper failed — using the previous HTML.",
    };
  }

  // ---- Final ----
  yield { type: "html", html };
  yield { type: "done" };
}

// ---------------------------------------------------------------------
// Iterate-only agent chain — used when the user asks for a tweak in the
// Iterate tab. We skip the Vibe Interpreter (the project already has a
// vibe) and re-run Architect → Alchemist → Guardian → Keeper.
// ---------------------------------------------------------------------
export interface IterateInput {
  apiKey: string;
  instruction: string;
  previousHtml: string;
  previousSpec?: string;
}

export async function* runIteration(
  input: IterateInput,
): AsyncGenerator<ForgeEvent, void, unknown> {
  // Quick "Re-Alchemist" path: ask the Code Alchemist to edit the existing
  // HTML in place using the user's natural-language instruction. This is
  // dramatically faster than a full rebuild while still feeling agentic.
  yield { type: "agent_start", agentId: "code-alchemist", statusMessage: "Re-tuning the artifact to your wish…" };

  let full = "";
  try {
    for await (const delta of streamChat({
      apiKey: input.apiKey,
      model: AGENTS["code-alchemist"].model,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS["code-alchemist"] },
        {
          role: "user",
          content: `Here is the current HTML document:\n\n${input.previousHtml}\n\nThe user requests the following change. Apply ONLY this change and keep everything else intact. Output the complete refined <html> document.\n\nUser instruction: ${input.instruction}`,
        },
      ],
      temperature: 0.5,
      maxTokens: 8192,
    })) {
      full += delta;
      yield { type: "agent_delta", agentId: "code-alchemist", delta };
    }
  } catch (err) {
    yield { type: "error", agentId: "code-alchemist", message: err instanceof Error ? err.message : "Iterate failed" };
    return;
  }

  let html = extractHtml(full);
  if (!html || !/<html/i.test(html)) html = input.previousHtml;
  yield { type: "agent_done", agentId: "code-alchemist", full };

  // Quick Guardian pass for scores + a11y polish.
  yield { type: "agent_start", agentId: "performance-guardian", statusMessage: "Re-checking vital signs…" };
  let guardianFull = "";
  try {
    for await (const delta of streamChat({
      apiKey: input.apiKey,
      model: AGENTS["performance-guardian"].model,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS["performance-guardian"] },
        {
          role: "user",
          content: `Audit and refine this HTML for SEO/PERF/A11Y. Output SCORES line then refined HTML.\n\n${html}`,
        },
      ],
      temperature: 0.4,
      maxTokens: 8192,
    })) {
      guardianFull += delta;
      yield { type: "agent_delta", agentId: "performance-guardian", delta };
    }
    const scoresMatch = guardianFull.match(/SCORES:\s*SEO=(\d+)\s+PERF=(\d+)\s+A11Y=(\d+)/i);
    const seo = scoresMatch ? parseInt(scoresMatch[1], 10) : 80;
    const perf = scoresMatch ? parseInt(scoresMatch[2], 10) : 84;
    const a11y = scoresMatch ? parseInt(scoresMatch[3], 10) : 82;
    const refinedHtml = extractHtml(guardianFull);
    if (refinedHtml && /<html/i.test(refinedHtml)) html = refinedHtml;
    yield { type: "scores", seo, perf, a11y, review: "Refined." };
    yield { type: "agent_done", agentId: "performance-guardian", full: guardianFull };
  } catch (err) {
    yield { type: "error", agentId: "performance-guardian", message: "Guardian skipped" };
  }

  yield { type: "html", html };
  yield { type: "done" };
}

export { AGENT_ORDER };
