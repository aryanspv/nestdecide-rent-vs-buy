import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function humanize(value?: string) {
  return value ? value.replace(/_/g, " ") : "";
}

function cleanSentence(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function formatCompactInr(value?: number) {
  if (!Number.isFinite(value)) return "₹0";

  const amount = Math.abs(value as number);
  const sign = (value as number) < 0 ? "-" : "";

  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `${sign}₹${crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `${sign}₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }

  return `${sign}₹${Math.round(amount)}`;
}

function buildLocalityHeadline(summary: any, profile: any) {
  const localityName = profile?.canonicalName || summary?.locality || "This locality";

  if (profile?.segment === "ultra_luxury" || profile?.priceToRentPressure === "very_high") {
    return `${localityName}: rent beats prestige by ${summary?.netWorthDiffFormatted ?? "more"}.`;
  }

  if (profile?.segment === "affordable" || profile?.segment === "mid_market") {
    return `${localityName}: affordability alone still doesn't justify buying.`;
  }

  return `${localityName}: renting stays ahead by ${summary?.netWorthDiffFormatted ?? "more"}.`;
}

function buildLocalityTldr(summary: any, profile: any) {
  const localityName = profile?.canonicalName || summary?.locality || "This locality";
  const zone = profile?.zone || summary?.cityLabel || "the city";
  const segment = humanize(profile?.segment) || "local";
  const pressure = humanize(profile?.priceToRentPressure) || "high";
  const priceText = formatCompactInr(summary?.propertyPrice);
  const alternative = profile?.betterValueAlternatives?.[0];
  const profileSummary = (profile?.summary || "This micro-market needs tighter scrutiny before you buy.").replace(/\.$/, "");

  return cleanSentence(
    `${localityName} is a ${segment} pocket in ${zone} with ${pressure} buy-vs-rent pressure, so paying ${priceText} for a ${summary?.plannedStay ?? "short"}-year stay is weak capital allocation when renting still leaves you ahead by ${summary?.netWorthDiffFormatted ?? "more"}. ${profileSummary}${alternative ? `, so compare ${alternative} before paying the ${localityName} premium.` : "."}`
  );
}

function buildLocalityRiskCallout(summary: any, profile: any) {
  const localityName = profile?.canonicalName || summary?.locality || "this locality";

  if (summary?.safetyPriority >= 4 && profile?.safety && profile.safety !== "strong") {
    return cleanSentence(
      `${localityName}'s ${humanize(profile.safety)} safety profile plus ${summary?.cityLivability?.crimeSafetyGrade ?? "mixed"} city crime conditions make a ${formatCompactInr(summary?.monthlyEmi)} EMI hard to justify for a safety-first buyer.`
    );
  }

  if (summary?.resaleConcern >= 4 && profile?.liquidity && profile.liquidity !== "strong") {
    return cleanSentence(
      `${localityName}'s ${humanize(profile.liquidity)} liquidity and ${humanize(profile.appreciationOutlook)} appreciation outlook make the ${formatCompactInr(summary?.totalTransactionCost)} entry cost dangerous if you may need to exit before year ${summary?.breakEvenYear ?? "the break-even point"}.`
    );
  }

  return cleanSentence(
    `${formatCompactInr(summary?.monthlyEmi)} of EMI plus ${formatCompactInr(summary?.totalTransactionCost)} upfront costs are especially hard to justify in ${localityName}, where ${humanize(profile?.priceToRentPressure)} buy-vs-rent pressure keeps ownership returns weak.`
  );
}

function buildLocalityActionItems(summary: any, profile: any) {
  const localityName = profile?.canonicalName || summary?.locality || "this locality";
  const alternative = profile?.betterValueAlternatives?.[0] || "a nearby pocket";

  return [
    `Benchmark ${localityName} against ${alternative} before paying a ${humanize(profile?.priceToRentPressure)} micro-market premium.`,
    `Only buy if you will stay past year ${summary?.breakEvenYear ?? "the break-even point"} and can absorb ${formatCompactInr(summary?.emiIfRatePlus2)} under rate stress.`,
    profile?.segment === "affordable" || profile?.segment === "mid_market"
      ? `Audit building quality lane by lane in ${localityName}; stock quality matters more than area averages.`
      : `Negotiate hard in ${localityName}; prestige only works if yield and resale stay strong.`,
  ];
}

function localizeInsights(summary: any, rawInsights: any) {
  const profile = summary?.localityProfile;

  if (!profile) {
    return rawInsights;
  }

  const localityName = (profile?.canonicalName || summary?.locality || "").toLowerCase();
  const generatedHeadline = typeof rawInsights?.headline === "string" ? rawInsights.headline.trim() : "";
  const headline = localityName && generatedHeadline.toLowerCase().includes(localityName)
    ? generatedHeadline
    : buildLocalityHeadline(summary, profile);

  return {
    headline,
    tldr: buildLocalityTldr(summary, profile),
    actionItems: buildLocalityActionItems(summary, profile),
    riskCallout: buildLocalityRiskCallout(summary, profile),
  };
}

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
- Do NOT give the same framing for an ultra_luxury enclave and an affordable dense locality.
- If localityProfile is missing, use city-level context only and do NOT fake hyperlocal facts.

Return JSON with exactly:
{
  "headline": "Max 12 words. Name the locality. Lead with the sharpest financial fact.",
  "tldr": "2 sentences max. Must combine financial outcome with localityProfile facts when available.",
  "actionItems": ["Exactly 3 items. Each max 20 words. Ultra-specific and practical."],
  "riskCallout": "1 sentence. Biggest quantified risk from finances + locality."
}

Rules:
- ₹ in lakhs/crores
- Keep it concise, sharp, and practical`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `Locality: ${summary.locality} in ${summary.cityLabel}\n\nStructured locality intelligence (if present, use this as source of truth):\n${JSON.stringify(summary.localityProfile ?? null, null, 2)}\n\nFull summary:\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
        temperature: 0.3,
        tools: [
          {
            type: "function",
            function: {
              name: "provide_insights",
              description: "Provide locality-specific personalized financial insights",
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
                required: ["headline", "tldr", "actionItems", "riskCallout"],
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
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No insights generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawInsights = JSON.parse(toolCall.function.arguments);
    const insights = localizeInsights(summary, rawInsights);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
