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

    const systemPrompt = `You are NestDecide, a brutally honest Indian real-estate financial advisor.
You receive a comprehensive JSON summary of a Rent vs Buy financial comparison for an Indian user — including ALL their inputs (income, savings, property price, loan details, city, profile, lifestyle preferences) AND all calculated outputs (EMI burden, net worth projections, stress test, location intelligence, milestones).

Your job: synthesize this rich data into sharp, personalized insights that feel like a financially savvy friend analyzed their EXACT situation — not generic advice.

Return a JSON object with exactly these fields:
{
  "headline": "One punchy sentence (max 15 words). Reference their specific situation — city, profile, or a striking number.",
  "narrative": "3-4 sentences explaining WHY. Weave together multiple data points: EMI burden vs income, rent escalation vs appreciation, freedom money gap, stress test risk, location factors. Be specific — cite ₹ amounts, percentages, years. Speak conversationally but with authority.",
  "surprises": ["2-3 genuinely counter-intuitive or non-obvious findings. Cross-reference different data points to surface hidden patterns. E.g. compare rent trap year vs break-even, or freedom money vs opportunity cost. Each max 25 words."],
  "actionItems": ["3-4 hyper-specific next steps. Reference their exact numbers — down payment amount, EMI, savings runway. Suggest specific strategies: prepayment amounts, SIP amounts for the difference, negotiation targets based on rental yield verdict. Be concrete with timelines."],
  "riskCallout": "2 sentences about their biggest risk. Use stress test data (rate hike impact), emergency runway, or liquidity risk. Quantify the risk — 'If rates rise 2%, your EMI jumps to ₹X (Y% of income)' or 'Your savings cover only Z months of EMI'."
}

Rules:
- Use ₹ and lakhs/crores notation (e.g., ₹18.5L, ₹1.2Cr)
- Be direct, opinionated, and specific to THEIR numbers — never generic
- Cross-reference data points: don't just repeat individual metrics, synthesize them
- If EMI burden >45%, be alarming. If >60%, be very alarming.
- If emergency runway <6 months, flag it prominently
- If they're a bachelor, mention flexibility + rental discrimination tradeoff
- If rental yield verdict is "overpriced", tell them the property is overvalued
- If planned stay < break-even year, emphasize this mismatch strongly
- Reference their city, locality (if provided), profile, and property type
- Mention wealth milestones when relevant (e.g., "Renting gets you to ₹1Cr 3 years faster")
- Tone: smart, warm, slightly cheeky — like a financially savvy friend who's done the math`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze this person's complete rent vs buy data and give personalized insights:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_insights",
                description:
                  "Provide personalized financial insights based on rent vs buy analysis",
                parameters: {
                  type: "object",
                  properties: {
                    headline: { type: "string" },
                    narrative: { type: "string" },
                    surprises: {
                      type: "array",
                      items: { type: "string" },
                    },
                    actionItems: {
                      type: "array",
                      items: { type: "string" },
                    },
                    riskCallout: { type: "string" },
                  },
                  required: [
                    "headline",
                    "narrative",
                    "surprises",
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
