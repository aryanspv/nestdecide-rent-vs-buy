import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculationResult, UserInputs } from '@/lib/calculations';
import { formatLakhs } from '@/lib/formatCurrency';
import { getCityData } from '@/lib/locationData';

export interface AiInsights {
  headline: string;
  tldr: string;
  actionItems: string[];
  riskCallout: string;
}

function buildSummary(result: CalculationResult, inputs: UserInputs) {
  const staySnap = result.snapshots[Math.min(inputs.plannedStay, 30) - 1];
  const cityData = getCityData(inputs.city);
  return {
    city: inputs.city,
    cityLabel: cityData.label,
    locality: inputs.locality || 'not specified',
    userProfile: inputs.userProfile,
    propertyType: inputs.propertyType,
    furnishing: inputs.furnishing,
    monthlyIncome: inputs.monthlyIncome,
    monthlyRent: inputs.monthlyRent,
    savings: inputs.savings,
    propertyPrice: inputs.propertyPrice,
    downPayment: inputs.downPayment,
    downPaymentPct: Math.round((inputs.downPayment / inputs.propertyPrice) * 100),
    interestRate: inputs.interestRate,
    loanTenure: inputs.loanTenure,
    loanAmount: inputs.propertyPrice - inputs.downPayment,
    monthlyMaintenance: inputs.monthlyMaintenance,
    plannedStay: inputs.plannedStay,
    propertyAppreciation: inputs.propertyAppreciation,
    investmentReturn: inputs.investmentReturn,
    annualRentIncrease: inputs.annualRentIncrease,
    commuteDistance: inputs.commuteDistance,
    safetyPriority: inputs.safetyPriority,
    resaleConcern: inputs.resaleConcern,

    verdict: result.overallVerdict,
    financialVerdict: result.financialVerdict,
    monthlyEmi: Math.round(result.monthlyEmi),
    emiBurdenPct: Math.round((result.monthlyEmi / inputs.monthlyIncome) * 100),
    monthlyCashFlowDiff: Math.round(result.monthlyCashFlowDiff),
    netWorthDiffAtTenure: Math.round(result.netWorthDiffAtTenure),
    netWorthDiffFormatted: formatLakhs(Math.abs(result.netWorthDiffAtTenure)),
    breakEvenYear: result.breakEvenYear,
    totalInterestPaid: Math.round(result.totalInterestPaid),
    totalRentPaid: Math.round(result.totalRentPaid),
    propertyValueAtEnd: Math.round(result.propertyValueAtEnd),
    netEquityAtEnd: Math.round(result.netEquityAtEnd),
    downPaymentOpportunityCost: Math.round(result.downPaymentOpportunityCost),
    totalMaintenanceCost: Math.round(result.totalMaintenanceCost),
    totalTaxBenefit: Math.round(result.totalTaxBenefit),

    stampDutyCost: Math.round(result.stampDutyCost),
    registrationCost: Math.round(result.registrationCost),
    totalTransactionCost: Math.round(result.totalTransactionCost),
    propertyTaxTotal: Math.round(result.propertyTaxTotal),
    rentalDepositLocked: Math.round(result.rentalDepositLocked),

    buyNetWorthAtStay: staySnap ? Math.round(staySnap.buyNetWorth) : 0,
    rentNetWorthAtStay: staySnap ? Math.round(staySnap.rentNetWorth) : 0,
    rentAtEndOfStay: staySnap ? Math.round(inputs.monthlyRent * Math.pow(1 + inputs.annualRentIncrease / 100, inputs.plannedStay)) : 0,

    stressTestRisk: result.uniqueInsights.stressTest.riskLevel,
    stressTestBurden: result.uniqueInsights.stressTest.burdenPctCurrent,
    emergencyRunwayMonths: result.uniqueInsights.stressTest.emergencyRunwayMonths,
    emiIfRatePlus2: Math.round(result.uniqueInsights.stressTest.emiAtPlus2),
    burdenIfRatePlus2: Math.round(result.uniqueInsights.stressTest.burdenPctPlus2),

    freedomMoneyBuyer: result.uniqueInsights.freedomMoney.buyer,
    freedomMoneyRenter: result.uniqueInsights.freedomMoney.renter,
    freedomMoneyDelta: Math.round(result.uniqueInsights.freedomMoney.delta),
    rentTrapYear: result.uniqueInsights.rentTrapYear,
    opportunityCostPerMonth: Math.round(result.uniqueInsights.opportunityCostPerMonth),

    landlordProtection: result.uniqueInsights.landlordRisk.protectionLevel,
    relocationFreqYears: result.uniqueInsights.landlordRisk.relocationFreqYears,

    locationVerdict: result.locationInsight.locationVerdict,
    locationScore: result.locationInsight.locationScore,
    rentalYieldImplied: result.locationInsight.rentalYield.impliedYield,
    rentalYieldVerdict: result.locationInsight.rentalYield.verdict,
    liquidityRisk: result.locationInsight.liquidity.riskLevel,
    mobilityScore: result.locationInsight.mobility.score,

    milestones: result.uniqueInsights.milestones
      .filter(m => m.buyYear !== null || m.rentYear !== null)
      .map(m => ({ label: m.label, buyYear: m.buyYear, rentYear: m.rentYear, faster: m.fasterPath })),

    verdictReasons: result.verdictReasons,

    cityLivability: {
      crimeRatePerLakh: cityData.crimeRatePerLakh,
      topCrimes: cityData.topCrimes,
      crimeSafetyGrade: cityData.crimeSafetyGrade,
      trafficCongestionIndex: cityData.trafficCongestionIndex,
      avgCommuteTimeMins: cityData.avgCommuteTimeMins,
      peakHourDelayPct: cityData.peakHourDelayPct,
      avgAQI: cityData.avgAQI,
      aqiCategory: cityData.aqiCategory,
      bachelorFriendliness: cityData.bachelorFriendliness,
      avgRentDepositMonths: cityData.avgRentDepositMonths,
    },

    bachelorInsight: result.locationInsight.bachelorInsight,
    mobilityExplanation: result.locationInsight.mobility.explanation,
    liquidityExplanation: result.locationInsight.liquidity.explanation,
    rentalYieldExplanation: result.locationInsight.rentalYield.explanation,
    locationExplanation: result.locationInsight.locationExplanation,
    hiddenBuyCosts: result.locationInsight.hiddenBuyCosts,
    hiddenRentCosts: result.locationInsight.hiddenRentCosts,
  };
}

export function useAiInsights() {
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (result: CalculationResult, inputs: UserInputs) => {
    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const summary = buildSummary(result, inputs);
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: { summary },
      });

      if (fnError) throw new Error(fnError.message || 'Failed to get AI insights');
      if (data?.error) throw new Error(data.error);

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
