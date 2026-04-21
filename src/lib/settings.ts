import { prisma } from '@/lib/prisma';

const contactKeys = [
  'brandName',
  'companyName',
  'siteUrl',
  'contactName',
  'contactRole',
  'contactEmail',
  'contactPhone',
  'supportEmail',
  'supportPhone',
  'businessHours',
  'location',
  'currency',
  'paymentMethods',
  'shippingArea',
  'contactAddress',
] as const;

const adminKeys = ['adminTitle', 'adminSubtitle', 'reportFooter'] as const;

export type PublicSettings = {
  brandName: string;
  companyName: string;
  siteUrl: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  location: string;
  currency: string;
  paymentMethods: string;
  shippingArea: string;
  contactAddress: string;
  adminTitle: string;
  adminSubtitle: string;
  reportFooter: string;
};

const brandName = process.env.NEXT_PUBLIC_SITE_NAME || 'Resurgence Powered by DesignXpress';
const companyName = process.env.COMPANY_NAME || 'DesignXpress Merchandising OPC';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://resurgence-dx.biz';
const location = process.env.NEXT_PUBLIC_LOCATION || 'Philippines';

export const appSettingDefaults: PublicSettings = {
  brandName,
  companyName,
  siteUrl,
  contactName: process.env.NEXT_PUBLIC_CONTACT_NAME || 'Jake Anilao',
  contactRole: process.env.NEXT_PUBLIC_CONTACT_ROLE || 'Sponsorship / Partnerships',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'partnerships@resurgence-dx.biz',
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+639387841636',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@resurgence-dx.biz',
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+639957558147',
  businessHours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || 'Monday to Saturday, 9:00 AM to 6:00 PM, Asia/Manila',
  location,
  currency: process.env.NEXT_PUBLIC_CURRENCY || 'PHP',
  paymentMethods:
    process.env.NEXT_PUBLIC_PAYMENT_METHODS || 'GCash, Maya, Bank Transfer, Credit/Debit Card, Cash',
  shippingArea: process.env.NEXT_PUBLIC_SHIPPING_AREA || 'Philippines nationwide',
  contactAddress: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || location,
  adminTitle: 'Resurgence Admin',
  adminSubtitle: `${companyName} - Sponsorship Operations`,
  reportFooter: `${brandName} - ${companyName}`,
};

let appSettingsMapPromise: Promise<Map<string, string>> | null = null;

async function hasAppSettingsTable() {
  const provider = (process.env.PRISMA_DB_PROVIDER || 'sqlite').trim();

  if (provider === 'postgresql') {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'AppSetting'
      LIMIT 1
    `;

    return rows.length > 0;
  }

  const rows = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name = 'AppSetting'
    LIMIT 1
  `;

  return rows.length > 0;
}

export async function getAppSettingsMap() {
  try {
    if (appSettingsMapPromise) {
      return await appSettingsMapPromise;
    }

    appSettingsMapPromise = (async () => {
      if (!(await hasAppSettingsTable())) {
        return new Map<string, string>();
      }

      const records = await prisma.appSetting.findMany();
      return new Map(records.map((item) => [item.key, item.value] as const));
    })();

    return await appSettingsMapPromise;
  } catch (error) {
    appSettingsMapPromise = null;
    console.error('[settings] Falling back to default public settings.', error);
    return new Map<string, string>();
  }
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const map = await getAppSettingsMap();
  return {
    brandName: map.get('brandName') || appSettingDefaults.brandName,
    companyName: map.get('companyName') || appSettingDefaults.companyName,
    siteUrl: map.get('siteUrl') || appSettingDefaults.siteUrl,
    contactName: map.get('contactName') || appSettingDefaults.contactName,
    contactRole: map.get('contactRole') || appSettingDefaults.contactRole,
    contactEmail: map.get('contactEmail') || appSettingDefaults.contactEmail,
    contactPhone: map.get('contactPhone') || appSettingDefaults.contactPhone,
    supportEmail: map.get('supportEmail') || appSettingDefaults.supportEmail,
    supportPhone: map.get('supportPhone') || appSettingDefaults.supportPhone,
    businessHours: map.get('businessHours') || appSettingDefaults.businessHours,
    location: map.get('location') || appSettingDefaults.location,
    currency: map.get('currency') || appSettingDefaults.currency,
    paymentMethods: map.get('paymentMethods') || appSettingDefaults.paymentMethods,
    shippingArea: map.get('shippingArea') || appSettingDefaults.shippingArea,
    contactAddress: map.get('contactAddress') || appSettingDefaults.contactAddress,
    adminTitle: map.get('adminTitle') || appSettingDefaults.adminTitle,
    adminSubtitle: map.get('adminSubtitle') || appSettingDefaults.adminSubtitle,
    reportFooter: map.get('reportFooter') || appSettingDefaults.reportFooter,
  };
}

export async function upsertAppSettings(values: Partial<PublicSettings>) {
  const entries = Object.entries(values).filter(([, value]) => typeof value === 'string');
  const output: Record<string, string> = {};

  for (const [key, value] of entries) {
    const saved = await prisma.appSetting.upsert({
      where: { key },
      update: { value: value || '' },
      create: {
        key,
        value: value || '',
        label: key,
        group: contactKeys.includes(key as (typeof contactKeys)[number])
          ? 'contact'
          : adminKeys.includes(key as (typeof adminKeys)[number])
            ? 'admin'
            : 'general',
      },
    });
    output[saved.key] = saved.value;
  }

  appSettingsMapPromise = null;

  return output;
}
