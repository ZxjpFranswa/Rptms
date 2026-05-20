// Payment calculation utilities

export interface QuarterlyPayment {
  quarter: number;
  dueDate: string;
  amount: number;
  status: "paid" | "unpaid" | "overdue";
}

// Calculate penalties based on months overdue (2% per month)
export function calculatePenalty(baseAmount: number, monthsOverdue: number): number {
  const penaltyRate = 0.02; // 2% per month
  return baseAmount * penaltyRate * monthsOverdue;
}

// Calculate months between two dates
export function calculateMonthsOverdue(dueDate: Date, currentDate: Date = new Date()): number {
  const months =
    (currentDate.getFullYear() - dueDate.getFullYear()) * 12 +
    (currentDate.getMonth() - dueDate.getMonth());
  return Math.max(0, months);
}

// Generate quarterly payment schedule
export function generateQuarterlySchedule(
  fiscalYear: string,
  totalAnnualTax: number
): QuarterlyPayment[] {
  const year = parseInt(fiscalYear);
  const quarterlyAmount = totalAnnualTax / 4;

  return [
    {
      quarter: 1,
      dueDate: `${year}-03-31`,
      amount: quarterlyAmount,
      status: "unpaid",
    },
    {
      quarter: 2,
      dueDate: `${year}-06-30`,
      amount: quarterlyAmount,
      status: "unpaid",
    },
    {
      quarter: 3,
      dueDate: `${year}-09-30`,
      amount: quarterlyAmount,
      status: "unpaid",
    },
    {
      quarter: 4,
      dueDate: `${year}-12-31`,
      amount: quarterlyAmount,
      status: "unpaid",
    },
  ];
}

// Determine early payment discount eligibility
export function getEarlyPaymentDiscount(
  paymentDate: Date,
  firstQuarterDueDate: Date,
  secondQuarterDueDate: Date
): { eligible: boolean; type: "advance" | "prompt" | "none"; percentage: number } {
  // Advance payment: Pay before Q1 due date (10% discount)
  if (paymentDate < firstQuarterDueDate) {
    return { eligible: true, type: "advance", percentage: 10 };
  }

  // Prompt payment: Pay before Q2 due date (20% discount)
  if (paymentDate < secondQuarterDueDate) {
    return { eligible: true, type: "prompt", percentage: 20 };
  }

  return { eligible: false, type: "none", percentage: 0 };
}

// Calculate total with discount
export function applyDiscount(amount: number, discountPercentage: number): number {
  return amount * (discountPercentage / 100);
}
