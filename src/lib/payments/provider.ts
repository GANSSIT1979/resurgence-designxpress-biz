export const ACTIVE_PAYMENT_PROVIDER = 'paypal' as const;

export const ONLINE_PAYMENT_PROVIDERS = ['paypal'] as const;
export const MANUAL_PAYMENT_PROVIDERS = ['gcash', 'maya', 'bank_transfer', 'cash'] as const;

export type OnlinePaymentProvider = (typeof ONLINE_PAYMENT_PROVIDERS)[number];
export type ManualPaymentProvider = (typeof MANUAL_PAYMENT_PROVIDERS)[number];
export type PaymentProvider = OnlinePaymentProvider | ManualPaymentProvider;

export function assertOnlinePaymentProvider(provider: string): asserts provider is OnlinePaymentProvider {
  if (!ONLINE_PAYMENT_PROVIDERS.includes(provider as OnlinePaymentProvider)) {
    throw new Error(`Unsupported online payment provider: ${provider}. Active provider is PayPal.`);
  }
}

export function isManualPaymentProvider(provider: string): provider is ManualPaymentProvider {
  return MANUAL_PAYMENT_PROVIDERS.includes(provider as ManualPaymentProvider);
}

export function isPayPalEnabled() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_ENV);
}

export function getPayPalEnvironment() {
  const env = process.env.PAYPAL_ENV || 'sandbox';
  return env === 'live' ? 'live' : 'sandbox';
}

export function getPayPalApiBaseUrl() {
  return getPayPalEnvironment() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}
