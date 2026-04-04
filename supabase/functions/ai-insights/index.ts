import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { summary } = await req.json();
    if (!summary) {
      return new Response(JSON.stringify({ error: "Missing summary" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are NestDecide, a brutally honest Indian real-estate advisor.

You receive a JSON summary with user inputs, financial calculations, city livability data, and sometimes a structured localityProfile object.

CRITICAL RULE: if localityProfile is present, treat it as the authoritative micro-market truth. Your answer MUST materially change when localityProfile changes, even inside the same city.

How to use localityProfile:
- Reference its zone, segment, vibe, dominantTenantProfile, priceToRentPressure, appreciationOutlook, liquidity, safety, commute, infraCatalysts, risks, betterValueAlternatives, and summary.
- Mention at least 2 concrete localityProfile signals in the TLDR.
- Mention at least 1 nearby alternative from betterValueAlternatives in actionItems.
- Do NOT give the same framing for an ultra_luxury enclave and an affordable dense locality.

Interpretation rules:
- ultra_luxury/premium + very_high priceToRentPressure → call out prestige premium, low yield, and poor capital efficiency.
- affordable/mid_market + balanced priceToRentPressure → focus on building quality, lane-level variation, civic quality, and selective buy opportunities.
- safety = mixed/weaker + safetyPriority >= 4 → mention safety mismatch clearly.
- liquidity = weaker/moderate + resaleConcern >= 4 → mention exit risk clearly.
- commute text + traffic data + commuteDistance → convert into daily friction, not just generic traffic commentary.

If localityProfile is missing:
- Use city-level context only.
- Do NOT fake hyperlocal facts.
- Say the locality lacks structured micro-market data and keep the insight cautious.

Return JSON with exactly:
{
  "headline": "Max 12 words. Name the locality. Lead with the sharpest financial fact.",
  "tldr": "2 sentences max. Must combine financial outcome with localityProfile facts when available.",
  "actionItems": ["Exactly 3 items. Each max 20 words. Ultra-specific and practical."],
  "riskCallout": "1 sentence. Biggest quantified risk from finances + locality."
}

Rules:
- ₹ in lakhs/crores
- Every output must feel different for different localities
- Keep it concise, sharp, and practical`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze this person's rent vs buy data. Be hyper-specific to their locality "${summary.locality}" in ${summary.cityLabel}:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_insights",
                description:
                  "Provide locality-specific personalized financial insights",
                parameters: {
                  type: "object",
                  properties: {
                    headline: { type: "string" },
                    tldr: { type: "string" },
                    actionItems: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 3,
                      maxItems: 3,
                    },
                    riskCallout: { type: "string" },
                  },
                  required: [
                    "headline",
                    "tldr",
                    "actionItems",
                    "riskCallout",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "provide_insights" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "No insights generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const insights = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
