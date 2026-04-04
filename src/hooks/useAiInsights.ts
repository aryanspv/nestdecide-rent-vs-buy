import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculationResult } from '@/lib/calculations';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';

export interface AiInsights {
  headline: string;
  narrative: string;
  surprises: string[];
  actionItems: string[];
  riskCallout: string;
}

function buildSummary(result: CalculationResult, city: string, profile: string, monthlyIncome: number) {
  return {
    city,
    profile,
    monthlyIncome,
    verdict: result.overallVerdict,
    plannedStay: result.plannedStay,
    monthlyEmi: Math.round(result.monthlyEmi),
    emiBurdenPct: Math.round((result.monthlyEmi / monthlyIncome) * 100),
    netWorthDiffAtTenure: Math.round(result.netWorthDiffAtTenure),
    netWorthDiffFormatted: formatLakhs(Math.abs(result.netWorthDiffAtTenure)),
    breakEvenYear: result.breakEvenYear,
    totalInterestPaid: Math.round(result.totalInterestPaid),
    totalRentPaid: Math.round(result.totalRentPaid),
    propertyValueAtEnd: Math.round(result.propertyValueAtEnd),
    stressTestRisk: result.uniqueInsights.stressTest.riskLevel,
    stressTestBurden: result.uniqueInsights.stressTest.burdenPctCurrent,
    freedomMoneyDelta: Math.round(result.uniqueInsights.freedomMoney.delta),
    rentTrapYear: result.uniqueInsights.rentTrapYear,
    locationVerdict: result.locationInsight.locationVerdict,
    locationScore: result.locationInsight.locationScore,
    verdictReasons: result.verdictReasons,
  };
}

export function useAiInsights() {
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (
    result: CalculationResult,
    city: string,
    profile: string,
    monthlyIncome: number,
  ) => {
    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const summary = buildSummary(result, city, profile, monthlyIncome);
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: { summary },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get AI insights');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setInsights(data as AiInsights);
    } catch (e) {
      console.error('AI insights error:', e);
      setError(e instanceof Error ? e.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  return { insights, loading, error, fetchInsights };
}
