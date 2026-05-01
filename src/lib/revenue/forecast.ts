export type RevenueForecastInput = {
  paidRevenue: number;
  outstandingRevenue: number;
  paidInvoiceCount: number;
  unpaidInvoiceCount: number;
  periodDays?: number;
};

export function buildRevenueForecast(input: RevenueForecastInput) {
  const periodDays = Math.max(1, input.periodDays || 30);
  const dailyAverage = input.paidRevenue / periodDays;
  const projectedMonthlyRevenue = dailyAverage * 30;
  const conservativePipeline = input.outstandingRevenue * 0.35;
  const realisticPipeline = input.outstandingRevenue * 0.55;
  const aggressivePipeline = input.outstandingRevenue * 0.75;
  const invoiceConversionRate = input.paidInvoiceCount + input.unpaidInvoiceCount > 0
    ? input.paidInvoiceCount / (input.paidInvoiceCount + input.unpaidInvoiceCount)
    : 0;

  return {
    dailyAverage,
    projectedMonthlyRevenue,
    conservativePipeline,
    realisticPipeline,
    aggressivePipeline,
    invoiceConversionRate,
    recoveryPriority: input.outstandingRevenue > input.paidRevenue * 0.5 ? 'high' : input.outstandingRevenue > input.paidRevenue * 0.2 ? 'medium' : 'normal',
  };
}
