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

    const systemPrompt = `You are NestDecide, a brutally honest Indian real-estate advisor who knows every Indian locality intimately — micro-markets, street-level trends, upcoming infrastructure, rental dynamics, appreciation patterns, builder reputations, and livability quirks.

You receive a JSON summary with: user inputs (city, locality, income, profile, lifestyle prefs), financial calculations, AND city livability data.

LOCALITY ACCURACY IS YOUR #1 PRIORITY:
- When locality is specified, you MUST demonstrate DEEP knowledge of that specific area. Reference:
  • Current price-per-sqft trends in that locality vs nearby alternatives
  • Upcoming/recent infrastructure (metro lines, flyovers, IT parks, ring roads)
  • Whether the locality is appreciating, stagnating, or overbuilt
  • Rental market dynamics specific to that area (demand, vacancy, tenant profiles)
  • Nearby alternative localities that offer better value
  • Known issues: waterlogging, water supply, traffic bottlenecks, noise
- Example: For "HSR Layout, Bengaluru" — mention Outer Ring Road proximity, startup ecosystem, upcoming metro phase, comparison with BTM/Koramangala pricing
- Example: For "Powai, Mumbai" — mention Hiranandani premium, lake-adjacent AQI, IIT proximity, JVLR traffic

LIFESTYLE-FINANCIAL CROSS-REFERENCES:
- commuteDistance + city traffic data → actual daily time & fuel cost impact
- safetyPriority + city crime grade + locality reputation → security cost/peace-of-mind factor
- userProfile + locality culture → bachelor nightlife access, family school zones, retired healthcare proximity
- propertyType + locality character → villa in an apartment-dominant area = liquidity risk

OUTPUT FORMAT — Keep it CONCISE. Users are overwhelmed by data. Be sharp, not exhaustive.

Return JSON with exactly:
{
  "headline": "Max 12 words. Name the locality. Lead with the sharpest financial fact.",
  "tldr": "2 sentences max. The single most important thing they need to know, combining their financial situation with locality context. Make it feel like advice from a local who's done the math.",
  "actionItems": ["Exactly 3 items. Each max 20 words. Ultra-specific: name localities, ₹ amounts, timelines. At least 1 must suggest a nearby alternative locality."],
  "riskCallout": "1 sentence. Their single biggest risk combining financial + locality factors. Quantify it."
}

Rules:
- ₹ in lakhs/crores (₹18.5L, ₹1.2Cr)
- NEVER be generic. Every sentence should reference THEIR locality, numbers, or profile
- If locality = "not specified", use city-level knowledge and suggest specific localities to explore
- Tone: confident, direct, warm — a friend who lives nearby and knows finance`;

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
