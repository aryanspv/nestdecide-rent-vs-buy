import {
  getCityData,
  getRentalYieldVerdict,
  getMobilityScore,
  getBachelorRentalInsight,
  getLiquidityRisk,
  type UserProfile,
  type PropertyType,
  type Furnishing,
  type CityData,
} from './locationData';

export interface UserInputs {
  // Step 1: Situation
  city: string;
  monthlyRent: number;
  monthlyIncome: number;
  savings: number;

  // Step 2: Property
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTenure: number;
  monthlyMaintenance: number;

  // Step 3: Assumptions
  plannedStay: number;
  propertyAppreciation: number;
  investmentReturn: number;
  annualRentIncrease: number;

  // Step 4: Location & Lifestyle (new)
  locality: string;
  propertyType: PropertyType;
  furnishing: Furnishing;
  userProfile: UserProfile;
  commuteDistance: number;
  safetyPriority: number; // 1-5
  resaleConcern: number; // 1-5
}

export interface YearlySnapshot {
  year: number;
  buyNetWorth: number;
  rentNetWorth: number;
  propertyValue: number;
  loanOutstanding: number;
  equityInProperty: number;
  totalRentPaid: number;
  totalEmiPaid: number;
  rentInvestmentCorpus: number;
  // Real (inflation-adjusted) values
  buyNetWorthReal: number;
  rentNetWorthReal: number;
}

export interface StressTestResult {
  emergencyRunwayMonths: number;
  emiAtPlus1: number;
  emiAtPlus2: number;
  emiDeltaPlus1: number;
  emiDeltaPlus2: number;
  burdenPctCurrent: number;
  burdenPctPlus1: number;
  burdenPctPlus2: number;
  riskLevel: 'safe' | 'stretched' | 'danger';
}

export interface WealthMilestone {
  label: string;
  amountLakhs: number;
  buyYear: number | null;
  rentYear: number | null;
  fasterPath: 'buy' | 'rent' | 'tie';
}

export interface UniqueInsights {
  stressTest: StressTestResult;
  rentTrapYear: number | null; // year cumulative rent > transaction costs
  freedomMoney: { buyer: number; renter: number; delta: number };
  milestones: WealthMilestone[];
  landlordRisk: {
    protectionLevel: 'weak' | 'moderate' | 'strong';
    score: number;
    relocationFreqYears: number;
    explanation: string;
  };
  opportunityCostPerMonth: number; // ₹ per month of indecision
}

export interface LocationInsight {
  rentalYield: {
    impliedYield: number;
    cityAvgYield: number;
    verdict: 'underpriced' | 'fair' | 'overpriced';
    explanation: string;
  };
  mobility: {
    score: number;
    explanation: string;
  };
  bachelorInsight: {
    relevant: boolean;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    explanation: string;
  };
  liquidity: {
    riskLevel: 'low' | 'medium' | 'high';
    discountPct: number;
    explanation: string;
  };
  hiddenBuyCosts: {
    stampDuty: number;
    registration: number;
    brokerageBuy: number;
    totalUpfront: number;
  };
  hiddenRentCosts: {
    securityDeposit: number;
    depositOpportunityCost: number;
    brokerageRent: number;
  };
  locationScore: number; // 1-100, higher = favours buy
  locationVerdict: 'strongly_favours_buy' | 'slightly_favours_buy' | 'neutral' | 'slightly_favours_rent' | 'strongly_favours_rent';
  locationExplanation: string;
}

export interface CalculationResult {
  snapshots: YearlySnapshot[];
  breakEvenYear: number | null;
  verdictAtTenure: 'BUY' | 'RENT' | 'NEUTRAL';
  netWorthDiffAtTenure: number;
  monthlyEmi: number;
  monthlyCashFlowDiff: number;
  totalInterestPaid: number;
  totalRentPaid: number;
  downPaymentOpportunityCost: number;
  totalMaintenanceCost: number;
  propertyValueAtEnd: number;
  netEquityAtEnd: number;
  taxBenefit80C: number;
  taxBenefit24B: number;
  totalTaxBenefit: number;
  plannedStay: number;

  // Hidden costs
  stampDutyCost: number;
  registrationCost: number;
  brokerageBuyCost: number;
  totalTransactionCost: number;
  propertyTaxTotal: number;
  commuteAnnualCost: number;
  rentalDepositLocked: number;
  rentalDepositOpportunityCost: number;
  brokerageRentCost: number;

