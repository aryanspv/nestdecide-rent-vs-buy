// City-level intelligence data for Indian metros
// Sources: State govt stamp duty schedules, RERA data, NHB rental yield reports

export interface CityData {
  label: string;
  stampDutyPct: number; // % of property price
  registrationPct: number; // % of property price
  avgRentalYieldPct: number; // annual rent / property price
  propertyTaxPct: number; // annual % of property value (approx)
  avgAppreciationRange: [number, number]; // min-max %
  bachelorFriendliness: number; // 1-5 (5 = very friendly)
  avgSafetyIndex: number; // 1-5
  avgLiquidityScore: number; // 1-5 (how quickly properties sell)
  avgRentDepositMonths: number; // typical security deposit in months
  brokerageBuyPct: number; // buyer brokerage % of property price
  brokerageRentMonths: number; // rent brokerage in months of rent
  avgCommutePerKmMonthly: number; // ₹ per km per month (fuel/metro avg)
  tenantProtectionScore: number; // 1-5 (5 = strong tenant protection laws)
  avgRelocationFreqYears: number; // average years before landlord-driven relocation
}

export const CITY_DATA: Record<string, CityData> = {
  mumbai: {
    label: 'Mumbai',
    stampDutyPct: 6, registrationPct: 1, avgRentalYieldPct: 2.8, propertyTaxPct: 0.3,
    avgAppreciationRange: [5, 7], bachelorFriendliness: 3, avgSafetyIndex: 3.5,
    avgLiquidityScore: 4, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 2, avgCommutePerKmMonthly: 350,
    tenantProtectionScore: 4, avgRelocationFreqYears: 5,
  },
  delhi: {
    label: 'Delhi NCR',
    stampDutyPct: 6, registrationPct: 1, avgRentalYieldPct: 2.5, propertyTaxPct: 0.5,
    avgAppreciationRange: [4, 6], bachelorFriendliness: 2, avgSafetyIndex: 3,
    avgLiquidityScore: 3.5, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 300,
    tenantProtectionScore: 3, avgRelocationFreqYears: 4,
  },
  bengaluru: {
    label: 'Bengaluru',
    stampDutyPct: 5.6, registrationPct: 1, avgRentalYieldPct: 3.2, propertyTaxPct: 0.2,
    avgAppreciationRange: [6, 8], bachelorFriendliness: 4, avgSafetyIndex: 4,
    avgLiquidityScore: 4, avgRentDepositMonths: 10, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 280,
    tenantProtectionScore: 3, avgRelocationFreqYears: 3,
  },
  hyderabad: {
    label: 'Hyderabad',
    stampDutyPct: 5.5, registrationPct: 0.5, avgRentalYieldPct: 3.5, propertyTaxPct: 0.25,
    avgAppreciationRange: [7, 9], bachelorFriendliness: 3.5, avgSafetyIndex: 3.5,
    avgLiquidityScore: 3.5, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 250,
    tenantProtectionScore: 2, avgRelocationFreqYears: 3,
  },
  pune: {
    label: 'Pune',
    stampDutyPct: 6, registrationPct: 1, avgRentalYieldPct: 3.0, propertyTaxPct: 0.3,
    avgAppreciationRange: [5, 7], bachelorFriendliness: 4, avgSafetyIndex: 4,
    avgLiquidityScore: 3.5, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 2, avgCommutePerKmMonthly: 260,
    tenantProtectionScore: 4, avgRelocationFreqYears: 5,
  },
  chennai: {
    label: 'Chennai',
    stampDutyPct: 7, registrationPct: 1, avgRentalYieldPct: 3.0, propertyTaxPct: 0.4,
    avgAppreciationRange: [4, 6], bachelorFriendliness: 2.5, avgSafetyIndex: 3.5,
    avgLiquidityScore: 3, avgRentDepositMonths: 6, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 250,
    tenantProtectionScore: 3, avgRelocationFreqYears: 4,
  },
  ahmedabad: {
    label: 'Ahmedabad',
    stampDutyPct: 4.9, registrationPct: 1, avgRentalYieldPct: 3.2, propertyTaxPct: 0.3,
    avgAppreciationRange: [4, 6], bachelorFriendliness: 2, avgSafetyIndex: 3.5,
    avgLiquidityScore: 3, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 220,
    tenantProtectionScore: 2, avgRelocationFreqYears: 3,
  },
  kolkata: {
    label: 'Kolkata',
    stampDutyPct: 6, registrationPct: 1, avgRentalYieldPct: 3.0, propertyTaxPct: 0.4,
    avgAppreciationRange: [3, 5], bachelorFriendliness: 3, avgSafetyIndex: 3,
    avgLiquidityScore: 2.5, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 200,
    tenantProtectionScore: 4, avgRelocationFreqYears: 6,
  },
  gurgaon: {
    label: 'Gurgaon',
    stampDutyPct: 7, registrationPct: 0, avgRentalYieldPct: 2.8, propertyTaxPct: 0.5,
    avgAppreciationRange: [5, 8], bachelorFriendliness: 4, avgSafetyIndex: 3,
    avgLiquidityScore: 3.5, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 320,
    tenantProtectionScore: 2, avgRelocationFreqYears: 3,
  },
  noida: {
    label: 'Noida / Greater Noida',
    stampDutyPct: 7, registrationPct: 1, avgRentalYieldPct: 2.5, propertyTaxPct: 0.4,
    avgAppreciationRange: [4, 7], bachelorFriendliness: 3.5, avgSafetyIndex: 3,
    avgLiquidityScore: 2.5, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 280,
    tenantProtectionScore: 2, avgRelocationFreqYears: 3,
  },
  other: {
    label: 'Other',
    stampDutyPct: 6, registrationPct: 1, avgRentalYieldPct: 3.0, propertyTaxPct: 0.3,
    avgAppreciationRange: [4, 6], bachelorFriendliness: 3, avgSafetyIndex: 3,
    avgLiquidityScore: 3, avgRentDepositMonths: 3, brokerageBuyPct: 1,
    brokerageRentMonths: 1, avgCommutePerKmMonthly: 250,
    tenantProtectionScore: 3, avgRelocationFreqYears: 4,
  },
};

