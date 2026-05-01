export type PaymentRiskInput = {
  amount?: number | null;
  currency?: string | null;
  provider?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  country?: string | null;
  previousFailedPayments?: number;
  duplicateEvent?: boolean;
  manualReference?: string | null;
};

export type PaymentRiskResult = {
  score: number;
  level: 'low' | 'medium' | 'high';
  flags: string[];
};

export function scorePaymentRisk(input: PaymentRiskInput): PaymentRiskResult {
  const flags: string[] = [];
  let score = 0;

  const amount = Number(input.amount || 0);

  if (amount >= 150000) {
    score += 25;
    flags.push('high_value_payment');
  } else if (amount >= 75000) {
    score += 12;
    flags.push('mid_value_payment');
  }

  if (!input.customerEmail && !input.customerPhone) {
    score += 20;
    flags.push('missing_customer_contact');
  }

  if (input.previousFailedPayments && input.previousFailedPayments > 0) {
    score += Math.min(30, input.previousFailedPayments * 10);
    flags.push('previous_failed_payments');
  }

  if (input.duplicateEvent) {
    score += 40;
    flags.push('duplicate_payment_event');
  }

  if (input.provider && input.provider !== 'paypal' && input.provider !== 'gcash' && input.provider !== 'maya' && input.provider !== 'bank_transfer' && input.provider !== 'cash') {
    score += 40;
    flags.push('unsupported_provider');
  }

  if ((input.provider === 'gcash' || input.provider === 'maya' || input.provider === 'bank_transfer') && !input.manualReference) {
    score += 25;
    flags.push('manual_payment_missing_reference');
  }

  const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return { score, level, flags };
}
