import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const RequestSchema = z.object({
  domain: z.string().min(1).max(253),
  domainAge: z.string().max(100),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(20000),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1).max(365),
        volume: z.number().min(0),
        actualVolume: z.number().nullable().optional(),
        bounceRate: z.number().nullable().optional(),
        complaintRate: z.number().nullable().optional(),
      }),
    )
    .min(1)
    .max(21),
});

const ResultSchema = z.object({
  summary: z.string(),
  contentRisks: z.array(z.string()),
  spamTriggerPhrases: z.array(z.string()),
  days: z.array(
    z.object({
      day: z.number(),
      risk: z.enum(["low", "medium", "high", "critical"]),
      riskScore: z.number(),
      reason: z.string(),
      advice: z.string(),
    }),
  ),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured for this project." }, 500);

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const input = parsed.data;

    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const dayLines = input.days
      .map(
        (d) =>
          `Day ${d.day}: planned ${d.volume} emails` +
          (d.actualVolume != null ? `, actually sent ${d.actualVolume}` : "") +
          (d.bounceRate != null ? `, bounce ${d.bounceRate}%` : "") +
          (d.complaintRate != null ? `, complaints ${d.complaintRate}%` : ""),
      )
      .join("\n");

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system:
        "You are a senior email deliverability consultant specialising in domain warmup. Be specific and plain-spoken, never invent data. Reply with JSON only — no prose, no markdown fences.",
      prompt: `Review this warmup email and estimate its spam risk on each warmup day, combining the content with that day's volume and any logged results.

Domain: ${input.domain}
Domain age at start: ${input.domainAge}

WARMUP SCHEDULE
${dayLines}

EMAIL CONTENT
Subject: ${input.subject}
Body:
${input.body}

Rules:
- Return exactly one entry in "days" per schedule day above, same day numbers, same order.
- riskScore 0-100 (100 = certain spam folder), consistent with risk.
- reason and advice: one sentence each, specific to that day's volume/results and the content.
- contentRisks: at most 5 short items. spamTriggerPhrases must quote words actually in the subject/body (empty list if none).

Reply with ONLY this JSON shape:
{"summary": string, "contentRisks": [string], "spamTriggerPhrases": [string], "days": [{"day": number, "risk": "low"|"medium"|"high"|"critical", "riskScore": number, "reason": string, "advice": string}]}`,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const text = await result.text;
    let data: unknown;
    try {
      data = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    } catch {
      console.error("analyze-warmup: parse failed", text.slice(0, 500));
      return json({ error: "The review came back in an unexpected format. Please try again." }, 502);
    }
    const validated = ResultSchema.safeParse(data);
    if (!validated.success) {
      console.error("analyze-warmup: bad shape", validated.error.message);
      return json({ error: "The review came back incomplete. Please try again." }, 502);
    }
    return json(validated.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("analyze-warmup failed:", message);
    const status = /rate limit|429/i.test(message) ? 429 : /credit|402/i.test(message) ? 402 : 500;
    return json({ error: message }, status);
  }
});