export type UserProfile = 'bachelor' | 'couple' | 'family' | 'retired';
export type PropertyType = 'apartment' | 'independent_house' | 'villa';
export type Furnishing = 'unfurnished' | 'semi_furnished' | 'fully_furnished';

export function getCityData(city: string): CityData {
  return CITY_DATA[city] ?? CITY_DATA.other;
}

// Rental yield analysis: is the property overpriced relative to rent for this city?
export function getRentalYieldVerdict(monthlyRent: number, propertyPrice: number, cityAvgYield: number): {
  impliedYield: number;
  cityAvgYield: number;
  verdict: 'underpriced' | 'fair' | 'overpriced';
  explanation: string;
} {
  const impliedYield = (monthlyRent * 12) / propertyPrice * 100;
  const diff = impliedYield - cityAvgYield;

  let verdict: 'underpriced' | 'fair' | 'overpriced';
  let explanation: string;

  if (diff > 0.5) {
    verdict = 'underpriced';
    explanation = `This property's rental yield (${impliedYield.toFixed(1)}%) is above city average (${cityAvgYield.toFixed(1)}%). The property may be underpriced relative to its rental income — favours buying.`;
  } else if (diff < -0.5) {
    verdict = 'overpriced';
    explanation = `This property's rental yield (${impliedYield.toFixed(1)}%) is below city average (${cityAvgYield.toFixed(1)}%). The property may be overpriced relative to its rental income — favours renting.`;
  } else {
    verdict = 'fair';
    explanation = `This property's rental yield (${impliedYield.toFixed(1)}%) is near the city average (${cityAvgYield.toFixed(1)}%). Pricing looks fair for this market.`;
  }

  return { impliedYield, cityAvgYield, verdict, explanation };
}