  // Location intelligence
  locationInsight: LocationInsight;

  // Verdicts
  financialVerdict: 'BUY' | 'RENT' | 'NEUTRAL';
  overallVerdict: 'BUY' | 'RENT' | 'NEUTRAL';
  verdictReasons: string[];

  // Unique insights
  uniqueInsights: UniqueInsights;
}

function calculateEMI(principal: number, annualRate: number, tenureYears: number): number {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function getLoanOutstanding(principal: number, annualRate: number, tenureYears: number, monthsPaid: number): number {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return principal - (principal / n) * monthsPaid;
  if (monthsPaid >= n) return 0;
  const emi = calculateEMI(principal, annualRate, tenureYears);
  return principal * Math.pow(1 + r, monthsPaid) - emi * (Math.pow(1 + r, monthsPaid) - 1) / r;
}

function getInterestPaidInYear(principal: number, annualRate: number, tenureYears: number, year: number): number {
  const r = annualRate / 12 / 100;
  let interest = 0;
  const startMonth = (year - 1) * 12;
  const endMonth = Math.min(year * 12, tenureYears * 12);
  for (let m = startMonth; m < endMonth; m++) {
    const outstanding = getLoanOutstanding(principal, annualRate, tenureYears, m);
    interest += outstanding * r;
  }
  return interest;
}

function getPrincipalPaidInYear(principal: number, annualRate: number, tenureYears: number, year: number): number {
  const emi = calculateEMI(principal, annualRate, tenureYears);
  const months = Math.min(12, tenureYears * 12 - (year - 1) * 12);
  if (months <= 0) return 0;
  const interestInYear = getInterestPaidInYear(principal, annualRate, tenureYears, year);
  return emi * months - interestInYear;
}

function computeLocationInsight(inputs: UserInputs, cityData: CityData): LocationInsight {
  const rentalYield = getRentalYieldVerdict(inputs.monthlyRent, inputs.propertyPrice, cityData.avgRentalYieldPct);
  const mobility = getMobilityScore(inputs.userProfile, inputs.plannedStay);
  const bachelorInsight = getBachelorRentalInsight(inputs.userProfile, cityData.bachelorFriendliness);
  const liquidity = getLiquidityRisk(cityData.avgLiquidityScore, inputs.propertyType, inputs.propertyPrice);

  const stampDuty = inputs.propertyPrice * cityData.stampDutyPct / 100;
  const registration = inputs.propertyPrice * cityData.registrationPct / 100;
  const brokerageBuy = inputs.propertyPrice * cityData.brokerageBuyPct / 100;
  const totalUpfront = stampDuty + registration + brokerageBuy;

  const securityDeposit = inputs.monthlyRent * cityData.avgRentDepositMonths;
  const depositOpportunityCost = securityDeposit * (Math.pow(1 + inputs.investmentReturn / 100, inputs.plannedStay) - 1);
  const brokerageRent = inputs.monthlyRent * cityData.brokerageRentMonths;

  // Location score (1-100, higher = favours buy)
  let score = 50;

  // Rental yield: overpriced property → favours rent
  if (rentalYield.verdict === 'overpriced') score -= 10;
  else if (rentalYield.verdict === 'underpriced') score += 10;

  // Mobility: high mobility → favours rent
  score -= (mobility.score - 5) * 4; // ±20 range

  // Bachelor discrimination → slightly favours buy
  if (bachelorInsight.severity === 'severe') score += 8;
  else if (bachelorInsight.severity === 'moderate') score += 5;
  else if (bachelorInsight.severity === 'mild') score += 2;

  // Liquidity risk → favours rent (harder to exit)
  if (liquidity.riskLevel === 'high') score -= 10;
  else if (liquidity.riskLevel === 'medium') score -= 5;

  // Safety priority: high safety needs in low-safety city → favours buying in gated community
  if (inputs.safetyPriority >= 4 && cityData.avgSafetyIndex < 3.5) {
    score += 5;
  }

  // Resale concern: high concern + low liquidity → favours rent
  if (inputs.resaleConcern >= 4 && liquidity.riskLevel !== 'low') {
    score -= 8;
  }

  // Planned stay: short stay + high transaction costs → strongly favours rent
  const transactionCostPct = (totalUpfront / inputs.propertyPrice) * 100;
  if (inputs.plannedStay <= 3 && transactionCostPct > 6) {
    score -= 12;
  } else if (inputs.plannedStay >= 10) {
    score += 8;
  }

  score = Math.max(1, Math.min(100, score));

  let locationVerdict: LocationInsight['locationVerdict'];
  if (score >= 70) locationVerdict = 'strongly_favours_buy';
  else if (score >= 58) locationVerdict = 'slightly_favours_buy';
  else if (score >= 42) locationVerdict = 'neutral';
  else if (score >= 30) locationVerdict = 'slightly_favours_rent';
  else locationVerdict = 'strongly_favours_rent';

  // Build explanation
  const reasons: string[] = [];
  if (rentalYield.verdict === 'overpriced') reasons.push('Property appears overpriced relative to rental income for this area');
  if (rentalYield.verdict === 'underpriced') reasons.push('Property is underpriced relative to its rental yield — good buy signal');
  if (mobility.score >= 7) reasons.push('Your profile suggests high mobility needs — renting preserves flexibility');
  if (mobility.score <= 3) reasons.push('Your profile favours stability — ownership makes sense');
  if (bachelorInsight.severity === 'severe' || bachelorInsight.severity === 'moderate') reasons.push('Bachelor rental discrimination in this city is a real friction cost');
  if (liquidity.riskLevel === 'high') reasons.push('Resale could be slow in this market — factor in exit risk');
  if (inputs.plannedStay <= 3) reasons.push(`${transactionCostPct.toFixed(1)}% transaction costs are hard to recover in ${inputs.plannedStay} years`);

  const locationExplanation = reasons.length > 0
    ? reasons.join('. ') + '.'
    : 'Location and lifestyle factors are broadly neutral for your decision.';

  return {
    rentalYield,
    mobility,
    bachelorInsight,
    liquidity,
    hiddenBuyCosts: { stampDuty, registration, brokerageBuy, totalUpfront },
    hiddenRentCosts: { securityDeposit, depositOpportunityCost, brokerageRent },
    locationScore: score,
    locationVerdict,
    locationExplanation,
  };
}

export function calculate(inputs: UserInputs): CalculationResult {
  const cityData = getCityData(inputs.city);
  const locationInsight = computeLocationInsight(inputs, cityData);

  const loanAmount = inputs.propertyPrice - inputs.downPayment;
  const emi = calculateEMI(loanAmount, inputs.interestRate, inputs.loanTenure);
  const maxYears = 30;

  // Upfront buy costs (stamp duty + registration + brokerage)
  const stampDutyCost = locationInsight.hiddenBuyCosts.stampDuty;
  const registrationCost = locationInsight.hiddenBuyCosts.registration;
  const brokerageBuyCost = locationInsight.hiddenBuyCosts.brokerageBuy;
  const totalTransactionCost = locationInsight.hiddenBuyCosts.totalUpfront;

  // Rental upfront costs
  const rentalDepositLocked = locationInsight.hiddenRentCosts.securityDeposit;
  const brokerageRentCost = locationInsight.hiddenRentCosts.brokerageRent;

  // Commute cost (same for both, but included for transparency)
  const commuteAnnualCost = inputs.commuteDistance * cityData.avgCommutePerKmMonthly * 12;

  const snapshots: YearlySnapshot[] = [];
  let totalRentPaid = 0;
  let totalEmiPaid = 0;
  let totalMaintenancePaid = 0;
  let totalInterestPaid = 0;
  let totalPropertyTax = 0;
  let breakEvenYear: number | null = null;
  let currentRent = inputs.monthlyRent;
  let currentMaintenance = inputs.monthlyMaintenance;

  // Renter starts with: savings - rental deposit - rent brokerage, invested
  // Buyer starts with: savings - downPayment - transaction costs (stamp duty etc), rest invested if any
  const buyerInitialCashOut = inputs.downPayment + totalTransactionCost;
  const renterInitialCashOut = rentalDepositLocked + brokerageRentCost;

  let rentInvestmentCorpus = Math.max(0, inputs.savings - renterInitialCashOut);
  // If buyer has leftover savings after down payment + transaction costs, they lose that too
  // The key comparison: buyer puts (downPayment + transactionCosts) into property, renter invests it
  const buyerOpportunitySavings = Math.max(0, inputs.savings - buyerInitialCashOut);
  // But buyer's leftover savings also compound — for simplicity, we track the net comparison

  // Tax benefits
  let totalTax80C = 0;
  let totalTax24B = 0;

  const maintenanceInflation = 0.05; // 5% annual increase in maintenance

  for (let year = 1; year <= maxYears; year++) {
    // Property value
    const propertyValue = inputs.propertyPrice * Math.pow(1 + inputs.propertyAppreciation / 100, year);

    // Property tax this year
    const propertyTaxThisYear = propertyValue * cityData.propertyTaxPct / 100;
    totalPropertyTax += propertyTaxThisYear;

    // Loan outstanding
    const monthsPaid = Math.min(year * 12, inputs.loanTenure * 12);
    const loanOutstanding = Math.max(0, getLoanOutstanding(loanAmount, inputs.interestRate, inputs.loanTenure, monthsPaid));

    // EMI payments this year
    const emisThisYear = year <= inputs.loanTenure ? 12 : 0;
    const emiThisYear = emi * emisThisYear;
    totalEmiPaid += emiThisYear;

    // Interest & principal this year
    const interestThisYear = year <= inputs.loanTenure ? getInterestPaidInYear(loanAmount, inputs.interestRate, inputs.loanTenure, year) : 0;
    totalInterestPaid += interestThisYear;
    const principalThisYear = year <= inputs.loanTenure ? getPrincipalPaidInYear(loanAmount, inputs.interestRate, inputs.loanTenure, year) : 0;

    // Maintenance (with inflation)
    const maintenanceThisYear = currentMaintenance * 12;
    totalMaintenancePaid += maintenanceThisYear;

    // Tax benefits (approximate)
    const tax80C = Math.min(principalThisYear, 150000);
    const tax24B = Math.min(interestThisYear, 200000);
    totalTax80C += tax80C;
    totalTax24B += tax24B;
    const taxSavingsThisYear = (tax80C + tax24B) * 0.3;

    // ===== BUYER NET WORTH =====
    // Property equity - but if they sell, they lose liquidity discount + selling costs
    const equityInProperty = propertyValue - loanOutstanding;
    // Buyer's total cost outflow this year: EMI + maintenance + property tax
    // Buyer also has their leftover savings compounding
    const buyerSavingsCorpus = buyerOpportunitySavings * Math.pow(1 + inputs.investmentReturn / 100, year);
    // Buy net worth = equity in property + savings corpus - transaction costs already sunk at year 0
    // We don't subtract transaction costs from equity because they're a sunk cost already paid
    // But we DO need to reflect that the buyer spent (downPayment + transactionCosts) upfront
    const buyNetWorth = equityInProperty + buyerSavingsCorpus;

    // ===== RENTER NET WORTH =====
    // Rent this year
    const rentThisYear = currentRent * 12;
    totalRentPaid += rentThisYear;

    // Renter invests: (what buyer pays monthly) - (what renter pays monthly)
    // Buyer monthly: EMI + maintenance + property tax/12
    // Renter monthly: rent
    const buyerMonthlyOutflow = (year <= inputs.loanTenure ? emi : 0) + currentMaintenance + propertyTaxThisYear / 12;
    const renterMonthlyOutflow = currentRent;
    const monthlyInvestment = Math.max(0, buyerMonthlyOutflow - renterMonthlyOutflow);

    // Compound existing corpus, then add this year's investments
    rentInvestmentCorpus = rentInvestmentCorpus * (1 + inputs.investmentReturn / 100);
    rentInvestmentCorpus += monthlyInvestment * 12;
    // Renter also gets tax savings that buyer gets? No — buyer gets tax benefits, renter doesn't
    // But we should reduce buyer's effective cost by tax savings
    // Simplified: add tax savings back to buyer's side via savings corpus adjustment
    // Actually let's keep it simpler: the renter invests less because we don't add tax benefit to buyer outflow

    const rentNetWorth = rentInvestmentCorpus + rentalDepositLocked; // deposit is returned eventually

    const inflationDeflator = Math.pow(1.06, year);
    snapshots.push({
      year,
      buyNetWorth,
      rentNetWorth,
      propertyValue,
      loanOutstanding,
      equityInProperty,
      totalRentPaid,
      totalEmiPaid,
      rentInvestmentCorpus,
      buyNetWorthReal: buyNetWorth / inflationDeflator,
      rentNetWorthReal: rentNetWorth / inflationDeflator,
    });

    // Check crossover
    if (breakEvenYear === null && buyNetWorth >= rentNetWorth) {
      breakEvenYear = year;
    }

    // Increase rent and maintenance for next year
    currentRent = currentRent * (1 + inputs.annualRentIncrease / 100);
    currentMaintenance = currentMaintenance * (1 + maintenanceInflation);
  }

  const stayIndex = Math.min(inputs.plannedStay, maxYears) - 1;
  const tenureSnapshot = snapshots[stayIndex];
  const netWorthDiffAtTenure = tenureSnapshot ? tenureSnapshot.rentNetWorth - tenureSnapshot.buyNetWorth : 0;

  const downPaymentOpportunityCost = inputs.downPayment * Math.pow(1 + inputs.investmentReturn / 100, inputs.plannedStay) - inputs.downPayment;

  // Financial verdict
  let financialVerdict: 'BUY' | 'RENT' | 'NEUTRAL' = 'NEUTRAL';
  if (tenureSnapshot) {
    const diff = tenureSnapshot.buyNetWorth - tenureSnapshot.rentNetWorth;
    const threshold = inputs.propertyPrice * 0.02;
    if (diff > threshold) financialVerdict = 'BUY';
    else if (diff < -threshold) financialVerdict = 'RENT';
  }

  // Overall verdict: blend financial + location
  let overallVerdict: 'BUY' | 'RENT' | 'NEUTRAL' = financialVerdict;
  const verdictReasons: string[] = [];

  if (financialVerdict === 'BUY') {
    verdictReasons.push('Financially, buying builds more wealth at your planned tenure');
  } else if (financialVerdict === 'RENT') {
    verdictReasons.push('Financially, renting and investing the difference builds more wealth');
  } else {
    verdictReasons.push('Financially, it\'s a close call — the numbers are within 2% of property value');
  }

  // Location can shift a NEUTRAL to a direction, or reinforce, or create tension
  const locVerdict = locationInsight.locationVerdict;
  if (locVerdict === 'strongly_favours_buy' || locVerdict === 'slightly_favours_buy') {
    if (financialVerdict === 'NEUTRAL') overallVerdict = 'BUY';
    verdictReasons.push('Location & lifestyle factors tilt toward buying');
  } else if (locVerdict === 'strongly_favours_rent' || locVerdict === 'slightly_favours_rent') {
    if (financialVerdict === 'NEUTRAL') overallVerdict = 'RENT';
    verdictReasons.push('Location & lifestyle factors tilt toward renting');
  } else {
    verdictReasons.push('Location & lifestyle factors are neutral');
  }

  // Special case: financial says BUY but location strongly says RENT → NEUTRAL
  if (financialVerdict === 'BUY' && locVerdict === 'strongly_favours_rent') {
    overallVerdict = 'NEUTRAL';
    verdictReasons.push('Caution: numbers say buy but your lifestyle/location suggests renting may be wiser');
  }
  if (financialVerdict === 'RENT' && locVerdict === 'strongly_favours_buy') {
    overallVerdict = 'NEUTRAL';
    verdictReasons.push('Caution: numbers say rent but location factors (discrimination, stability) push toward buying');
  }

  const monthlyCashFlowDiff = emi + inputs.monthlyMaintenance - inputs.monthlyRent;
  const totalTaxBenefit = (totalTax80C + totalTax24B) * 0.3;
  const rentalDepositOpportunityCost = locationInsight.hiddenRentCosts.depositOpportunityCost;

  return {
    snapshots,
    breakEvenYear,
    verdictAtTenure: overallVerdict,
    netWorthDiffAtTenure,
    monthlyEmi: emi,
    monthlyCashFlowDiff,
    totalInterestPaid,
    totalRentPaid: snapshots[stayIndex]?.totalRentPaid ?? 0,
    downPaymentOpportunityCost,
    totalMaintenanceCost: totalMaintenancePaid,
    propertyValueAtEnd: snapshots[stayIndex]?.propertyValue ?? 0,
    netEquityAtEnd: snapshots[stayIndex]?.equityInProperty ?? 0,
    taxBenefit80C: totalTax80C * 0.3,
    taxBenefit24B: totalTax24B * 0.3,
    totalTaxBenefit,
    plannedStay: inputs.plannedStay,

    // Hidden costs
    stampDutyCost,
    registrationCost,
    brokerageBuyCost,
    totalTransactionCost,
    propertyTaxTotal: totalPropertyTax,
    commuteAnnualCost,
    rentalDepositLocked,
    rentalDepositOpportunityCost,
    brokerageRentCost,

    // Location
    locationInsight,

    // Verdicts
    financialVerdict,
    overallVerdict,
    verdictReasons,
  };
}
