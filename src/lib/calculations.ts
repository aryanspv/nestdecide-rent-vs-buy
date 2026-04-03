export interface UserInputs {
  city: string;
  monthlyRent: number;
  monthlyIncome: number;
  savings: number;
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTenure: number;
  monthlyMaintenance: number;
  plannedStay: number;
  propertyAppreciation: number;
  investmentReturn: number;
  annualRentIncrease: number;
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
  const emi = calculateEMI(principal, annualRate, tenureYears);
  let interest = 0;
  const startMonth = (year - 1) * 12;
  const endMonth = Math.min(year * 12, tenureYears * 12);
  for (let m = startMonth; m < endMonth; m++) {
    const outstanding = getLoanOutstanding(principal, annualRate, tenureYears, m);
    const monthInterest = outstanding * r;
    interest += monthInterest;
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

export function calculate(inputs: UserInputs): CalculationResult {
  const loanAmount = inputs.propertyPrice - inputs.downPayment;
  const emi = calculateEMI(loanAmount, inputs.interestRate, inputs.loanTenure);
  const maxYears = 30;

  const snapshots: YearlySnapshot[] = [];
  let totalRentPaid = 0;
  let totalEmiPaid = 0;
  let totalMaintenancePaid = 0;
  let totalInterestPaid = 0;
  let rentInvestmentCorpus = inputs.savings; // renter keeps full savings
  let breakEvenYear: number | null = null;
  let currentRent = inputs.monthlyRent;

  // Tax benefits
  let totalTax80C = 0;
  let totalTax24B = 0;

  for (let year = 1; year <= maxYears; year++) {
    // Property value
    const propertyValue = inputs.propertyPrice * Math.pow(1 + inputs.propertyAppreciation / 100, year);

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

    // Maintenance
    const maintenanceThisYear = inputs.monthlyMaintenance * 12;
    totalMaintenancePaid += maintenanceThisYear;

    // Tax benefits (approximate)
    const tax80C = Math.min(principalThisYear, 150000);
    const tax24B = Math.min(interestThisYear, 200000);
    totalTax80C += tax80C;
    totalTax24B += tax24B;

    // Buyer net worth: property value - loan outstanding - total maintenance paid (sunk)
    // But we also consider: buyer doesn't have down payment invested
    const equityInProperty = propertyValue - loanOutstanding;
    const buyNetWorth = equityInProperty;

    // Rent this year
    const rentThisYear = currentRent * 12;
    totalRentPaid += rentThisYear;

    // Renter: invest (EMI - rent + maintenance savings) + compound existing corpus
    const monthlyInvestment = Math.max(0, emi + inputs.monthlyMaintenance - currentRent);
    // Compound existing corpus
    rentInvestmentCorpus = rentInvestmentCorpus * (1 + inputs.investmentReturn / 100);
    // Add monthly investments (simplified to annual)
    rentInvestmentCorpus += monthlyInvestment * 12;

    const rentNetWorth = rentInvestmentCorpus;

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
    });

    // Check crossover
    if (breakEvenYear === null && buyNetWorth >= rentNetWorth) {
      breakEvenYear = year;
    }

    // Increase rent for next year
    currentRent = currentRent * (1 + inputs.annualRentIncrease / 100);
  }

  const tenureSnapshot = snapshots[Math.min(inputs.plannedStay, maxYears) - 1];
  const netWorthDiffAtTenure = tenureSnapshot ? tenureSnapshot.rentNetWorth - tenureSnapshot.buyNetWorth : 0;

  // Down payment opportunity cost
  const downPaymentOpportunityCost = inputs.downPayment * Math.pow(1 + inputs.investmentReturn / 100, inputs.plannedStay) - inputs.downPayment;

  let verdictAtTenure: 'BUY' | 'RENT' | 'NEUTRAL' = 'NEUTRAL';
  if (tenureSnapshot) {
    const diff = tenureSnapshot.buyNetWorth - tenureSnapshot.rentNetWorth;
    const threshold = inputs.propertyPrice * 0.02; // 2% of property price as neutral zone
    if (diff > threshold) verdictAtTenure = 'BUY';
    else if (diff < -threshold) verdictAtTenure = 'RENT';
  }

  const monthlyCashFlowDiff = emi + inputs.monthlyMaintenance - inputs.monthlyRent;

  const totalTaxBenefit = (totalTax80C + totalTax24B) * 0.3; // Assume 30% tax bracket

  return {
    snapshots,
    breakEvenYear,
    verdictAtTenure,
    netWorthDiffAtTenure,
    monthlyEmi: emi,
    monthlyCashFlowDiff,
    totalInterestPaid,
    totalRentPaid: snapshots[Math.min(inputs.plannedStay, maxYears) - 1]?.totalRentPaid ?? 0,
    downPaymentOpportunityCost,
    totalMaintenanceCost: totalMaintenancePaid,
    propertyValueAtEnd: snapshots[Math.min(inputs.plannedStay, maxYears) - 1]?.propertyValue ?? 0,
    netEquityAtEnd: snapshots[Math.min(inputs.plannedStay, maxYears) - 1]?.equityInProperty ?? 0,
    taxBenefit80C: totalTax80C * 0.3,
    taxBenefit24B: totalTax24B * 0.3,
    totalTaxBenefit,
    plannedStay: inputs.plannedStay,
  };
}
