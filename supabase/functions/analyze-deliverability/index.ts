import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "npm:ai";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  subject: z.string().min(1).max(300),
  preheader: z.string().max(300).optional(),
  body: z.string().min(1).max(20000),
  fromName: z.string().max(200).optional(),
  fromDomain: z.string().max(253).optional(),
  domainAge: z.string().max(100).optional(),
  audienceSource: z.string().max(300).optional(),
  monthlyVolume: z.string().max(100).optional(),
  authStatus: z.string().max(300).optional(),
  bounceRate: z.string().max(50).optional(),
  complaintRate: z.string().max(50).optional(),
  openRate: z.string().max(50).optional(),
  blacklisted: z.string().max(300).optional(),
});

const ResultSchema = z.object({
  overallRisk: z.enum(["low", "medium", "high", "critical"]),
  riskScore: z.number(),
  summary: z.string(),
  inboxPlacementOutlook: z.string(),
  risks: z.array(
    z.object({
      title: z.string(),
      area: z.enum(["content", "authentication", "reputation", "list", "sending"]),
      severity: z.enum(["low", "medium", "high"]),
      why: z.string(),
      fix: z.string(),
    }),
  ),
  spamTriggerPhrases: z.array(z.string()),
  subjectLineFeedback: z.string(),
  quickWins: z.array(z.string()),
  rewrittenSubject: z.string(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI is not configured for this project." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const input = parsed.data;

    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const prompt = `Assess the spam/deliverability risk of this email BEFORE it is sent.

SENDER REPUTATION DETAILS
From name: ${input.fromName || "not provided"}
Sending domain: ${input.fromDomain || "not provided"}
Domain age: ${input.domainAge || "not provided"}
SPF/DKIM/DMARC status: ${input.authStatus || "not provided"}
Blacklist status: ${input.blacklisted || "not provided"}
Monthly sending volume: ${input.monthlyVolume || "not provided"}
How the list was built: ${input.audienceSource || "not provided"}
Recent bounce rate: ${input.bounceRate || "not provided"}
Recent spam complaint rate: ${input.complaintRate || "not provided"}
Recent open rate: ${input.openRate || "not provided"}

EMAIL CONTENT
Subject: ${input.subject}
Preheader: ${input.preheader || "not provided"}
Body:
${input.body}

Rules for your answer:
- riskScore is 0-100 where 100 is certain spam folder placement; keep it consistent with overallRisk.
- List at most 8 risks, ordered most damaging first. Each fix must be a concrete action this sender can take today.
- spamTriggerPhrases must quote actual words or phrases from the subject, preheader or body; use an empty list if there are none.
- quickWins: at most 5 short imperative items.
- rewrittenSubject: one improved subject line under 60 characters.
- Judge authentication, domain reputation and list quality as heavily as content wording.`;

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system:
        "You are a senior email deliverability consultant. You explain spam-filter risk in plain, specific language and never invent data that was not provided.",
      prompt,
      output: Output.object({ schema: ResultSchema }),
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

    const output = await result.output;

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("analyze-deliverability: model output did not match schema", error.text);
      return new Response(
        JSON.stringify({ error: "The analysis came back in an unexpected format. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("analyze-deliverability failed:", message);
    const status = /rate limit|429/i.test(message) ? 429 : /credit|402/i.test(message) ? 402 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
