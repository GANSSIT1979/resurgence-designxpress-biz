export type MetricEvent = {
  name: string;
  value?: number;
  tags?: Record<string, string | number | boolean | null>;
};

export function trackMetric(event: MetricEvent) {
  const payload = {
    timestamp: new Date().toISOString(),
    ...event,
  };

  console.log(JSON.stringify({ metric: payload }));
}

export function trackRevenue(amount: number, currency: string, source: string) {
  trackMetric({
    name: 'revenue.recorded',
    value: amount,
    tags: { currency, source },
  });
}

export function trackConversion(eventName: string, metadata?: Record<string, unknown>) {
  trackMetric({
    name: `conversion.${eventName}`,
    tags: metadata as any,
  });
}

export function trackFunnelStep(step: string, metadata?: Record<string, unknown>) {
  trackMetric({
    name: `funnel.${step}`,
    tags: metadata as any,
  });
}
