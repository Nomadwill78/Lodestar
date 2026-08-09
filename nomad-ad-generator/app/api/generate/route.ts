import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { clean, requireEnv } from "../../../lib/env";
import { generationLimit, type PlanId } from "../../../lib/plans";
import { PLACEMENTS } from "../../../lib/placements";

export const maxDuration = 60;

const STAGES: Record<string, string> = {
  TOF: "Top of funnel (cold audience). They have never heard of the brand. Lead with a pattern-interrupt hook, focus on the problem and curiosity — do not assume any brand awareness.",
  MOF: "Middle of funnel (warm retargeting). They know the brand but have not bought. Overcome objections, use social proof, highlight differentiation and benefits.",
  BOF: "Bottom of funnel (ready to buy). They have visited the site or added to cart. Create urgency, remove risk (guarantees, shipping, returns), and drive the final click.",
};

const VARIANT_SCHEMA = {
  type: "object",
  properties: {
    variants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          hook_style: { type: "string", description: "Short label for the hook/angle used, e.g. 'Problem-Agitate', 'Social Proof', 'Bold Claim'" },
          headline: { type: "string", description: "Meta ad headline, max 40 characters — this is the Feed placement headline" },
          primary_text: { type: "string", description: "Meta ad primary text, 60-180 words, line breaks allowed" },
          description: { type: "string", description: "Meta ad link description, max 30 words" },
          cta: { type: "string", description: "Recommended CTA button, e.g. 'Shop Now'" },
          placements: {
            type: "array",
            description: "The same hook rewritten as a standalone headline for each additional Meta placement, each fit to that placement's character budget — not a truncation of the Feed headline.",
            items: {
              type: "object",
              properties: {
                placement: { type: "string", enum: PLACEMENTS.map((p) => p.id) },
                headline: { type: "string" },
              },
              required: ["placement", "headline"],
              additionalProperties: false,
            },
          },
        },
        required: ["hook_style", "headline", "primary_text", "description", "cta", "placements"],
        additionalProperties: false,
      },
    },
  },
  required: ["variants"],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const product = typeof body?.product === "string" ? body.product.trim() : "";
  const audience = typeof body?.audience === "string" ? body.audience.trim() : "";
  const tone = typeof body?.tone === "string" ? body.tone.trim() : "Bold & punchy";
  const stage = typeof body?.stage === "string" && body.stage in STAGES ? body.stage : "TOF";

  if (!product) {
    return NextResponse.json({ error: "Describe your product or offer first." }, { status: 400 });
  }

  // Plan + monthly usage enforcement. This is a fast-fail pre-check only —
  // it saves a Claude call for the common case of someone clearly over
  // their limit, but it is NOT the source of truth, since a plain
  // count-then-later-insert has a race window between concurrent requests.
  // The real enforcement is create_generation_if_within_limit's atomic
  // check-and-insert after generation, below.
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = (profile?.plan ?? "free") as PlanId;
  const limit = generationLimit(plan);
  const limitMessage =
    plan === "free"
      ? `You've used all ${limit} free generations this month. Upgrade to keep generating.`
      : `You've hit your ${limit} generations for this month. Upgrade your plan for more.`;

  if (limit !== -1) {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString());

    if ((count ?? 0) >= limit) {
      return NextResponse.json({ error: limitMessage, upgrade: true }, { status: 402 });
    }
  }

  const anthropic = new Anthropic({ apiKey: requireEnv(process.env.ANTHROPIC_API_KEY, "ANTHROPIC_API_KEY") });

  const response = await anthropic.messages.create({
    model: clean(process.env.ANTHROPIC_MODEL) || "claude-opus-4-8",
    max_tokens: 4096,
    system:
      "You are a direct-response copywriter with $50M+ in profitable Meta ad spend across DTC and e-commerce brands. " +
      "You write scroll-stopping Facebook and Instagram ad copy that converts. Write like a human, never like AI. " +
      "No hashtags. Emojis only where they genuinely add punch. Every variant must take a genuinely different angle.",
    output_config: { format: { type: "json_schema", schema: VARIANT_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `Write 3 distinct Meta ad copy variants.\n\n` +
          `Product/offer: ${product}\n` +
          `Target audience: ${audience || "infer the most likely buyer from the product"}\n` +
          `Tone: ${tone}\n` +
          `Funnel stage: ${stage} — ${STAGES[stage]}\n\n` +
          `For each variant, also write a headline for each of these placements. Each is a fresh ` +
          `headline carrying the same hook and angle as the variant — not the Feed headline cut down ` +
          `to fit — because each placement has a different amount of room and a different reading context:\n` +
          PLACEMENTS.map((p) => `- ${p.id} (max ${p.maxLength} characters): ${p.helper}`).join("\n"),
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    return NextResponse.json({ error: "That request couldn't be processed. Try rewording your product description." }, { status: 400 });
  }

  const text = response.content.find((block) => block.type === "text")?.text ?? "";
  let variants;
  try {
    variants = JSON.parse(text).variants;
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 502 });
  }

  const { error: rpcError } = await supabase.rpc("create_generation_if_within_limit", {
    p_limit: limit,
    p_product: product,
    p_audience: audience,
    p_tone: tone,
    p_stage: stage,
    p_variants: variants,
  });

  if (rpcError) {
    // A concurrent request from the same user won the race between the
    // pre-check above and this atomic insert — the limit is real, so the
    // generation is not handed out even though Claude already produced it.
    if (rpcError.message.includes("generation_limit_reached")) {
      return NextResponse.json({ error: limitMessage, upgrade: true }, { status: 402 });
    }
    console.error("Failed to save generation:", rpcError.message);
  }

  return NextResponse.json({ variants });
}