// Mobility score: how much does the user's profile favour renting flexibility?
export function getMobilityScore(profile: UserProfile, plannedStay: number): {
  score: number; // 1-10 (10 = highly mobile, favours rent)
  explanation: string;
} {
  let baseScore = 5;

  // Profile adjustments
  switch (profile) {
    case 'bachelor':
      baseScore += 3; // high mobility need
      break;
    case 'couple':
      baseScore += 1.5;
      break;
    case 'family':
      baseScore -= 2; // stability matters
      break;
    case 'retired':
      baseScore -= 3; // settled, stability matters most
      break;
  }

  // Stay duration adjustments
  if (plannedStay <= 3) baseScore += 2;
  else if (plannedStay <= 5) baseScore += 1;
  else if (plannedStay >= 10) baseScore -= 2;
  else if (plannedStay >= 7) baseScore -= 1;

  const score = Math.max(1, Math.min(10, baseScore));

  const explanations: string[] = [];
  if (profile === 'bachelor') explanations.push('Bachelors typically change cities/jobs more often');
  if (profile === 'couple') explanations.push('Couples may need to relocate for dual careers');
  if (profile === 'family') explanations.push('Families benefit from school continuity and stability');
  if (profile === 'retired') explanations.push('Retired individuals value settled living');
  if (plannedStay <= 3) explanations.push('Short stay makes buying risky due to transaction costs');
  if (plannedStay >= 10) explanations.push('Long tenure lets property appreciation compound');

  return {
    score,
    explanation: explanations.join('. ') + '.',
  };
}

// Bachelor-specific rental challenges in India
export function getBachelorRentalInsight(profile: UserProfile, cityBachelorScore: number): {
  relevant: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  explanation: string;
} {
  if (profile !== 'bachelor') {
    return { relevant: false, severity: 'none', explanation: '' };
  }

  if (cityBachelorScore >= 4) {
    return {
      relevant: true,
      severity: 'mild',
      explanation: 'This city is relatively bachelor-friendly. You should find rentals without major discrimination, though some gated communities may still have restrictions.',
    };
  } else if (cityBachelorScore >= 3) {
    return {
      relevant: true,
      severity: 'moderate',
      explanation: 'Bachelors face moderate rental discrimination in this city. Many societies restrict bachelors or charge premiums. This is a real cost to factor in — buying eliminates this friction.',
    };
  } else {
    return {
      relevant: true,
      severity: 'severe',
      explanation: 'Bachelors face significant rental discrimination in this city. Finding quality housing is harder, you may be restricted to certain areas, and landlords often charge premiums. Buying eliminates this persistent challenge.',
    };
  }
}

// Resale liquidity risk: how easy is it to sell the property if needed?
export function getLiquidityRisk(cityLiquidity: number, propertyType: PropertyType, propertyPrice: number): {
  riskLevel: 'low' | 'medium' | 'high';
  discountPct: number; // estimated discount on market value for quick sale
  explanation: string;
} {
  let score = cityLiquidity;

  // Property type adjustments
  if (propertyType === 'apartment') score += 0.5; // apartments sell faster
  if (propertyType === 'villa') score -= 1; // villas take longer
  if (propertyType === 'independent_house') score -= 0.5;

  // Very expensive properties take longer to sell
  if (propertyPrice > 30000000) score -= 1; // 3Cr+
  else if (propertyPrice > 15000000) score -= 0.5; // 1.5Cr+

  score = Math.max(1, Math.min(5, score));

  let riskLevel: 'low' | 'medium' | 'high';
  let discountPct: number;

  if (score >= 4) {
    riskLevel = 'low';
    discountPct = 3;
  } else if (score >= 2.5) {
    riskLevel = 'medium';
    discountPct = 7;
  } else {
    riskLevel = 'high';
    discountPct = 12;
  }

  const explanation = riskLevel === 'low'
    ? 'This type of property in this city typically sells within 3-6 months at market rates.'
    : riskLevel === 'medium'
    ? 'Resale may take 6-12 months. If you need to sell quickly, expect a 5-10% discount.'
    : 'Properties like this can take 12+ months to sell. Budget for a significant discount if you need to exit early.';

  return { riskLevel, discountPct, explanation };
}
