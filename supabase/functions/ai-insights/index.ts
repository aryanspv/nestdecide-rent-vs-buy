import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type InsightPayload = {
  headline: string;
  tldr: string;
  actionItems: string[];
  riskCallout: string;
};

const COMMON_TERMS = new Set([
  "this",
  "that",
  "with",
  "from",
  "into",
  "your",
  "their",
  "about",
  "where",
  "there",
  "still",
  "only",
  "before",
  "after",
  "under",
  "around",
  "versus",
  "because",
  "would",
  "could",
  "should",
  "market",
  "locality",
  "pocket",
  "years",
  "year",
  "buyer",
  "rent",
  "buying",
  "buy",
  "city",
  "area",
]);

function humanize(value?: string) {
  return value ? value.replace(/_/g, " ") : "";
}

function cleanSentence(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function pickLocalityName(summary: any, profile?: any) {
  return profile?.canonicalName || summary?.locality || "This locality";
}

function listToText(values?: string[], limit = 2) {
  const items = (values ?? []).map(cleanSentence).filter(Boolean).slice(0, limit);

  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function extractTerms(value?: string) {
  if (!value) return [];

  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 4 && !COMMON_TERMS.has(term));
}

function getSpecificityTerms(summary: any, profile?: any) {
  return Array.from(
    new Set([
      pickLocalityName(summary, profile).toLowerCase(),
      ...(profile?.betterValueAlternatives ?? []).map((value: string) => value.toLowerCase()),
      ...extractTerms(profile?.zone),
      ...extractTerms(profile?.segment),
      ...extractTerms(profile?.vibe),
      ...extractTerms(profile?.dominantTenantProfile),
      ...extractTerms(humanize(profile?.priceToRentPressure)),
      ...extractTerms(humanize(profile?.appreciationOutlook)),
      ...extractTerms(humanize(profile?.liquidity)),
      ...extractTerms(humanize(profile?.safety)),
      ...(profile?.infraCatalysts ?? []).flatMap((value: string) => extractTerms(value)),
      ...(profile?.risks ?? []).flatMap((value: string) => extractTerms(value)),
    ].filter(Boolean))
  );
}

function countSpecificityHits(text: string, summary: any, profile?: any) {
  const lower = text.toLowerCase();
  const terms = getSpecificityTerms(summary, profile);

  return terms.reduce((count, term) => count + (lower.includes(term) ? 1 : 0), 0);
}

function buildPromptAnalysis(summary: any) {
  const profile = summary?.localityProfile;
  if (!profile) return null;

  const localityName = pickLocalityName(summary, profile);
  const segment = humanize(profile?.segment) || "mixed";
  const pressure = humanize(profile?.priceToRentPressure) || "unclear";
  const stay = summary?.plannedStay ? `${summary.plannedStay}-year hold` : "current hold period";
  const alternative = profile?.betterValueAlternatives?.[0] || null;

  const decisionFrame = profile?.segment === "ultra_luxury" || profile?.priceToRentPressure === "very_high"
    ? "Prestige market: test whether status, scarcity and centrality justify yield compression and extreme carrying costs."
    : profile?.segment === "affordable" || profile?.segment === "mid_market"
      ? "Value market: test whether cheap entry survives lane-level quality risk, civic variability, congestion and weaker exits."
      : "Convenience-led market: test whether livability and demand are strong enough to outrun the buy premium.";

  const lifestyleTension = profile?.segment === "ultra_luxury" || profile?.priceToRentPressure === "very_high"
    ? `${localityName} may feel exceptional to live in, but buyers are usually prepaying for address value rather than return.`
    : profile?.segment === "affordable" || profile?.segment === "mid_market"
      ? `${localityName} can look sensible on price, but daily friction comes from stock quality, congestion and uneven civic quality.`
      : `${localityName} sits in the middle: commute, renter demand and exit depth matter more than headline prestige.`;

  const exitTension = profile?.liquidity === "strong"
    ? "Exit liquidity is relatively strong, but that also means the premium may already be priced in."
    : profile?.liquidity === "moderate"
      ? "Exit risk is real: a weak buy decision may require price compromise or patience."
      : "Exit risk is a major issue: this locality punishes buyers who may need flexibility.";

  return {
    localityName,
    zone: profile?.zone ?? null,
    segment,
    priceToRentPressure: pressure,
    safety: humanize(profile?.safety) || null,
    liquidity: humanize(profile?.liquidity) || null,
    appreciationOutlook: humanize(profile?.appreciationOutlook) || null,
    vibe: profile?.vibe ?? null,
    dominantTenantProfile: profile?.dominantTenantProfile ?? null,
    commuteRead: profile?.commute || summary?.mobilityExplanation || null,
    decisionFrame,
    moneyTension: `${localityName} carries ${pressure} buy-vs-rent pressure; for this ${stay}, the current numbers show ${summary?.netWorthDiffFormatted ?? "a material gap"} of net-worth underperformance versus renting.`,
    lifestyleTension,
    exitTension,
    benchmarkAlternative: alternative,
    mustUseFacts: [
      profile?.zone,
      segment,
      pressure,
      humanize(profile?.liquidity),
      humanize(profile?.safety),
      alternative,
      ...(profile?.risks ?? []).slice(0, 2),
    ].filter(Boolean),
  };
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
  const localityName = pickLocalityName(summary, profile);

  if (profile?.segment === "ultra_luxury" || profile?.priceToRentPressure === "very_high") {
    return `${localityName}: status premium burns ${summary?.netWorthDiffFormatted ?? "value"}.`;
  }

  if (profile?.segment === "affordable" || profile?.segment === "mid_market") {
    return `${localityName}: cheap entry, patchy resale, weak buy case.`;
  }

  return `${localityName}: locality premium still trails renting.`;
}

function buildLocalityTldr(summary: any, profile: any) {
  const localityName = pickLocalityName(summary, profile);
  const zone = profile?.zone || summary?.cityLabel || "the city";
  const priceText = formatCompactInr(summary?.propertyPrice);
  const alternative = profile?.betterValueAlternatives?.[0];
  const stay = `${summary?.plannedStay ?? "short"}-year`;

  if (profile?.segment === "ultra_luxury" || profile?.priceToRentPressure === "very_high") {
    return cleanSentence(
      `${localityName} is a prestige-heavy pocket in ${zone}, so a ${priceText} buy for a ${stay} stay mainly pays for address value, not return. Scarcity and safety may be real, but yield compression is so severe that ${alternative ? `${alternative} is the smarter benchmark before you buy.` : `renting stays cleaner financially.`}`
    );
  }

  if (profile?.segment === "affordable" || profile?.segment === "mid_market") {
    return cleanSentence(
      `${localityName} looks affordable versus pricier parts of ${zone}, but this kind of value market is won or lost on building quality, congestion and resale depth, not the listing price alone. For a ${stay} stay, cheap entry still does not offset the risk of uneven stock and patchy exits${alternative ? `, so compare ${alternative} too.` : "."}`
    );
  }

  return cleanSentence(
    `${localityName} carries a real convenience premium in ${zone}, so the buy case only works if livability and future demand beat the cost of waiting. Right now that locality premium still looks richer than the financial payoff${alternative ? `, so benchmark ${alternative} before committing.` : "."}`
  );
}

function buildLocalityRiskCallout(summary: any, profile: any) {
  const localityName = pickLocalityName(summary, profile);

  if (profile?.segment === "ultra_luxury" || profile?.priceToRentPressure === "very_high") {
    return cleanSentence(
      `${localityName} asks you to carry ${formatCompactInr(summary?.monthlyEmi)} of EMI plus ${formatCompactInr(summary?.totalTransactionCost)} upfront largely for prestige, which is punishing if you exit before year ${summary?.breakEvenYear ?? "the break-even point"}.`
    );
  }

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

  if (profile?.segment === "affordable" || profile?.segment === "mid_market") {
    return cleanSentence(
      `${localityName} can trap buyers with cheap-looking entry pricing if block quality is weak, because even a ${formatCompactInr(summary?.monthlyEmi)} EMI does not protect you from costly repairs, slower resale and congestion-heavy daily life.`
    );
  }

  return cleanSentence(
    `${formatCompactInr(summary?.monthlyEmi)} of EMI plus ${formatCompactInr(summary?.totalTransactionCost)} upfront costs are especially hard to justify in ${localityName}, where ${humanize(profile?.priceToRentPressure)} buy-vs-rent pressure keeps ownership returns weak.`
  );
}

function buildLocalityActionItems(summary: any, profile: any) {
  const localityName = pickLocalityName(summary, profile);
  const alternative = profile?.betterValueAlternatives?.[0] || "a nearby pocket";

  if (profile?.segment === "ultra_luxury" || profile?.priceToRentPressure === "very_high") {
    return [
      `Benchmark ${localityName} against ${alternative} to price the prestige premium honestly.`,
      `Demand recent yield and resale comps before paying ${formatCompactInr(summary?.propertyPrice)} here.`,
      `Only buy if you can hold past year ${summary?.breakEvenYear ?? "the break-even point"} and absorb ${formatCompactInr(summary?.emiIfRatePlus2)}.`
    ];
  }

  if (profile?.segment === "affordable" || profile?.segment === "mid_market") {
    return [
      `Inspect ${localityName} lane by lane; block quality matters more than area averages.`,
      `Compare the exact building against options in ${alternative} before committing.`,
      `Only buy if the best block still works beyond year ${summary?.breakEvenYear ?? "the break-even point"}.`
    ];
  }

  return [
    `Benchmark ${localityName} against ${alternative} before paying a ${humanize(profile?.priceToRentPressure)} micro-market premium.`,
    `Only buy if you will stay past year ${summary?.breakEvenYear ?? "the break-even point"} and can absorb ${formatCompactInr(summary?.emiIfRatePlus2)} under rate stress.`,
    profile?.segment === "affordable" || profile?.segment === "mid_market"
      ? `Audit building quality lane by lane in ${localityName}; stock quality matters more than area averages.`
      : `Negotiate hard in ${localityName}; prestige only works if yield and resale stay strong.`,
  ];
}

function buildFallbackInsights(summary: any): InsightPayload {
  const profile = summary?.localityProfile;

  return {
    headline: buildLocalityHeadline(summary, profile),
    tldr: buildLocalityTldr(summary, profile),
    actionItems: buildLocalityActionItems(summary, profile),
    riskCallout: buildLocalityRiskCallout(summary, profile),
  };
}

function ensureString(value: unknown) {
  return typeof value === "string" ? cleanSentence(value) : "";
}

function isSpecificHeadline(value: string, summary: any, profile?: any) {
  const localityName = pickLocalityName(summary, profile).toLowerCase();
  return !!value && (!localityName || value.toLowerCase().includes(localityName));
}

function isSpecificTldr(value: string, summary: any, profile?: any) {
  if (!value) return false;

  const localityName = pickLocalityName(summary, profile).toLowerCase();
  const lower = value.toLowerCase();
  const mentionsLocality = !localityName || lower.includes(localityName);

  return mentionsLocality && countSpecificityHits(value, summary, profile) >= 2 && /₹|\d/.test(value);
}

function isSpecificRisk(value: string, summary: any, profile?: any) {
  if (!value) return false;

  const localityName = pickLocalityName(summary, profile).toLowerCase();
  const lower = value.toLowerCase();
  const mentionsLocality = !localityName || lower.includes(localityName);

  return mentionsLocality && (/₹|\d/.test(value) || /(yield|liquidity|safety|resale|commute|premium)/.test(lower));
}

function isSpecificAction(value: string, summary: any, profile?: any) {
  if (!value) return false;

  const lower = value.toLowerCase();
  const localityName = pickLocalityName(summary, profile).toLowerCase();
  const alternative = profile?.betterValueAlternatives?.[0]?.toLowerCase();

  return (
    (localityName && lower.includes(localityName)) ||
    (alternative && lower.includes(alternative)) ||
    /₹|\d/.test(value) ||
    countSpecificityHits(value, summary, profile) >= 1
  );
}

function finalizeInsights(summary: any, rawInsights: any): InsightPayload {
  const profile = summary?.localityProfile;
  const fallback = buildFallbackInsights(summary);
  const actionCandidates = Array.isArray(rawInsights?.actionItems)
    ? rawInsights.actionItems.map((item: unknown) => ensureString(item)).filter(Boolean)
    : [];

  const dedupedActions = Array.from(new Set(actionCandidates.map((item) => item.trim())))
    .filter((item) => isSpecificAction(item, summary, profile));

  return {
    headline: isSpecificHeadline(ensureString(rawInsights?.headline), summary, profile)
      ? ensureString(rawInsights?.headline)
      : fallback.headline,
    tldr: isSpecificTldr(ensureString(rawInsights?.tldr), summary, profile)
      ? ensureString(rawInsights?.tldr)
      : fallback.tldr,
    actionItems: [...dedupedActions, ...fallback.actionItems].slice(0, 3),
    riskCallout: isSpecificRisk(ensureString(rawInsights?.riskCallout), summary, profile)
      ? ensureString(rawInsights?.riskCallout)
      : fallback.riskCallout,
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

    const promptAnalysis = buildPromptAnalysis(summary);

    const systemPrompt = `You are NestDecide's lead Indian residential micro-market analyst.

Your job is not to repeat generic city-level rent-vs-buy advice. Your job is to explain why THIS exact locality changes the decision.

You receive:
1) hard financial outputs
2) city livability context
3) an optional localityProfile object that is authoritative when present
4) an optional promptAnalysis object derived from the localityProfile to focus your reasoning

CRITICAL LOCALITY RULES:
- If localityProfile exists, your answer must sound obviously different for different pockets in the same city.
- If someone swapped Lodhi Estate with Shahdara and most of your answer still fits, your answer is wrong.
- Mention the locality name in the headline, TLDR and riskCallout.
- Across the full answer, use at least 3 distinct locality-specific facts chosen from: zone, segment, vibe, tenant profile, priceToRentPressure, appreciationOutlook, liquidity, safety, commute, infraCatalysts, risks, betterValueAlternatives.
- Tie the financial verdict to the micro-market reason. Explain WHY the locality changes the math, not just WHAT the math is.
- For prestige markets, focus on scarcity premium, yield compression, carrying cost and status pricing.
- For affordable/value markets, focus on building quality, civic variability, congestion, hidden maintenance and exit liquidity.
- Never invent facts beyond the provided JSON.
- Avoid reusing generic phrasing like “renting still leaves you ahead” unless you add the locality-specific why.

Return JSON via the tool with exactly:
{
  "headline": "Max 12 words. Mention the locality by name.",
  "tldr": "Exactly 2 sentences. Sentence 1 = core decision. Sentence 2 = locality-specific why.",
  "actionItems": ["Exactly 3 items. Each max 20 words. Specific to this locality."],
  "riskCallout": "1 sentence. Quantified financial risk sharpened by locality-specific risk."
}

Rules:
- Use ₹ in lakhs/crores
- Be blunt, useful and concrete
- No markdown, no extra keys, no disclaimers`;

    const models = ["openai/gpt-5.2", "google/gemini-3-flash-preview"];
    let response: Response | null = null;

    for (const model of models) {
      const useReasoning = model.startsWith("openai/");
      const bodyPayload: any = {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Locality: ${summary.locality} in ${summary.cityLabel}\n\nAuthoritative locality intelligence (if present, use this as source of truth):\n${JSON.stringify(summary.localityProfile ?? null, null, 2)}\n\nDerived prompt analysis (use this to focus, but never contradict the source data):\n${JSON.stringify(promptAnalysis, null, 2)}\n\nFull summary:\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
        temperature: 0.2,
        tools: [
          {
            type: "function",
            function: {
              name: "provide_insights",
              description: "Provide deeply locality-specific personalized financial insights that materially differ across micro-markets in the same city",
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
      };

      if (useReasoning) {
        bodyPayload.reasoning = { effort: "medium" };
      }

      try {
        console.log(`Trying model: ${model}`);
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyPayload),
        });

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response.ok) {
          console.log(`Success with model: ${model}`);
          break;
        }

        const errText = await response.text();
        console.error(`Model ${model} failed (${response.status}):`, errText);
        response = null; // try next model
      } catch (fetchErr) {
        console.error(`Model ${model} fetch error:`, fetchErr);
        response = null;
      }
    }

    if (!response || !response.ok) {
      console.error("All models failed, using fallback insights");
      const fallback = buildFallbackInsights(summary);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const rawPayload = toolCall?.function?.arguments ?? data.choices?.[0]?.message?.content;

    let rawInsights = {};
    if (rawPayload) {
      try {
        rawInsights = JSON.parse(rawPayload);
      } catch (parseError) {
        console.error("Failed to parse AI insights payload:", parseError, rawPayload);
      }
    }

    const insights = finalizeInsights(summary, rawInsights);

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
