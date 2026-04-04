export type ValidationErrors = Record<string, string>;

interface RentValidation {
  monthlyRent: number;
  monthlyIncome: number;
  savings: number;
}

interface BuyValidation {
  propertyPrice: number;
  downPayment: number;
  monthlyIncome: number;
  interestRate: number;
}

interface CompareValidation extends RentValidation, BuyValidation {}

export function validateRent(inputs: RentValidation): ValidationErrors {
  const errors: ValidationErrors = {};
  if (inputs.monthlyIncome <= 0) errors.monthlyIncome = 'Income must be greater than 0';
  if (inputs.monthlyRent <= 0) errors.monthlyRent = 'Rent must be greater than 0';
  if (inputs.monthlyRent > inputs.monthlyIncome) errors.monthlyRent = 'Rent exceeds your income';
  if (inputs.savings < 0) errors.savings = 'Savings cannot be negative';
  return errors;
}

export function validateBuy(inputs: BuyValidation): ValidationErrors {
  const errors: ValidationErrors = {};
  if (inputs.monthlyIncome <= 0) errors.monthlyIncome = 'Income must be greater than 0';
  if (inputs.propertyPrice <= 0) errors.propertyPrice = 'Property price must be greater than 0';
  if (inputs.downPayment <= 0) errors.downPayment = 'Down payment must be greater than 0';
  if (inputs.downPayment > inputs.propertyPrice) errors.downPayment = 'Down payment exceeds property price';
  else if (inputs.propertyPrice > 0 && inputs.downPayment / inputs.propertyPrice < 0.1)
    errors.downPayment = 'Most banks require at least 10-20% down payment';
  if (inputs.interestRate <= 0 || inputs.interestRate > 25) errors.interestRate = 'Enter a valid interest rate';
  return errors;
}

export function validateCompare(inputs: CompareValidation): ValidationErrors {
  return { ...validateRent(inputs), ...validateBuy(inputs) };
}

export function hasBlockingErrors(errors: ValidationErrors): boolean {
  // Warning-level errors (like low down payment) don't block
  const warningMessages = ['Most banks require'];
  return Object.values(errors).some(msg => !warningMessages.some(w => msg.includes(w)));
}
