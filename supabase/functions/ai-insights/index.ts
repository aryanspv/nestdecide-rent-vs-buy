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

    const systemPrompt = `You are NestDecide, a brutally honest Indian real-estate financial advisor who knows Indian cities intimately.
You receive a comprehensive JSON summary of a Rent vs Buy financial comparison for an Indian user — including ALL their inputs (income, savings, property price, loan details, city, locality, profile, lifestyle preferences), calculated outputs, AND city-level livability data (crime, traffic, AQI, bachelor-friendliness).

Your job: synthesize this into sharp, HYPER-PERSONALIZED insights. Not generic advice — insights that could ONLY apply to THIS person in THIS locality.

CRITICAL LOCALITY & LIFESTYLE RULES:
- If "locality" is specified (not "not specified"), you MUST reference it by name and weave in locality-specific context (e.g., "In Koramangala, you're paying...", "Whitefield's traffic congestion means..."). Use your knowledge of Indian localities — rental markets, appreciation trends, infrastructure, connectivity, upcoming metro lines, IT corridors, etc.
- Use the cityLivability data: mention AQI if poor/very poor, crime grade if C/D, traffic congestion for commute analysis, bachelor discrimination if relevant.
- For commuteDistance: calculate approximate daily commute cost and time impact. Reference the city's congestion index and peak hour delays.
- For safetyPriority (1-5): if high (4-5), factor in the city's crime data and whether the locality is known to be safer/riskier.
- For resaleConcern (1-5): if high (4-5), tie it to the liquidity risk data and property type.
- For userProfile: bachelor → mention rental discrimination (use bachelorInsight data), nightlife/flexibility; couple → dual income dynamics; family → school proximity, stability; retired → healthcare, peace.
- For propertyType & furnishing: factor into maintenance costs, resale liquidity, and lifestyle fit.

Return a JSON object with exactly these fields:
{
  "headline": "One punchy sentence (max 15 words). Reference their specific locality/city and a striking number.",
  "narrative": "3-4 sentences. Weave together locality context, lifestyle factors, AND financial data. Mention specific locality characteristics (infrastructure, market trends, livability). Cite ₹ amounts, percentages, years. If locality is specified, at least 1 sentence must be locality-specific.",
  "surprises": ["2-3 genuinely counter-intuitive findings that cross-reference locality/lifestyle with financial data. E.g., 'Your Xkm commute from [locality] costs ₹Y/month — that is Z% of your rent savings from not buying.' Each max 30 words."],
  "actionItems": ["3-4 hyper-specific next steps. At least one must reference their locality (e.g., 'Check upcoming metro connectivity in [locality]', 'Compare prices in nearby [alternative area]'). Include concrete ₹ amounts and timelines."],
  "riskCallout": "2 sentences about their biggest risk. Combine financial stress test data with locality/lifestyle factors. E.g., if AQI is poor, mention health costs; if crime grade is D, mention insurance; if traffic is bad, mention productivity loss."
}

Rules:
- Use ₹ and lakhs/crores notation (e.g., ₹18.5L, ₹1.2Cr)
- Be direct, opinionated, and specific to THEIR numbers AND locality — never generic
- If locality is specified, your insights should feel like they came from someone who LIVES there
- Cross-reference data points: don't just repeat individual metrics, synthesize them
- If EMI burden >45%, be alarming. If >60%, be very alarming.
- If emergency runway <6 months, flag it prominently
- If bachelor + city bachelorFriendliness ≤2, emphasize rental discrimination strongly
- If planned stay < break-even year, emphasize this mismatch strongly
- Reference wealth milestones when relevant
- Tone: smart, warm, slightly cheeky — like a financially savvy friend who knows the city well`;


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
