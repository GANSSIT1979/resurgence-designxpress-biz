import type { PublicSettings } from '@/lib/settings';

export type ShopPaymentInstructions = {
  gcashNumber: string;
  mayaNumber: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  supportEmail: string;
  supportPhone: string;
};

function clean(value?: string | null) {
  return String(value || '').trim();
}

export function getShopPaymentInstructions(settings: Pick<PublicSettings, 'supportEmail' | 'supportPhone'>): ShopPaymentInstructions {
  return {
    gcashNumber: clean(process.env.GCASH_NUMBER),
    mayaNumber: clean(process.env.MAYA_NUMBER),
    bankAccountName: clean(process.env.BANK_ACCOUNT_NAME),
    bankAccountNumber: clean(process.env.BANK_ACCOUNT_NUMBER),
    bankName: clean(process.env.BANK_NAME),
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
  };
}
