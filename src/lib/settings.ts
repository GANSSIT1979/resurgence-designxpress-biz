import { prisma } from '@/lib/prisma';

export type PublicSettings = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  adminTitle: string;
  adminSubtitle: string;
  reportFooter: string;
};

export const appSettingDefaults: PublicSettings = {
  contactName: process.env.NEXT_PUBLIC_CONTACT_NAME || 'Jake Anilao',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'resurgence.dx@gmail.com',
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '09387841636',
  contactAddress: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Official business address to follow',
  adminTitle: 'RESURGENCE Admin',
  adminSubtitle: '2026 Sponsorship Operations',
  reportFooter: 'RESURGENCE Powered by DesignXpress',
};

export async function getAppSettingsMap() {
  const records = await prisma.appSetting.findMany();
  return new Map(records.map((item) => [item.key, item.value] as const));
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const map = await getAppSettingsMap();
  return {
    contactName: map.get('contactName') || appSettingDefaults.contactName,
    contactEmail: map.get('contactEmail') || appSettingDefaults.contactEmail,
    contactPhone: map.get('contactPhone') || appSettingDefaults.contactPhone,
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
        group: ['contactName', 'contactEmail', 'contactPhone', 'contactAddress'].includes(key) ? 'contact' : 'admin',
      },
    });
    output[saved.key] = saved.value;
  }

  return output;
}
