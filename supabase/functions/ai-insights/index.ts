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
You receive a JSON summary of a Rent vs Buy financial comparison for an Indian user.

Return a JSON object with exactly these fields:
{
  "headline": "One punchy sentence (max 12 words) — the verdict in plain language. Use Indian context.",
  "narrative": "2-3 sentences explaining WHY in a conversational, empathetic tone. Reference specific numbers from the data. Speak like a smart friend, not a bank.",
  "surprises": ["1-2 genuinely surprising or counter-intuitive findings from the data. Each max 20 words."],
  "actionItems": ["2-3 specific, actionable next steps. Be concrete — mention amounts, timelines, or strategies."],
  "riskCallout": "One sentence about the biggest financial risk they should watch out for. Be specific."
}

Rules:
- Use ₹ and lakhs/crores notation (e.g., ₹18.5L, ₹1.2Cr)
- Be direct and opinionated, not wishy-washy
- Reference their specific city, income, and numbers
- If EMI burden is >45% of income, be alarming about it
- If they're a bachelor, mention flexibility advantages
- Tone: smart, warm, slightly cheeky — like a financially savvy friend`;

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
              content: `Here is the financial comparison data:\n${JSON.stringify(summary, null, 2)}`,
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
