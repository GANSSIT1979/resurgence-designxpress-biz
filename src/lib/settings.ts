import { db } from "@/lib/db";

export type PublicSettings = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  adminTitle: string;
  adminSubtitle: string;
  reportFooter: string;
};

const DEFAULT_SETTINGS: PublicSettings = {
  contactName: "RESURGENCE Team",
  contactEmail: "customerservice@designxpress.biz",
  contactPhone: "+63 966 405 7004",
  contactAddress: "B20 L31 Sampaguita Oval, Maligaya Park, Barangay 177, Caloocan City, Third District, NCR, Philippines",
  adminTitle: "RESURGENCE Admin",
  adminSubtitle: "Powered by DesignXpress",
  reportFooter: "RESURGENCE Powered by DesignXpress",
};

const SETTINGS_KEY = "public-admin-settings";

type SettingRow = {
  key: string;
  value?: unknown;
  valueJson?: unknown;
  jsonValue?: unknown;
  settingsJson?: unknown;
};

function normalizeSettings(input: unknown): PublicSettings {
  if (!input || typeof input !== "object") {
    return DEFAULT_SETTINGS;
  }

  const value = input as Record<string, unknown>;

  return {
    contactName:
      typeof value.contactName === "string" && value.contactName.trim()
        ? value.contactName
        : DEFAULT_SETTINGS.contactName,
    contactEmail:
      typeof value.contactEmail === "string" && value.contactEmail.trim()
        ? value.contactEmail
        : DEFAULT_SETTINGS.contactEmail,
    contactPhone:
      typeof value.contactPhone === "string" && value.contactPhone.trim()
        ? value.contactPhone
        : DEFAULT_SETTINGS.contactPhone,
    contactAddress:
      typeof value.contactAddress === "string" && value.contactAddress.trim()
        ? value.contactAddress
        : DEFAULT_SETTINGS.contactAddress,
    adminTitle:
      typeof value.adminTitle === "string" && value.adminTitle.trim()
        ? value.adminTitle
        : DEFAULT_SETTINGS.adminTitle,
    adminSubtitle:
      typeof value.adminSubtitle === "string" && value.adminSubtitle.trim()
        ? value.adminSubtitle
        : DEFAULT_SETTINGS.adminSubtitle,
    reportFooter:
      typeof value.reportFooter === "string" && value.reportFooter.trim()
        ? value.reportFooter
        : DEFAULT_SETTINGS.reportFooter,
  };
}

function parseStoredValue(raw: unknown): PublicSettings {
  if (!raw) return DEFAULT_SETTINGS;

  if (typeof raw === "string") {
    try {
      return normalizeSettings(JSON.parse(raw));
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  return normalizeSettings(raw);
}

function getSettingDelegate() {
  return (db as unknown as {
    setting?: {
      findFirst?: (args: Record<string, unknown>) => Promise<SettingRow | null>;
      upsert?: (args: Record<string, unknown>) => Promise<SettingRow>;
    };
  }).setting;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const setting = getSettingDelegate();

  if (!setting?.findFirst) {
    return DEFAULT_SETTINGS;
  }

  try {
    const row = await setting.findFirst({
      where: { key: SETTINGS_KEY },
    });

    if (!row) {
      return DEFAULT_SETTINGS;
    }

    const raw =
      row.valueJson ??
      row.value ??
      row.jsonValue ??
      row.settingsJson ??
      null;

    return parseStoredValue(raw);
  } catch (error) {
    console.error("getPublicSettings failed:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function upsertAppSettings(
  next: Partial<PublicSettings>
): Promise<PublicSettings> {
  const current = await getPublicSettings();

  const merged = normalizeSettings({
    ...current,
    ...next,
  });

  const setting = getSettingDelegate();

  if (!setting?.upsert) {
    return merged;
  }

  try {
    await setting.upsert({
      where: { key: SETTINGS_KEY },
      update: {
        value: merged,
        valueJson: merged,
      },
      create: {
        key: SETTINGS_KEY,
        value: merged,
        valueJson: merged,
      },
    });
  } catch (error) {
    console.error("upsertAppSettings failed:", error);
    throw error;
  }

  return merged;
}